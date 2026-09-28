import "server-only";

import { db } from "@/lib/db";
import { SHIPPING, WHATSAPP_NUMBER, SITE } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { CheckoutData } from "@/lib/validations";

export type CreatedOrder = {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  itemsCount: number;
};

export type CreateOrderResult =
  | { ok: true; order: CreatedOrder }
  | { ok: false; error: string; code: "SIN_STOCK" | "NO_DISPONIBLE" | "ERROR" };

/** Envío gratis a partir del umbral configurado. */
export function shippingFor(subtotal: number) {
  return subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flatRate;
}

/**
 * Referencia legible: NT-0926-0043 (mes, año y consecutivo del mes).
 * Se reintenta porque dos pedidos simultáneos pueden calcular el mismo
 * consecutivo; el índice único de `orderNumber` es quien decide.
 */
async function nextOrderNumber() {
  const now = new Date();
  const stamp = `${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getFullYear()
  ).slice(2)}`;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const count = await db.order.count({ where: { createdAt: { gte: monthStart } } });

  return (attempt: number) =>
    `NT-${stamp}-${String(count + 1 + attempt).padStart(4, "0")}`;
}

/**
 * Crea el pedido a partir de datos ya validados por Zod.
 *
 * Los precios se recalculan SIEMPRE desde la base de datos: el carrito vive en
 * el navegador, así que lo que manda el cliente son solo identificadores y
 * cantidades. Si se confiara en el precio enviado, cualquiera podría comprar a
 * cero editando el localStorage.
 */
export async function createOrder(
  data: CheckoutData
): Promise<CreateOrderResult> {
  const productIds = [...new Set(data.items.map((i) => i.productId))];

  const products = await db.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));

  type Line = {
    productId: string;
    productName: string;
    productSlug: string;
    image: string | null;
    variantLabel: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  };

  const lines: Line[] = [];

  for (const item of data.items) {
    const product = byId.get(item.productId);

    if (!product) {
      return {
        ok: false,
        code: "NO_DISPONIBLE",
        error:
          "Uno de los productos de tu carrito ya no está disponible. Quítalo e inténtalo de nuevo.",
      };
    }

    if (product.stock < item.quantity) {
      return {
        ok: false,
        code: "SIN_STOCK",
        error:
          product.stock === 0
            ? `${product.name} se agotó. Quítalo del carrito para continuar.`
            : `Solo quedan ${product.stock} unidades de ${product.name}.`,
      };
    }

    // Las variantes solo suman si pertenecen a este producto: así un ID de otro
    // producto con priceDelta negativo no puede abaratar la compra.
    const chosen = product.variants.filter((v) =>
      item.variantIds.includes(v.id)
    );
    const unitPrice =
      product.price + chosen.reduce((sum, v) => sum + v.priceDelta, 0);

    lines.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0]?.url ?? null,
      variantLabel:
        chosen.length > 0
          ? chosen.map((v) => `${v.label}: ${v.value}`).join(" · ")
          : null,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const itemsCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  const buildNumber = await nextOrderNumber();

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await db.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber: buildNumber(attempt),
            status: "PENDIENTE",
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerEmail: data.customerEmail ?? null,
            address: data.address,
            city: data.city,
            department: data.department,
            notes: data.notes ?? null,
            subtotal,
            shipping,
            total,
            itemsCount,
            items: { create: lines },
          },
        });

        // Se descuenta el inventario al crear el pedido, no al confirmarlo:
        // evita vender dos veces la última unidad mientras se llama al cliente.
        // Si el pedido se cancela, `restoreStock` lo devuelve.
        for (const line of lines) {
          await tx.product.update({
            where: { id: line.productId },
            data: {
              stock: { decrement: line.quantity },
              unitsSold: { increment: line.quantity },
            },
          });
        }

        return created;
      });

      return {
        ok: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          subtotal: order.subtotal,
          shipping: order.shipping,
          itemsCount: order.itemsCount,
        },
      };
    } catch (error) {
      const isDuplicate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";

      if (!isDuplicate) {
        console.error("[createOrder]", error);
        return {
          ok: false,
          code: "ERROR",
          error: "No pudimos registrar tu pedido. Vuelve a intentarlo.",
        };
      }
      // Consecutivo tomado por otro pedido: se reintenta con el siguiente.
    }
  }

  return {
    ok: false,
    code: "ERROR",
    error: "No pudimos registrar tu pedido. Vuelve a intentarlo.",
  };
}

/** Devuelve al inventario las unidades de un pedido cancelado. */
export async function restoreStock(orderId: string) {
  const items = await db.orderItem.findMany({
    where: { orderId, productId: { not: null } },
    select: { productId: true, quantity: true },
  });

  await db.$transaction(
    items.map((item) =>
      db.product.update({
        where: { id: item.productId! },
        data: {
          stock: { increment: item.quantity },
          unitsSold: { decrement: item.quantity },
        },
      })
    )
  );
}

export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}

type WhatsAppOrder = {
  orderNumber: string;
  customerName: string;
  address: string;
  city: string;
  department: string;
  notes?: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  items: {
    productName: string;
    variantLabel?: string | null;
    quantity: number;
    lineTotal: number;
  }[];
};

/**
 * Mensaje prellenado para WhatsApp. Se envía desde el cliente hacia la tienda,
 * de modo que la conversación queda abierta y el equipo puede confirmar el
 * pedido sin pedir los datos otra vez.
 */
export function whatsAppMessage(order: WhatsAppOrder) {
  const lines = order.items.map(
    (item) =>
      `• ${item.quantity}× ${item.productName}` +
      (item.variantLabel ? ` (${item.variantLabel})` : "") +
      ` — ${formatPrice(item.lineTotal)}`
  );

  return [
    `Hola ${SITE.name} 👋`,
    `Acabo de hacer el pedido *${order.orderNumber}*.`,
    "",
    "*Productos*",
    ...lines,
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Envío: ${order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}`,
    `*Total a pagar contra entrega: ${formatPrice(order.total)}*`,
    "",
    "*Entrega*",
    order.customerName,
    `${order.address}`,
    `${order.city}, ${order.department}`,
    ...(order.notes ? [`Referencias: ${order.notes}`] : []),
    "",
    "Quedo atento a la confirmación. ¡Gracias!",
  ].join("\n");
}

export function whatsAppUrl(order: WhatsAppOrder) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsAppMessage(order)
  )}`;
}

/** Enlace de WhatsApp para una consulta suelta (cabecera, footer, producto). */
export function whatsAppInquiry(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

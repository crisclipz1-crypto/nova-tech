import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ORDER_STATUS_META } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Escapa un valor para CSV.
 *
 * Además de las comillas, se antepone un apóstrofo a lo que empiece por `=`,
 * `+`, `-` o `@`: Excel interpretaría esas celdas como fórmulas, y una
 * dirección escrita por un cliente podría ejecutar algo al abrir el archivo
 * (inyección de fórmulas CSV).
 */
function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  // La exportación contiene nombres, teléfonos y direcciones de clientes: es
  // el endpoint con más datos personales de toda la app.
  const session = await auth();
  if (!session?.user) {
    return new Response("No autorizado", { status: 401 });
  }

  const estado = new URL(request.url).searchParams.get("estado");
  const status = estado && estado in ORDER_STATUS_META ? estado : undefined;

  const orders = await db.order.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const headers = [
    "Pedido",
    "Fecha",
    "Estado",
    "Cliente",
    "Telefono",
    "Correo",
    "Departamento",
    "Ciudad",
    "Direccion",
    "Referencias",
    "Productos",
    "Unidades",
    "Subtotal",
    "Envio",
    "Total",
    "Notas internas",
  ];

  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.createdAt.toISOString(),
      ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META]?.label ??
        order.status,
      order.customerName,
      `+${order.customerPhone}`,
      order.customerEmail ?? "",
      order.department,
      order.city,
      order.address,
      order.notes ?? "",
      order.items
        .map(
          (item) =>
            `${item.quantity}x ${item.productName}` +
            (item.variantLabel ? ` (${item.variantLabel})` : "")
        )
        .join(" | "),
      order.itemsCount,
      order.subtotal,
      order.shipping,
      order.total,
      order.adminNotes ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  // BOM UTF-8: sin él, Excel en Windows abre las tildes como caracteres raros.
  const csv = "﻿" + [headers.map(csvCell).join(","), ...rows].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  const name = `novatech-pedidos${status ? `-${status.toLowerCase()}` : ""}-${stamp}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

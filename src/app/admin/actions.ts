"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";

import { db } from "@/lib/db";
import { requireAdmin, ok, fail, type ActionState } from "@/lib/admin-guard";
import { restoreStock } from "@/lib/orders";
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from "@/lib/config";
import {
  bannerSchema,
  productSchema,
  reviewSchema,
  updateOrderSchema,
} from "@/lib/validations";

/** Convierte los issues de Zod en un mapa campo → mensaje para el formulario. */
function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

/** Refresca las rutas públicas que dependen del catálogo. */
function revalidateStorefront(slug?: string) {
  revalidatePath("/");
  revalidatePath("/productos");
  if (slug) revalidatePath(`/productos/${slug}`);
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

export async function updateOrder(input: unknown): Promise<ActionState> {
  await requireAdmin();

  const parsed = updateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Revisa los datos.", toFieldErrors(parsed.error));
  }

  const { orderId, status, adminNotes, cancelReason } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) return fail("Ese pedido ya no existe.");

  const current = order.status as OrderStatus;

  /**
   * El estado solo avanza por el camino permitido. La interfaz ya ofrece
   * únicamente los destinos válidos, pero se vuelve a comprobar aquí porque
   * la acción es un endpoint y podría recibir cualquier valor.
   */
  if (status !== current && !ORDER_STATUS_TRANSITIONS[current].includes(status)) {
    return fail(
      `Un pedido ${current.toLowerCase()} no puede pasar a ${status.toLowerCase()}.`
    );
  }

  const now = new Date();

  await db.order.update({
    where: { id: orderId },
    data: {
      status,
      adminNotes: adminNotes ?? null,
      cancelReason: status === "CANCELADO" ? (cancelReason ?? null) : null,
      // Las marcas de tiempo se escriben una sola vez, al entrar en el estado.
      ...(status === "CONFIRMADO" && current !== "CONFIRMADO"
        ? { confirmedAt: now }
        : {}),
      ...(status === "ENVIADO" && current !== "ENVIADO" ? { shippedAt: now } : {}),
      ...(status === "ENTREGADO" && current !== "ENTREGADO"
        ? { deliveredAt: now }
        : {}),
    },
  });

  // Cancelar devuelve las unidades al inventario: se descontaron al crear el
  // pedido para no vender dos veces la última pieza.
  if (status === "CANCELADO" && current !== "CANCELADO") {
    await restoreStock(orderId);
    revalidateStorefront();
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);

  return ok("Pedido actualizado.");
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

export async function saveProduct(
  input: unknown,
  productId?: string
): Promise<ActionState & { slug?: string }> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Revisa los campos marcados.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const clash = await db.product.findFirst({
    where: { slug: data.slug, ...(productId ? { NOT: { id: productId } } : {}) },
    select: { id: true },
  });

  if (clash) {
    return fail("Ya existe un producto con ese slug.", {
      slug: "Ese slug ya está en uso",
    });
  }

  const scalars = {
    name: data.name,
    slug: data.slug,
    summary: data.summary,
    description: data.description,
    price: data.price,
    compareAtPrice: data.compareAtPrice ?? null,
    sku: data.sku ?? null,
    brand: data.brand ?? null,
    stock: data.stock,
    categoryId: data.categoryId,
    active: data.active,
    featured: data.featured,
    bestSeller: data.bestSeller,
    isNew: data.isNew,
    badge: data.badge ?? null,
    specs: JSON.stringify(data.specs),
  };

  const images = data.images.map((image, index) => ({
    url: image.url,
    alt: image.alt ?? "",
    position: index,
  }));

  const variants = data.variants.map((variant, index) => ({
    group: variant.group,
    label: variant.label,
    value: variant.value,
    hex: variant.hex ?? null,
    priceDelta: variant.priceDelta,
    stock: variant.stock,
    position: index,
  }));

  try {
    if (productId) {
      /**
       * Imágenes y variantes se reemplazan por completo dentro de una
       * transacción. Es más simple que calcular un diff y, sobre todo, deja
       * el orden exactamente como lo dejó el formulario. Las variantes viejas
       * desaparecen, pero los pedidos ya guardaron su etiqueta como texto.
       */
      await db.$transaction([
        db.productImage.deleteMany({ where: { productId } }),
        db.productVariant.deleteMany({ where: { productId } }),
        db.product.update({
          where: { id: productId },
          data: {
            ...scalars,
            images: { create: images },
            variants: { create: variants },
          },
        }),
      ]);
    } else {
      const created = await db.product.create({
        data: {
          ...scalars,
          images: { create: images },
          variants: { create: variants },
        },
      });
      productId = created.id;
    }
  } catch (error) {
    console.error("[saveProduct]", error);
    return fail("No pudimos guardar el producto. Inténtalo de nuevo.");
  }

  revalidateStorefront(data.slug);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);

  return { ...ok("Producto guardado."), slug: data.slug };
}

export async function toggleProductActive(
  productId: string
): Promise<ActionState> {
  await requireAdmin();

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { active: true, slug: true },
  });

  if (!product) return fail("Ese producto ya no existe.");

  await db.product.update({
    where: { id: productId },
    data: { active: !product.active },
  });

  revalidateStorefront(product.slug);
  revalidatePath("/admin/productos");

  return ok(product.active ? "Producto oculto." : "Producto publicado.");
}

export async function deleteProduct(productId: string): Promise<ActionState> {
  await requireAdmin();

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true, _count: { select: { orderItems: true } } },
  });

  if (!product) return fail("Ese producto ya no existe.");

  /**
   * Un producto con pedidos no se borra: las líneas conservan su nombre y
   * precio, pero perder la referencia rompería el enlace del histórico. Se
   * oculta, que es lo que el equipo quiere el 99 % de las veces.
   */
  if (product._count.orderItems > 0) {
    await db.product.update({
      where: { id: productId },
      data: { active: false },
    });

    revalidateStorefront(product.slug);
    revalidatePath("/admin/productos");

    return ok(
      "Este producto tiene pedidos asociados, así que se ocultó en vez de eliminarse."
    );
  }

  await db.product.delete({ where: { id: productId } });

  revalidateStorefront(product.slug);
  revalidatePath("/admin/productos");

  return ok("Producto eliminado.");
}

// ---------------------------------------------------------------------------
// Banners
// ---------------------------------------------------------------------------

export async function saveBanner(
  input: unknown,
  bannerId?: string
): Promise<ActionState> {
  await requireAdmin();

  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Revisa los campos marcados.", toFieldErrors(parsed.error));
  }

  const data = {
    ...parsed.data,
    eyebrow: parsed.data.eyebrow ?? null,
    subtitle: parsed.data.subtitle ?? null,
    ctaLabel: parsed.data.ctaLabel ?? null,
    ctaHref: parsed.data.ctaHref ?? null,
    image: parsed.data.image ?? null,
    startsAt: parsed.data.startsAt ?? null,
    endsAt: parsed.data.endsAt ?? null,
  };

  if (bannerId) {
    await db.banner.update({ where: { id: bannerId }, data });
  } else {
    await db.banner.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");

  return ok("Banner guardado.");
}

/**
 * La home muestra un solo banner, así que activar uno apaga el resto: evita
 * que el equipo se pregunte por qué no ve el que acaba de encender.
 */
export async function activateBanner(bannerId: string): Promise<ActionState> {
  await requireAdmin();

  const banner = await db.banner.findUnique({
    where: { id: bannerId },
    select: { active: true },
  });

  if (!banner) return fail("Ese banner ya no existe.");

  if (banner.active) {
    await db.banner.update({ where: { id: bannerId }, data: { active: false } });
  } else {
    await db.$transaction([
      db.banner.updateMany({ data: { active: false } }),
      db.banner.update({ where: { id: bannerId }, data: { active: true } }),
    ]);
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");

  return ok(banner.active ? "Banner desactivado." : "Banner activado en la home.");
}

export async function deleteBanner(bannerId: string): Promise<ActionState> {
  await requireAdmin();

  await db.banner.delete({ where: { id: bannerId } }).catch(() => undefined);

  revalidatePath("/");
  revalidatePath("/admin/banners");

  return ok("Banner eliminado.");
}

// ---------------------------------------------------------------------------
// Reseñas
// ---------------------------------------------------------------------------

export async function saveReview(
  input: unknown,
  reviewId?: string
): Promise<ActionState> {
  await requireAdmin();

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Revisa los campos marcados.", toFieldErrors(parsed.error));
  }

  const data = {
    ...parsed.data,
    productId: parsed.data.productId ?? null,
    city: parsed.data.city ?? null,
    title: parsed.data.title ?? null,
  };

  if (reviewId) {
    await db.review.update({ where: { id: reviewId }, data });
  } else {
    await db.review.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/resenas");

  return ok("Reseña guardada.");
}

export async function toggleReviewFlag(
  reviewId: string,
  flag: "approved" | "featured"
): Promise<ActionState> {
  await requireAdmin();

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { approved: true, featured: true, product: { select: { slug: true } } },
  });

  if (!review) return fail("Esa reseña ya no existe.");

  await db.review.update({
    where: { id: reviewId },
    data: { [flag]: !review[flag] },
  });

  revalidatePath("/");
  revalidatePath("/admin/resenas");
  if (review.product) revalidatePath(`/productos/${review.product.slug}`);

  return ok("Reseña actualizada.");
}

export async function deleteReview(reviewId: string): Promise<ActionState> {
  await requireAdmin();

  await db.review.delete({ where: { id: reviewId } }).catch(() => undefined);

  revalidatePath("/");
  revalidatePath("/admin/resenas");

  return ok("Reseña eliminada.");
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function logout() {
  const { signOut } = await import("@/auth");
  await signOut({ redirect: false });
  redirect("/login");
}

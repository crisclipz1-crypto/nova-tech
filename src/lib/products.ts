import "server-only";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { CatalogParams } from "@/lib/validations";

/**
 * `mode: "insensitive"` no existe en SQLite y Prisma lanza error si se envía;
 * en Postgres, en cambio, hace falta para que la búsqueda ignore mayúsculas.
 * Esto resuelve la diferencia en un solo sitio.
 */
const INSENSITIVE = process.env.DATABASE_URL?.startsWith("file:")
  ? {}
  : ({ mode: "insensitive" } as const);

export const PAGE_SIZE = 12;

/** Campos que necesita una tarjeta de producto. Evita traer la descripción. */
const cardSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  badge: true,
  bestSeller: true,
  isNew: true,
  brand: true,
  unitsSold: true,
  category: { select: { name: true, slug: true } },
  images: {
    select: { url: true, alt: true },
    orderBy: { position: "asc" },
    take: 2,
  },
  // Con variantes, la tarjeta manda al detalle en vez de añadir directo:
  // no se puede elegir color o capacidad desde el listado.
  _count: { select: { variants: true } },
} as const;

export type ProductCard = Awaited<
  ReturnType<typeof db.product.findMany<{ select: typeof cardSelect }>>
>[number];

export type Spec = { label: string; value: string };

/**
 * `specs` viaja como texto para que el esquema funcione igual en SQLite y en
 * Postgres. Si el JSON estuviera corrupto devolvemos una lista vacía en vez de
 * romper la página de producto.
 */
export function parseSpecs(raw: string): Spec[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Spec =>
        typeof s?.label === "string" && typeof s?.value === "string"
    );
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

/** Banner activo cuya ventana de fechas incluye el momento actual. */
export async function getActiveBanner() {
  const now = new Date();
  return db.banner.findFirst({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { position: "asc" },
  });
}

export async function getBestSellers(take = 8) {
  return db.product.findMany({
    where: { active: true, bestSeller: true },
    select: cardSelect,
    orderBy: { unitsSold: "desc" },
    take,
  });
}

export async function getNewArrivals(take = 8) {
  return db.product.findMany({
    where: { active: true },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

/** Productos con precio tachado mayor al de venta. */
export async function getOnSale(take = 8) {
  const products = await db.product.findMany({
    where: { active: true, compareAtPrice: { not: null } },
    select: cardSelect,
    orderBy: { unitsSold: "desc" },
    take: take * 2,
  });
  return products
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
    .slice(0, take);
}

export async function getFeaturedReviews(take = 6) {
  return db.review.findMany({
    where: { approved: true, featured: true },
    orderBy: { createdAt: "desc" },
    take,
    include: { product: { select: { name: true, slug: true } } },
  });
}

export async function getCategories() {
  return db.category.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
}

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

export type CatalogResult = {
  products: ProductCard[];
  total: number;
  page: number;
  pages: number;
  /** Rango real de precios del catálogo, para los atajos del filtro. */
  priceRange: { min: number; max: number };
};

export async function getCatalog(params: CatalogParams): Promise<CatalogResult> {
  const page = params.pagina ?? 1;

  const where = {
    active: true,
    ...(params.categoria ? { category: { slug: params.categoria } } : {}),
    ...(params.stock !== "todos" ? { stock: { gt: 0 } } : {}),
    ...(params.min !== undefined || params.max !== undefined
      ? {
          price: {
            ...(params.min !== undefined ? { gte: params.min } : {}),
            ...(params.max !== undefined ? { lte: params.max } : {}),
          },
        }
      : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, ...INSENSITIVE } },
            { summary: { contains: params.q, ...INSENSITIVE } },
            { brand: { contains: params.q, ...INSENSITIVE } },
            { slug: { contains: params.q.toLowerCase() } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (params.orden) {
      case "precio-asc":
        return [{ price: "asc" }];
      case "precio-desc":
        return [{ price: "desc" }];
      case "nuevos":
        return [{ createdAt: "desc" }];
      case "vendidos":
        return [{ unitsSold: "desc" }];
      default:
        // "Relevancia": primero lo que la tienda quiere empujar.
        return [{ featured: "desc" }, { unitsSold: "desc" }];
    }
  })();

  const [rows, total, cheapest, priciest] = await Promise.all([
    db.product.findMany({
      where,
      select: cardSelect,
      orderBy,
      // El filtro de ofertas no se puede expresar en SQL portable (comparar dos
      // columnas), así que se pide de más y se recorta después.
      skip: params.oferta ? 0 : (page - 1) * PAGE_SIZE,
      take: params.oferta ? 200 : PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.product.findFirst({
      where: { active: true },
      orderBy: { price: "asc" },
      select: { price: true },
    }),
    db.product.findFirst({
      where: { active: true },
      orderBy: { price: "desc" },
      select: { price: true },
    }),
  ]);

  let products = rows;
  let count = total;

  if (params.oferta) {
    const discounted = rows.filter(
      (p) => p.compareAtPrice && p.compareAtPrice > p.price
    );
    count = discounted.length;
    products = discounted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }

  return {
    products,
    total: count,
    page,
    pages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
    priceRange: { min: cheapest?.price ?? 0, max: priciest?.price ?? 0 },
  };
}

/** Búsqueda ligera para el buscador en vivo de la cabecera. */
export async function searchProducts(query: string, take = 6) {
  const q = query.trim();
  if (q.length < 2) return [];

  return db.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q, ...INSENSITIVE } },
        { summary: { contains: q, ...INSENSITIVE } },
        { brand: { contains: q, ...INSENSITIVE } },
        { slug: { contains: q.toLowerCase() } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      category: { select: { name: true } },
      images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: [{ unitsSold: "desc" }],
    take,
  });
}

// ---------------------------------------------------------------------------
// Detalle
// ---------------------------------------------------------------------------

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, active: true },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ group: "asc" }, { position: "asc" }] },
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  take = 4
) {
  return db.product.findMany({
    where: { active: true, categoryId, id: { not: excludeId } },
    select: cardSelect,
    orderBy: { unitsSold: "desc" },
    take,
  });
}

/** Slugs activos para `generateStaticParams`. */
export async function getAllProductSlugs() {
  return db.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
}

/**
 * Suma una visita. Es telemetría del panel: si falla, la página igual se
 * muestra, así que nunca debe propagar el error.
 */
export async function trackProductView(id: string) {
  await db.product
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(() => undefined);
}

/** Media y conteo de estrellas de un producto. */
export function ratingOf(reviews: { rating: number }[]) {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

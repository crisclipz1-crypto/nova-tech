import "server-only";

import { db } from "@/lib/db";
import type { OrderStatus } from "@/lib/config";

const CANCELLED = "CANCELADO";

/**
 * Métricas del dashboard.
 *
 * "Ventas estimadas" excluye los pedidos cancelados pero incluye los que aún
 * están pendientes de confirmar: en pago contra entrega, hasta que el cliente
 * no recibe no hay dinero real, así que la cifra es una previsión, no caja. El
 * desglose por estado que viene debajo deja ver cuánto de eso ya se cobró.
 */
export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    estimated,
    delivered,
    thisMonth,
    lastMonth,
    byStatus,
    pending,
    lowStock,
    totalProducts,
  ] = await Promise.all([
    db.order.aggregate({
      where: { status: { not: CANCELLED } },
      _sum: { total: true },
      _count: true,
    }),
    db.order.aggregate({
      where: { status: "ENTREGADO" },
      _sum: { total: true },
      _count: true,
    }),
    db.order.aggregate({
      where: { status: { not: CANCELLED }, createdAt: { gte: monthStart } },
      _sum: { total: true },
      _count: true,
    }),
    db.order.aggregate({
      where: {
        status: { not: CANCELLED },
        createdAt: { gte: previousMonthStart, lt: monthStart },
      },
      _sum: { total: true },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    db.order.count({ where: { status: "PENDIENTE" } }),
    db.product.count({ where: { active: true, stock: { lte: 5 } } }),
    db.product.count({ where: { active: true } }),
  ]);

  const currentRevenue = thisMonth._sum.total ?? 0;
  const previousRevenue = lastMonth._sum.total ?? 0;

  // Sin mes anterior no hay comparación posible: mostrar "+100 %" sería mentir.
  const growth =
    previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : null;

  const orderCount = estimated._count || 0;

  return {
    estimatedRevenue: estimated._sum.total ?? 0,
    orderCount,
    deliveredRevenue: delivered._sum.total ?? 0,
    deliveredCount: delivered._count || 0,
    monthRevenue: currentRevenue,
    monthCount: thisMonth._count || 0,
    growth,
    averageTicket: orderCount > 0 ? Math.round((estimated._sum.total ?? 0) / orderCount) : 0,
    pending,
    lowStock,
    totalProducts,
    byStatus: byStatus.map((row) => ({
      status: row.status as OrderStatus,
      count: row._count._all,
      total: row._sum.total ?? 0,
    })),
  };
}

export async function getRecentOrders(take = 6) {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      customerName: true,
      city: true,
      total: true,
      itemsCount: true,
      createdAt: true,
    },
  });
}

export async function getTopProducts(take = 5) {
  return db.product.findMany({
    where: { unitsSold: { gt: 0 } },
    orderBy: { unitsSold: "desc" },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      unitsSold: true,
      views: true,
      stock: true,
      images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
    },
  });
}

export async function getMostViewedProducts(take = 5) {
  return db.product.findMany({
    where: { views: { gt: 0 } },
    orderBy: { views: "desc" },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      views: true,
      unitsSold: true,
      images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
    },
  });
}

export async function getLowStockProducts(take = 5) {
  return db.product.findMany({
    where: { active: true, stock: { lte: 5 } },
    orderBy: { stock: "asc" },
    take,
    select: { id: true, name: true, slug: true, stock: true },
  });
}

// ---------------------------------------------------------------------------
// Listados del panel
// ---------------------------------------------------------------------------

export async function getAdminOrders({
  status,
  query,
  page = 1,
  pageSize = 20,
}: {
  status?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const insensitive = process.env.DATABASE_URL?.startsWith("file:")
    ? {}
    : ({ mode: "insensitive" } as const);

  const where = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, ...insensitive } },
            { customerName: { contains: query, ...insensitive } },
            { customerPhone: { contains: query.replace(/\D/g, "") } },
            { city: { contains: query, ...insensitive } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: {
          select: { productName: true, quantity: true },
        },
      },
    }),
    db.order.count({ where }),
  ]);

  return { orders, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdminOrder(id: string) {
  return db.order.findUnique({ where: { id }, include: { items: true } });
}

export async function getAdminProducts({
  query,
  categoryId,
}: {
  query?: string;
  categoryId?: string;
}) {
  const insensitive = process.env.DATABASE_URL?.startsWith("file:")
    ? {}
    : ({ mode: "insensitive" } as const);

  return db.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, ...insensitive } },
              { sku: { contains: query, ...insensitive } },
              { slug: { contains: query.toLowerCase() } },
            ],
          }
        : {}),
    },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { name: true } },
      images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
      _count: { select: { variants: true, orderItems: true } },
    },
  });
}

export async function getAdminProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ group: "asc" }, { position: "asc" }] },
    },
  });
}

export async function getAllCategories() {
  return db.category.findMany({ orderBy: { position: "asc" } });
}

export async function getAdminBanners() {
  return db.banner.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
}

export async function getAdminReviews() {
  return db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
  });
}

export async function getProductOptions() {
  return db.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

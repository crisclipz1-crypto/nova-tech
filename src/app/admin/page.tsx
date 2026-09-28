import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BanknoteArrowDown,
  Clock,
  Eye,
  Package,
  ReceiptText,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  getDashboardStats,
  getLowStockProducts,
  getMostViewedProducts,
  getRecentOrders,
  getTopProducts,
} from "@/lib/admin-queries";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/config";
import { formatNumber, formatPrice, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, recentOrders, topProducts, mostViewed, lowStock] =
    await Promise.all([
      getDashboardStats(),
      getRecentOrders(6),
      getTopProducts(5),
      getMostViewedProducts(5),
      getLowStockProducts(5),
    ]);

  const maxSold = topProducts[0]?.unitsSold ?? 1;
  const maxViews = mostViewed[0]?.views ?? 1;

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-brand">Dashboard</p>
        <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
          Cómo va la tienda
        </h1>
      </header>

      {stats.pending > 0 && (
        <Link
          href="/admin/pedidos?estado=PENDIENTE"
          className="group flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-muted/50 p-4 transition-colors hover:border-brand/60"
        >
          <Clock className="size-5 shrink-0 text-brand" />
          <p className="flex-1 text-sm">
            <span className="font-medium">
              {stats.pending}{" "}
              {stats.pending === 1 ? "pedido pendiente" : "pedidos pendientes"}
            </span>{" "}
            <span className="text-muted-foreground">
              de confirmar con el cliente.
            </span>
          </p>
          <ArrowRight className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas estimadas"
          value={formatPrice(stats.estimatedRevenue)}
          hint={`${stats.orderCount} pedidos sin cancelar`}
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Cobrado (entregado)"
          value={formatPrice(stats.deliveredRevenue)}
          hint={`${stats.deliveredCount} entregas completadas`}
          icon={BanknoteArrowDown}
        />
        <StatCard
          label="Este mes"
          value={formatPrice(stats.monthRevenue)}
          hint={`${stats.monthCount} pedidos`}
          trend={stats.growth}
          icon={ReceiptText}
          href="/admin/pedidos"
        />
        <StatCard
          label="Ticket promedio"
          value={formatPrice(stats.averageTicket)}
          hint={`${stats.totalProducts} productos activos`}
          icon={Package}
          href="/admin/productos"
        />
      </section>

      {/* Reparto por estado: da de un vistazo dónde está atascada la operación. */}
      <section className="rounded-xl border p-5">
        <h2 className="eyebrow text-muted-foreground">Pedidos por estado</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((status) => {
            const row = stats.byStatus.find((item) => item.status === status);
            const meta = ORDER_STATUS_META[status];

            return (
              <li key={status}>
                <Link
                  href={`/admin/pedidos?estado=${status}`}
                  className="group block"
                >
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`size-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </p>
                  <p className="tabular mt-1 text-xl font-medium transition-colors group-hover:text-brand">
                    {row?.count ?? 0}
                  </p>
                  <p className="tabular text-xs text-muted-foreground">
                    {formatPrice(row?.total ?? 0)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {lowStock.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="flex items-center gap-2 text-sm font-medium text-amber-900">
            <TriangleAlert className="size-4" />
            Stock bajo ({stats.lowStock})
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {lowStock.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-background px-3 py-1.5 text-xs transition-colors hover:border-amber-500"
                >
                  {product.name}
                  <span className="tabular font-mono text-amber-700">
                    {product.stock}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-medium">Últimos pedidos</h2>
            <Link
              href="/admin/pedidos"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver todos
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay pedidos.
            </p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {order.customerName}
                        </span>
                        <StatusBadge status={order.status} />
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                        {order.orderNumber} · {order.city} ·{" "}
                        {timeAgo(order.createdAt)}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-sm font-medium">
                      {formatPrice(order.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-medium">Más vendidos</h2>
          </div>

          {topProducts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Sin ventas registradas.
            </p>
          ) : (
            <ul className="divide-y">
              {topProducts.map((product) => (
                <li key={product.id} className="px-5 py-3.5">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="flex items-center gap-3"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {product.name}
                      </span>
                      {/* Barra proporcional al líder: compara de un vistazo
                          sin necesidad de leer las cifras. */}
                      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{
                            width: `${(product.unitsSold / maxSold) * 100}%`,
                          }}
                        />
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="tabular block text-sm font-medium">
                        {formatNumber(product.unitsSold)}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        vendidos
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Eye className="size-4 text-muted-foreground" />
            Más vistos
          </h2>
          <p className="text-xs text-muted-foreground">
            Visitas a la ficha de producto
          </p>
        </div>

        {mostViewed.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Sin visitas registradas todavía.
          </p>
        ) : (
          <ul className="divide-y">
            {mostViewed.map((product) => {
              // Conversión aproximada: no hay sesiones, pero la relación
              // ventas/visitas ya señala qué ficha no está convirtiendo.
              const rate =
                product.views > 0
                  ? Math.round((product.unitsSold / product.views) * 1000) / 10
                  : 0;

              return (
                <li key={product.id} className="px-5 py-3.5">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="flex items-center gap-3"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {product.name}
                      </span>
                      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-foreground/30"
                          style={{ width: `${(product.views / maxViews) * 100}%` }}
                        />
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="tabular block text-sm font-medium">
                        {formatNumber(product.views)}
                      </span>
                      <span className="tabular block text-[11px] text-muted-foreground">
                        {rate}% convierte
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

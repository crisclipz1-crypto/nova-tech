import Link from "next/link";
import { Download, Inbox, Search } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";
import { getAdminOrders } from "@/lib/admin-queries";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/config";
import { formatDateTime, formatPrice, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pedidos" };

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; pagina?: string }>;
}) {
  const { estado, q, pagina } = await searchParams;

  const status =
    estado && estado in ORDER_STATUS_META ? estado : undefined;
  const page = Math.max(1, Number(pagina) || 1);

  const { orders, total, pages } = await getAdminOrders({
    status,
    query: q?.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  function href(params: Record<string, string | undefined>) {
    const search = new URLSearchParams();
    const merged = { estado: status, q, ...params };
    for (const [key, value] of Object.entries(merged)) {
      if (value) search.set(key, value);
    }
    const query = search.toString();
    return query ? `/admin/pedidos?${query}` : "/admin/pedidos";
  }

  const exportHref = `/api/admin/pedidos/export${
    status ? `?estado=${status}` : ""
  }`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brand">Pedidos</p>
          <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
            {total} {total === 1 ? "pedido" : "pedidos"}
          </h1>
        </div>

        {/* La exportación es un enlace normal: el navegador descarga el CSV
            sin que la página tenga que manejar el blob. */}
        <a
          href={exportHref}
          className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors hover:border-foreground"
        >
          <Download className="size-4" />
          Exportar CSV
        </a>
      </header>

      <div className="space-y-3">
        <form action="/admin/pedidos" className="relative">
          {status && <input type="hidden" name="estado" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por número, nombre, teléfono o ciudad…"
            className="h-11 pl-10"
          />
        </form>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Link
            href={href({ estado: undefined, pagina: undefined })}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              !status
                ? "border-brand bg-brand text-brand-foreground"
                : "hover:border-foreground"
            }`}
          >
            Todos
          </Link>
          {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((key) => (
            <Link
              key={key}
              href={href({ estado: key, pagina: undefined })}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                status === key
                  ? "border-brand bg-brand text-brand-foreground"
                  : "hover:border-foreground"
              }`}
            >
              {ORDER_STATUS_META[key].label}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <Inbox className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No hay pedidos con estos filtros</p>
          <Link
            href="/admin/pedidos"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Ver todos los pedidos
          </Link>
        </div>
      ) : (
        <>
          {/* Móvil: tarjetas. Una tabla obligaría a hacer scroll horizontal
              justo cuando el equipo revisa pedidos desde el celular. */}
          <ul className="space-y-3 lg:hidden">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="block rounded-xl border p-4 transition-colors hover:border-foreground/25"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {order.customerName}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {order.orderNumber}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {order.city}, {order.department} · {order.itemsCount}{" "}
                    {order.itemsCount === 1 ? "unidad" : "unidades"}
                  </p>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="tabular text-base font-medium">
                      {formatPrice(order.total)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(order.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Escritorio: tabla */}
          <div className="hidden overflow-hidden rounded-xl border lg:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-surface">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Destino</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {order.itemsCount}{" "}
                        {order.itemsCount === 1 ? "unidad" : "unidades"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.customerName}
                      </Link>
                      <span className="tabular mt-0.5 block text-[11px] text-muted-foreground">
                        +{order.customerPhone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.city}
                      <span className="block text-[11px]">
                        {order.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="tabular px-4 py-3 text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <nav className="flex items-center justify-center gap-2 pt-2">
              {page > 1 && (
                <Link
                  href={href({ pagina: String(page - 1) })}
                  className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-foreground"
                >
                  Anterior
                </Link>
              )}
              <span className="tabular px-3 text-sm text-muted-foreground">
                {page} / {pages}
              </span>
              {page < pages && (
                <Link
                  href={href({ pagina: String(page + 1) })}
                  className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-foreground"
                >
                  Siguiente
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

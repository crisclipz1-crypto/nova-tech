import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Phone, User } from "lucide-react";

import { OrderStatusForm } from "@/components/admin/order-status-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { CopyButton } from "@/components/admin/copy-button";
import { getAdminOrder } from "@/lib/admin-queries";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (!order) notFound();

  const shippingBlock = [
    order.customerName,
    `+${order.customerPhone}`,
    order.address,
    `${order.city}, ${order.department}`,
    order.notes ? `Referencias: ${order.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const timeline = [
    { label: "Recibido", at: order.createdAt },
    { label: "Confirmado", at: order.confirmedAt },
    { label: "Enviado", at: order.shippedAt },
    { label: "Entregado", at: order.deliveredAt },
  ].filter((step) => step.at);

  // Mensaje de seguimiento listo para enviar desde el panel.
  const whatsAppHref = `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(
    `Hola ${order.customerName.split(" ")[0]}, te escribimos de NOVA TECH por tu pedido ${order.orderNumber}.`
  )}`;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Todos los pedidos
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-muted-foreground">
            {order.orderNumber}
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-[-0.03em]">
            {order.customerName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.status} />
          <p className="tabular text-2xl font-medium">
            {formatPrice(order.total)}
          </p>
        </div>
      </header>

      {order.status === "CANCELADO" && order.cancelReason && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <strong className="font-medium">Cancelado:</strong> {order.cancelReason}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border">
            <h2 className="border-b px-5 py-4 text-sm font-medium">Productos</h2>

            <ul className="divide-y px-5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3.5 py-4">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/productos/${item.productSlug}`}
                      target="_blank"
                      className="block text-sm font-medium hover:underline"
                    >
                      {item.productName}
                    </Link>
                    {item.variantLabel && (
                      <span className="block text-xs text-muted-foreground">
                        {item.variantLabel}
                      </span>
                    )}
                    <span className="tabular mt-1 block text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                  </span>

                  <span className="tabular shrink-0 text-sm font-medium">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className="tabular">
                  {order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2.5 text-base font-medium">
                <dt>A cobrar contra entrega</dt>
                <dd className="tabular">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-muted-foreground" />
                Datos de envío
              </h2>
              <CopyButton value={shippingBlock} label="Copiar para logística" />
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted-foreground">
                  <User className="mr-1.5 inline size-3.5" />
                  Cliente
                </dt>
                <dd className="font-medium">{order.customerName}</dd>
              </div>

              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted-foreground">
                  <Phone className="mr-1.5 inline size-3.5" />
                  Teléfono
                </dt>
                <dd className="tabular">
                  <a
                    href={`tel:+${order.customerPhone}`}
                    className="hover:underline"
                  >
                    +{order.customerPhone}
                  </a>
                </dd>
              </div>

              {order.customerEmail && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 text-muted-foreground">Correo</dt>
                  <dd>
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="hover:underline"
                    >
                      {order.customerEmail}
                    </a>
                  </dd>
                </div>
              )}

              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted-foreground">Dirección</dt>
                <dd>
                  {order.address}
                  <span className="block text-muted-foreground">
                    {order.city}, {order.department}
                  </span>
                </dd>
              </div>

              {order.notes && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 text-muted-foreground">
                    Referencias
                  </dt>
                  <dd className="text-muted-foreground">{order.notes}</dd>
                </div>
              )}
            </dl>

            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-success px-4 text-sm font-medium text-white transition-colors hover:bg-success/90"
            >
              <MessageCircle className="size-4" />
              Escribir al cliente
            </a>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border p-5">
            <OrderStatusForm
              orderId={order.id}
              status={order.status as OrderStatus}
              adminNotes={order.adminNotes}
              cancelReason={order.cancelReason}
            />
          </section>

          <section className="rounded-xl border p-5">
            <h2 className="eyebrow mb-4 text-muted-foreground">Historial</h2>
            <ol className="space-y-3">
              {timeline.map((step) => (
                <li key={step.label} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  <span>
                    <span className="block font-medium">{step.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDateTime(step.at!)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}

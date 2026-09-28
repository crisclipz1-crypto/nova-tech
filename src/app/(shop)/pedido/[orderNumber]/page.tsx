import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BanknoteArrowDown, Check, Clock, MapPin, Package } from "lucide-react";

import { WhatsAppHandoff } from "@/components/checkout/whatsapp-handoff";
import { getOrderByNumber, whatsAppUrl } from "@/lib/orders";
import { ownsOrder } from "@/lib/order-access";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  // Los consecutivos son adivinables, así que la cookie de compra hace de
  // llave: sin ella la página se comporta como si el pedido no existiera.
  if (!(await ownsOrder(orderNumber))) notFound();

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const status = ORDER_STATUS_META[order.status as OrderStatus];

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success/10">
            <Check className="size-6 text-success" strokeWidth={2.5} />
          </span>

          <h1 className="display-2 mt-6 text-balance">
            ¡Listo, {order.customerName.split(" ")[0]}!
          </h1>
          <p className="mt-3 max-w-md text-base text-pretty text-muted-foreground">
            Tu pedido quedó registrado. Te escribimos por WhatsApp para
            confirmarlo y coordinar la entrega.
          </p>

          <p className="mt-6 flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm">
            <Package className="size-3.5 text-muted-foreground" />
            {order.orderNumber}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <h2 className="eyebrow text-muted-foreground">Estado</h2>
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium">
              <span className={`size-2 rounded-full ${status.dot}`} />
              {status.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {status.description}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2">
              <BanknoteArrowDown className="size-4 text-muted-foreground" />
              <h2 className="eyebrow text-muted-foreground">Pagas al recibir</h2>
            </div>
            <p className="tabular mt-3 text-2xl font-medium">
              {formatPrice(order.total)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              En efectivo, al mensajero
            </p>
          </div>
        </div>

        <div className="mt-5">
          <WhatsAppHandoff href={whatsAppUrl(order)} />
        </div>

        <section className="mt-10 rounded-xl border">
          <h2 className="border-b px-5 py-4 text-sm font-medium">
            Lo que pediste
          </h2>

          <ul className="divide-y px-5">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3.5 py-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <Link
                    href={`/productos/${item.productSlug}`}
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
                {order.shipping === 0 ? (
                  <span className="text-success">Gratis</span>
                ) : (
                  formatPrice(order.shipping)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-2.5 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-5 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <h2 className="eyebrow text-muted-foreground">Entrega</h2>
          </div>
          <address className="mt-3 text-sm leading-relaxed not-italic">
            <span className="font-medium">{order.customerName}</span>
            <br />
            {order.address}
            <br />
            {order.city}, {order.department}
            <br />
            <span className="tabular text-muted-foreground">
              +{order.customerPhone}
            </span>
          </address>
          {order.notes && (
            <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Referencias: </span>
              {order.notes}
            </p>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/productos"
            className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

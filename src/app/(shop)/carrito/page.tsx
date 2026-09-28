"use client";

import Link from "next/link";
import { ArrowRight, BanknoteArrowDown, ShoppingBag, Trash2 } from "lucide-react";

import { LinkButton } from "@/components/shared/link-button";
import { CartLine } from "@/components/cart/cart-line";
import { FreeShippingMeter } from "@/components/cart/free-shipping-meter";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice, padCount } from "@/lib/format";

/**
 * Vista completa del carrito, pensada para revisar el pedido con calma antes
 * de pagar. El panel lateral sigue siendo el camino rápido; esta página es la
 * que se comparte y a la que se vuelve desde el checkout.
 */
export default function CartPage() {
  const { items, hydrated, count, subtotal, shipping, total, clear } = useCart();

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="display-1">Tu carrito</h1>
          <span className="tabular font-mono text-sm text-muted-foreground">
            {hydrated ? padCount(count) : "···"}
          </span>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-sale"
          >
            <Trash2 className="size-3.5" />
            Vaciar carrito
          </button>
        )}
      </header>

      {/* Hasta leer localStorage no se sabe si hay productos: sin este estado
          intermedio la página parpadearía mostrando "vacío" a todo el mundo. */}
      {!hydrated ? (
        <div className="mt-12 space-y-4">
          {[0, 1].map((row) => (
            <div key={row} className="flex animate-pulse gap-5 py-6">
              <div className="size-24 shrink-0 rounded-lg bg-surface sm:size-32" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-4 w-2/3 rounded bg-surface" />
                <div className="h-3 w-1/3 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-6 rounded-2xl border border-dashed py-20 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-surface">
            <ShoppingBag className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-medium tracking-[-0.02em]">
              Ni una sola cosa por aquí
            </p>
            <p className="max-w-sm text-sm text-balance text-muted-foreground">
              Cuando encuentres algo que te sirva, aparecerá en esta lista. Lo
              pagas cuando lo tengas en la mano.
            </p>
          </div>
          <LinkButton href="/productos" className="h-12 rounded-full px-7">
            Explorar el catálogo
            <ArrowRight className="size-4" />
          </LinkButton>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div>
            <ul className="divide-y border-y">
              {items.map((item) => (
                <CartLine key={item.key} item={item} size="lg" />
              ))}
            </ul>

            <Link
              href="/productos"
              className="link-underline mt-6 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Seguir comprando
            </Link>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border p-5">
              <h2 className="eyebrow text-muted-foreground">Resumen</h2>

              <div className="mt-4 border-b pb-4">
                <FreeShippingMeter subtotal={subtotal} />
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Subtotal ({count} {count === 1 ? "producto" : "productos"})
                  </dt>
                  <dd className="tabular">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Envío</dt>
                  <dd className="tabular">
                    {shipping === 0 ? (
                      <span className="text-success">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg font-medium">
                  <dt>Total a pagar</dt>
                  <dd className="tabular">{formatPrice(total)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                <BanknoteArrowDown className="mt-0.5 size-4 shrink-0 text-success" />
                <span>
                  Pagas este total en efectivo cuando recibas el pedido. No
                  pedimos tarjeta ni transferencia.
                </span>
              </div>

              <LinkButton
                href="/checkout"
                className="group mt-5 h-13 w-full rounded-full text-sm"
              >
                Continuar con el pedido
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </LinkButton>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

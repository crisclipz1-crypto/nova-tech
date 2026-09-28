"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { cn } from "cn";

import { FreeShippingMeter } from "@/components/cart/free-shipping-meter";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice, padCount } from "@/lib/format";

/**
 * Resumen del pedido en el checkout.
 *
 * En móvil arranca plegado y se despliega: ocupa una línea en vez de media
 * pantalla, y el formulario —que es lo que hay que completar— queda a la vista
 * desde el principio. En escritorio se muestra siempre, fijo en la columna.
 */
export function OrderSummary() {
  const { items, hydrated, count, subtotal, shipping, total } = useCart();
  const [expanded, setExpanded] = useState(false);

  if (!hydrated) {
    return (
      <div className="h-32 animate-pulse rounded-xl border bg-surface/50" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <ShoppingBag className="mx-auto size-5 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Tu carrito está vacío</p>
        <Link
          href="/productos"
          className="link-underline mt-1 inline-block text-sm text-muted-foreground"
        >
          Ver el catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40 lg:pointer-events-none"
      >
        <span className="flex items-baseline gap-2">
          <span className="text-sm font-medium">Resumen del pedido</span>
          <span className="tabular font-mono text-[11px] text-muted-foreground">
            {padCount(count)}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="tabular text-sm font-medium">
            {formatPrice(total)}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform lg:hidden",
              expanded && "rotate-180"
            )}
          />
        </span>
      </button>

      <div className={cn("border-t", !expanded && "hidden lg:block")}>
        <ul className="divide-y px-5">
          {items.map((item) => (
            <li key={item.key} className="flex gap-3 py-3.5">
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
                <span className="tabular absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-brand font-mono text-[10px] text-brand-foreground">
                  {item.quantity}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {item.name}
                </span>
                {item.variants.length > 0 && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.variants.map((v) => v.value).join(" · ")}
                  </span>
                )}
              </span>

              <span className="tabular shrink-0 text-sm">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t px-5 py-4">
          <FreeShippingMeter subtotal={subtotal} />
        </div>

        <dl className="space-y-2 border-t px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
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
          <div className="flex justify-between border-t pt-2.5 text-base font-medium">
            <dt>Pagas al recibir</dt>
            <dd className="tabular">{formatPrice(total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

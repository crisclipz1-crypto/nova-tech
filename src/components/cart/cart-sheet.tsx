"use client";

import { ArrowRight, BanknoteArrowDown, ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LinkButton } from "@/components/shared/link-button";
import { CartLine } from "@/components/cart/cart-line";
import { FreeShippingMeter } from "@/components/cart/free-shipping-meter";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice, padCount } from "@/lib/format";

/**
 * Panel lateral del carrito. Vive en el layout de la tienda y lo abre cualquier
 * componente a través de `useCart().setOpen(true)`.
 */
export function CartSheet() {
  const { items, count, subtotal, shipping, total, isOpen, setOpen } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-baseline gap-2.5 text-base">
            Tu carrito
            <span className="tabular font-mono text-xs text-muted-foreground">
              {padCount(count)}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Productos añadidos a tu carrito de compras
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-surface">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <p className="font-medium">Todavía no hay nada aquí</p>
              <p className="text-sm text-balance text-muted-foreground">
                Mira el catálogo: lo pagas cuando lo tengas en la mano.
              </p>
            </div>
            <LinkButton
              href="/productos"
              onClick={() => setOpen(false)}
              className="h-11 rounded-full px-6"
            >
              Ver productos
            </LinkButton>
          </div>
        ) : (
          <>
            <div className="border-b px-5 py-3">
              <FreeShippingMeter subtotal={subtotal} />
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              <ul className="divide-y">
                {items.map((item) => (
                  <CartLine
                    key={item.key}
                    item={item}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </ul>
            </div>

            <div className="space-y-4 border-t px-5 py-4">
              <dl className="space-y-1.5 text-sm">
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
                <div className="flex justify-between border-t pt-2 text-base font-medium">
                  <dt>Total</dt>
                  <dd className="tabular">{formatPrice(total)}</dd>
                </div>
              </dl>

              <div className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                <BanknoteArrowDown className="mt-0.5 size-4 shrink-0 text-success" />
                <span>
                  Pagas en efectivo al recibir. No pedimos tarjeta ni datos
                  bancarios.
                </span>
              </div>

              <div className="grid gap-2">
                <LinkButton
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="group h-12 w-full rounded-full text-sm"
                >
                  Finalizar pedido
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </LinkButton>
                <LinkButton
                  variant="ghost"
                  href="/carrito"
                  onClick={() => setOpen(false)}
                  className="h-10 w-full rounded-full text-sm"
                >
                  Ver el carrito completo
                </LinkButton>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

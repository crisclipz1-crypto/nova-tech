"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "cn";

import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart, type CartItem } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";

export function CartLine({
  item,
  size = "sm",
  onNavigate,
}: {
  item: CartItem;
  size?: "sm" | "lg";
  onNavigate?: () => void;
}) {
  const { setQuantity, remove } = useCart();
  const large = size === "lg";

  return (
    <li
      className={cn(
        "flex gap-3 py-4",
        large && "gap-5 py-6 sm:gap-6"
      )}
    >
      <Link
        href={`/productos/${item.slug}`}
        onClick={onNavigate}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg bg-surface",
          large ? "size-24 sm:size-32" : "size-20"
        )}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="128px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/productos/${item.slug}`}
              onClick={onNavigate}
              className={cn(
                "line-clamp-2 font-medium hover:underline",
                large ? "text-base" : "text-sm"
              )}
            >
              {item.name}
            </Link>
            {item.variants.length > 0 && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.variants.map((v) => `${v.label}: ${v.value}`).join(" · ")}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => remove(item.key)}
            aria-label={`Quitar ${item.name} del carrito`}
            className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <QuantityStepper
            value={item.quantity}
            onChange={(quantity) => setQuantity(item.key, quantity)}
            max={Math.max(1, item.stock)}
            size={large ? "md" : "sm"}
            label={`Cantidad de ${item.name}`}
          />

          <div className="text-right">
            <p className={cn("tabular font-medium", large ? "text-base" : "text-sm")}>
              {formatPrice(item.unitPrice * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="tabular text-[11px] text-muted-foreground">
                {formatPrice(item.unitPrice)} c/u
              </p>
            )}
          </div>
        </div>

        {item.stock > 0 && item.stock <= 5 && (
          <p className="text-[11px] text-sale">
            Quedan {item.stock} unidades
          </p>
        )}
      </div>
    </li>
  );
}

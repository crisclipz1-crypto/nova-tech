"use client";

import { useMemo, useState } from "react";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { ExternalLinkButton } from "@/components/shared/link-button";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/components/cart/cart-provider";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/config";

export type PurchaseVariant = {
  id: string;
  group: string;
  label: string;
  value: string;
  hex: string | null;
  priceDelta: number;
  stock: number;
};

type ProductPurchaseProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    image: string | null;
  };
  variants: PurchaseVariant[];
  whatsAppHref: string;
};

export function ProductPurchase({
  product,
  variants,
  whatsAppHref,
}: ProductPurchaseProps) {
  const { add, setOpen } = useCart();

  // Las variantes llegan planas y se agrupan aquí para pintar un selector por
  // grupo (color, almacenamiento, talla…) conservando el orden del panel.
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; options: PurchaseVariant[] }>();
    for (const variant of variants) {
      const entry = map.get(variant.group) ?? {
        label: variant.label,
        options: [],
      };
      entry.options.push(variant);
      map.set(variant.group, entry);
    }
    return [...map.entries()].map(([group, entry]) => ({ group, ...entry }));
  }, [variants]);

  // Preselecciona la primera opción con stock de cada grupo: llegar a un
  // producto y tener que elegir antes de ver el precio final es fricción.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [group, entry] of new Map(
      groups.map((g) => [g.group, g] as const)
    )) {
      const first = entry.options.find((o) => o.stock > 0) ?? entry.options[0];
      if (first) initial[group] = first.id;
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const chosen = groups
    .map((group) => group.options.find((o) => o.id === selected[group.group]))
    .filter((v): v is PurchaseVariant => Boolean(v));

  const unitPrice =
    product.price + chosen.reduce((sum, variant) => sum + variant.priceDelta, 0);

  const compareAt =
    product.compareAtPrice !== null
      ? product.compareAtPrice +
        chosen.reduce((sum, variant) => sum + variant.priceDelta, 0)
      : null;

  /**
   * El stock real es el menor entre el del producto y el de cada variante
   * elegida: no sirve tener 20 teléfonos si solo quedan 2 en azul.
   */
  const availableStock = chosen.length
    ? Math.min(product.stock, ...chosen.map((variant) => variant.stock))
    : product.stock;

  const soldOut = availableStock <= 0;
  const maxQuantity = Math.max(1, Math.min(availableStock, MAX_QUANTITY_PER_ITEM));

  function addToCart() {
    const result = add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitPrice,
      compareAtPrice: compareAt,
      quantity,
      stock: availableStock,
      variants: chosen.map((variant) => ({
        id: variant.id,
        label: variant.label,
        value: variant.value,
      })),
    });

    if (!result.ok) {
      toast.error(result.message ?? "No se pudo añadir al carrito");
      return;
    }

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    setOpen(true);
  }

  return (
    <div className="space-y-7">
      <Price value={unitPrice} compareAt={compareAt} size="lg" />

      {groups.map((group) => {
        const isColor = group.group === "color";

        return (
          <fieldset key={group.group}>
            <legend className="flex w-full items-baseline justify-between gap-3">
              <span className="eyebrow text-muted-foreground">{group.label}</span>
              <span className="text-sm">
                {group.options.find((o) => o.id === selected[group.group])?.value}
              </span>
            </legend>

            <div className={cn("mt-3 flex flex-wrap gap-2")}>
              {group.options.map((option) => {
                const isSelected = selected[group.group] === option.id;
                const unavailable = option.stock <= 0;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={unavailable}
                    onClick={() => {
                      setSelected((current) => ({
                        ...current,
                        [group.group]: option.id,
                      }));
                      setQuantity(1);
                    }}
                    aria-pressed={isSelected}
                    title={
                      unavailable ? `${option.value} — agotado` : option.value
                    }
                    className={cn(
                      "relative transition-all",
                      isColor
                        ? "size-9 rounded-full ring-offset-2"
                        : "h-10 rounded-full border px-4 text-sm",
                      isColor
                        ? isSelected
                          ? "ring-2 ring-foreground"
                          : "ring-1 ring-border hover:ring-foreground/40"
                        : isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "hover:border-foreground",
                      unavailable &&
                        "cursor-not-allowed opacity-35 after:absolute after:inset-x-1 after:top-1/2 after:h-px after:bg-current"
                    )}
                    style={
                      isColor && option.hex
                        ? { backgroundColor: option.hex }
                        : undefined
                    }
                  >
                    {isColor ? (
                      <span className="sr-only">{option.value}</span>
                    ) : (
                      <>
                        {option.value}
                        {option.priceDelta > 0 && (
                          <span className="ml-1.5 text-[11px] opacity-60">
                            +{Math.round(option.priceDelta / 1000)}k
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className="flex items-center gap-4">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={maxQuantity}
          label={`Cantidad de ${product.name}`}
        />

        <p className="text-xs text-muted-foreground">
          {soldOut ? (
            <span className="text-sale">Agotado por ahora</span>
          ) : availableStock <= 5 ? (
            <span className="text-sale">
              Quedan {availableStock} unidades
            </span>
          ) : (
            <span className="text-success">Disponible para envío inmediato</span>
          )}
        </p>
      </div>

      <div className="grid gap-2.5">
        <Button
          onClick={addToCart}
          disabled={soldOut}
          className={cn(
            "h-13 w-full rounded-full text-sm transition-all",
            added && "bg-success text-white hover:bg-success"
          )}
        >
          {added ? (
            <>
              <Check className="size-4" />
              Añadido al carrito
            </>
          ) : soldOut ? (
            "Sin stock"
          ) : (
            <>
              <ShoppingBag className="size-4" />
              Añadir al carrito
            </>
          )}
        </Button>

        <ExternalLinkButton
          variant="outline"
          href={whatsAppHref}
          className="h-12 w-full rounded-full text-sm"
        >
          <MessageCircle className="size-4 text-success" />
          Preguntar por WhatsApp
        </ExternalLinkButton>
      </div>
    </div>
  );
}

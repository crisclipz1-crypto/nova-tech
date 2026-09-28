"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/shared/link-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { saveProduct } from "@/app/admin/actions";
import { formatPrice, slugify } from "@/lib/format";
import type {
  ProductFormValues,
  ProductImageInput,
  ProductSpecInput as Spec,
  ProductVariantInput as VariantInput,
} from "@/types/product-form";

const VARIANT_GROUPS = [
  { group: "color", label: "Color" },
  { group: "almacenamiento", label: "Almacenamiento" },
  { group: "talla", label: "Talla" },
  { group: "modelo", label: "Modelo" },
  { group: "switch", label: "Switch" },
  { group: "correa", label: "Correa" },
];

export function ProductForm({
  initial,
  productId,
  categories,
  productSlug,
}: {
  initial: ProductFormValues;
  productId?: string;
  categories: { id: string; name: string }[];
  productSlug?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  function submit() {
    setFormError(null);
    setErrors({});

    startTransition(async () => {
      const payload = {
        ...values,
        price: Number(values.price) || 0,
        compareAtPrice:
          values.compareAtPrice === "" ? "" : Number(values.compareAtPrice),
        stock: Number(values.stock) || 0,
        images: values.images.map((image) => ({
          url: image.url,
          alt: image.alt,
        })),
        variants: values.variants.map((variant) => ({
          ...variant,
          priceDelta: Number(variant.priceDelta) || 0,
          stock: Number(variant.stock) || 0,
        })),
      };

      const result = await saveProduct(payload, productId);

      if (result.ok) {
        toast.success(result.message ?? "Producto guardado");
        router.push("/admin/productos");
        router.refresh();
        return;
      }

      setErrors(result.fieldErrors ?? {});
      setFormError(result.message ?? "No se pudo guardar");
      // Lleva a la vista el primer campo con problema: el formulario es largo
      // y el error puede quedar fuera de pantalla.
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const compareAtNumber = Number(values.compareAtPrice);
  const priceNumber = Number(values.price);
  const showsDiscount = compareAtNumber > priceNumber && priceNumber > 0;

  return (
    <div className="space-y-6">
      {formError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {formError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* ---------------------------------------------------- Básicos --- */}
          <Card title="Información básica">
            <Field label="Nombre" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setValues((current) => ({
                    ...current,
                    name,
                    // Al crear, el slug sigue al nombre. Al editar no se toca:
                    // cambiarlo rompería los enlaces ya compartidos.
                    slug: productId ? current.slug : slugify(name),
                  }));
                }}
                placeholder="Nova Pulse Pro"
                className="h-11"
              />
            </Field>

            <Field
              label="Slug (URL)"
              error={errors.slug}
              hint={`/productos/${values.slug || "…"}`}
              required
            >
              <div className="flex gap-2">
                <Input
                  value={values.slug}
                  onChange={(event) => set("slug", event.target.value)}
                  placeholder="nova-pulse-pro"
                  className="h-11 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => set("slug", slugify(values.name))}
                  aria-label="Generar slug desde el nombre"
                  className="h-11 shrink-0 px-3"
                >
                  <Wand2 className="size-4" />
                </Button>
              </div>
            </Field>

            <Field
              label="Resumen"
              error={errors.summary}
              hint="Una línea. Es lo que se lee en las tarjetas del catálogo."
              required
            >
              <Textarea
                value={values.summary}
                onChange={(event) => set("summary", event.target.value)}
                rows={2}
                maxLength={180}
                placeholder="Audífonos over-ear con cancelación activa y 40 h de batería."
                className="resize-none"
              />
            </Field>

            <Field
              label="Descripción"
              error={errors.description}
              hint="Separa los párrafos con una línea en blanco."
              required
            >
              <Textarea
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                rows={8}
                placeholder="Qué problema resuelve, para quién es y qué lo diferencia."
              />
            </Field>
          </Card>

          {/* ---------------------------------------------------- Imágenes -- */}
          <Card
            title="Imágenes"
            description="La primera es la portada. Pega la URL de la imagen alojada en tu CDN."
          >
            {errors.images && (
              <p className="text-xs text-destructive">{errors.images}</p>
            )}

            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(event) => setNewImageUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addImage();
                  }
                }}
                placeholder="https://images.unsplash.com/photo-…"
                className="h-11"
              />
              <Button
                variant="outline"
                onClick={addImage}
                disabled={!newImageUrl.trim()}
                className="h-11 shrink-0 px-4"
              >
                <ImagePlus className="size-4" />
                Añadir
              </Button>
            </div>

            {values.images.length === 0 ? (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                Todavía no hay imágenes
              </p>
            ) : (
              <ul className="space-y-2">
                {values.images.map((image, index) => (
                  <li
                    key={`${image.url}-${index}`}
                    className="flex items-center gap-3 rounded-lg border p-2.5"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-surface">
                      {/* `unoptimized` porque el dominio puede no estar en la
                          lista blanca de next.config todavía: en el panel
                          interesa ver la foto, no optimizarla. */}
                      {image.url && (
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover"
                        />
                      )}
                      {index === 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-foreground/85 py-0.5 text-center font-mono text-[8px] tracking-wider text-background uppercase">
                          Portada
                        </span>
                      )}
                    </span>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="truncate font-mono text-[11px] text-muted-foreground">
                        {image.url}
                      </p>
                      <Input
                        value={image.alt}
                        onChange={(event) =>
                          updateImage(index, { alt: event.target.value })
                        }
                        placeholder="Texto alternativo (accesibilidad y SEO)"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="flex shrink-0 flex-col gap-0.5">
                      <IconButton
                        label="Subir"
                        disabled={index === 0}
                        onClick={() => moveImage(index, -1)}
                      >
                        <ArrowUp className="size-3.5" />
                      </IconButton>
                      <IconButton
                        label="Bajar"
                        disabled={index === values.images.length - 1}
                        onClick={() => moveImage(index, 1)}
                      >
                        <ArrowDown className="size-3.5" />
                      </IconButton>
                    </div>

                    <IconButton
                      label="Quitar imagen"
                      danger
                      onClick={() =>
                        set(
                          "images",
                          values.images.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ------------------------------------------------- Ficha técnica */}
          <Card
            title="Ficha técnica"
            description="Aparece como tabla en la página del producto."
          >
            {values.specs.length > 0 && (
              <ul className="space-y-2">
                {values.specs.map((spec, index) => (
                  <li key={index} className="flex gap-2">
                    <Input
                      value={spec.label}
                      onChange={(event) =>
                        updateSpec(index, { label: event.target.value })
                      }
                      placeholder="Batería"
                      className="h-10 sm:max-w-48"
                    />
                    <Input
                      value={spec.value}
                      onChange={(event) =>
                        updateSpec(index, { value: event.target.value })
                      }
                      placeholder="40 h con ANC"
                      className="h-10"
                    />
                    <IconButton
                      label="Quitar característica"
                      danger
                      onClick={() =>
                        set(
                          "specs",
                          values.specs.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant="outline"
              onClick={() =>
                set("specs", [...values.specs, { label: "", value: "" }])
              }
              className="h-10 rounded-full px-4 text-sm"
            >
              <Plus className="size-4" />
              Añadir característica
            </Button>
          </Card>

          {/* ---------------------------------------------------- Variantes - */}
          <Card
            title="Variantes"
            description="Color, capacidad o talla. Cada una lleva su propio stock y puede sumar al precio base."
          >
            {values.variants.length > 0 && (
              <ul className="space-y-2">
                {values.variants.map((variant, index) => (
                  <li
                    key={index}
                    className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[130px_1fr_110px_90px_auto] sm:items-center"
                  >
                    <select
                      value={variant.group}
                      onChange={(event) => {
                        const preset = VARIANT_GROUPS.find(
                          (item) => item.group === event.target.value
                        );
                        updateVariant(index, {
                          group: event.target.value,
                          label: preset?.label ?? variant.label,
                        });
                      }}
                      aria-label="Tipo de variante"
                      className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {VARIANT_GROUPS.map((item) => (
                        <option key={item.group} value={item.group}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <Input
                        value={variant.value}
                        onChange={(event) =>
                          updateVariant(index, { value: event.target.value })
                        }
                        placeholder="Negro medianoche"
                        className="h-10"
                      />
                      {variant.group === "color" && (
                        <input
                          type="color"
                          value={variant.hex || "#1a1a1a"}
                          onChange={(event) =>
                            updateVariant(index, { hex: event.target.value })
                          }
                          aria-label="Color del swatch"
                          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                        />
                      )}
                    </div>

                    <Input
                      type="number"
                      value={variant.priceDelta}
                      onChange={(event) =>
                        updateVariant(index, { priceDelta: event.target.value })
                      }
                      placeholder="+ precio"
                      aria-label="Diferencia de precio"
                      className="h-10"
                    />

                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(event) =>
                        updateVariant(index, { stock: event.target.value })
                      }
                      placeholder="Stock"
                      aria-label="Stock de la variante"
                      className="h-10"
                      min={0}
                    />

                    <IconButton
                      label="Quitar variante"
                      danger
                      onClick={() =>
                        set(
                          "variants",
                          values.variants.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant="outline"
              onClick={() =>
                set("variants", [
                  ...values.variants,
                  {
                    group: "color",
                    label: "Color",
                    value: "",
                    hex: "#1a1a1a",
                    priceDelta: 0,
                    stock: 0,
                  },
                ])
              }
              className="h-10 rounded-full px-4 text-sm"
            >
              <Plus className="size-4" />
              Añadir variante
            </Button>
          </Card>
        </div>

        {/* ------------------------------------------------------ Columna --- */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Publicación">
            <Toggle
              label="Visible en la tienda"
              description="Si lo apagas, desaparece del catálogo"
              checked={values.active}
              onChange={(checked) => set("active", checked)}
            />
            <Toggle
              label="Destacado"
              description="Sube posiciones en el orden por relevancia"
              checked={values.featured}
              onChange={(checked) => set("featured", checked)}
            />
            <Toggle
              label="Más vendido"
              description="Aparece en el carrusel de la home"
              checked={values.bestSeller}
              onChange={(checked) => set("bestSeller", checked)}
            />
            <Toggle
              label="Nuevo"
              description="Muestra la etiqueta «Nuevo»"
              checked={values.isNew}
              onChange={(checked) => set("isNew", checked)}
            />

            <Field
              label="Etiqueta libre"
              error={errors.badge}
              hint="Ej: Descuento de Temporada"
            >
              <Input
                value={values.badge}
                onChange={(event) => set("badge", event.target.value)}
                placeholder="Opcional"
                className="h-10"
              />
            </Field>
          </Card>

          <Card title="Precio e inventario">
            <Field label="Precio de venta (COP)" error={errors.price} required>
              <Input
                type="number"
                value={values.price}
                onChange={(event) => set("price", event.target.value)}
                placeholder="459900"
                className="h-11"
                min={0}
              />
            </Field>

            <Field
              label="Precio tachado"
              error={errors.compareAtPrice}
              hint={
                showsDiscount
                  ? `Se mostrará ${formatPrice(compareAtNumber)} tachado`
                  : "Déjalo vacío si no hay oferta"
              }
            >
              <Input
                type="number"
                value={values.compareAtPrice}
                onChange={(event) => set("compareAtPrice", event.target.value)}
                placeholder="599900"
                className="h-11"
                min={0}
              />
            </Field>

            <Field label="Stock total" error={errors.stock} required>
              <Input
                type="number"
                value={values.stock}
                onChange={(event) => set("stock", event.target.value)}
                className="h-11"
                min={0}
              />
            </Field>
          </Card>

          <Card title="Organización">
            <Field label="Categoría" error={errors.categoryId} required>
              <select
                value={values.categoryId}
                onChange={(event) => set("categoryId", event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Elige una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Marca" error={errors.brand}>
              <Input
                value={values.brand}
                onChange={(event) => set("brand", event.target.value)}
                className="h-10"
              />
            </Field>

            <Field label="SKU" error={errors.sku}>
              <Input
                value={values.sku}
                onChange={(event) => set("sku", event.target.value)}
                placeholder="NVA-AUD-001"
                className="h-10 font-mono text-sm"
              />
            </Field>
          </Card>

          <div className="space-y-2">
            <Button
              onClick={submit}
              disabled={pending}
              className="h-12 w-full rounded-full text-sm"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {productId ? "Guardar cambios" : "Crear producto"}
            </Button>

            <div className="flex gap-2">
              <LinkButton
                variant="ghost"
                href="/admin/productos"
                className="h-10 flex-1 rounded-full text-sm"
              >
                Cancelar
              </LinkButton>
              {productSlug && (
                <LinkButton
                  variant="outline"
                  href={`/productos/${productSlug}`}
                  target="_blank"
                  className="h-10 flex-1 rounded-full text-sm"
                >
                  <ExternalLink className="size-3.5" />
                  Ver
                </LinkButton>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  // -------------------------------------------------------------- helpers ---

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;

    if (values.images.some((image) => image.url === url)) {
      toast.error("Esa imagen ya está en la lista");
      return;
    }

    set("images", [...values.images, { url, alt: "" }]);
    setNewImageUrl("");
  }

  function updateImage(index: number, patch: Partial<ProductImageInput>) {
    set(
      "images",
      values.images.map((image, i) =>
        i === index ? { ...image, ...patch } : image
      )
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...values.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    set("images", next);
  }

  function updateSpec(index: number, patch: Partial<Spec>) {
    set(
      "specs",
      values.specs.map((spec, i) => (i === index ? { ...spec, ...patch } : spec))
    );
  }

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    set(
      "variants",
      values.variants.map((variant, i) =>
        i === index ? { ...variant, ...patch } : variant
      )
    );
  }
}

// ----------------------------------------------------------------- bloques --

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium">
        {label}
        {!required && (
          <span className="text-xs font-normal text-muted-foreground">
            (opcional)
          </span>
        )}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block truncate text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} className="mt-1" />
    </label>
  );
}

function IconButton({
  label,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors",
        danger
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-30"
      )}
    >
      {children}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Stars } from "@/components/shared/stars";
import {
  deleteReview,
  saveReview,
  toggleReviewFlag,
} from "@/app/admin/actions";
import { formatDate, initials } from "@/lib/format";

export type ReviewRecord = {
  id: string;
  authorName: string;
  city: string | null;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  approved: boolean;
  featured: boolean;
  createdAt: Date;
  product: { name: string; slug: string } | null;
};

type Draft = {
  productId: string;
  authorName: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  approved: boolean;
  featured: boolean;
};

const EMPTY: Draft = {
  productId: "",
  authorName: "",
  city: "",
  rating: 5,
  title: "",
  body: "",
  verified: true,
  approved: true,
  featured: false,
};

export function ReviewManager({
  reviews,
  products,
}: {
  reviews: ReviewRecord[];
  products: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Listo");
        setConfirming(null);
        router.refresh();
      } else {
        toast.error(result.message ?? "No se pudo completar");
      }
    });
  }

  function create() {
    setErrors({});
    startTransition(async () => {
      const result = await saveReview(draft);

      if (result.ok) {
        toast.success("Reseña creada");
        setDraft(EMPTY);
        setCreating(false);
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message ?? "No se pudo guardar");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setCreating((open) => !open)}
          className="h-10 rounded-full px-4 text-sm"
        >
          {creating ? <X className="size-4" /> : <Plus className="size-4" />}
          {creating ? "Cerrar" : "Nueva reseña"}
        </Button>
      </div>

      {creating && (
        <section className="space-y-4 rounded-xl border-2 border-foreground/15 p-5">
          <h2 className="text-sm font-medium">Nueva reseña</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" error={errors.authorName} required>
              <Input
                value={draft.authorName}
                onChange={(event) =>
                  setDraft({ ...draft, authorName: event.target.value })
                }
                placeholder="Camila Restrepo"
                className="h-11"
              />
            </Field>

            <Field label="Ciudad" error={errors.city}>
              <Input
                value={draft.city}
                onChange={(event) =>
                  setDraft({ ...draft, city: event.target.value })
                }
                placeholder="Medellín"
                className="h-11"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Producto"
              hint="Déjalo vacío para una reseña general de la tienda"
            >
              <select
                value={draft.productId}
                onChange={(event) =>
                  setDraft({ ...draft, productId: event.target.value })
                }
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Sobre la tienda en general</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Puntuación" error={errors.rating} required>
              <div className="flex h-11 items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDraft({ ...draft, rating: value })}
                    aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "size-6",
                        value <= draft.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Título" error={errors.title}>
            <Input
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              placeholder="Valen cada peso"
              className="h-11"
            />
          </Field>

          <Field label="Reseña" error={errors.body} required>
            <Textarea
              value={draft.body}
              onChange={(event) =>
                setDraft({ ...draft, body: event.target.value })
              }
              rows={4}
              placeholder="Qué le gustó, cómo fue la entrega, si lo recomendaría."
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle
              label="Compra verificada"
              checked={draft.verified}
              onChange={(checked) => setDraft({ ...draft, verified: checked })}
            />
            <Toggle
              label="Aprobada"
              checked={draft.approved}
              onChange={(checked) => setDraft({ ...draft, approved: checked })}
            />
            <Toggle
              label="Destacada en la home"
              checked={draft.featured}
              onChange={(checked) => setDraft({ ...draft, featured: checked })}
            />
          </div>

          <Button
            onClick={create}
            disabled={pending}
            className="h-11 rounded-full px-6 text-sm"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Crear reseña
          </Button>
        </section>
      )}

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no hay reseñas.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className={cn(
                "rounded-xl border p-4",
                !review.approved && "bg-muted/40 opacity-70"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-surface font-mono text-[11px] font-medium"
                >
                  {initials(review.authorName)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {review.authorName}
                    </span>
                    <Stars value={review.rating} />
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-success">
                        <BadgeCheck className="size-3" />
                        Verificada
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {review.city && `${review.city} · `}
                    {review.product ? review.product.name : "Tienda"} ·{" "}
                    {formatDate(review.createdAt)}
                  </p>

                  {review.title && (
                    <p className="mt-2 text-sm font-medium">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                <FlagButton
                  active={review.approved}
                  disabled={pending}
                  onClick={() => run(() => toggleReviewFlag(review.id, "approved"))}
                >
                  {review.approved ? "Aprobada" : "Sin aprobar"}
                </FlagButton>

                <FlagButton
                  active={review.featured}
                  disabled={pending || !review.approved}
                  onClick={() => run(() => toggleReviewFlag(review.id, "featured"))}
                >
                  {review.featured ? "En la home" : "Destacar"}
                </FlagButton>

                <div className="ml-auto">
                  {confirming === review.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        ¿Eliminar?
                      </span>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => deleteReview(review.id))}
                        className="rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-white"
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className="rounded-full border px-2.5 py-1 text-xs"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(review.id)}
                      aria-label="Eliminar reseña"
                      className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FlagButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "hover:border-foreground",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
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
        <span className="mt-1.5 block text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

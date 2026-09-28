"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Loader2,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  activateBanner,
  deleteBanner,
  saveBanner,
} from "@/app/admin/actions";
import { BANNER_THEMES, bannerTheme, type BannerTheme } from "@/lib/config";
import { formatDate } from "@/lib/format";

export type BannerRecord = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: string | null;
  theme: string;
  active: boolean;
  position: number;
  startsAt: Date | null;
  endsAt: Date | null;
};

type Draft = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  theme: string;
  active: boolean;
  position: number | string;
  startsAt: string;
  endsAt: string;
};

const EMPTY: Draft = {
  eyebrow: "",
  title: "",
  subtitle: "",
  ctaLabel: "Ver catálogo",
  ctaHref: "/productos",
  image: "",
  theme: "default",
  active: false,
  position: 0,
  startsAt: "",
  endsAt: "",
};

/** Date -> "2026-11-24T08:00" para `<input type="datetime-local">`. */
function toLocalInput(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function BannerManager({ banners }: { banners: BannerRecord[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openNew() {
    setDraft({ ...EMPTY, position: banners.length });
    setErrors({});
    setEditing("new");
  }

  function openEdit(banner: BannerRecord) {
    setDraft({
      eyebrow: banner.eyebrow ?? "",
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      ctaLabel: banner.ctaLabel ?? "",
      ctaHref: banner.ctaHref ?? "",
      image: banner.image ?? "",
      theme: banner.theme,
      active: banner.active,
      position: banner.position,
      startsAt: toLocalInput(banner.startsAt),
      endsAt: toLocalInput(banner.endsAt),
    });
    setErrors({});
    setEditing(banner.id);
  }

  function save() {
    setErrors({});
    startTransition(async () => {
      const result = await saveBanner(
        { ...draft, position: Number(draft.position) || 0 },
        editing === "new" ? undefined : (editing ?? undefined)
      );

      if (result.ok) {
        toast.success(result.message ?? "Banner guardado");
        setEditing(null);
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message ?? "No se pudo guardar");
      }
    });
  }

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Listo");
        router.refresh();
      } else {
        toast.error(result.message ?? "No se pudo completar");
      }
    });
  }

  const theme = bannerTheme(draft.theme);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew} className="h-10 rounded-full px-4 text-sm">
          <Plus className="size-4" />
          Nuevo banner
        </Button>
      </div>

      {editing && (
        <section className="space-y-5 rounded-xl border-2 border-foreground/15 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">
              {editing === "new" ? "Nuevo banner" : "Editando banner"}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Cerrar editor"
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Vista previa en vivo: el tema cambia mucho el resultado y no
              tiene sentido guardar para descubrir cómo queda. */}
          <div
            className={cn(
              "relative overflow-hidden rounded-xl px-6 py-10",
              theme.wrapper
            )}
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-20 -right-10 size-56 rounded-full blur-3xl",
                theme.glow
              )}
            />
            <div className="relative">
              {draft.eyebrow && (
                <p className={cn("eyebrow mb-3", theme.eyebrow)}>
                  {draft.eyebrow}
                </p>
              )}
              <p className="max-w-lg text-2xl leading-tight font-medium tracking-[-0.03em] text-balance sm:text-3xl">
                {draft.title || "Título del banner"}
              </p>
              {draft.subtitle && (
                <p className="mt-3 max-w-md text-sm opacity-70">
                  {draft.subtitle}
                </p>
              )}
              {draft.ctaLabel && (
                <span
                  className={cn(
                    "mt-5 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium",
                    theme.cta
                  )}
                >
                  {draft.ctaLabel}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Antetítulo" error={errors.eyebrow}>
              <Input
                value={draft.eyebrow}
                onChange={(event) =>
                  setDraft({ ...draft, eyebrow: event.target.value })
                }
                placeholder="Black Friday"
                className="h-11"
              />
            </Field>

            <Field label="Tema visual">
              <select
                value={draft.theme}
                onChange={(event) =>
                  setDraft({ ...draft, theme: event.target.value })
                }
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {(Object.keys(BANNER_THEMES) as BannerTheme[]).map((key) => (
                  <option key={key} value={key}>
                    {BANNER_THEMES[key].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Título" error={errors.title} required>
            <Input
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              placeholder="Hasta 40 % en audio y cómputo"
              className="h-11"
            />
          </Field>

          <Field label="Subtítulo" error={errors.subtitle}>
            <Textarea
              value={draft.subtitle}
              onChange={(event) =>
                setDraft({ ...draft, subtitle: event.target.value })
              }
              rows={2}
              placeholder="Tres días. Stock limitado. Sigue siendo pago contra entrega."
              className="resize-none"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto del botón" error={errors.ctaLabel}>
              <Input
                value={draft.ctaLabel}
                onChange={(event) =>
                  setDraft({ ...draft, ctaLabel: event.target.value })
                }
                className="h-11"
              />
            </Field>

            <Field
              label="Enlace del botón"
              error={errors.ctaHref}
              hint="Ruta interna, ej. /productos?oferta=1"
            >
              <Input
                value={draft.ctaHref}
                onChange={(event) =>
                  setDraft({ ...draft, ctaHref: event.target.value })
                }
                className="h-11 font-mono text-sm"
              />
            </Field>
          </div>

          <Field
            label="Imagen"
            error={errors.image}
            hint="Opcional. Aparece junto al texto en pantallas grandes."
          >
            <Input
              value={draft.image}
              onChange={(event) =>
                setDraft({ ...draft, image: event.target.value })
              }
              placeholder="https://…"
              className="h-11"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Desde"
              error={errors.startsAt}
              hint="Vacío = sin fecha de inicio"
            >
              <Input
                type="datetime-local"
                value={draft.startsAt}
                onChange={(event) =>
                  setDraft({ ...draft, startsAt: event.target.value })
                }
                className="h-11"
              />
            </Field>

            <Field
              label="Hasta"
              error={errors.endsAt}
              hint="Vacío = sin fecha de fin"
            >
              <Input
                type="datetime-local"
                value={draft.endsAt}
                onChange={(event) =>
                  setDraft({ ...draft, endsAt: event.target.value })
                }
                className="h-11"
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3">
            <span>
              <span className="block text-sm font-medium">
                Activo en la home
              </span>
              <span className="block text-xs text-muted-foreground">
                Solo se muestra un banner a la vez
              </span>
            </span>
            <Switch
              checked={draft.active}
              onCheckedChange={(checked) =>
                setDraft({ ...draft, active: checked })
              }
            />
          </label>

          <div className="flex gap-2">
            <Button
              onClick={save}
              disabled={pending}
              className="h-11 rounded-full px-6 text-sm"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Guardar banner
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEditing(null)}
              className="h-11 rounded-full px-5 text-sm"
            >
              Cancelar
            </Button>
          </div>
        </section>
      )}

      {banners.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no hay banners. La home mostrará el mensaje por defecto.
        </p>
      ) : (
        <ul className="space-y-3">
          {banners.map((banner) => {
            const itsTheme = bannerTheme(banner.theme);
            const scheduled = banner.startsAt || banner.endsAt;

            return (
              <li
                key={banner.id}
                className={cn(
                  "overflow-hidden rounded-xl border transition-colors",
                  banner.active && "border-brand/50"
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div
                    className={cn(
                      "relative grid h-20 w-full shrink-0 place-items-center overflow-hidden rounded-lg px-3 sm:w-40",
                      itsTheme.wrapper
                    )}
                  >
                    {banner.image && (
                      <Image
                        src={banner.image}
                        alt=""
                        fill
                        sizes="160px"
                        unoptimized
                        className="object-cover opacity-30"
                      />
                    )}
                    <span className="relative line-clamp-2 text-center text-[11px] leading-tight font-medium">
                      {banner.title}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {banner.title}
                      </p>
                      {banner.active && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-medium text-brand-foreground">
                          En la home
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {itsTheme.label}
                      </span>
                    </div>

                    {banner.subtitle && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {banner.subtitle}
                      </p>
                    )}

                    {scheduled && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <CalendarClock className="size-3" />
                        {banner.startsAt
                          ? `Desde ${formatDate(banner.startsAt)}`
                          : "Sin inicio"}
                        {" · "}
                        {banner.endsAt
                          ? `hasta ${formatDate(banner.endsAt)}`
                          : "sin fin"}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant={banner.active ? "default" : "outline"}
                      disabled={pending}
                      onClick={() => run(() => activateBanner(banner.id))}
                      className="h-9 rounded-full px-3.5 text-xs"
                    >
                      <Power className="size-3.5" />
                      {banner.active ? "Desactivar" : "Activar"}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => openEdit(banner)}
                      className="h-9 rounded-full px-3.5 text-xs"
                    >
                      Editar
                    </Button>

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => deleteBanner(banner.id))}
                      aria-label="Eliminar banner"
                      className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
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

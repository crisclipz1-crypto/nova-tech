"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronDown, Loader2, Lock } from "lucide-react";
import type { z } from "zod";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart/cart-provider";
import { checkoutFormSchema } from "@/lib/validations";
import { DEPARTMENTS, citiesOf } from "@/lib/colombia";

type FormInput = z.input<typeof checkoutFormSchema>;
type FormOutput = z.output<typeof checkoutFormSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onBlur",
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      department: "",
      city: "",
      address: "",
      notes: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  // `useWatch` en lugar de `watch()`: devuelve un valor, no una función, así
  // que no rompe la memoización del compilador de React.
  const department = useWatch({ control, name: "department" });
  const cities = department ? citiesOf(department) : [];

  async function onSubmit(data: FormOutput) {
    setServerError(null);

    if (items.length === 0) {
      setServerError("Tu carrito está vacío.");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantIds: item.variants.map((variant) => variant.id),
          })),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        // El servidor devuelve los errores por campo: se pintan donde
        // corresponde en vez de en un aviso suelto arriba.
        if (payload.fieldErrors) {
          for (const [field, message] of Object.entries(
            payload.fieldErrors as Record<string, string>
          )) {
            if (field in data) {
              setError(field as keyof FormOutput, { message });
            }
          }
        }
        setServerError(payload.error ?? "No pudimos registrar tu pedido.");
        return;
      }

      // El carrito se vacía solo cuando el pedido ya está guardado: si algo
      // falla a mitad, la persona no pierde lo que había elegido.
      clear();
      router.push(`/pedido/${payload.orderNumber}`);
    } catch {
      setServerError(
        "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <fieldset disabled={isSubmitting} className="space-y-8">
        <section className="space-y-4">
          <h2 className="eyebrow text-muted-foreground">Tus datos</h2>

          <Field
            label="Nombre y apellidos"
            error={errors.customerName?.message}
            required
          >
            <Input
              {...register("customerName")}
              autoComplete="name"
              placeholder="Camila Restrepo"
              className="h-12"
              aria-invalid={Boolean(errors.customerName)}
            />
          </Field>

          <Field
            label="Celular (WhatsApp)"
            error={errors.customerPhone?.message}
            hint="Te escribimos por aquí para confirmar el pedido"
            required
          >
            <div className="flex items-center gap-2">
              <span className="tabular grid h-12 shrink-0 place-items-center rounded-lg border bg-surface px-3 text-sm text-muted-foreground">
                +57
              </span>
              <Input
                {...register("customerPhone")}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="300 123 4567"
                className="h-12"
                aria-invalid={Boolean(errors.customerPhone)}
              />
            </div>
          </Field>

          <Field
            label="Correo electrónico"
            error={errors.customerEmail?.message}
            hint="Opcional. Solo para enviarte el comprobante"
          >
            <Input
              {...register("customerEmail")}
              type="email"
              autoComplete="email"
              placeholder="camila@correo.com"
              className="h-12"
              aria-invalid={Boolean(errors.customerEmail)}
            />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="eyebrow text-muted-foreground">Dirección de entrega</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Departamento"
              error={errors.department?.message}
              required
            >
              <NativeSelect
                {...register("department", {
                  // Al cambiar de departamento la ciudad anterior deja de ser
                  // válida: se limpia para que nadie envíe una combinación
                  // imposible.
                  onChange: () => setValue("city", "", { shouldValidate: false }),
                })}
                aria-invalid={Boolean(errors.department)}
              >
                <option value="">Elige un departamento</option>
                {DEPARTMENTS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Ciudad / Municipio" error={errors.city?.message} required>
              <NativeSelect
                {...register("city")}
                disabled={!department}
                aria-invalid={Boolean(errors.city)}
              >
                <option value="">
                  {department ? "Elige una ciudad" : "Primero el departamento"}
                </option>
                {cities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <Field
            label="Dirección completa"
            error={errors.address?.message}
            hint="Calle, número, barrio, apartamento o local"
            required
          >
            <Input
              {...register("address")}
              autoComplete="street-address"
              placeholder="Carrera 43A #18-95, apto 704"
              className="h-12"
              aria-invalid={Boolean(errors.address)}
            />
          </Field>

          <Field
            label="Referencias para el mensajero"
            error={errors.notes?.message}
            hint="Opcional. Un punto de referencia acelera la entrega"
          >
            <Textarea
              {...register("notes")}
              rows={3}
              placeholder="Edificio de fachada azul, al lado de la panadería. Portería recibe."
              className="min-h-20 resize-none"
              aria-invalid={Boolean(errors.notes)}
            />
          </Field>
        </section>
      </fieldset>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="h-13 w-full rounded-full text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Registrando pedido…
            </>
          ) : (
            "Confirmar pedido contra entrega"
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3" />
          No pedimos datos de tarjeta. Pagas en efectivo al recibir.
        </p>
      </div>
    </form>
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
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * Select nativo: en móvil abre el selector del sistema operativo, que se
 * maneja con el pulgar y ya es accesible. Un menú a medida aquí sería peor.
 */
function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        {...props}
        className={cn(
          "h-12 w-full appearance-none rounded-lg border border-input bg-transparent py-0 pr-9 pl-3 text-base transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "md:text-sm",
          className
        )}
      />
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  );
}

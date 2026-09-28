import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { buttonVariants } from "@/components/ui/button";

type Variants = VariantProps<typeof buttonVariants>;

/**
 * Enlace con apariencia de botón.
 *
 * Existe porque `<Button render={<Link/>}>` hace que Base UI marque el
 * elemento con `role="button"`, y eso pisa la semántica de enlace: el lector
 * de pantalla deja de anunciar que navega y el navegador pierde el menú
 * contextual de "abrir en otra pestaña". Aquí se aplican solo los estilos, y
 * el elemento sigue siendo un enlace de verdad.
 *
 * Para acciones que no navegan (añadir al carrito, guardar) se usa `Button`.
 */
export function LinkButton({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof Link> & Variants) {
  return (
    <Link
      data-slot="link-button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/** Igual que `LinkButton` pero para destinos externos (WhatsApp, redes). */
export function ExternalLinkButton({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"a"> & Variants) {
  return (
    <a
      data-slot="link-button"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

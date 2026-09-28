"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/shared/link-button";

/**
 * Frontera de error de la app. Cubre cualquier fallo no capturado durante el
 * renderizado de una página: la tienda sigue navegable en vez de quedarse en
 * blanco.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción el mensaje real no llega al navegador; `digest` es lo que
    // permite cruzarlo con los logs del servidor.
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-surface">
        <TriangleAlert className="size-6 text-muted-foreground" />
      </span>

      <h1 className="display-2 mt-6 text-balance">Algo se rompió por aquí</h1>
      <p className="mt-3 max-w-md text-base text-pretty text-muted-foreground">
        No es culpa tuya. Vuelve a intentarlo y, si sigue pasando, escríbenos
        por WhatsApp y lo resolvemos contigo.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-[11px] tracking-wide text-muted-foreground">
          Referencia: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="h-12 rounded-full px-6">
          <RefreshCw className="size-4" />
          Reintentar
        </Button>
        <LinkButton variant="outline" href="/" className="h-12 rounded-full px-6">
          Ir al inicio
        </LinkButton>
      </div>
    </div>
  );
}

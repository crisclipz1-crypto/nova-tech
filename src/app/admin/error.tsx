"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/shared/link-button";

/**
 * Frontera de error del panel. Es propia para que un fallo aquí no tire abajo
 * la tienda pública ni pierda la barra lateral.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  const unauthorized = error.message === "NO_AUTORIZADO";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-12 place-items-center rounded-full bg-surface">
        <TriangleAlert className="size-5 text-muted-foreground" />
      </span>

      <h1 className="mt-5 text-xl font-medium tracking-[-0.02em]">
        {unauthorized
          ? "Tu sesión expiró"
          : "No pudimos cargar esta sección"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-balance text-muted-foreground">
        {unauthorized
          ? "Vuelve a iniciar sesión para seguir trabajando en el panel."
          : "Reintenta la operación. Si el problema se repite, revisa los registros del servidor."}
      </p>

      {error.digest && !unauthorized && (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          Referencia: {error.digest}
        </p>
      )}

      <div className="mt-6 flex gap-2">
        {unauthorized ? (
          <LinkButton
            href="/login?callbackUrl=/admin"
            className="h-11 rounded-full px-5"
          >
            Iniciar sesión
          </LinkButton>
        ) : (
          <>
            <Button onClick={reset} className="h-11 rounded-full px-5">
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
            <LinkButton
              variant="outline"
              href="/admin"
              className="h-11 rounded-full px-5"
            >
              Ir al dashboard
            </LinkButton>
          </>
        )}
      </div>
    </div>
  );
}

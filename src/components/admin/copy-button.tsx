"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "cn";

/**
 * Copia un bloque de texto al portapapeles. En el panel sirve para pasar la
 * dirección completa a la transportadora sin transcribirla a mano, que es
 * donde se cuelan los errores de entrega.
 */
export function CopyButton({
  value,
  label = "Copiar",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permiso de portapapeles (o sin HTTPS) no hay alternativa fiable:
      // se deja el estado como estaba en vez de fingir que copió.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:border-foreground",
        copied && "border-success/40 text-success",
        className
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copiado" : label}
    </button>
  );
}

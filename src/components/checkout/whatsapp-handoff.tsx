"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { ExternalLinkButton } from "@/components/shared/link-button";

const COUNTDOWN = 6;

/**
 * Lleva a la persona a WhatsApp con el pedido ya escrito.
 *
 * La cuenta atrás es visible y cancelable a propósito: redirigir de golpe a
 * otra app sin avisar se siente como un secuestro, y quien solo quería su
 * comprobante se queda sin poder leerlo. Se navega con `location.assign` y no
 * con `window.open` porque una pestaña nueva automática la bloquea el
 * navegador; una navegación normal, no.
 */
export function WhatsAppHandoff({ href }: { href: string }) {
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;

    if (seconds <= 0) {
      window.location.assign(href);
      return;
    }

    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds, cancelled, href]);

  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-5">
      <div className="flex items-start gap-3">
        <MessageCircle className="mt-0.5 size-5 shrink-0 text-success" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Confirma tu pedido por WhatsApp
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Te abrimos el chat con el resumen ya escrito. Solo tienes que
            enviarlo y te respondemos en minutos.
          </p>
        </div>

        {!cancelled && (
          <button
            type="button"
            onClick={() => setCancelled(true)}
            aria-label="Cancelar la apertura automática de WhatsApp"
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <ExternalLinkButton
        href={href}
        className="mt-4 h-12 w-full rounded-full bg-success text-sm text-white hover:bg-success/90"
      >
        <MessageCircle className="size-4" />
        {cancelled ? "Abrir WhatsApp" : `Abriendo WhatsApp en ${seconds}…`}
      </ExternalLinkButton>

      {!cancelled && (
        <button
          type="button"
          onClick={() => setCancelled(true)}
          className="mt-2.5 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          No abrir automáticamente
        </button>
      )}
    </div>
  );
}

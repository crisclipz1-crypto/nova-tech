"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateOrder } from "@/app/admin/actions";
import {
  ORDER_STATUS_META,
  ORDER_STATUS_TRANSITIONS,
  type OrderStatus,
} from "@/lib/config";

export function OrderStatusForm({
  orderId,
  status,
  adminNotes,
  cancelReason,
}: {
  orderId: string;
  status: OrderStatus;
  adminNotes: string | null;
  cancelReason: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [reason, setReason] = useState(cancelReason ?? "");
  const [confirming, setConfirming] = useState<OrderStatus | null>(null);

  const nextStates = ORDER_STATUS_TRANSITIONS[status];

  function submit(nextStatus: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrder({
        orderId,
        status: nextStatus,
        adminNotes: notes,
        cancelReason: nextStatus === "CANCELADO" ? reason : "",
      });

      if (result.ok) {
        toast.success(result.message ?? "Pedido actualizado");
        setConfirming(null);
        router.refresh();
      } else {
        toast.error(result.message ?? "No se pudo actualizar");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-2 text-muted-foreground">Estado actual</p>
        <StatusBadge status={status} />
        <p className="mt-2 text-xs text-muted-foreground">
          {ORDER_STATUS_META[status].description}
        </p>
      </div>

      {nextStates.length > 0 ? (
        <div>
          <p className="eyebrow mb-2 text-muted-foreground">Siguiente paso</p>

          <div className="flex flex-wrap gap-2">
            {nextStates.map((next) => {
              const cancelling = next === "CANCELADO";

              return (
                <Button
                  key={next}
                  variant={cancelling ? "outline" : "default"}
                  disabled={pending}
                  onClick={() =>
                    // Cancelar devuelve stock y no tiene vuelta atrás: se pide
                    // confirmación y un motivo antes de ejecutarlo.
                    cancelling ? setConfirming(next) : submit(next)
                  }
                  className={cn(
                    "h-10 rounded-full px-4 text-sm",
                    cancelling &&
                      "border-destructive/30 text-destructive hover:bg-destructive/5"
                  )}
                >
                  {pending && !cancelling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Marcar como {ORDER_STATUS_META[next].label.toLowerCase()}
                  {!cancelling && <ArrowRight className="size-4" />}
                </Button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-lg bg-surface px-3 py-2.5 text-xs text-muted-foreground">
          Este pedido llegó al final de su ciclo. No admite más cambios de
          estado.
        </p>
      )}

      {confirming === "CANCELADO" && (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            ¿Seguro que quieres cancelar este pedido?
          </p>
          <p className="text-xs text-muted-foreground">
            Las unidades volverán al inventario y el pedido no podrá reactivarse.
          </p>

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            placeholder="Motivo (el cliente no contesta, encontró mejor precio…)"
            className="resize-none bg-background"
          />

          <div className="flex gap-2">
            <Button
              disabled={pending}
              onClick={() => submit("CANCELADO")}
              className="h-9 rounded-full bg-destructive px-4 text-sm text-white hover:bg-destructive/90"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Sí, cancelar
            </Button>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => setConfirming(null)}
              className="h-9 rounded-full px-4 text-sm"
            >
              Volver
            </Button>
          </div>
        </div>
      )}

      <div>
        <label className="eyebrow mb-2 block text-muted-foreground">
          Notas internas
        </label>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Visible solo para el equipo. Ej: cliente pidió entrega después de las 6 p.m."
          className="resize-none"
        />
        <Button
          variant="outline"
          disabled={pending || notes === (adminNotes ?? "")}
          onClick={() => submit(status)}
          className="mt-2 h-9 rounded-full px-4 text-sm"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Guardar notas
        </Button>
      </div>
    </div>
  );
}

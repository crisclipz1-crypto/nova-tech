"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct, toggleProductActive } from "@/app/admin/actions";

export function ProductRowActions({
  productId,
  active,
  hasOrders,
}: {
  productId: string;
  active: boolean;
  hasOrders: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Listo");
        setConfirming(false);
        router.refresh();
      } else {
        toast.error(result.message ?? "No se pudo completar");
      }
    });
  }

  // Confirmación en línea, sin diálogo: el aviso aparece donde estaba el botón
  // y no tapa la fila que se está a punto de borrar.
  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <span className="text-xs text-muted-foreground">
          {hasOrders ? "¿Ocultar?" : "¿Eliminar?"}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => deleteProduct(productId))}
          className="rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : "Sí"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-foreground"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => toggleProductActive(productId))}
        aria-label={active ? "Ocultar de la tienda" : "Publicar en la tienda"}
        title={active ? "Ocultar de la tienda" : "Publicar en la tienda"}
        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : active ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
      </button>

      <Link
        href={`/admin/productos/${productId}`}
        aria-label="Editar producto"
        title="Editar producto"
        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Pencil className="size-3.5" />
      </Link>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={hasOrders ? "Ocultar producto" : "Eliminar producto"}
        title={
          hasOrders
            ? "Tiene pedidos asociados: se ocultará en vez de eliminarse"
            : "Eliminar producto"
        }
        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

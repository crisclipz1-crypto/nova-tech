import { cn } from "cn";

import { ORDER_STATUS_META, type OrderStatus } from "@/lib/config";

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const meta =
    ORDER_STATUS_META[status as OrderStatus] ?? ORDER_STATUS_META.PENDIENTE;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

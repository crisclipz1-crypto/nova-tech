import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  href,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Variación porcentual frente al periodo anterior; null si no hay base. */
  trend?: number | null;
  href?: string;
  accent?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-muted-foreground">{label}</p>
        <Icon
          className={cn(
            "size-4 shrink-0",
            accent ? "text-brand" : "text-muted-foreground"
          )}
        />
      </div>

      <p className="tabular mt-3 text-2xl font-medium">{value}</p>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {typeof trend === "number" && (
          <span
            className={cn(
              "tabular inline-flex items-center gap-1 text-xs font-medium",
              trend >= 0 ? "text-success" : "text-sale"
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      {href && (
        <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
          Ver detalle
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </>
  );

  const className = cn(
    "block rounded-xl border p-5 transition-colors",
    href && "group hover:border-foreground/25",
    accent && "border-brand/30 bg-brand-muted/40"
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

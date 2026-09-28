import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";

/**
 * Paginación con enlaces reales (`<a href>`), no botones con JavaScript: así
 * se puede abrir una página en otra pestaña y los buscadores rastrean el
 * catálogo completo.
 */
export function Pagination({
  page,
  pages,
  buildHref,
}: {
  page: number;
  pages: number;
  buildHref: (page: number) => string;
}) {
  if (pages <= 1) return null;

  // Ventana de páginas alrededor de la actual, para no imprimir 40 enlaces.
  const window = 1;
  const numbers: (number | "…")[] = [];

  for (let n = 1; n <= pages; n++) {
    const inWindow = Math.abs(n - page) <= window;
    if (n === 1 || n === pages || inWindow) {
      numbers.push(n);
    } else if (numbers.at(-1) !== "…") {
      numbers.push("…");
    }
  }

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-12 flex items-center justify-center gap-1"
    >
      <PageLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </PageLink>

      {numbers.map((n, index) =>
        n === "…" ? (
          <span
            key={`gap-${index}`}
            className="grid size-9 place-items-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={n}
            href={buildHref(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "tabular grid size-9 place-items-center rounded-full text-sm transition-colors",
              n === page
                ? "bg-foreground text-background"
                : "hover:bg-muted"
            )}
          >
            {n}
          </Link>
        )
      )}

      <PageLink
        href={buildHref(page + 1)}
        disabled={page >= pages}
        label="Página siguiente"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-full text-muted-foreground/35"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}

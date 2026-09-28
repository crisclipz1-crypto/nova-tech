/**
 * Esqueleto del catálogo. Reproduce la rejilla real para que, al llegar los
 * datos, nada se mueva de sitio.
 */
export default function CatalogLoading() {
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-8 max-w-2xl space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-surface" />
        <div className="h-10 w-72 animate-pulse rounded bg-surface" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-surface" />
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="hidden space-y-6 lg:block">
          {[0, 1, 2].map((block) => (
            <div key={block} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-surface" />
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-8 animate-pulse rounded-lg bg-surface"
                />
              ))}
            </div>
          ))}
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-surface" />
            <div className="h-9 w-40 animate-pulse rounded-full bg-surface" />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-square animate-pulse rounded-xl bg-surface" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-surface" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
                <div className="h-3 w-full animate-pulse rounded bg-surface" />
                <div className="h-4 w-24 animate-pulse rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";

import { searchProducts } from "@/lib/products";
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Buscador en vivo de la cabecera. Es de solo lectura y no expone nada que no
 * esté ya en el catálogo público, pero se limita igualmente: sin tope, es la
 * ruta más barata de golpear en bucle para saturar la base de datos.
 */
export async function GET(request: Request) {
  const limit = rateLimit(`search:${clientIp(request.headers)}`, {
    limit: 40,
    windowMs: 60_000,
  });

  if (!limit.success) {
    return NextResponse.json(
      { results: [], error: "Demasiadas búsquedas. Espera un momento." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  const query = new URL(request.url).searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json({ results: [] }, { headers: rateLimitHeaders(limit) });
  }

  try {
    const results = await searchProducts(query.slice(0, 80));
    return NextResponse.json({ results }, { headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error("[api/search]", error);
    return NextResponse.json(
      { results: [], error: "No pudimos buscar en este momento." },
      { status: 500 }
    );
  }
}

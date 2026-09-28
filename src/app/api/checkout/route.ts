import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createOrder, whatsAppUrl } from "@/lib/orders";
import { checkoutSchema } from "@/lib/validations";
import { clientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { ORDER_COOKIE } from "@/lib/order-access";

export const dynamic = "force-dynamic";

/**
 * Bloquea peticiones desde otro origen.
 *
 * Aquí no hay cookie de sesión que robar, así que no es CSRF clásico; lo que
 * se evita es que un sitio ajeno use este endpoint para llenar la tienda de
 * pedidos falsos desde los navegadores de sus visitantes. Sin cabecera
 * `Origin` (curl, apps nativas) se deja pasar: bloquearlo no añade seguridad
 * real y rompería integraciones legítimas.
 */
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { error: "Origen no permitido." },
      { status: 403 }
    );
  }

  // Crear un pedido escribe en la base y descuenta inventario: es la ruta más
  // cara de la tienda y la primera que abusaría un bot.
  const limit = rateLimit(`checkout:${clientIp(request.headers)}`, {
    limit: 5,
    windowMs: 10 * 60_000,
  });

  if (!limit.success) {
    return NextResponse.json(
      {
        error: `Has enviado demasiados pedidos seguidos. Inténtalo en ${Math.ceil(
          limit.retryAfter / 60
        )} minutos o escríbenos por WhatsApp.`,
      },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    // Se devuelven los errores por campo para que el formulario los pinte
    // junto a cada input en vez de en un aviso genérico.
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }

    return NextResponse.json(
      { error: "Revisa los datos del formulario.", fieldErrors },
      { status: 400, headers: rateLimitHeaders(limit) }
    );
  }

  const result = await createOrder(parsed.data);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.code === "ERROR" ? 500 : 409 }
    );
  }

  // El stock cambió: catálogo y home deben reflejarlo sin esperar el plazo.
  revalidatePath("/");
  revalidatePath("/productos");

  const full = await db.order.findUnique({
    where: { id: result.order.id },
    include: { items: true },
  });

  const response = NextResponse.json(
    {
      orderNumber: result.order.orderNumber,
      total: result.order.total,
      whatsAppUrl: full ? whatsAppUrl(full) : null,
    },
    { status: 201, headers: rateLimitHeaders(limit) }
  );

  /**
   * Los números de pedido son consecutivos y, por tanto, adivinables. La página
   * de confirmación muestra nombre, teléfono y dirección, así que solo se abre
   * si el navegador trae esta cookie —es la prueba de que fue quien lo hizo.
   * Se guardan los últimos pedidos por si alguien compra varias veces seguidas.
   */
  const previous = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${ORDER_COOKIE}=`))
    ?.slice(ORDER_COOKIE.length + 1);

  const owned = [
    result.order.orderNumber,
    ...decodeURIComponent(previous ?? "").split(",").filter(Boolean),
  ].slice(0, 5);

  response.cookies.set({
    name: ORDER_COOKIE,
    value: owned.join(","),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 días
  });

  return response;
}

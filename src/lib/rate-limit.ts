import "server-only";

/**
 * Limitador de peticiones por ventana deslizante, en memoria.
 *
 * Alcance: frena el abuso evidente (un script enviando pedidos en bucle, fuerza
 * bruta contra el login) sin añadir infraestructura. Al vivir en memoria, el
 * contador es por instancia: en Vercel varias lambdas concurrentes tienen cada
 * una el suyo, así que el límite efectivo es mayor que el configurado. Para
 * límites estrictos, sustituir el `Map` por Upstash Redis manteniendo esta
 * misma firma —el resto del código no cambia.
 */

type Entry = { count: number; expiresAt: number };

const buckets = new Map<string, Entry>();

/** Evita que el Map crezca sin control en procesos de larga vida. */
function sweep(now: number) {
  if (buckets.size < 5_000) return;
  for (const [key, entry] of buckets) {
    if (entry.expiresAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Segundos hasta que la ventana se reinicia. */
  retryAfter: number;
};

export type RateLimitOptions = { limit: number; windowMs: number };

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(key);

  if (!entry || entry.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  entry.count += 1;
  const retryAfter = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));

  return {
    success: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter,
  };
}

/**
 * Consulta el estado sin gastar un intento.
 *
 * Lo usa el login para separar "comprobar si puede intentar" de "apuntar que
 * falló": así el contador solo sube con los errores y quien escribe bien la
 * contraseña nunca se queda fuera por entrar varias veces al día.
 */
export function rateLimitPeek(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.expiresAt <= now) {
    return {
      success: true,
      limit,
      remaining: limit,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  return {
    success: entry.count < limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
  };
}

/** Apunta un intento fallido. */
export function rateLimitConsume(key: string, options: RateLimitOptions) {
  return rateLimit(key, options);
}

/** Borra el contador: se llama tras una autenticación correcta. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/**
 * IP del cliente a partir de las cabeceras del proxy. En Vercel `x-forwarded-for`
 * es de confianza porque lo reescribe el edge; en otro hosting hay que
 * asegurarse de que el proxy la sobrescriba y no la deje pasar del cliente.
 */
export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "desconocida";
}

/** Cabeceras estándar para que el cliente sepa cuánto le queda. */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.retryAfter),
    ...(result.success ? {} : { "Retry-After": String(result.retryAfter) }),
  };
}

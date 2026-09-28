"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations";
import {
  clientIp,
  rateLimitConsume,
  rateLimitPeek,
  resetRateLimit,
} from "@/lib/rate-limit";

export type LoginState = { error: string | null };

/**
 * Cinco fallos cada quince minutos por IP. Solo cuentan los intentos
 * fallidos: un acierto borra el contador, de modo que el equipo puede entrar
 * tantas veces como necesite y el freno cae únicamente sobre quien prueba
 * contraseñas a ciegas.
 */
const LOGIN_LIMIT = { limit: 5, windowMs: 15 * 60_000 };

export async function login(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const key = `login:${clientIp(await headers())}`;
  const allowance = rateLimitPeek(key, LOGIN_LIMIT);

  if (!allowance.success) {
    return {
      error: `Demasiados intentos fallidos. Espera ${Math.ceil(
        allowance.retryAfter / 60
      )} minutos antes de volver a probar.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // No se dice qué campo falló: cualquier detalle de más ayuda a enumerar
  // cuentas válidas.
  if (!parsed.success) {
    rateLimitConsume(key, LOGIN_LIMIT);
    return { error: "Correo o contraseña incorrectos." };
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

  // Solo se acepta una ruta interna: un `callbackUrl` absoluto convertiría el
  // login en un redirector abierto hacia sitios de phishing.
  const redirectTo =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/admin";

  try {
    // `redirect: false` deja que sea esta acción quien redirija, y así hay un
    // punto donde reconocer el acierto y limpiar el contador de intentos.
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      rateLimitConsume(key, LOGIN_LIMIT);
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }

  resetRateLimit(key);
  redirect(redirectTo);
}

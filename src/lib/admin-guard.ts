import "server-only";

import { auth } from "@/auth";

/**
 * Comprueba la sesión dentro de cada server action.
 *
 * El proxy ya bloquea las páginas de `/admin`, pero las server actions son
 * endpoints POST con su propia URL: alguien con el identificador de la acción
 * puede invocarla sin pasar por ninguna página. Por eso la autorización se
 * repite aquí, que es donde ocurre la escritura.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("NO_AUTORIZADO");
  }

  return session.user;
}

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const ok = (message?: string): ActionState => ({ ok: true, message });

export const fail = (
  message: string,
  fieldErrors?: Record<string, string>
): ActionState => ({ ok: false, message, fieldErrors });

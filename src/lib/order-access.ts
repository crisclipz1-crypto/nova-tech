import "server-only";

import { cookies } from "next/headers";

/**
 * Cookie que registra los pedidos hechos desde este navegador.
 *
 * Hace de llave para la página de confirmación: sin ella, cualquiera podría
 * recorrer NT-0926-0001, 0002, 0003… y leer el nombre, el teléfono y la
 * dirección de todos los clientes. El equipo interno accede por `/admin`, que
 * tiene su propia autenticación.
 */
export const ORDER_COOKIE = "nt_orders";

export async function ownsOrder(orderNumber: string) {
  const store = await cookies();
  const raw = store.get(ORDER_COOKIE)?.value;
  if (!raw) return false;

  return raw.split(",").includes(orderNumber);
}

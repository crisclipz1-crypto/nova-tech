import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Proxy de Next 16 (antes `middleware.ts`). Se apoya en el callback
 * `authorized` de `authConfig` para cerrar `/admin` a quien no tenga sesión.
 */
export default NextAuth(authConfig).auth;

export const config = {
  /**
   * Se excluyen los assets y las rutas de NextAuth. El resto pasa por aquí
   * porque `authorized` también redirige a `/admin` a quien ya inició sesión
   * y vuelve a `/login`.
   */
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};

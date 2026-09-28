import type { NextAuthConfig } from "next-auth";

/**
 * Configuración compartida entre el proxy de rutas y la instancia completa.
 *
 * Aquí NO se importa Prisma ni bcrypt a propósito: este objeto lo carga el
 * proxy que se ejecuta antes que cualquier página, y debe mantenerse ligero y
 * sin dependencias nativas. La verificación real de credenciales vive en
 * `src/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 h: una jornada de trabajo
  },
  trustHost: true,
  callbacks: {
    /**
     * Única puerta de entrada a `/admin`. Se ejecuta en el proxy, así que
     * ninguna página o server action del panel llega a renderizarse sin sesión.
     */
    authorized({ auth, request }) {
      const { pathname, search } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);

      if (pathname.startsWith("/admin")) {
        if (isLoggedIn) return true;
        // Guarda el destino para volver ahí después de iniciar sesión.
        const url = new URL("/login", request.nextUrl);
        url.searchParams.set("callbackUrl", `${pathname}${search}`);
        return Response.redirect(url);
      }

      if (pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "ADMIN";
        token.name = user.name;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Se añaden en src/auth.ts
} satisfies NextAuthConfig;

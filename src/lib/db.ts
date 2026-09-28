import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 exige un driver adapter. Elegimos uno u otro según el esquema de la
 * URL, de modo que pasar de desarrollo (SQLite) a producción (Postgres) sea
 * solo cambiar `DATABASE_URL` y el `provider` del schema —ver `db:use-postgres`.
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Copia .env.example a .env y define la conexión."
    );
  }

  const adapter = url.startsWith("file:")
    ? new PrismaBetterSqlite3({ url })
    : new PrismaPg({ connectionString: url });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

// En desarrollo Next.js recarga los módulos en cada cambio; sin este singleton
// se abriría una conexión nueva por recarga hasta agotar el pool.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

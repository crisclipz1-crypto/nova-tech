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
    : new PrismaPg({
        connectionString: url,
        /**
         * En serverless cada instancia abre su propio pool y hay muchas
         * instancias a la vez, así que el límite de la base se reparte entre
         * todas. Con el `max: 10` que trae `pg` por defecto, tres lambdas
         * concurrentes ya agotan una base de 30 conexiones y todo devuelve
         * P2037 (`too many connections`).
         *
         * Por eso el valor por defecto es 1: cada invocación atiende una sola
         * petición, y las consultas en paralelo de esa petición se serializan
         * —cuesta unos milisegundos y a cambio la tienda no se cae.
         *
         * Con un endpoint agrupado (el `-pooler` de Neon, PgBouncer,
         * Supabase) el pooler ya multiplexa y conviene subirlo:
         *   DATABASE_POOL_MAX=5
         */
        max: Number(process.env.DATABASE_POOL_MAX ?? 1),
        /** Devuelve las conexiones ociosas en vez de retenerlas. */
        idleTimeoutMillis: 10_000,
        /** Falla rápido si la base no responde, en vez de colgar la petición. */
        connectionTimeoutMillis: 10_000,
        /** Permite que la lambda termine sin esperar al pool. */
        allowExitOnIdle: true,
      });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

/**
 * Cliente único por proceso.
 *
 * En desarrollo evita abrir una conexión nueva en cada recarga de Next. En
 * producción importa todavía más: las instancias de serverless se reutilizan
 * entre peticiones, así que guardar el cliente aquí hace que un contenedor
 * caliente reaproveche su pool en lugar de crear uno por invocación.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;

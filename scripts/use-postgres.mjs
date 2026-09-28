#!/usr/bin/env node
/**
 * Cambia el datasource de SQLite a PostgreSQL.
 *
 * El `provider` de Prisma no admite variables de entorno, así que el salto de
 * desarrollo a producción es una edición de una línea del schema. Este script
 * la hace y recuerda los pasos siguientes.
 *
 *   npm run db:use-postgres
 *
 * El esquema de `prisma/schema.prisma` ya está escrito para ser compatible con
 * ambos motores (sin enums, sin arrays, sin tipos nativos), así que no hace
 * falta tocar ningún modelo.
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const schemaPath = resolve("prisma/schema.prisma");
const schema = readFileSync(schemaPath, "utf8");

if (schema.includes('provider = "postgresql"')) {
  console.log("El schema ya apunta a PostgreSQL. Nada que hacer.");
  process.exit(0);
}

if (!schema.includes('provider = "sqlite"')) {
  console.error("No se encontró `provider = \"sqlite\"` en prisma/schema.prisma.");
  process.exit(1);
}

writeFileSync(
  schemaPath,
  schema.replace('provider = "sqlite"', 'provider = "postgresql"'),
  "utf8"
);

// Las migraciones generadas para SQLite usan su dialecto de SQL y no se pueden
// aplicar sobre Postgres: se descartan para regenerar una inicial limpia.
const migrations = resolve("prisma/migrations");
if (existsSync(migrations)) {
  rmSync(migrations, { recursive: true, force: true });
  console.log("· Migraciones de SQLite eliminadas.");
}

console.log(`
✔ prisma/schema.prisma ahora usa PostgreSQL.

Siguientes pasos:

  1. Apunta DATABASE_URL a tu Postgres, por ejemplo:
     DATABASE_URL="postgresql://usuario:clave@host/basedatos?sslmode=require"

  2. Genera y aplica la migración inicial:
     npx prisma migrate dev --name init

  3. Carga los datos de ejemplo (opcional):
     npm run db:seed

  4. En Vercel, define DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL y
     NEXT_PUBLIC_WHATSAPP_NUMBER, y usa "vercel-build" como Build Command
     (aplica las migraciones antes de compilar).

  5. Opcional, para un bundle más liviano:
     npm uninstall @prisma/adapter-better-sqlite3 better-sqlite3
`);

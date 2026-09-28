#!/usr/bin/env node
/**
 * Cambia el motor de base de datos del esquema de Prisma.
 *
 *   npm run db:use-postgres    # producción (Vercel, Neon, Supabase…)
 *   npm run db:use-sqlite      # desarrollo sin servidor
 *
 * El `provider` de Prisma no admite variables de entorno, así que el motor es
 * una línea del esquema. Los modelos no cambian: `prisma/schema.prisma` está
 * escrito para funcionar igual en ambos (sin enums, sin arrays escalares y sin
 * tipos nativos).
 *
 * Las migraciones sí son específicas de cada dialecto, así que se descartan y
 * se regenera una inicial. `prisma migrate diff` la produce sin necesidad de
 * una base de datos en marcha, lo que permite preparar el despliegue antes de
 * tener el Postgres creado.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const TARGETS = {
  sqlite: {
    name: "SQLite",
    example: 'DATABASE_URL="file:./dev.db"',
  },
  postgresql: {
    name: "PostgreSQL",
    example:
      'DATABASE_URL="postgresql://usuario:clave@host/basedatos?sslmode=require"',
  },
};

const target = process.argv[2];

if (!TARGETS[target]) {
  console.error(
    `Uso: node scripts/datasource.mjs <${Object.keys(TARGETS).join("|")}>`
  );
  process.exit(1);
}

const schemaPath = resolve("prisma/schema.prisma");
const schema = readFileSync(schemaPath, "utf8");

const current = schema.match(/provider\s*=\s*"(sqlite|postgresql)"/)?.[1];

if (!current) {
  console.error("No se encontró el provider del datasource en el esquema.");
  process.exit(1);
}

if (current === target) {
  console.log(
    `El esquema ya usa ${TARGETS[target].name}; se regenera la migración inicial.`
  );
}

writeFileSync(
  schemaPath,
  schema.replace(
    /(datasource db \{[\s\S]*?provider\s*=\s*)"(?:sqlite|postgresql)"/,
    `$1"${target}"`
  ),
  "utf8"
);

// Las migraciones del motor anterior usan otro dialecto de SQL.
const migrations = resolve("prisma/migrations");
rmSync(migrations, { recursive: true, force: true });

const initDir = resolve(migrations, "0_init");
mkdirSync(initDir, { recursive: true });

// `--from-empty` genera el SQL de la base completa sin conectarse a ninguna.
const sql = execFileSync(
  "npx",
  [
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ],
  { encoding: "utf8" }
);

writeFileSync(resolve(initDir, "migration.sql"), sql, "utf8");
writeFileSync(
  resolve(migrations, "migration_lock.toml"),
  `# Generado por scripts/datasource.mjs\nprovider = "${target}"\n`,
  "utf8"
);

console.log(`
✔ El esquema ahora usa ${TARGETS[target].name}.
✔ Migración inicial regenerada en prisma/migrations/0_init/

Siguientes pasos:

  1. Apunta DATABASE_URL a la nueva base:
     ${TARGETS[target].example}

  2. Aplica la migración:
     npx prisma migrate deploy

  3. Carga los datos de ejemplo (opcional):
     npm run db:seed
`);

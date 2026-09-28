<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NOVA TECH — notas del proyecto

E-commerce con pago contra entrega (sin pasarela). Next.js 16 · Prisma 7 ·
Auth.js v5 · Tailwind v4 · shadcn/ui sobre Base UI.

## Reglas que no hay que romper

- **Los precios se recalculan en el servidor.** El carrito del navegador solo
  aporta `productId`, `quantity` y `variantIds`. Ver `createOrder()` en
  `src/lib/orders.ts`.
- **El esquema de Prisma tiene que seguir funcionando en SQLite y Postgres**:
  nada de `enum`, arrays escalares ni tipos nativos.
- **Cada server action llama a `requireAdmin()`.** El proxy protege las páginas,
  pero las actions son endpoints POST invocables por su cuenta.
- **Las transiciones de estado de un pedido se validan en el servidor** contra
  `ORDER_STATUS_TRANSITIONS`, no solo en la interfaz.
- **Para enlaces con aspecto de botón usa `LinkButton`**, no
  `<Button render={<Link/>}>`: Base UI le pone `role="button"` y se pierde la
  semántica de enlace.
- **No exportes constantes desde módulos `"use client"` hacia el servidor.** Los
  valores compartidos viven en `src/types/`.
- **No subas el `max` del pool de `pg` sin un endpoint agrupado.** En serverless
  cada instancia abre el suyo; con el `max: 10` por defecto tres peticiones
  concurrentes agotan una base de 30 conexiones (`P2037`).
- **El color de marca es #0037FF y va en tokens**, no incrustado en clases. Usa
  `bg-brand` / `text-brand` / `brand-muted` / `brand-soft`. Sobre fondo oscuro
  el azul base no contrasta (2.82:1): ahí se usa `brand-soft`. El blanco
  translúcido sobre azul necesita `/80` o más para pasar AA.

## Comandos

`npm run dev` · `npm run typecheck` · `npm run lint` · `npm run db:seed`

# NOVA TECH

Tienda de tecnología con **pago 100 % contra entrega**. Sin pasarela de pago: el
cliente pide, el equipo confirma por WhatsApp y el dinero cambia de manos cuando
el producto ya está en la puerta.

Incluye la tienda pública y un panel de administración (`/admin`) para gestionar
catálogo, pedidos, campañas y reseñas.

---

## Arranque rápido

El esquema apunta a **PostgreSQL**, que es lo que corre en producción.

```bash
npm install
cp .env.example .env          # pon tu DATABASE_URL y genera AUTH_SECRET
npx prisma migrate deploy     # crea las tablas
npm run db:seed               # carga catálogo, pedidos y reseñas de ejemplo
npm run dev
```

Si el proyecto ya está desplegado, `vercel env pull .env.local` trae la
conexión sin copiar nada a mano.

La tienda queda en <http://localhost:3000> y el panel en
<http://localhost:3000/admin>.

### Sin servidor de base de datos

Para desarrollar con SQLite en un archivo local:

```bash
npm run db:use-sqlite         # cambia el provider y regenera la migración
# DATABASE_URL="file:./dev.db" en .env
npx prisma migrate deploy && npm run db:seed
```

Los modelos no cambian: el esquema está escrito para funcionar igual en ambos
motores. **Vuelve a `npm run db:use-postgres` antes de desplegar.**

### Acceso al panel

Credenciales del seed (se definen en `.env`):

| | |
|---|---|
| Usuario | `admin@novatech.co` |
| Contraseña | `NovaTech2026!` |

> Cambia `ADMIN_PASSWORD` antes de sembrar en cualquier entorno real. El seed
> genera el hash con bcrypt; la contraseña en claro nunca se guarda.

### Variables de entorno

```bash
DATABASE_URL="postgresql://…?sslmode=require"
AUTH_SECRET="…"                           # openssl rand -base64 32
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="573001234567" # internacional, sin "+" ni espacios
ADMIN_EMAIL="admin@novatech.co"           # solo para el seed
ADMIN_PASSWORD="NovaTech2026!"
ADMIN_NAME="Equipo Nova"
```

**`NEXT_PUBLIC_WHATSAPP_NUMBER` es el número que recibe los pedidos.** Cámbialo
por el real antes de publicar o los clientes escribirán a un número inexistente.

---

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Lenguaje | TypeScript en modo estricto |
| Estilos | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Base de datos | Prisma 7 · PostgreSQL (SQLite opcional en local) |
| Autenticación | Auth.js v5 (NextAuth) con credenciales + bcrypt |
| Validación | Zod v4 · React Hook Form en el checkout |
| Iconos | lucide-react |

---

## Estructura

```
src/
├─ app/
│  ├─ (shop)/                 tienda pública (cabecera y pie propios)
│  │  ├─ page.tsx             home: hero, destacados, reseñas
│  │  ├─ productos/           catálogo con filtros + ficha de producto
│  │  ├─ carrito/             carrito completo
│  │  ├─ checkout/            formulario contra entrega
│  │  ├─ pedido/[orderNumber] confirmación (protegida por cookie)
│  │  └─ como-funciona/       envíos, garantía y devoluciones
│  ├─ admin/                  panel interno + server actions
│  ├─ login/                  acceso del equipo
│  ├─ api/
│  │  ├─ checkout/            crea el pedido y descuenta stock
│  │  ├─ search/              buscador en vivo
│  │  ├─ auth/[...nextauth]/  handlers de Auth.js
│  │  └─ admin/pedidos/export exportación CSV para logística
│  ├─ error.tsx · global-error.tsx · not-found.tsx
│  └─ globals.css             sistema de diseño (tokens y utilidades)
├─ components/
│  ├─ cart/                   store + panel lateral + líneas
│  ├─ catalog/ product/ home/ checkout/ admin/ layout/ shared/
│  └─ ui/                     primitivas de shadcn
├─ lib/                       db, config, validaciones, consultas, utilidades
├─ types/                     formas compartidas servidor ↔ cliente
├─ auth.ts · auth.config.ts   configuración de Auth.js
└─ proxy.ts                   protege /admin (antes `middleware.ts`)
```

---

## Decisiones que conviene conocer

**El precio se recalcula siempre en el servidor.** El carrito vive en el
navegador, así que el checkout solo acepta identificadores y cantidades; los
precios salen de la base de datos. Ver `createOrder()` en
[`src/lib/orders.ts`](src/lib/orders.ts).

**El stock se descuenta al crear el pedido**, no al confirmarlo, para no vender
dos veces la última unidad mientras se llama al cliente. Cancelar devuelve las
unidades al inventario.

**Los estados de pedido solo avanzan por transiciones válidas**
(`PENDIENTE → CONFIRMADO → ENVIADO → ENTREGADO`, con `CANCELADO` disponible
hasta el envío). La regla vive en `ORDER_STATUS_TRANSITIONS` y se comprueba en
el servidor, no solo en la interfaz.

**La página de confirmación exige una cookie.** Los números de pedido son
consecutivos y por tanto adivinables; sin esa llave, cualquiera podría leer
nombres, teléfonos y direcciones recorriendo la secuencia.

**El esquema de Prisma es portable entre PostgreSQL y SQLite**: sin `enum`, sin
arrays escalares y sin tipos nativos. Por eso los estados son `String`
validados con Zod y las especificaciones técnicas se guardan como JSON en texto.
El script `scripts/datasource.mjs` cambia el motor y regenera la migración
inicial con `prisma migrate diff`, que no necesita una base en marcha.

**Los productos con pedidos no se eliminan, se ocultan.** El histórico guarda
nombre y precio de cada línea, pero borrar el producto rompería el enlace.

---

## Seguridad

- **Validación con Zod** en cada entrada: checkout, login, formularios del panel
  y parámetros de URL del catálogo. El texto libre se sanea (se quitan etiquetas
  y caracteres de control) antes de guardarse.
- **Consultas parametrizadas** por Prisma: no hay SQL construido a mano.
- **`/admin` cerrado en el proxy** (`src/proxy.ts`) y, además, cada server
  action revalida la sesión con `requireAdmin()`, porque las actions son
  endpoints POST invocables directamente.
- **Límite de peticiones** en checkout (5 cada 10 min por IP), búsqueda (40/min)
  y login (5 **fallos** cada 15 min; un acierto limpia el contador).
- **Comprobación de origen** en `/api/checkout`, para que otro sitio no pueda
  generar pedidos desde el navegador de sus visitantes.
- **Escape de fórmulas en el CSV**: las celdas que empiezan por `=`, `+`, `-` o
  `@` se neutralizan para que Excel no las ejecute.
- **Cabeceras de seguridad** en `next.config.ts` (HSTS, `X-Frame-Options`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy`).

### Pendiente: Content-Security-Policy

No se incluye CSP porque una con `'unsafe-inline'` no protege de nada. Hacerla
útil exige generar un nonce por petición en `src/proxy.ts` y propagarlo a los
scripts de Next. Es el siguiente paso natural de endurecimiento.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Crea una migración nueva tras cambiar el esquema |
| `npm run db:seed` | Reinicia y siembra los datos de ejemplo |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Borra, migra y vuelve a sembrar |
| `npm run db:use-postgres` | Cambia el datasource a PostgreSQL |
| `npm run db:use-sqlite` | Cambia el datasource a SQLite |

---

## Despliegue en Vercel

SQLite no sirve en Vercel: el sistema de archivos es efímero y de solo lectura.
Hace falta un PostgreSQL gestionado.

**1. Crea la base de datos**

En el panel de Vercel → *Storage* → *Create Database* → **Neon (Postgres)**. La
integración añade `DATABASE_URL` al proyecto automáticamente. Cualquier otro
proveedor sirve: basta con crear la variable a mano.

**2. Comprueba el resto de variables**

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la inyecta Neon; si no, la cadena con `?sslmode=require` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.vercel.app` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | el número real que atiende los pedidos |

**3. Despliega**

Vercel detecta el script `vercel-build` del `package.json` y lo usa en lugar de
`build`:

```
prisma generate && prisma migrate deploy && next build
```

`migrate deploy` aplica `prisma/migrations/0_init` en el primer despliegue, así
que las tablas se crean solas.

**4. Carga el catálogo inicial**

```bash
vercel env pull .env.local
DATABASE_URL="$(grep ^DATABASE_URL .env.local | cut -d= -f2- | tr -d \")" npm run db:seed
```

O empieza de cero creando los productos desde `/admin`.

**5. Opcional: bundle más liviano**

Si no piensas volver a SQLite en local:

```bash
npm uninstall @prisma/adapter-better-sqlite3 better-sqlite3
```

### Imágenes de producto

`next.config.ts` trae una lista blanca de dominios (`images.unsplash.com`,
Cloudinary y Vercel Blob). **Añade ahí tu CDN antes de subir fotos propias**: el
optimizador descarga las URLs desde el servidor, así que abrirlo a `**`
convertiría la tienda en un proxy de imágenes para cualquiera.

### Antes de abrir al público

- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` con el número real
- [ ] Contraseña del administrador cambiada
- [ ] `AUTH_SECRET` distinto del de desarrollo
- [ ] Catálogo real cargado y productos de ejemplo eliminados
- [ ] Dominio propio y `NEXT_PUBLIC_SITE_URL` actualizado
- [ ] Textos legales de `/como-funciona` revisados por quien corresponda

---

## Notas operativas

**Límites de petición en serverless.** El limitador vive en memoria, así que en
Vercel cada instancia lleva su propio contador y el límite efectivo es mayor que
el configurado. Frena el abuso evidente; para límites estrictos, sustituye el
`Map` de [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts) por Upstash Redis
manteniendo la misma firma.

**Campañas de temporada.** En *Banners* se preparan los banners de Black Friday,
Navidad o verano y se activan cuando toque. Solo se muestra uno a la vez: al
activar uno, el anterior se apaga. Si se programan fechas, el banner aparece
únicamente dentro de esa ventana.

**Exportación para logística.** *Pedidos → Exportar CSV* descarga los pedidos
con dirección, teléfono y detalle de productos, respetando el filtro de estado
activo.

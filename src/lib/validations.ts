import { z } from "zod";

import {
  MAX_ITEMS_PER_ORDER,
  MAX_QUANTITY_PER_ITEM,
  ORDER_STATUSES,
  BANNER_THEME_KEYS,
} from "@/lib/config";
import { isValidLocation } from "@/lib/colombia";

/**
 * Limpieza de texto libre aplicada a TODO lo que escribe un usuario o un
 * administrador. Prisma ya parametriza las consultas (no hay inyección SQL),
 * y React escapa al renderizar (no hay XSS reflejado); esto cierra el resto:
 * evita que se almacene marcado, caracteres de control o espacios basura que
 * luego rompan exportaciones CSV o mensajes de WhatsApp.
 */
const cleanText = (value: string) =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

/** String de texto libre saneado, con longitud acotada. */
const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} es obligatorio` })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(min, `${label} debe tener al menos ${min} caracteres`)
        .max(max, `${label} no puede superar ${max} caracteres`)
    );

/** Igual que `text` pero opcional: "" se normaliza a undefined. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(max, `${label} no puede superar ${max} caracteres`))
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional();

// ---------------------------------------------------------------------------
// Checkout (público)
// ---------------------------------------------------------------------------

/**
 * Celular colombiano: 10 dígitos que empiezan por 3, aceptando que la persona
 * escriba espacios, guiones o el prefijo +57. Se normaliza a 573XXXXXXXXX
 * para poder abrir WhatsApp directamente.
 */
export const phoneSchema = z
  .string({ error: "El teléfono es obligatorio" })
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .transform((value) => value.replace(/^\+?57/, ""))
  .pipe(
    z
      .string()
      .regex(
        /^3\d{9}$/,
        "Escribe un celular colombiano válido (10 dígitos, empieza por 3)"
      )
  )
  .transform((value) => `57${value}`);

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Producto inválido"),
  quantity: z
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad mínima es 1")
    .max(MAX_QUANTITY_PER_ITEM, `Máximo ${MAX_QUANTITY_PER_ITEM} unidades`),
  /** IDs de las variantes elegidas; se revalidan contra la BD en el servidor. */
  variantIds: z.array(z.string().min(1)).max(4).default([]),
});

/** Campos que escribe la persona en el formulario de entrega. */
const deliveryFields = {
  customerName: text(3, 80, "El nombre"),
  customerPhone: phoneSchema,
  customerEmail: z
    .union([z.literal(""), z.email("Escribe un correo válido")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  department: text(3, 60, "El departamento"),
  city: text(2, 60, "La ciudad"),
  address: text(8, 160, "La dirección"),
  notes: optionalText(300, "Las notas"),
};

/** La pareja departamento/ciudad tiene que existir en la lista de cobertura. */
const locationIsReal = {
  check: (data: { department: string; city: string }) =>
    isValidLocation(data.department, data.city),
  options: {
    message: "Elige una ciudad válida para ese departamento",
    path: ["city"],
  },
};

/**
 * El formulario valida solo los datos de entrega: el carrito lo añade el
 * cliente al enviar, y el servidor lo vuelve a comprobar con `checkoutSchema`.
 * Por eso son dos esquemas construidos sobre los mismos campos y no uno con
 * `items` opcional —así `checkoutSchema` nunca acepta un pedido sin líneas.
 */
export const checkoutFormSchema = z
  .object(deliveryFields)
  .refine(locationIsReal.check, locationIsReal.options);

export const checkoutSchema = z
  .object({
    ...deliveryFields,
    items: z
      .array(cartItemSchema)
      .min(1, "Tu carrito está vacío")
      .max(MAX_ITEMS_PER_ORDER, "Demasiados productos distintos en un pedido"),
  })
  .refine(locationIsReal.check, locationIsReal.options);

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;
export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.email("Escribe un correo válido").max(120),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Panel: productos
// ---------------------------------------------------------------------------

const priceField = (label: string) =>
  z.coerce
    .number({ error: `${label} debe ser un número` })
    .int(`${label} no admite decimales en COP`)
    .min(0, `${label} no puede ser negativo`)
    .max(100_000_000, `${label} es demasiado alto`);

export const specSchema = z.object({
  label: text(1, 40, "La característica"),
  value: text(1, 80, "El valor"),
});

export const productImageSchema = z.object({
  url: z.url("La imagen debe ser una URL válida").max(500),
  alt: optionalText(140, "El texto alternativo"),
});

export const productVariantSchema = z.object({
  group: text(2, 30, "El grupo de variante"),
  label: text(2, 30, "La etiqueta"),
  value: text(1, 40, "El valor"),
  hex: z
    .union([
      z.literal(""),
      z.string().regex(/^#[0-9a-fA-F]{6}$/, "Usa un color hex tipo #1A1A1A"),
    ])
    .optional()
    .transform((v) => (v ? v : undefined)),
  priceDelta: z.coerce.number().int().min(-50_000_000).max(50_000_000).default(0),
  stock: z.coerce.number().int().min(0).max(100_000).default(0),
});

export const productSchema = z
  .object({
    name: text(3, 120, "El nombre"),
    slug: z
      .string()
      .transform((v) => cleanText(v).toLowerCase())
      .pipe(
        z
          .string()
          .min(3, "El slug debe tener al menos 3 caracteres")
          .max(80)
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "El slug solo admite minúsculas, números y guiones"
          )
      ),
    summary: text(10, 180, "El resumen"),
    description: text(20, 4000, "La descripción"),
    price: priceField("El precio"),
    compareAtPrice: z
      .union([z.literal(""), priceField("El precio tachado")])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
    sku: optionalText(40, "El SKU"),
    brand: optionalText(40, "La marca"),
    stock: z.coerce.number().int().min(0).max(100_000).default(0),
    categoryId: z.string().min(1, "Elige una categoría"),
    active: z.boolean().default(true),
    featured: z.boolean().default(false),
    bestSeller: z.boolean().default(false),
    isNew: z.boolean().default(false),
    badge: optionalText(40, "La etiqueta"),
    specs: z.array(specSchema).max(20).default([]),
    images: z
      .array(productImageSchema)
      .min(1, "Añade al menos una imagen")
      .max(8, "Máximo 8 imágenes"),
    variants: z.array(productVariantSchema).max(24).default([]),
  })
  .refine(
    (data) =>
      data.compareAtPrice === undefined || data.compareAtPrice > data.price,
    {
      message: "El precio tachado debe ser mayor que el precio de venta",
      path: ["compareAtPrice"],
    }
  );

export type ProductInput = z.input<typeof productSchema>;
export type ProductData = z.output<typeof productSchema>;

// ---------------------------------------------------------------------------
// Panel: categorías
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  name: text(2, 60, "El nombre"),
  slug: z
    .string()
    .transform((v) => cleanText(v).toLowerCase())
    .pipe(
      z
        .string()
        .min(2)
        .max(60)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido")
    ),
  description: optionalText(200, "La descripción"),
  icon: optionalText(40, "El icono"),
  position: z.coerce.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Panel: banners
// ---------------------------------------------------------------------------

/**
 * Valor de un `<input type="datetime-local">`: "2026-11-24T08:00", sin zona ni
 * segundos. Se interpreta como hora local del servidor, que es la que el
 * equipo tiene en la cabeza al programar una campaña.
 */
const localDateTime = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? new Date(v) : undefined))
  .refine((d) => d === undefined || !Number.isNaN(d.getTime()), {
    message: "Fecha inválida",
  });

export const bannerSchema = z
  .object({
    eyebrow: optionalText(40, "El antetítulo"),
    title: text(3, 90, "El título"),
    subtitle: optionalText(200, "El subtítulo"),
    ctaLabel: optionalText(30, "El texto del botón"),
    ctaHref: optionalText(200, "El enlace del botón"),
    image: z
      .union([z.literal(""), z.url("La imagen debe ser una URL válida").max(500)])
      .optional()
      .transform((v) => (v ? v : undefined)),
    theme: z.enum(BANNER_THEME_KEYS as [string, ...string[]]),
    active: z.boolean().default(false),
    position: z.coerce.number().int().min(0).max(999).default(0),
    startsAt: localDateTime,
    endsAt: localDateTime,
  })
  .refine((d) => !d.startsAt || !d.endsAt || d.endsAt > d.startsAt, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["endsAt"],
  });

export type BannerInput = z.input<typeof bannerSchema>;

// ---------------------------------------------------------------------------
// Panel: pedidos
// ---------------------------------------------------------------------------

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const updateOrderSchema = z.object({
  orderId: z.string().min(1),
  status: orderStatusSchema,
  adminNotes: optionalText(500, "Las notas internas"),
  cancelReason: optionalText(200, "El motivo"),
});

// ---------------------------------------------------------------------------
// Panel: reseñas
// ---------------------------------------------------------------------------

export const reviewSchema = z.object({
  productId: z
    .union([z.literal(""), z.string().min(1)])
    .optional()
    .transform((v) => (v ? v : undefined)),
  authorName: text(2, 60, "El nombre"),
  city: optionalText(60, "La ciudad"),
  rating: z.coerce.number().int().min(1, "Mínimo 1 estrella").max(5),
  title: optionalText(90, "El título"),
  body: text(10, 600, "La reseña"),
  verified: z.boolean().default(false),
  approved: z.boolean().default(true),
  featured: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Catálogo: parámetros de búsqueda (URL)
// ---------------------------------------------------------------------------

export const catalogParamsSchema = z.object({
  q: z.string().max(80).optional().catch(undefined),
  categoria: z.string().max(80).optional().catch(undefined),
  min: z.coerce.number().int().min(0).optional().catch(undefined),
  max: z.coerce.number().int().min(0).optional().catch(undefined),
  stock: z.enum(["disponible", "todos"]).optional().catch(undefined),
  oferta: z.enum(["1"]).optional().catch(undefined),
  orden: z
    .enum(["relevancia", "precio-asc", "precio-desc", "nuevos", "vendidos"])
    .optional()
    .catch(undefined),
  pagina: z.coerce.number().int().min(1).max(500).optional().catch(undefined),
});

export type CatalogParams = z.infer<typeof catalogParamsSchema>;

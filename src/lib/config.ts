/**
 * Configuración de la tienda. Todo lo que cambia entre clientes o entornos vive
 * aquí y se alimenta de variables de entorno, para no tener textos de negocio
 * incrustados por los componentes.
 */

export const SITE = {
  name: "NOVA TECH",
  legalName: "Nova Tech S.A.S.",
  tagline: "Tecnología que llega a tu puerta",
  description:
    "Audio, cómputo y accesorios originales con garantía. Pagas en efectivo cuando recibes el pedido en tu casa. Envíos a toda Colombia.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hola@novatech.co",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
} as const;

/**
 * Número de WhatsApp que recibe los pedidos, en formato internacional sin `+`
 * ni espacios (ej. 573001234567). Se configura en `.env`.
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573001234567";

export const WHATSAPP_DISPLAY = formatWhatsAppForDisplay(WHATSAPP_NUMBER);

export const CURRENCY = {
  code: "COP",
  locale: "es-CO",
  /** COP no usa decimales en el día a día. */
  fractionDigits: 0,
} as const;

export const SHIPPING = {
  /** Costo fijo de envío en COP. */
  flatRate: 12000,
  /** A partir de este subtotal el envío es gratis. */
  freeFrom: 200000,
} as const;

/** Tope de unidades por línea, para evitar pedidos absurdos desde el cliente. */
export const MAX_QUANTITY_PER_ITEM = 10;

/** Tope de líneas distintas por pedido. */
export const MAX_ITEMS_PER_ORDER = 30;

export const ORDER_STATUSES = [
  "PENDIENTE",
  "CONFIRMADO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; description: string; className: string; dot: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    description: "Recibido, falta confirmar con el cliente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  CONFIRMADO: {
    label: "Confirmado",
    description: "Cliente confirmó por WhatsApp",
    className: "bg-brand-muted text-brand border-brand/20",
    dot: "bg-brand",
  },
  ENVIADO: {
    label: "Enviado",
    description: "En camino con la transportadora",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  ENTREGADO: {
    label: "Entregado",
    description: "Entregado y pagado contra entrega",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  CANCELADO: {
    label: "Cancelado",
    description: "No se concretó",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

/**
 * Transiciones permitidas. El panel solo ofrece los destinos válidos y la
 * server action vuelve a comprobarlos, para que nadie salte pasos con una
 * petición manual.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["ENVIADO", "CANCELADO"],
  ENVIADO: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

/** Temas visuales de los banners de temporada. */
export const BANNER_THEMES = {
  /**
   * Tema por defecto: el hero es un bloque azul de marca a sangre completa.
   * Es lo primero que se ve al entrar y lo que fija el color de la tienda.
   */
  default: {
    label: "Marca (azul)",
    wrapper: "bg-brand text-brand-foreground",
    eyebrow: "text-white/80",
    cta: "bg-white text-brand hover:bg-white/90",
    glow: "bg-white/15",
  },
  claro: {
    label: "Claro",
    wrapper: "bg-brand-muted text-foreground",
    eyebrow: "text-brand",
    cta: "bg-brand text-brand-foreground hover:bg-brand-hover",
    glow: "bg-brand/15",
  },
  blackfriday: {
    label: "Black Friday",
    wrapper: "bg-neutral-950 text-neutral-50",
    eyebrow: "text-[#C6F432]",
    cta: "bg-[#C6F432] text-neutral-950 hover:bg-[#d4ff45]",
    glow: "bg-[#C6F432]/15",
  },
  navidad: {
    label: "Navidad",
    wrapper: "bg-[#0d2b1e] text-emerald-50",
    eyebrow: "text-[#f5d67b]",
    cta: "bg-[#f5d67b] text-[#0d2b1e] hover:bg-[#ffe393]",
    glow: "bg-[#f5d67b]/15",
  },
  verano: {
    label: "Verano",
    wrapper: "bg-[#0b3d5c] text-sky-50",
    eyebrow: "text-[#ffd166]",
    cta: "bg-[#ffd166] text-[#0b3d5c] hover:bg-[#ffdd8a]",
    glow: "bg-[#ffd166]/20",
  },
  promo: {
    label: "Tinta",
    wrapper: "bg-neutral-950 text-neutral-50",
    eyebrow: "text-brand-soft",
    cta: "bg-brand text-brand-foreground hover:bg-brand-hover",
    glow: "bg-brand/25",
  },
} as const;

export type BannerTheme = keyof typeof BANNER_THEMES;

export const BANNER_THEME_KEYS = Object.keys(BANNER_THEMES) as BannerTheme[];

export function bannerTheme(key: string) {
  return BANNER_THEMES[key as BannerTheme] ?? BANNER_THEMES.default;
}

function formatWhatsAppForDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  // Colombia: 57 + 10 dígitos -> +57 300 123 4567
  if (digits.startsWith("57") && digits.length === 12) {
    const n = digits.slice(2);
    return `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return `+${digits}`;
}

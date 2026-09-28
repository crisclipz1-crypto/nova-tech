import { CURRENCY } from "@/lib/config";

const currencyFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  style: "currency",
  currency: CURRENCY.code,
  minimumFractionDigits: CURRENCY.fractionDigits,
  maximumFractionDigits: CURRENCY.fractionDigits,
});

const compactFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat(CURRENCY.locale);

/** 149900 -> "$ 149.900" */
export function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

/** 1250000 -> "$ 1,3 M" — para las tarjetas del dashboard. */
export function formatCompactPrice(value: number) {
  return `$ ${compactFormatter.format(value)}`;
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

/** Porcentaje de descuento redondeado; null si no hay oferta real. */
export function discountPercent(price: number, compareAtPrice?: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

const dateFormatter = new Intl.DateTimeFormat(CURRENCY.locale, {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(CURRENCY.locale, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return dateTimeFormatter.format(new Date(value));
}

/** "hace 3 h" — usado en el listado de pedidos del panel. */
export function timeAgo(value: Date | string) {
  const date = new Date(value);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 7],
    ["week", 4.35],
    ["month", 12],
  ];

  const rtf = new Intl.RelativeTimeFormat(CURRENCY.locale, { numeric: "auto" });
  let amount = seconds;

  for (const [unit, size] of steps) {
    if (Math.abs(amount) < size) return rtf.format(-Math.round(amount), unit);
    amount /= size;
  }
  return rtf.format(-Math.round(amount), "year");
}

/** Contador de 3 dígitos del carrito: 4 -> "004" (guiño a la referencia). */
export function padCount(value: number) {
  return String(Math.min(value, 999)).padStart(3, "0");
}

/** Convierte un nombre en slug URL-safe, sin tildes ni caracteres raros. */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Iniciales para los avatares de las reseñas. */
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

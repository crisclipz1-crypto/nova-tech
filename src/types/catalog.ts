/**
 * Formas de datos compartidas entre servidor y cliente.
 *
 * Se declaran aquí, y no se infieren desde `@/lib/products`, porque ese módulo
 * importa `server-only`: un componente de cliente no puede tocarlo ni para
 * sacar un tipo sin arriesgar que el bundler lo arrastre.
 */

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  badge: string | null;
  bestSeller: boolean;
  isNew: boolean;
  brand: string | null;
  unitsSold: number;
  category: { name: string; slug: string };
  images: { url: string; alt: string }[];
  _count: { variants: number };
};

export type SearchResult = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  category: { name: string };
  images: { url: string }[];
};

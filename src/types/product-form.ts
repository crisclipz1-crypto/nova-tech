/**
 * Forma y valores por defecto del formulario de producto.
 *
 * Viven fuera de `product-form.tsx` porque ese archivo es `"use client"`: al
 * importar una constante desde un módulo de cliente, un componente de servidor
 * recibe una referencia al cliente, no el objeto —y el formulario arrancaría
 * con `images` y `variants` sin definir.
 */

export type ProductSpecInput = { label: string; value: string };

export type ProductImageInput = { url: string; alt: string };

export type ProductVariantInput = {
  group: string;
  label: string;
  value: string;
  hex: string;
  priceDelta: number | string;
  stock: number | string;
};

export type ProductFormValues = {
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: number | string;
  compareAtPrice: number | string;
  sku: string;
  brand: string;
  stock: number | string;
  categoryId: string;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  badge: string;
  specs: ProductSpecInput[];
  images: ProductImageInput[];
  variants: ProductVariantInput[];
};

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  slug: "",
  summary: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sku: "",
  brand: "Nova",
  stock: 0,
  categoryId: "",
  active: true,
  featured: false,
  bestSeller: false,
  isNew: true,
  badge: "",
  specs: [],
  images: [],
  variants: [],
};

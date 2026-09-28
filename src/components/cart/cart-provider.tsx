"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { SHIPPING } from "@/lib/config";
import {
  addItem,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeItem,
  setItemQuantity,
  subscribe,
  type AddToCartInput,
  type CartItem,
  type CartVariant,
} from "@/components/cart/cart-store";

export type { CartItem, CartVariant, AddToCartInput };

type CartContextValue = {
  items: CartItem[];
  /** false durante el render del servidor y la hidratación. */
  hydrated: boolean;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  /** Cuánto falta para el envío gratis; 0 si ya lo alcanzó. */
  missingForFreeShipping: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  /** Clave del último producto añadido, para la micro-interacción del botón. */
  lastAdded: string | null;
  add: (input: AddToCartInput) => { ok: boolean; message?: string };
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/** Suscripción vacía: el valor de "ya montado" no cambia nunca. */
const neverChanges = () => () => {};

export function CartProvider({ children }: { children: React.ReactNode }) {
  // El carrito real vive en `cart-store`; React solo se suscribe a él.
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /**
   * El servidor no puede saber qué hay en el carrito, así que el primer render
   * cliente tiene que coincidir con el suyo (vacío) o la hidratación falla.
   * Este flag distingue "carrito vacío" de "todavía no lo sabemos", y es lo
   * que permite mostrar un esqueleto en vez de un falso "no hay nada".
   */
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  );

  const [isOpen, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const add = useCallback((input: AddToCartInput) => {
    const result = addItem(input);

    if (result.ok && result.key) {
      setLastAdded(result.key);
      window.setTimeout(() => setLastAdded(null), 1600);
    }

    return { ok: result.ok, message: result.message };
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const shipping =
      subtotal === 0 || subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flatRate;

    return {
      items,
      hydrated,
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
      missingForFreeShipping: Math.max(0, SHIPPING.freeFrom - subtotal),
      isOpen,
      setOpen,
      lastAdded,
      add,
      remove: removeItem,
      setQuantity: setItemQuantity,
      clear: clearCart,
    };
  }, [items, hydrated, isOpen, lastAdded, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return context;
}

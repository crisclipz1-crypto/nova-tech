import {
  MAX_ITEMS_PER_ORDER,
  MAX_QUANTITY_PER_ITEM,
} from "@/lib/config";

/**
 * Almacén del carrito respaldado por `localStorage`.
 *
 * Vive fuera de React y se consume con `useSyncExternalStore`, que es la API
 * pensada para estado que no controla React. La alternativa —leer
 * `localStorage` en un `useEffect` y volcarlo a `useState`— provoca un render
 * extra en cada carga y deja una ventana en la que el carrito se ve vacío.
 *
 * `getSnapshot` tiene que devolver SIEMPRE la misma referencia mientras nada
 * cambie, o React entra en un bucle de renders; por eso se cachea el texto
 * crudo junto con el array ya parseado.
 */

const STORAGE_KEY = "novatech.cart.v1";

export type CartVariant = { id: string; label: string; value: string };

export type CartItem = {
  /** productId + variantes elegidas: distingue "X5 negro" de "X5 azul". */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  /** Precio unitario ya con el delta de variantes aplicado. */
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  variants: CartVariant[];
  /** Stock conocido al añadir; el servidor lo revalida en el checkout. */
  stock: number;
};

export type AddToCartInput = Omit<CartItem, "key" | "quantity"> & {
  quantity?: number;
};

/** Referencia estable para el render del servidor y el primer render cliente. */
const EMPTY: CartItem[] = [];

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY;

/** Descarta cualquier cosa guardada que no tenga la forma esperada. */
function parse(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    const items = parsed.filter(
      (item): item is CartItem =>
        typeof item?.key === "string" &&
        typeof item?.productId === "string" &&
        typeof item?.name === "string" &&
        Number.isFinite(item?.unitPrice) &&
        Number.isInteger(item?.quantity) &&
        item.quantity > 0 &&
        Array.isArray(item?.variants)
    );

    return items.length > 0 ? items : EMPTY;
  } catch {
    return EMPTY;
  }
}

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Modo privado o almacenamiento bloqueado: el carrito vive en memoria.
    return cachedRaw;
  }
}

export function getSnapshot(): CartItem[] {
  const raw = readStorage();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

export function subscribe(onChange: () => void) {
  listeners.add(onChange);

  // El evento `storage` solo lo disparan las OTRAS pestañas: es lo que
  // mantiene el carrito sincronizado si hay varias abiertas.
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(items: CartItem[]) {
  const raw = JSON.stringify(items);
  cachedRaw = raw;
  cachedItems = items;

  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Cuota llena: se pierde la persistencia, no el carrito de esta sesión.
  }

  for (const listener of listeners) listener();
}

function buildKey(productId: string, variants: CartVariant[]) {
  const ids = variants
    .map((variant) => variant.id)
    .sort()
    .join("|");
  return ids ? `${productId}::${ids}` : productId;
}

export type AddResult = { ok: boolean; message?: string; key?: string };

export function addItem(input: AddToCartInput): AddResult {
  const items = getSnapshot();
  const key = buildKey(input.productId, input.variants);
  const existing = items.find((item) => item.key === key);

  if (!existing && items.length >= MAX_ITEMS_PER_ORDER) {
    return {
      ok: false,
      message: `Máximo ${MAX_ITEMS_PER_ORDER} productos distintos por pedido.`,
    };
  }

  const already = existing?.quantity ?? 0;
  const ceiling = Math.min(
    MAX_QUANTITY_PER_ITEM,
    input.stock > 0 ? input.stock : MAX_QUANTITY_PER_ITEM
  );
  const next = Math.min(already + (input.quantity ?? 1), ceiling);

  if (next === already) {
    return {
      ok: false,
      message:
        input.stock <= already
          ? "No queda más stock de este producto."
          : `Máximo ${MAX_QUANTITY_PER_ITEM} unidades por producto.`,
    };
  }

  commit(
    existing
      ? items.map((item) =>
          item.key === key ? { ...item, quantity: next } : item
        )
      : [...items, { ...input, key, quantity: next }]
  );

  return { ok: true, key };
}

export function removeItem(key: string) {
  commit(getSnapshot().filter((item) => item.key !== key));
}

export function setItemQuantity(key: string, quantity: number) {
  const items = getSnapshot();

  if (quantity <= 0) {
    commit(items.filter((item) => item.key !== key));
    return;
  }

  commit(
    items.map((item) =>
      item.key === key
        ? {
            ...item,
            quantity: Math.min(
              quantity,
              MAX_QUANTITY_PER_ITEM,
              item.stock > 0 ? item.stock : MAX_QUANTITY_PER_ITEM
            ),
          }
        : item
    )
  );
}

export function clearCart() {
  commit(EMPTY);
}

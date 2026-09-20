import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Product, CartItem } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";

const GUEST_CART_KEY = "nm_mart_cart_guest";

function readCart(key: string): CartItem[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sameProduct(first: CartItem, second: CartItem): boolean {
  if (first.id && second.id) return first.id === second.id;
  if (first.barcode && second.barcode) return first.barcode === second.barcode;
  return first.name === second.name;
}

function mergeCarts(savedCart: CartItem[], guestCart: CartItem[]): CartItem[] {
  return guestCart.reduce<CartItem[]>((merged, guestItem) => {
    const existing = merged.find((item) => sameProduct(item, guestItem));
    if (!existing) return [...merged, guestItem];

    const stockLimit = Number(existing.stock);
    const quantity = existing.qty + guestItem.qty;
    const nextQty = Number.isFinite(stockLimit) && stockLimit > 0
      ? Math.min(quantity, stockLimit)
      : quantity;
    return merged.map((item) => sameProduct(item, guestItem) ? { ...item, qty: nextQty } : item);
  }, [...savedCart]);
}

type CartContextValue = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQty: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readCart(GUEST_CART_KEY));
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const loadUserCart = async (authSession?: { user?: { id?: string } } | null) => {
      const session = authSession === undefined
        ? (await supabase.auth.getSession()).data.session
        : authSession;
      if (!mounted) return;
      const nextUserId = session?.user?.id ?? null;
      if (!nextUserId) {
        setUserId(null);
        setCart(readCart(GUEST_CART_KEY));
        return;
      }

      const savedCart = readCart(`nm_mart_cart_${nextUserId}`);
      const guestCart = readCart(GUEST_CART_KEY);
      const mergedCart = mergeCarts(savedCart, guestCart);
      setUserId(nextUserId);
      setCart(mergedCart);
      if (guestCart.length > 0) window.localStorage.removeItem(GUEST_CART_KEY);
    };

    void loadUserCart();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadUserCart(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const key = userId ? `nm_mart_cart_${userId}` : GUEST_CART_KEY;
    if (userId !== undefined) window.localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, userId]);

  const isSameProduct = (cartItem: CartItem, product: Product) => {
    return sameProduct(cartItem, product);
  };

  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => isSameProduct(c, p));
      if (ex) {
        const stockLimit = Number(ex.stock);
        const nextQty = Number.isFinite(stockLimit) && stockLimit > 0
          ? Math.min(ex.qty + 1, stockLimit)
          : ex.qty + 1;
        return prev.map(c => isSameProduct(c, p) ? { ...c, qty: nextQty } : c);
      }
      return [...prev, { ...p, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((idx: number, delta: number) => {
    setCart(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      const stockLimit = Number(c.stock);
      const nextQty = Math.max(0, c.qty + delta);
      return {
        ...c,
        qty: Number.isFinite(stockLimit) && stockLimit > 0 ? Math.min(nextQty, stockLimit) : nextQty,
      };
    }).filter(c => c.qty > 0));
  }, []);

  const removeItem = useCallback((idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((s, c) => s + c.saleRate * c.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    cartTotal,
    cartCount,
    setCart,
  }), [cart, addToCart, updateQty, removeItem, clearCart, cartTotal, cartCount]);

  return createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

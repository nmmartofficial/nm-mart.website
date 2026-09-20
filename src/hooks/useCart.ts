import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Product, CartItem } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";
import { fetchCatalogProductsByIds } from "@/hooks/useProductCatalog";
import { TABLES } from "@/lib/supabase/schema";

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
  const [cartHydrated, setCartHydrated] = useState(false);

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
        setCartHydrated(true);
        return;
      }

      const guestCart = readCart(GUEST_CART_KEY);
      try {
        const { data, error } = await supabase
          .from(TABLES.cartItems)
          .select("product_id, quantity")
          .eq("user_id", nextUserId);
        if (error) throw error;

        const productIds = (data || []).map((item) => Number(item.product_id)).filter((id) => Number.isInteger(id) && id > 0);
        const products = await fetchCatalogProductsByIds(productIds);
        if (!mounted) return;
        const remoteCart = products.map((product) => {
          const row = (data || []).find((item) => Number(item.product_id) === product.product_id);
          return { ...product, qty: Math.max(1, Number(row?.quantity || 1)) };
        });
        setCart(mergeCarts(remoteCart, guestCart));
        if (guestCart.length > 0) window.localStorage.removeItem(GUEST_CART_KEY);
      } catch (error) {
        console.error("Unable to load Supabase cart; using local account cart.", error);
        setCart(mergeCarts(readCart(`nm_mart_cart_${nextUserId}`), guestCart));
      } finally {
        if (mounted) {
          setUserId(nextUserId);
          setCartHydrated(true);
        }
      }
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
    if (userId === undefined || !cartHydrated) return;
    if (!userId) {
      window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      return;
    }

    window.localStorage.setItem(`nm_mart_cart_${userId}`, JSON.stringify(cart));
    const timer = window.setTimeout(async () => {
      try {
        const { error: deleteError } = await supabase.from(TABLES.cartItems).delete().eq("user_id", userId);
        if (deleteError) throw deleteError;
        const rows = cart
          .filter((item) => Number.isInteger(Number(item.product_id)) && Number(item.product_id) > 0 && item.qty > 0)
          .map((item) => ({ user_id: userId, product_id: Number(item.product_id), quantity: item.qty }));
        if (rows.length === 0) return;
        const { error: insertError } = await supabase.from(TABLES.cartItems).insert(rows);
        if (insertError) throw insertError;
      } catch (error) {
        console.error("Unable to sync cart with Supabase.", error);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [cart, cartHydrated, userId]);

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

import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Product, CartItem } from "@/lib/store-utils";

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
  const [cart, setCart] = useState<CartItem[]>([]);

  const isSameProduct = (cartItem: CartItem, product: Product) => {
    if (cartItem.id && product.id) return cartItem.id === product.id;
    if (cartItem.barcode && product.barcode) return cartItem.barcode === product.barcode;
    return cartItem.name === product.name;
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

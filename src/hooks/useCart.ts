import { useState, useCallback, useMemo } from "react";
import { Product, CartItem } from "@/lib/store-utils";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => c.name === p.name && c.barcode === p.barcode);
      if (ex) return prev.map(c => c.name === p.name && c.barcode === p.barcode ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...p, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((idx: number, delta: number) => {
    setCart(prev => prev.map((c, i) => i === idx ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  }, []);

  const removeItem = useCallback((idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((s, c) => s + c.saleRate * c.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);

  return { cart, addToCart, updateQty, removeItem, clearCart, cartTotal, cartCount, setCart };
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/store-utils";

interface WishlistContextValue {
  wishlist: Product[];
  isWishlisted: (product: Product) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "nm_mart_wishlist";

function sameProduct(first: Product, second: Product): boolean {
  if (first.id && second.id) return first.id === second.id;
  return first.barcode === second.barcode;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Product[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const value = useMemo<WishlistContextValue>(() => ({
    wishlist,
    isWishlisted: (product) => wishlist.some((item) => sameProduct(item, product)),
    toggleWishlist: (product) => {
      setWishlist((current) => current.some((item) => sameProduct(item, product))
        ? current.filter((item) => !sameProduct(item, product))
        : [...current, product]);
    },
    removeFromWishlist: (product) => {
      setWishlist((current) => current.filter((item) => !sameProduct(item, product)));
    },
  }), [wishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}

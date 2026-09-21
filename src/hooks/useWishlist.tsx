import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "@/lib/supabase/schema";

interface WishlistContextValue {
  wishlistBarcodes: string[];
  isWishlisted: (product: Product) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistBarcodes, setWishlistBarcodes] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) setWishlistBarcodes([]);
        return;
      }

      const { data } = await supabase
        .from(TABLES.wishlistItems)
        .select("barcode")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (mounted) setWishlistBarcodes((data || []).map((item) => String(item.barcode)));
    };

    loadWishlist();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadWishlist());
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleWishlist = useCallback(async (product: Product) => {
    const barcode = String(product.barcode || "").trim();
    if (!barcode) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (wishlistBarcodes.includes(barcode)) {
      await supabase
        .from(TABLES.wishlistItems)
        .delete()
        .eq("user_id", user.id)
        .eq("barcode", barcode);
      setWishlistBarcodes((current) => current.filter((item) => item !== barcode));
      return;
    }

    const { error } = await supabase.from(TABLES.wishlistItems).insert({
      user_id: user.id,
      barcode,
    });
    if (!error) setWishlistBarcodes((current) => [barcode, ...current]);
  }, [wishlistBarcodes]);

  const value = useMemo<WishlistContextValue>(() => ({
    wishlistBarcodes,
    isWishlisted: (product) => wishlistBarcodes.includes(String(product.barcode || "").trim()),
    toggleWishlist,
  }), [wishlistBarcodes, toggleWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}

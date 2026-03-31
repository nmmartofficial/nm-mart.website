import { useState, useEffect, useMemo } from "react";
import { Product } from "@/lib/store-utils";

export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch directly from our Sync API
    fetch("/api/sync")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => 
    [...new Set(allProducts.map(p => p.category).filter(Boolean))],
    [allProducts]
  );

  const flat33 = useMemo(() => 
    allProducts.filter(p => p.discount >= 30 && p.discount <= 35),
    [allProducts]
  );

  const flat50 = useMemo(() => 
    allProducts.filter(p => p.discount >= 45 && p.discount <= 55),
    [allProducts]
  );

  return { allProducts, loading, categories, flat33, flat50 };
}

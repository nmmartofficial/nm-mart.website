import { useState, useEffect, useMemo } from "react";
import { Product, parseCSV, CSV_URL } from "@/lib/store-utils";

export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(CSV_URL)
      .then(r => r.text())
      .then(t => { setAllProducts(parseCSV(t)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => 
    [...new Set(allProducts.map(p => p.category).filter(Boolean))],
    [allProducts]
  );

  const flat33 = useMemo(() => 
    allProducts.filter(p => p.discount >= 30 && p.discount < 50),
    [allProducts]
  );

  const flat50 = useMemo(() => 
    allProducts.filter(p => p.discount >= 50),
    [allProducts]
  );

  return { allProducts, loading, categories, flat33, flat50 };
}

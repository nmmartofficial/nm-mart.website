import { useState, useEffect, useMemo } from "react";
import { Product } from "@/lib/store-utils";
import { supabase } from "@/integrations/supabase/client";

export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*');

        if (error) throw error;

        if (data) {
          const mappedProducts: Product[] = data.map((item: any) => ({
            name: item.name,
            barcode: item.barcode,
            category: item.category || "General",
            subCategory: item.subCategory || "",
            mrp: Number(item.mrp || 0),
            saleRate: Number(item.saleRate || 0),
            imageUrl: item.imageUrl || "",
            discount: Number(item.discount || 0),
            save: Math.round(Number(item.mrp || 0) - Number(item.saleRate || 0))
          }));
          setAllProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Error fetching products from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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

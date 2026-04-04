import { useState, useEffect, useMemo } from "react";
import { Product, normalizeCategory } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";

export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Strictly fetch all columns from the 'products' table
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        if (data) {
          const mappedProducts: Product[] = data.map((item: any) => {
            const normalizedCat = normalizeCategory(item.category);
            return {
              name: String(item.name || "Unknown Product").trim(),
              barcode: String(item.barcode || "").trim(),
              category: normalizedCat,
              brand: String(item.brand || "Local").trim(),
              subCategory: String(item.sub_category || "").trim(),
              mrp: Number(item.mrp || 0),
              saleRate: Number(item.salerate || item.saleRate || 0),
              imageUrl: item.image_url || item.image || "",
              discount: Number(item.discount || 0),
              stock: Number(item.stock_quantity || item.stock || 0),
              save: Math.max(0, Math.round(Number(item.mrp || 0) - Number(item.salerate || item.saleRate || 0)))
            };
          });
          setAllProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Supabase Fetch Error:", err);
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

  const brands = useMemo(() => 
    [...new Set(allProducts.map(p => (p as any).brand).filter(Boolean))],
    [allProducts]
  );

  const flat33 = useMemo(() => 
    allProducts.filter(p => {
      if (!p.mrp || !p.saleRate) return false;
      const discountPercent = ((p.mrp - p.saleRate) / p.mrp) * 100;
      return Math.round(discountPercent) === 33;
    }),
    [allProducts]
  );

  const flat50 = useMemo(() => 
    allProducts.filter(p => {
      if (!p.mrp || !p.saleRate) return false;
      const discountPercent = ((p.mrp - p.saleRate) / p.mrp) * 100;
      return Math.round(discountPercent) === 50;
    }),
    [allProducts]
  );

  return { allProducts, loading, categories, brands, flat33, flat50 };
}

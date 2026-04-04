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
          .order('RawName', { ascending: true })
          .limit(10000); // Increased limit to fetch all 7,358+ products if available

        if (error) throw error;

        if (data) {
          const mappedProducts: Product[] = data.map((item: any) => {
            // Strictly fetch and map from the updated Supabase columns
            const normalizedCat = normalizeCategory(item.ItemGroupName || "General");
            const rate = Number(item.Rate || 0);
            const mrp = Number(item.MRP || 0);
            const barcode = String(item.RawCodeNew || "").trim();
            const discount = Number(item.discountPerc || 0);
            const stock = Number(item.OpStock || 0);
            
            return {
              id: barcode,
              name: String(item.RawName || "Unknown Product").trim(),
              price: rate,
              saleRate: rate, // Alias
              category: normalizedCat,
              mrp: mrp,
              barcode: barcode,
              brand: String(item.brand || "Local").trim(),
              subCategory: String(item.sub_category || "").trim(),
              imageUrl: item.image_url || item.image || "",
              discount: discount,
              stock: stock,
              save: Math.max(0, Math.round(mrp - rate))
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
      if (!p.mrp || !p.price) return false;
      const discountPercent = ((p.mrp - p.price) / p.mrp) * 100;
      return Math.round(discountPercent) === 33;
    }),
    [allProducts]
  );

  const flat50 = useMemo(() => 
    allProducts.filter(p => {
      if (!p.mrp || !p.price) return false;
      const discountPercent = ((p.mrp - p.price) / p.mrp) * 100;
      return Math.round(discountPercent) === 50;
    }),
    [allProducts]
  );

  return { allProducts, loading, categories, brands, flat33, flat50 };
}

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
        // Extremely flexible fetch: Try 'products' first, then 'Products'
        let { data, error } = await supabase
          .from('products')
          .select('*')
          .order('RawName', { ascending: true })
          .limit(10000); 

        // If 'products' fails or is empty, try 'Products' (Case sensitivity check)
        if (error || !data || data.length === 0) {
          const secondTry = await supabase
            .from('Products')
            .select('*')
            .order('RawName', { ascending: true })
            .limit(10000);
          
          if (!secondTry.error && secondTry.data && secondTry.data.length > 0) {
            data = secondTry.data;
            error = null;
          }
        }

        if (error) {
          console.error("Supabase Database Error:", error);
          throw error;
        }

        if (data) {
          console.log(`Fetched ${data.length} products from Supabase.`);
          const mappedProducts: Product[] = data.map((item: any) => {
            // Flexible mapping to handle different column name conventions
            const normalizedCat = normalizeCategory(item.ItemGroupName || item.category || "GENERAL");
            const rate = Number(item.Rate || item.salerate || item.saleRate || 0);
            const mrp = Number(item.MRP || item.mrp || 0);
            const barcode = String(item.RawCodeNew || item.barcode || "").trim();
            const discount = Number(item.discountPerc || item.discount || 0);
            const stock = Number(item.OpStock || item.stock_quantity || item.stock || 0);
            const name = String(item.RawName || item.name || "Unknown Product").trim();
            
            return {
              id: barcode,
              name: name,
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
        } else {
          console.warn("No data returned from Supabase products table.");
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

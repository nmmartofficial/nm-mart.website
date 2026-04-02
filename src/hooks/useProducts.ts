import { useState, useEffect, useMemo } from "react";
import { Product } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";

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
            name: item.product_name || item.name,
            barcode: item.barcode,
            category: item.category || "General",
            brand: item.brand || "Local",
            subCategory: item.sub_category || item.subCategory || "",
            mrp: Number(item.mrp || 0),
            saleRate: Number(item.sale_price || item.saleRate || 0),
            imageUrl: item.image_url || item.imageUrl || "",
            discount: Number(item.discount || 0),
            save: Math.round(Number(item.mrp || 0) - Number(item.sale_price || item.saleRate || 0))
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

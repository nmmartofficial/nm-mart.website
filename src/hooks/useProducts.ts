import { useState, useEffect, useMemo } from "react";
import { Product, normalizeCategory } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";

export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [flat50, setFlat50] = useState<Product[]>([]);
  const [flat33, setFlat33] = useState<Product[]>([]);

  const mapProduct = (item: any): Product => {
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
      saleRate: rate,
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
  };

  const fetchDiscountedProducts = async () => {
    try {
      // Fetch 50% discount items specifically
      const { data: data50 } = await supabase
        .from('products')
        .select('*')
        .eq('discountPerc', 50)
        .limit(12);
      
      if (data50) setFlat50(data50.map(mapProduct));

      // Fetch 33% discount items specifically
      const { data: data33 } = await supabase
        .from('products')
        .select('*')
        .eq('discountPerc', 33)
        .limit(12);
      
      if (data33) setFlat33(data33.map(mapProduct));
    } catch (err) {
      console.error("Discount Fetch Error:", err);
    }
  };

  const fetchProducts = async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
        fetchDiscountedProducts();
      }
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('RawName', { ascending: true })
        .range(offset, offset + 49);

      if (error) {
        console.error("Supabase Database Error:", error);
        throw error;
      }

      if (count !== null) setTotalCount(count);

      if (data) {
        console.log(`Fetched ${data.length} products from Supabase (Offset: ${offset}).`);
        const mappedProducts: Product[] = data.map(mapProduct);

        if (offset === 0) {
          setAllProducts(mappedProducts);
        } else {
          setAllProducts(prev => [...prev, ...mappedProducts]);
        }
        
        setHasMore(data.length === 50);
      }
    } catch (err) {
      console.error("Supabase Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(allProducts.length);
    }
  };

  const categories = useMemo(() => 
    [...new Set(allProducts.map(p => p.category).filter(Boolean))],
    [allProducts]
  );

  const brands = useMemo(() => 
    [...new Set(allProducts.map(p => (p as any).brand).filter(Boolean))],
    [allProducts]
  );

  return { allProducts, loading, categories, brands, flat33, flat50, hasMore, loadMore, totalCount };
}

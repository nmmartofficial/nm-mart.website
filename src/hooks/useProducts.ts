import { useState, useEffect, useMemo } from "react";
import { Product, normalizeCategory } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";
import { logSupabaseDebug } from "@/lib/supabase";

export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [flat50, setFlat50] = useState<Product[]>([]);
  const [flat33, setFlat33] = useState<Product[]>([]);
  const [total50, setTotal50] = useState(0);
  const [total33, setTotal33] = useState(0);
  const [hasMore50, setHasMore50] = useState(false);
  const [hasMore33, setHasMore33] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const mapProduct = (item: any): Product => {
    // Single source from sync script columns.
    const barcode = String(item.RawCodeNew || "").trim();
    const name = String(item.RawName || "Unknown Product").trim();
    const mrp = Number(item.MRP || 0);
    const rate = Number(item.Rate || 0);
    const imageUrl = item.image_url || "";
    const category = normalizeCategory(item.ItemGroupName || "GENERAL");
    const discount = Number(item.discountPerc || 0);
    const stock = Number(item.OpStock || 0);

    return {
      id: barcode,
      name: name,
      price: rate,
      saleRate: rate,
      category: category,
      mrp: mrp,
      barcode: barcode,
      brand: String(item.brand || "Local").trim(),
      subCategory: String(item.sub_category || "").trim(),
      imageUrl: imageUrl,
      discount: discount,
      stock: stock,
      save: Math.max(0, Math.round(mrp - rate)),
      badge: item.badge || ""
    };
  };

  const fetchAllCategories = async () => {
    try {
      // ─── SOURCE: ItemGroupName from products table ───
      const { data, error } = await supabase
        .from('products')
        .select('ItemGroupName')
        .not('RawCodeNew', 'is', null)
        .gt('OpStock', 0)
        .not('ItemGroupName', 'is', null);
      
      if (error) throw error;

      if (data) {
        const uniqueCats = [...new Set(data.map((item: any) => 
          normalizeCategory(item.ItemGroupName)
        ))].filter(c => c && c.length > 1);
        
        logSupabaseDebug("products:derivedCategories", uniqueCats);
        setAllCategories(uniqueCats);
      }
    } catch (err) {
      console.error("Error deriving categories:", err);
    }
  };

  const fetchDiscountedProducts = async (type: 50 | 33, offset = 0) => {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .gt('OpStock', 0)
        .neq('is_visible', false);
      
      if (type === 50) {
        query = query.gte('discountPerc', 50);
      } else {
        query = query.gte('discountPerc', 33).lt('discountPerc', 50);
      }

      const { data, error, count } = await query
        .order('image_url', { ascending: false, nullsFirst: false })
        .order('RawName', { ascending: true })
        .range(offset, offset + 11);
      
      if (error) throw error;

      if (data) {
        const mapped = data.map(mapProduct);
        if (type === 50) {
          if (offset === 0) {
            setFlat50(mapped);
            setTotal50(count || 0);
          } else {
            setFlat50(prev => [...prev, ...mapped]);
          }
          setHasMore50(data.length === 12);
        } else {
          if (offset === 0) {
            setFlat33(mapped);
            setTotal33(count || 0);
          } else {
            setFlat33(prev => [...prev, ...mapped]);
          }
          setHasMore33(data.length === 12);
        }
      }
    } catch (err) {
      console.error(`Discount Fetch Error (${type}%):`, err);
    }
  };

  const fetchProducts = async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
        fetchDiscountedProducts(50, 0);
        fetchDiscountedProducts(33, 0);
        fetchAllCategories();
      }
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .gt('OpStock', 0)
        .neq('is_visible', false)
        .order('image_url', { ascending: false, nullsFirst: false })
        .order('RawName', { ascending: true })
        .range(offset, offset + 49);

      if (error) {
        console.error("Supabase Database Error:", error);
        throw error;
      }

      if (count !== null) setTotalCount(count);

      if (data) {
        logSupabaseDebug("products:fetched", { count: data.length, offset });
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

  const loadMore50 = () => {
    if (hasMore50) {
      fetchDiscountedProducts(50, flat50.length);
    }
  };

  const loadMore33 = () => {
    if (hasMore33) {
      fetchDiscountedProducts(33, flat33.length);
    }
  };

  const categories = useMemo(() => 
    allCategories.length > 0 ? allCategories : [...new Set(allProducts.map(p => p.category).filter(Boolean))],
    [allProducts, allCategories]
  );

  const brands = useMemo(() => 
    [...new Set(allProducts.map(p => (p as any).brand).filter(Boolean))],
    [allProducts]
  );

  const refetchProducts = () => fetchProducts(0);

  return { 
    allProducts, loading, categories, brands, 
    flat33, flat50, hasMore, loadMore, totalCount,
    total50, total33, hasMore50, hasMore33, loadMore50, loadMore33,
    refetchProducts,
  };
}

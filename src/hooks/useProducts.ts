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
  const [total50, setTotal50] = useState(0);
  const [total33, setTotal33] = useState(0);
  const [hasMore50, setHasMore50] = useState(false);
  const [hasMore33, setHasMore33] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const mapProduct = (item: any): Product => {
    const normalizedCat = normalizeCategory(item.ItemGroupName || item.category || "GENERAL");
    const mrp = Number(item.MRP || item.mrp || 0);
    const discount = Number(item.discountPerc || item.discount || 0);
    
    // Auto-calculate rate based on discount if present
    let rate = Number(item.Rate || item.salerate || item.saleRate || 0);
    if (discount > 0 && mrp > 0) {
      rate = Math.round(mrp - (mrp * (discount / 100)));
    }

    const barcode = String(item.RawCodeNew || item.barcode || "").trim();
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
      save: Math.max(0, Math.round(mrp - rate)),
      badge: item.badge || ""
    };
  };

  const fetchAllCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('ItemGroupName, category')
        .gt('OpStock', 0);
      
      if (data) {
        const uniqueCats = [...new Set(data.map((item: any) => 
          normalizeCategory(item.ItemGroupName || item.category)
        ))].filter(c => c && c.length > 1);
        setAllCategories(uniqueCats);
      }
    } catch (err) {
      console.error("Error fetching all categories:", err);
    }
  };

  const fetchDiscountedProducts = async (type: 50 | 33, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('discountPerc', type)
        .gt('OpStock', 0)
        .neq('is_visible', false)
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

  return { 
    allProducts, loading, categories, brands, 
    flat33, flat50, hasMore, loadMore, totalCount,
    total50, total33, hasMore50, hasMore33, loadMore50, loadMore33
  };
}

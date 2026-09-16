import { useState, useEffect, useMemo } from "react";
import { Product, normalizeCategory } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";
import { logSupabaseDebug } from "@/lib/supabase";

/** Customer storefront catalog: all queries require OpStock > 0. Admin uses InventoryTab (no stock filter). */
export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [flat50, setFlat50] = useState<Product[]>([]);
  const [flat33, setFlat33] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [total50, setTotal50] = useState(0);
  const [total33, setTotal33] = useState(0);
  const [totalFeatured, setTotalFeatured] = useState(0);
  const [hasMore50, setHasMore50] = useState(false);
  const [hasMore33, setHasMore33] = useState(false);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const PRODUCT_TABLE_CANDIDATES = ["products", "product_master", "items", "catalog_products", "inventory"];

  const isExpectedTableMissingError = (error: any) => {
    const msg = String(error?.message || "").toLowerCase();
    return msg.includes("does not exist") || msg.includes("relation") || msg.includes("not found") || msg.includes("pgrst205") || msg.includes("pgrst301");
  };

  const getProductRows = async () => {
    let lastError: any = null;

    for (const table of PRODUCT_TABLE_CANDIDATES) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) return { data, error: null };
        lastError = error;
      } catch (err) {
        lastError = err;
      }
    }

    return { data: [], error: lastError };
  };

  const mapProduct = (item: any): Product => {
    const barcode = String(item?.barcode || item?.RawCodeNew || item?.id || "").trim();
    const name = String(item?.name || item?.RawName || item?.itname || "Unknown Product").trim();
    const mrp = Number(item?.mrp ?? item?.MRP ?? 0);
    const rate = Number(item?.sale_rate ?? item?.onlinerate ?? item?.retail_rate ?? item?.restrate ?? item?.Rate ?? 0);
    const imageUrl = String(item?.image_url || item?.picture || item?.imagename || "").trim();
    const category = normalizeCategory(String(item?.category_name || item?.ItemGroupName || item?.category || "GENERAL"));
    const discount = Number(item?.discount_percent ?? item?.discperc ?? item?.discountPerc ?? 0);
    const stock = Number(item?.stock ?? item?.opstock ?? item?.OpStock ?? 0);
    const unit = String(item?.unit_name || item?.unitcode || item?.unit || "pcs").trim();
    const description = String(item?.description || item?.details || item?.short_description || item?.product_description || "").trim();
    const isFeatured = Boolean(item?.is_favourite ?? item?.isfav ?? item?.is_featured ?? false);

    return {
      id: barcode,
      name,
      price: rate,
      saleRate: rate,
      category,
      mrp,
      barcode,
      brand: String(item?.brand_name || item?.brand || "Local").trim(),
      subCategory: String(item?.subcategory_name || item?.sub_category || "").trim(),
      imageUrl,
      discount,
      stock,
      unit,
      description: description || undefined,
      isFeatured,
      save: Math.max(0, Math.round(mrp - rate)),
      badge: String(item?.badge || "").trim()
    };
  };

  const fetchAllCategories = async () => {
    try {
      const { data, error } = await getProductRows();

      if (error) throw error;

      if (data) {
        const uniqueCats = [...new Set(data
          .map((item: any) => normalizeCategory(String(item?.category_name || item?.ItemGroupName || item?.category || "")))
          .filter((c: string) => c && c.length > 1))];

        logSupabaseDebug("products:derivedCategories", uniqueCats);
        setAllCategories(uniqueCats);
      }
    } catch (err) {
      if (!isExpectedTableMissingError(err)) {
        console.error("Error deriving categories:", err);
      }
    }
  };

  const fetchFeaturedProducts = async (offset = 0) => {
    try {
      const { data, error } = await getProductRows();

      if (error) throw error;

      if (data) {
        const filtered = data.filter((item: any) => {
          const stock = Number(item?.stock ?? item?.opstock ?? item?.OpStock ?? 0);
          return stock > 0 && (item?.is_favourite || item?.isfav || item?.is_featured === true) && item?.is_active !== false;
        });

        const mapped = filtered.slice(offset, offset + 12).map(mapProduct);
        if (offset === 0) {
          setFeaturedProducts(mapped);
          setTotalFeatured(filtered.length || 0);
        } else {
          setFeaturedProducts(prev => [...prev, ...mapped]);
        }
        setHasMoreFeatured(filtered.length > offset + 12);
      }
    } catch (err) {
      if (!isExpectedTableMissingError(err)) {
        console.error("Featured Fetch Error:", err);
      }
    }
  };

  const fetchDiscountedProducts = async (type: 50 | 33, offset = 0) => {
    try {
      const { data, error } = await getProductRows();

      if (error) throw error;

      if (data) {
        const filtered = data.filter((item: any) => {
          const stock = Number(item?.stock ?? item?.opstock ?? item?.OpStock ?? 0);
          const discount = Number(item?.discount_percent ?? item?.discperc ?? item?.discountPerc ?? 0);
          return stock > 0 && item?.is_active !== false && (
            type === 50 ? discount >= 50 : discount >= 33 && discount < 50
          );
        });

        const mapped = filtered.slice(offset, offset + 12).map(mapProduct);
        if (type === 50) {
          if (offset === 0) {
            setFlat50(mapped);
            setTotal50(filtered.length || 0);
          } else {
            setFlat50(prev => [...prev, ...mapped]);
          }
          setHasMore50(filtered.length > offset + 12);
        } else {
          if (offset === 0) {
            setFlat33(mapped);
            setTotal33(filtered.length || 0);
          } else {
            setFlat33(prev => [...prev, ...mapped]);
          }
          setHasMore33(filtered.length > offset + 12);
        }
      }
    } catch (err) {
      if (!isExpectedTableMissingError(err)) {
        console.error(`Discount Fetch Error (${type}%):`, err);
      }
    }
  };

  const fetchProducts = async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
        setError(null);
        fetchFeaturedProducts(0);
        fetchDiscountedProducts(50, 0);
        fetchDiscountedProducts(33, 0);
        fetchAllCategories();
      }

      const { data, error } = await getProductRows();

      if (error) {
        console.error("Supabase Database Error:", error);
        throw error;
      }

      const filtered = (data || []).filter((item: any) => {
        const stock = Number(item?.stock ?? item?.opstock ?? item?.OpStock ?? 0);
        return stock > 0 && item?.is_active !== false;
      });

      if (filtered.length) setTotalCount(filtered.length);

      const mappedProducts: Product[] = filtered.slice(offset, offset + 50).map(mapProduct);
      logSupabaseDebug("products:fetched", { count: mappedProducts.length, offset });

      if (offset === 0) {
        setAllProducts(mappedProducts);
      } else {
        setAllProducts(prev => [...prev, ...mappedProducts]);
      }

      setHasMore(filtered.length > offset + 50);
    } catch (err) {
      setError("Unable to load products right now.");
      if (!isExpectedTableMissingError(err)) {
        console.error("Supabase Fetch Error:", err);
      }
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

  const loadMoreFeatured = () => {
    if (hasMoreFeatured) {
      fetchFeaturedProducts(featuredProducts?.length || 0);
    }
  };

  const categories = useMemo(() => 
    (allCategories || []).length > 0 ? allCategories : [...new Set((allProducts || []).map(p => p?.category).filter(Boolean))],
    [allProducts, allCategories]
  );

  const brands = useMemo(() => 
    [...new Set((allProducts || []).map(p => (p as any)?.brand).filter(Boolean))],
    [allProducts]
  );

  const refetchProducts = () => fetchProducts(0);

  return { 
    allProducts, loading, error, categories, brands, 
    flat33, flat50, featuredProducts, hasMore, loadMore, totalCount,
    total50, total33, totalFeatured, hasMore50, hasMore33, hasMoreFeatured,
    loadMore50, loadMore33, loadMoreFeatured,
    refetchProducts,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateSalePrice, isDisplayLabel, normalizeCategory, type Product } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";
import {
  TABLES,
  getProductBarcode,
  getProductBrand,
  getProductCategory,
  getProductDescription,
  getProductDiscount,
  getProductImageUrl,
  getProductMrp,
  getProductName,
  getProductSaleRate,
  getProductStock,
  getProductSubcategory,
  getProductUnit,
  isProductActive,
  isProductFeatured,
  type DbProductRow,
} from "@/lib/supabase/schema";

const PRODUCT_COLUMNS = "barcode,name,mrp,sale_rate,retail_rate,restrate,onlinerate,online_rate,selling_price,stock,opstock,opening_stock,category_name,item_group_name,item_group,brand_name,subcategory_name,sub_category_name,discount_percent,discount_pct,discperc,discount,image_url,picture,is_active,is_deleted,is_favourite,isfav,unit_name,unitcode,description,item_description,itemdescription,id,created_at,updated_at";
let categoriesRequest: Promise<string[]> | null = null;

function loadActiveCategories(): Promise<string[]> {
  if (!categoriesRequest) {
    categoriesRequest = supabase
      .from(TABLES.categories)
      .select("name, is_active")
      .eq("is_active", true)
      .order("name")
      .then(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((item) => String(item.name || "").trim()).filter(isDisplayLabel);
      })
      .catch((error) => {
        categoriesRequest = null;
        throw error;
      });
  }
  return categoriesRequest;
}

export type ProductCatalogOptions = {
  pageSize?: number;
  category?: string;
  brand?: string;
  search?: string;
  offersOnly?: boolean;
  featuredOnly?: boolean;
  minDiscount?: number;
  maxDiscount?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "discount-desc" | "newest";
};

function mapProduct(item: DbProductRow): Product {
  const mrp = getProductMrp(item);
  const storedRate = getProductSaleRate(item);
  const discount = getProductDiscount(item);
  const rate = calculateSalePrice(mrp, storedRate, discount);
  return {
    id: Number(item.id),
    product_id: Number(item.id),
    name: getProductName(item),
    price: rate,
    saleRate: rate,
    mrp,
    barcode: getProductBarcode(item),
    category: isDisplayLabel(getProductCategory(item)) ? normalizeCategory(getProductCategory(item)) : "GENERAL",
    brand: isDisplayLabel(getProductBrand(item)) ? getProductBrand(item) : "Local",
    subCategory: getProductSubcategory(item),
    imageUrl: getProductImageUrl(item),
    discount,
    stock: getProductStock(item),
    unit: getProductUnit(item),
    description: getProductDescription(item) || undefined,
    isFeatured: isProductFeatured(item),
    save: Math.max(0, Math.round(mrp - rate)),
    badge: "",
  };
}

export async function fetchCatalogProductsByIds(ids: number[]): Promise<Product[]> {
  const productIds = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
  if (productIds.length === 0) return [];

  const { data, error } = await supabase
    .from(TABLES.products)
    .select(PRODUCT_COLUMNS)
    .in("id", productIds);
  if (error) throw error;

  return ((data || []) as DbProductRow[])
    .filter((item) => isProductActive(item) && getProductStock(item) > 0)
    .map(mapProduct);
}

export function useProductCatalog(options: ProductCatalogOptions = {}) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 50);
  const queryKey = JSON.stringify({ ...options, pageSize });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const nextOffset = useRef(0);
  const requestKey = useRef(queryKey);
  const activeRequest = useRef(false);

  const fetchPage = useCallback(async (offset: number, replace: boolean) => {
    if (activeRequest.current) return;
    activeRequest.current = true;
    if (replace) setLoading(true); else { setLoadingMore(true); setLoadMoreError(null); }
    if (replace) setError(null);
    try {
      let query = supabase.from(TABLES.products).select(PRODUCT_COLUMNS);
      query = query.eq("is_active", true).neq("is_deleted", true).gt("stock", 0);
      if (options.category) query = query.eq("category_name", options.category);
      if (options.brand) query = query.eq("brand_name", options.brand);
      if (options.search?.trim()) {
        const search = options.search.trim().replace(/[,()]/g, " ");
        query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,category_name.ilike.%${search}%,barcode.ilike.%${search}%`);
      }
      if (options.featuredOnly) query = query.or("is_favourite.eq.true,isfav.eq.true");
      if (options.offersOnly) query = query.gt("discount_percent", 25);
      if (options.minDiscount !== undefined) query = query.gte("discount_percent", options.minDiscount);
      if (options.maxDiscount !== undefined) query = query.lt("discount_percent", options.maxDiscount);
      if (options.minPrice !== undefined && Number.isFinite(options.minPrice)) query = query.gte("sale_rate", options.minPrice);
      if (options.maxPrice !== undefined && Number.isFinite(options.maxPrice)) query = query.lte("sale_rate", options.maxPrice);

      if (options.sort === "price-asc") query = query.order("sale_rate", { ascending: true });
      else if (options.sort === "price-desc") query = query.order("sale_rate", { ascending: false });
      else if (options.sort === "name-asc") query = query.order("name", { ascending: true });
      else if (options.sort === "name-desc") query = query.order("name", { ascending: false });
      else if (options.sort === "newest") query = query.order("created_at", { ascending: false });
      else query = query.order("is_favourite", { ascending: false }).order("updated_at", { ascending: false });

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);
      let data;
      let queryError;
      try {
        ({ data, error: queryError } = await query
          .abortSignal(controller.signal)
          .range(offset, offset + pageSize - 1));
      } finally {
        window.clearTimeout(timeoutId);
      }
      if (queryError) throw queryError;
      if (requestKey.current !== queryKey) return;

      const mapped = ((data || []) as DbProductRow[]).filter((item) => isProductActive(item) && getProductStock(item) > 0).map(mapProduct);
      setProducts((current) => replace ? mapped : [...current, ...mapped.filter((item) => !current.some((existing) => existing.id === item.id))]);
      setTotalCount(offset + mapped.length);
      setHasMore(mapped.length === pageSize);
      nextOffset.current = offset + mapped.length;
      const pageBrands = mapped.map((item) => item.brand).filter(isDisplayLabel);
      setBrands((current) => [...new Set([...current, ...pageBrands])]);
    } catch (err) {
      if (requestKey.current === queryKey) {
        if (replace) setError("Unable to load products right now.");
        else setLoadMoreError("Couldn't load more products. Try again.");
      }
      console.error("Product catalog query failed:", err);
    } finally {
      activeRequest.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [options.brand, options.category, options.featuredOnly, options.maxDiscount, options.maxPrice, options.minDiscount, options.minPrice, options.offersOnly, options.search, options.sort, pageSize, queryKey]);

  useEffect(() => {
    requestKey.current = queryKey;
    nextOffset.current = 0;
    setProducts([]);
    setBrands([]);
    setHasMore(true);
    void fetchPage(0, true);
  }, [fetchPage, queryKey]);

  useEffect(() => {
    let mounted = true;
    void loadActiveCategories().then((names) => {
      if (mounted) setCategories(names);
    }).catch(() => {
      if (mounted) setCategories([]);
    });
    return () => { mounted = false; };
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) void fetchPage(nextOffset.current, false);
  }, [fetchPage, hasMore, loading, loadingMore]);

  const retry = useCallback(() => {
    nextOffset.current = 0;
    void fetchPage(0, true);
  }, [fetchPage]);

  const retryLoadMore = useCallback(() => {
    if (!loadingMore && loadMoreError) void fetchPage(nextOffset.current, false);
  }, [fetchPage, loadMoreError, loadingMore]);

  return {
    products,
    categories,
    brands: useMemo(() => brands, [brands]),
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    totalCount,
    loadMore,
    retry,
    retryLoadMore,
  };
}

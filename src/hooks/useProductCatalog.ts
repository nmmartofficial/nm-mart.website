import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateSalePrice, isDisplayLabel, normalizeCategory, type Product } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";
import { subscribeToCatalogChanges } from "@/lib/supabase/realtime";
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
  isProductEligible,
  isProductActive,
  isProductFeatured,
  type DbProductRow,
} from "@/lib/supabase/schema";

const PRODUCT_COLUMNS = "barcode,name,mrp,sale_rate,retail_rate,restrate,onlinerate,online_rate,selling_price,stock,opstock,opening_stock,category_name,item_group_name,item_group,item_category,category_id,brand_name,subcategory_name,sub_category_name,subcategory_id,hsn_code,hsncode,gst_percent,gst_pct,gst,discount_percent,discount_pct,discperc,discount,image_url,picture,is_active,is_deleted,is_favourite,isfav,unit_name,unitcode,description,item_description,itemdescription,id,created_at,updated_at";

export type CatalogCategoryOption = { id: string; name: string };
export type CatalogSubcategoryOption = { id: string; categoryId: string; name: string };

type SubcategoryRow = {
  id: string;
  category_id: string;
  name: string;
  is_active: boolean | null;
  is_deleted: boolean | null;
};

type SubcategoryQueryResult = { data: SubcategoryRow[] | null; error: unknown };
type SubcategoryQuery = PromiseLike<SubcategoryQueryResult> & {
  eq: (column: string, value: string | boolean) => SubcategoryQuery;
  neq: (column: string, value: string | boolean) => SubcategoryQuery;
  order: (column: string) => SubcategoryQuery;
};

const subcategoryTableClient = supabase as unknown as {
  from: (table: "subcategories") => { select: (columns: string) => SubcategoryQuery };
};

type StorefrontProductRow = Omit<Partial<DbProductRow>, "stock"> & { stock?: unknown };

export function isStorefrontProductRow(item: StorefrontProductRow | null | undefined): boolean {
  return Boolean(item && item.is_active === true && item.is_deleted !== true && isProductEligible(item));
}

type BrandNameRow = { brand_name?: unknown; brand?: unknown; name?: unknown } | null | undefined;

export function extractUniqueBrandNames(rows: BrandNameRow[]): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const row of rows) {
    const raw = row?.brand_name ?? row?.brand ?? row?.name ?? "";
    const value = String(raw ?? "").trim();
    if (!isDisplayLabel(value)) continue;
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized || seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    values.push(normalized);
  }

  return values;
}

let categoriesRequest: Promise<CatalogCategoryOption[]> | null = null;

const subcategoryRequests = new Map<string, Promise<CatalogSubcategoryOption[]>>();

function loadActiveCategories(): Promise<CatalogCategoryOption[]> {
  if (!categoriesRequest) {
    categoriesRequest = (async () => {
      const { data, error } = await supabase
        .from(TABLES.categories)
        .select("id, name, is_active, is_deleted")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data || [])
        .filter((item) => item.is_deleted !== true)
        .map((item) => ({ id: String(item.id ?? "").trim(), name: String(item.name ?? "").trim() }))
        .filter((item) => item.id && isDisplayLabel(item.name));
    })().catch((error) => {
      categoriesRequest = null;
      throw error;
    });
  }
  return categoriesRequest;
}

function loadActiveSubcategories(categoryId?: string): Promise<CatalogSubcategoryOption[]> {
  const cacheKey = categoryId || "all";
  const cachedRequest = subcategoryRequests.get(cacheKey);
  if (cachedRequest) return cachedRequest;

  const request = (async () => {
    let query = subcategoryTableClient
      .from("subcategories")
      .select("id, category_id, name, is_active, is_deleted")
      .eq("is_active", true)
      .order("name");
    if (categoryId) query = query.eq("category_id", categoryId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || [])
      .filter((item) => item.is_active === true && item.is_deleted !== true)
      .map((item) => ({
        id: String(item.id ?? "").trim(),
        categoryId: String(item.category_id ?? "").trim(),
        name: String(item.name ?? "").trim(),
      }))
      .filter((item) => item.id && item.categoryId && isDisplayLabel(item.name));
  })().catch((error) => {
    subcategoryRequests.delete(cacheKey);
    throw error;
  });

  subcategoryRequests.set(cacheKey, request);
  return request;
}

export function resolveCategoryOption(
  categories: CatalogCategoryOption[],
  selectedCategory: string | null | undefined,
): CatalogCategoryOption | undefined {
  const selected = String(selectedCategory ?? "").trim();
  if (!selected) return undefined;
  return categories.find((category) => category.id === selected || category.name.toLowerCase() === selected.toLowerCase());
}

export function resolveSubcategoryOption(
  subcategories: CatalogSubcategoryOption[],
  categoryId: string,
  selectedSubcategory: string | null | undefined,
): CatalogSubcategoryOption | undefined {
  const selected = String(selectedSubcategory ?? "").trim();
  if (!selected) return undefined;
  return subcategories.find((subcategory) =>
    subcategory.categoryId === categoryId &&
    (subcategory.id === selected || subcategory.name.toLowerCase() === selected.toLowerCase()),
  );
}

export type ProductCatalogOptions = {
  pageSize?: number;
  category?: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  includeAllSubcategories?: boolean;
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
  const [categoryOptions, setCategoryOptions] = useState<CatalogCategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<CatalogSubcategoryOption[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(Boolean(options.category || options.categoryId || options.includeAllSubcategories));
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
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
      let categoryId = options.categoryId;
      if (!categoryId && options.category) {
        const categoryRows = await loadActiveCategories();
        categoryId = resolveCategoryOption(categoryRows, options.category)?.id;
      }

      let subcategoryId = options.subcategoryId;
      if (!subcategoryId && options.subcategory && categoryId) {
        const subcategoryRows = await loadActiveSubcategories(categoryId);
        subcategoryId = resolveSubcategoryOption(subcategoryRows, categoryId, options.subcategory)?.id;
      }

      const hasCategoryFilter = Boolean(options.category || options.categoryId);
      const hasSubcategoryFilter = Boolean(options.subcategory || options.subcategoryId);
      if ((hasCategoryFilter && !categoryId) || (hasSubcategoryFilter && (!categoryId || !subcategoryId))) {
        if (requestKey.current === queryKey) {
          setProducts([]);
          setTotalCount(0);
          setHasMore(false);
          setError(hasCategoryFilter && !categoryId
            ? "The selected category could not be matched to an existing category ID."
            : "The selected subcategory could not be matched to this category.");
        }
        return;
      }

      let rawOffset = offset;
      let reachedEnd = false;
      const validRows: DbProductRow[] = [];

      while (validRows.length < pageSize && !reachedEnd) {
        if (requestKey.current !== queryKey) return;

        let query = supabase.from(TABLES.products).select(PRODUCT_COLUMNS);
        query = query.eq("is_active", true).neq("is_deleted", true);
        if (categoryId) query = query.eq("category_id", categoryId);
        if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);
        if (options.brand) query = query.ilike("brand_name", options.brand);
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
            .range(rawOffset, rawOffset + pageSize - 1));
        } finally {
          window.clearTimeout(timeoutId);
        }
        if (queryError) throw queryError;
        if (requestKey.current !== queryKey) return;

        const rawRows = (data || []) as DbProductRow[];
        validRows.push(...rawRows.filter(isStorefrontProductRow));
        rawOffset += rawRows.length;
        reachedEnd = rawRows.length < pageSize;
      }
      if (requestKey.current !== queryKey) return;

      const mapped = validRows.map(mapProduct);
      setProducts((current) => replace ? mapped : [...current, ...mapped.filter((item) => !current.some((existing) => existing.id === item.id))]);
      setTotalCount((current) => replace ? mapped.length : current + mapped.length);
      setHasMore(!reachedEnd);
      nextOffset.current = rawOffset;

      const { data: activeBrandRows, error: activeBrandError } = await supabase
        .from(TABLES.brands)
        .select("name, is_active")
        .eq("is_active", true)
        .order("name");

      if (!activeBrandError) {
        setBrands(extractUniqueBrandNames(activeBrandRows ?? []));
      } else {
        const pageBrands = extractUniqueBrandNames(mapped.map((item) => ({ brand_name: item.brand })));
        setBrands((current) => {
          const merged = [...current, ...pageBrands];
          const unique = new Map<string, string>();
          for (const brand of merged) {
            unique.set(brand.toLowerCase(), brand);
          }
          return Array.from(unique.values());
        });
      }
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
  }, [options.brand, options.category, options.categoryId, options.featuredOnly, options.maxDiscount, options.maxPrice, options.minDiscount, options.minPrice, options.offersOnly, options.search, options.sort, options.subcategory, options.subcategoryId, pageSize, queryKey]);

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
    setSubcategories([]);
    setSubcategoryOptions([]);
    setSubcategoryError(null);
    const shouldLoad = Boolean(options.category || options.categoryId || options.includeAllSubcategories);
    if (!shouldLoad) {
      setSubcategoriesLoading(false);
      return () => { mounted = false; };
    }

    const loadSubcategories = async () => {
      setSubcategoriesLoading(true);
      try {
        let categoryId = options.categoryId;
        if (!categoryId && options.category) {
          const categoryRows = await loadActiveCategories();
          categoryId = resolveCategoryOption(categoryRows, options.category)?.id;
          if (!categoryId) throw new Error("Selected category could not be matched to an existing category ID.");
        }

        const rows = await loadActiveSubcategories(categoryId);
        if (!mounted) return;
        setSubcategoryOptions(rows);
        setSubcategories(rows.map((item) => item.name));
      } catch (error) {
        if (mounted) setSubcategoryError(error instanceof Error ? error.message : "Unable to load subcategories.");
      } finally {
        if (mounted) setSubcategoriesLoading(false);
      }
    };

    void loadSubcategories();
    return () => { mounted = false; };
  }, [options.category, options.categoryId, options.includeAllSubcategories]);

  useEffect(() => {
    let mounted = true;
    void loadActiveCategories().then((rows) => {
      if (mounted) {
        setCategoryOptions(rows);
        setCategories(rows.map((item) => item.name));
      }
    }).catch(() => {
      if (mounted) {
        setCategories([]);
        setCategoryOptions([]);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    return subscribeToCatalogChanges(() => {
      void fetchPage(0, true);
    });
  }, [fetchPage]);

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
    categoryOptions,
    subcategories,
    subcategoryOptions,
    subcategoriesLoading,
    subcategoryError,
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

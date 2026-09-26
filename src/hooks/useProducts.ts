import { useState, useEffect, useMemo } from "react";
import { calculateSalePrice, isDisplayLabel, Product, normalizeCategory } from "@/lib/store-utils";
import { supabase } from "@/lib/supabase/client";
import { subscribeToCatalogChanges } from "@/lib/supabase/realtime";
import { logSupabaseDebug } from "@/lib/supabase";
import {
  TABLES,
  getProductBarcode,
  getProductCategory,
  getProductDiscount,
  getProductImageUrl,
  getProductMrp,
  getProductName,
  getProductSaleRate,
  getProductStock,
  getProductBrand,
  getProductSubcategory,
  getProductUnit,
  getProductDescription,
  isProductActive,
  isProductFeatured,
  type DbProductRow,
} from "@/lib/supabase/schema";

export function getUniqueBrandNames(products: Array<{ brand?: string | null }>): string[] {
  return [...new Set(products.map((product) => String(product?.brand ?? "").trim()).filter(isDisplayLabel))];
}

/** Customer storefront catalog: all queries require stock > 0. Admin uses InventoryTab (no stock filter). */
export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
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

  const getProductRows = async (range?: { from: number; to: number }) => {
    const productColumns = "barcode,name,mrp,sale_rate,retail_rate,restrate,onlinerate,online_rate,selling_price,stock,opstock,opening_stock,category_name,item_group_name,item_group,brand_name,subcategory_name,sub_category_name,discount_percent,discount_pct,discperc,discount,image_url,picture,is_active,is_deleted,is_favourite,isfav,unit_name,unitcode,description,item_description,itemdescription,id";
    let query = supabase.from(TABLES.products).select(productColumns, range ? { count: "exact" } : undefined);
    if (range) query = query.range(range.from, range.to);
    const { data, error, count } = await query;
    return { data: (data || []) as DbProductRow[], error, count: count ?? null };
  };

  const mapProduct = (item: DbProductRow): Product => {
    const barcode = getProductBarcode(item);
    const name = getProductName(item);
    const mrp = getProductMrp(item);
    const storedRate = getProductSaleRate(item);
    const imageUrl = getProductImageUrl(item);
    const normalizedCategory = normalizeCategory(getProductCategory(item));
    const category = isDisplayLabel(normalizedCategory) ? normalizedCategory : "GENERAL";
    const discount = getProductDiscount(item);
    const rate = calculateSalePrice(mrp, storedRate, discount);
    const stock = getProductStock(item);
    const unit = getProductUnit(item);
    const description = getProductDescription(item);

    return {
      id: Number(item.id),
      product_id: Number(item.id),
      name,
      price: rate,
      saleRate: rate,
      category,
      mrp,
      barcode,
      brand: isDisplayLabel(getProductBrand(item)) ? getProductBrand(item) : "Local",
      subCategory: getProductSubcategory(item),
      imageUrl,
      discount,
      stock,
      unit,
      description: description || undefined,
      isFeatured: isProductFeatured(item),
      save: Math.max(0, Math.round(mrp - rate)),
      badge: "",
    };
  };

  const fetchAllCategories = async () => {
    try {
      const { data, error } = await getProductRows({ from: 0, to: 49 });
      if (error) throw error;

      const uniqueCats = [
        ...new Set(
          data
            .map((item) => normalizeCategory(getProductCategory(item)))
            .filter((c) => c && c.length > 1 && isDisplayLabel(c))
        ),
      ];

      logSupabaseDebug("products:derivedCategories", uniqueCats);
      setAllCategories(uniqueCats);
    } catch (err) {
      console.error("Error deriving categories:", err);
    }
  };

  const fetchSupplementalProducts = async () => {
    try {
      const { data, error } = await getProductRows({ from: 0, to: 49 });
      if (error) throw error;

      const liveRows = data.filter((item) => getProductStock(item) > 0 && isProductActive(item));
      const mappedProducts = liveRows.map(mapProduct);
      const categories = [...new Set(liveRows.map((item) => normalizeCategory(getProductCategory(item))).filter((category) => category.length > 1 && isDisplayLabel(category)))];
      const featured = mappedProducts.filter((product) => product.isFeatured);
      const flat50 = mappedProducts.filter((product) => product.discount >= 50);
      const flat33 = mappedProducts.filter((product) => product.discount >= 33 && product.discount < 50);

      setAllCategories(categories);
      setFeaturedProducts(featured);
      setFlat50(flat50);
      setFlat33(flat33);
      setTotalFeatured(featured.length);
      setTotal50(flat50.length);
      setTotal33(flat33.length);
      setHasMoreFeatured(false);
      setHasMore50(false);
      setHasMore33(false);
    } catch (err) {
      console.error("Supplemental Products Fetch Error:", err);
    }
  };

  const fetchFeaturedProducts = async (offset = 0) => {
    try {
      const { data, error } = await getProductRows({ from: offset, to: offset + 11 });
      if (error) throw error;

      const filtered = data.filter((item) => {
        const stock = getProductStock(item);
        return stock > 0 && isProductFeatured(item) && isProductActive(item);
      });

      const mapped = filtered.slice(offset, offset + 12).map(mapProduct);
      if (offset === 0) {
        setFeaturedProducts(mapped);
        setTotalFeatured(filtered.length || 0);
      } else {
        setFeaturedProducts((prev) => [...prev, ...mapped]);
      }
      setHasMoreFeatured(filtered.length > offset + 12);
    } catch (err) {
      console.error("Featured Fetch Error:", err);
    }
  };

  const fetchDiscountedProducts = async (type: 50 | 33, offset = 0) => {
    try {
      const { data, error } = await getProductRows({ from: offset, to: offset + 11 });
      if (error) throw error;

      const filtered = data.filter((item) => {
        const stock = getProductStock(item);
        const discount = getProductDiscount(item);
        return (
          stock > 0 &&
          isProductActive(item) &&
          (type === 50 ? discount >= 50 : discount >= 33 && discount < 50)
        );
      });

      const mapped = filtered.slice(offset, offset + 12).map(mapProduct);
      if (type === 50) {
        if (offset === 0) {
          setFlat50(mapped);
          setTotal50(filtered.length || 0);
        } else {
          setFlat50((prev) => [...prev, ...mapped]);
        }
        setHasMore50(filtered.length > offset + 12);
      } else {
        if (offset === 0) {
          setFlat33(mapped);
          setTotal33(filtered.length || 0);
        } else {
          setFlat33((prev) => [...prev, ...mapped]);
        }
        setHasMore33(filtered.length > offset + 12);
      }
    } catch (err) {
      console.error(`Discount Fetch Error (${type}%):`, err);
    }
  };

  const fetchProducts = async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
        setError(null);
        void fetchSupplementalProducts();
      }

      const { data, error, count } = await getProductRows({ from: offset, to: offset + 49 });
      if (error) throw error;

      const filtered = data.filter((item) => {
        const stock = getProductStock(item);
        return stock > 0 && isProductActive(item);
      });

      setAllBrands(getUniqueBrandNames(filtered.map((item) => ({ brand: getProductBrand(item) }))));

      setTotalCount(count ?? filtered.length);

      const mappedProducts: Product[] = filtered.map(mapProduct);
      logSupabaseDebug("products:fetched", { count: mappedProducts.length, offset });

      if (offset === 0) {
        setAllProducts(mappedProducts);
      } else {
        setAllProducts((prev) => [...prev, ...mappedProducts]);
      }

      setHasMore((count ?? 0) > offset + mappedProducts.length);
    } catch (err) {
      setError("Unable to load products right now.");
      console.error("Supabase Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    return subscribeToCatalogChanges(() => {
      void fetchProducts(0);
    });
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

  const categories = useMemo(
    () =>
      (allCategories || []).length > 0
        ? allCategories
        : [...new Set((allProducts || []).map((p) => p?.category).filter(Boolean))],
    [allProducts, allCategories]
  );

  const brands = useMemo(
    () => allBrands,
    [allBrands]
  );

  const refetchProducts = () => fetchProducts(0);

  return {
    allProducts,
    loading,
    error,
    categories,
    brands,
    flat33,
    flat50,
    featuredProducts,
    hasMore,
    loadMore,
    totalCount,
    total50,
    total33,
    totalFeatured,
    hasMore50,
    hasMore33,
    hasMoreFeatured,
    loadMore50,
    loadMore33,
    loadMoreFeatured,
    refetchProducts,
  };
}

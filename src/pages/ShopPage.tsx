import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Filter, Search, SlidersHorizontal } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useProductCatalog } from "@/hooks/useProductCatalog";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "discount-desc", label: "Biggest Discounts" },
] as const;

const MAX_RENDERED_PRODUCTS = 500;

const getNumericPrice = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ShopPage = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const collection = searchParams.get("collection") || "";

  const [query, setQuery] = useState(
    () => searchParams.get("search") || searchParams.get("q") || "",
  );

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const category = searchParams.get("category");
    return category || "all";
  });

  const [selectedSubcategory, setSelectedSubcategory] = useState(() => {
    const subcategory = searchParams.get("subcategory");
    return subcategory || "all";
  });

  const [selectedBrand, setSelectedBrand] = useState(() => {
    const brand = searchParams.get("brand");
    return brand || "all";
  });

  const [priceMin, setPriceMin] = useState(
    () => searchParams.get("priceMin") || "",
  );

  const [priceMax, setPriceMax] = useState(
    () => searchParams.get("priceMax") || "",
  );

  const [sortBy, setSortBy] = useState<
    (typeof sortOptions)[number]["value"]
  >(() => {
    const sortValue = searchParams.get("sort");

    return (
      sortOptions.some((option) => option.value === sortValue)
        ? sortValue
        : "featured"
    ) as (typeof sortOptions)[number]["value"];
  });

  const offersOnly = searchParams.get("offers") === "25";

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const collectionOptions =
    collection === "featured"
      ? { featuredOnly: true as const }
      : collection === "flat50"
        ? { minDiscount: 50 }
        : collection === "flat33"
          ? { minDiscount: 33, maxDiscount: 50 }
          : {};

  const catalog = useProductCatalog({
    pageSize: 20,
    search: query,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    subcategory:
      selectedSubcategory === "all" ? undefined : selectedSubcategory,
    brand: selectedBrand === "all" ? undefined : selectedBrand,
    offersOnly,
    sort: sortBy,
    minPrice: priceMin.trim() ? Number(priceMin) : undefined,
    maxPrice: priceMax.trim() ? Number(priceMax) : undefined,
    ...collectionOptions,
  });

  const {
    products: allProducts,
    loading,
    loadingMore,
    error,
    loadMoreError,
    categories,
    subcategories,
    brands,
    hasMore,
    loadMore,
    retry: refetchProducts,
    retryLoadMore,
  } = catalog;

  const validCategories = useMemo(
    () =>
      (categories || []).filter(
        (category): category is string =>
          Boolean(category && typeof category === "string" && category.trim()),
      ),
    [categories],
  );

  const validBrands = useMemo(
    () =>
      (brands || []).filter(
        (brand): brand is string =>
          Boolean(brand && typeof brand === "string" && brand.trim()),
      ),
    [brands],
  );

  const validCategorySet = useMemo(
    () => new Set(validCategories),
    [validCategories],
  );

  const validBrandSet = useMemo(
    () => new Set(validBrands),
    [validBrands],
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nextQuery =
      searchParams.get("search") || searchParams.get("q") || "";

    const nextCategory = searchParams.get("category") || "all";
    const nextSubcategory = searchParams.get("subcategory") || "all";
    const nextBrand = searchParams.get("brand") || "all";
    const nextPriceMin = searchParams.get("priceMin") || "";
    const nextPriceMax = searchParams.get("priceMax") || "";
    const nextSort = searchParams.get("sort");

    setQuery(nextQuery);
    setSelectedCategory(nextCategory);
    setSelectedSubcategory(nextSubcategory);
    setSelectedBrand(nextBrand);
    setPriceMin(nextPriceMin);
    setPriceMax(nextPriceMax);

    setSortBy(
      (
        sortOptions.some((option) => option.value === nextSort)
          ? nextSort
          : "featured"
      ) as (typeof sortOptions)[number]["value"],
    );
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (query.trim()) nextParams.set("search", query.trim());

    if (selectedCategory !== "all") {
      nextParams.set("category", selectedCategory);
    }

    if (selectedSubcategory !== "all") {
      nextParams.set("subcategory", selectedSubcategory);
    }

    if (selectedBrand !== "all") {
      nextParams.set("brand", selectedBrand);
    }

    if (priceMin.trim()) {
      nextParams.set("priceMin", priceMin.trim());
    }

    if (priceMax.trim()) {
      nextParams.set("priceMax", priceMax.trim());
    }

    if (sortBy !== "featured") {
      nextParams.set("sort", sortBy);
    }

    if (offersOnly) {
      nextParams.set("offers", "25");
    }

    if (collection) {
      nextParams.set("collection", collection);
    }

    const nextSearch = nextParams.toString();
    const currentSearch = searchParams.toString();

    if (nextSearch !== currentSearch) {
      setSearchParams(nextSearch ? `?${nextSearch}` : "", {
        replace: true,
      });
    }
  }, [
    collection,
    offersOnly,
    query,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    priceMin,
    priceMax,
    sortBy,
    searchParams,
    setSearchParams,
  ]);

  const filteredProducts = useMemo(() => {
    const minValue = Number(priceMin);
    const maxValue = Number(priceMax);

    return allProducts.filter(
      (product) =>
        (!priceMin.trim() ||
          getNumericPrice(product.price) >= minValue) &&
        (!priceMax.trim() ||
          getNumericPrice(product.price) <= maxValue),
    );
  }, [allProducts, priceMax, priceMin]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedBrand("all");
    setPriceMin("");
    setPriceMax("");
    setSortBy("featured");
    setSearchParams("", { replace: true });
  };

  const displayedProducts = filteredProducts.slice(
    0,
    MAX_RENDERED_PRODUCTS,
  );

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: "500px",
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, loadMore, loading, loadingMore]);

  const filterPanel = (
    <div className="space-y-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">
            Filters
          </p>

          <h2 className="mt-2 text-xl font-black uppercase tracking-[-0.05em] text-slate-900">
            Browse
          </h2>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="shop-search"
          className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
        >
          Search
        </label>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />

          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Category
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSubcategory("all");
            }}
            className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold transition ${
              selectedCategory === "all"
                ? "bg-orange-50 text-orange-700"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            All categories
          </button>

          {validCategories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <div key={category} className="border-t border-slate-200/80">
                <button
                  type="button"
                  aria-expanded={isSelected}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcategory("all");
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isSelected
                      ? "bg-white text-orange-700"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <span className="truncate">{category}</span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected
                        ? "rotate-180 text-orange-500"
                        : "text-slate-400"
                    }`}
                  />
                </button>

                {isSelected && subcategories.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-white px-3 py-2 md:grid-cols-3 lg:grid-cols-5">
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategory("all")}
                      className={`min-w-0 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                        selectedSubcategory === "all"
                          ? "bg-orange-50 font-bold text-orange-700"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      All {category}
                    </button>

                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() =>
                          setSelectedSubcategory(subcategory)
                        }
                        className={`min-w-0 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                          selectedSubcategory === subcategory
                            ? "bg-orange-50 font-bold text-orange-700"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block break-words">
                          {subcategory}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="shop-subcategory"
          className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
        >
          Subcategory
        </label>

        <select
          id="shop-subcategory"
          value={selectedSubcategory}
          onChange={(event) =>
            setSelectedSubcategory(event.target.value)
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-300"
        >
          <option value="all">All subcategories</option>

          {(() => {
            const subcats = new Set<string>();

            for (const product of allProducts) {
              const value = String(product.subCategory || "").trim();

              if (value) {
                subcats.add(value);
              }
            }

            return [...subcats]
              .sort()
              .map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ));
          })()}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="shop-brand"
          className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
        >
          Brand
        </label>

        <select
          id="shop-brand"
          value={selectedBrand}
          onChange={(event) => setSelectedBrand(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-300"
        >
          <option value="all">All brands</option>

          {(brands || []).map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Price
          </p>

          {allProducts.length > 0 && (
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              ₹
              {Math.min(
                ...allProducts.map((product) =>
                  getNumericPrice(product.price),
                ),
              ).toLocaleString()}
              –₹
              {Math.max(
                ...allProducts.map((product) =>
                  getNumericPrice(product.price),
                ),
              ).toLocaleString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <input
            type="number"
            min="0"
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
            placeholder={allProducts.length ? "Min" : "0"}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-300"
          />

          <input
            type="number"
            min="0"
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
            placeholder={allProducts.length ? "Max" : "0"}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="shop-sort"
          className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
        >
          Sort by
        </label>

        <select
          id="shop-sort"
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value as (typeof sortOptions)[number]["value"],
            )
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-300"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const activeFilterLabel =
    selectedCategory !== "all" && validCategorySet.has(selectedCategory)
      ? selectedCategory
      : selectedBrand !== "all" && validBrandSet.has(selectedBrand)
        ? selectedBrand
        : null;

  const statusMessage =
    !loading && !error && filteredProducts.length === 0
      ? query.trim()
        ? `No results for “${query.trim()}”`
        : activeFilterLabel
          ? `No products for ${activeFilterLabel}`
          : "No products found"
      : activeFilterLabel
        ? `${filteredProducts.length} products • ${activeFilterLabel}`
        : `${filteredProducts.length} products`;

  const minCatalogPrice = useMemo(
    () =>
      allProducts.length
        ? Math.min(
            ...allProducts.map((product) =>
              getNumericPrice(product.price),
            ),
          )
        : 0,
    [allProducts],
  );

  const maxCatalogPrice = useMemo(
    () =>
      allProducts.length
        ? Math.max(
            ...allProducts.map((product) =>
              getNumericPrice(product.price),
            ),
          )
        : 0,
    [allProducts],
  );

  void minCatalogPrice;
  void maxCatalogPrice;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">
              Store
            </p>

            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.08em] text-slate-900 md:text-4xl">
              {activeFilterLabel
                ? `Shop ${activeFilterLabel}`
                : "Shop All Products"}
            </h1>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 shadow-sm">
            {statusMessage}
          </div>
        </div>

        {filteredProducts.length > MAX_RENDERED_PRODUCTS && (
          <div className="mb-5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
            Showing the first {MAX_RENDERED_PRODUCTS} matching products for
            faster browsing. Use filters to narrow down results.
          </div>
        )}

        {/* =========================================================
            MOBILE CATEGORY LAYOUT
            20% SUBCATEGORIES + 80% PRODUCTS
           ========================================================= */}

        {selectedCategory !== "all" ? (
          <div className="mb-6 grid grid-cols-[20%_minmax(0,1fr)] gap-2 md:hidden">
            {/* 20% SUBCATEGORY PANEL */}
            <aside className="min-w-0 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-1 py-3 text-center">
                <p className="text-[7px] font-black uppercase leading-tight tracking-[0.1em] text-slate-500">
                  Sub
                  <br />
                  Categories
                </p>
              </div>

              <div className="max-h-[calc(100vh-290px)] overflow-y-auto px-1 py-2">
                {/* ALL */}
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory("all")}
                  className={`mb-2 flex w-full flex-col items-center rounded-xl px-1 py-2 text-center transition ${
                    selectedSubcategory === "all"
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[8px] font-black text-slate-500">
                    ALL
                  </div>

                  <span className="mt-1.5 line-clamp-2 text-[7px] font-bold leading-tight">
                    All
                  </span>
                </button>

                {/* SUBCATEGORIES */}
                {subcategories.map((subcategory) => {
                  const isSelected =
                    selectedSubcategory === subcategory;

                  return (
                    <button
                      key={subcategory}
                      type="button"
                      onClick={() =>
                        setSelectedSubcategory(subcategory)
                      }
                      className={`mb-2 flex w-full flex-col items-center rounded-xl px-1 py-2 text-center transition ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ${
                          isSelected
                            ? "bg-blue-100 ring-1 ring-blue-200"
                            : "bg-slate-100 ring-1 ring-slate-200"
                        }`}
                      >
                        <span className="px-0.5 text-center text-[7px] font-black leading-tight">
                          {subcategory.slice(0, 3).toUpperCase()}
                        </span>
                      </div>

                      <span className="mt-1.5 line-clamp-3 text-[7px] font-bold leading-tight">
                        {subcategory}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* 80% PRODUCT AREA */}
            <section className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2 rounded-[14px] border border-slate-200 bg-white px-2.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-black uppercase tracking-[0.06em] text-slate-700">
                    {selectedSubcategory === "all"
                      ? `${selectedCategory} Products`
                      : selectedSubcategory}
                  </p>

                  <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {filteredProducts.length} products
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileFiltersOpen((open) => !open)
                  }
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>

              {mobileFiltersOpen && (
                <div className="mb-3 rounded-[16px] border border-slate-200 bg-white p-2.5 shadow-sm">
                  {filterPanel}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-[18px] border border-slate-200 bg-white p-2 shadow-sm"
                    >
                      <div className="mb-2 h-32 rounded-[14px] bg-slate-200" />
                      <div className="mb-2 h-2.5 w-14 rounded-full bg-slate-200" />
                      <div className="mb-3 h-3 w-20 rounded-full bg-slate-200" />
                      <div className="h-8 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-[18px] border border-red-100 bg-red-50 p-5 text-center">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-red-500">
                    Products unavailable
                  </p>

                  <button
                    type="button"
                    onClick={() => refetchProducts()}
                    className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-300 bg-white p-5 text-center">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500">
                    No products found
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSubcategory("all")
                    }
                    className="mt-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-slate-700"
                  >
                    Show All
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id || product.barcode}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <>
            {/* MOBILE SHOP-ALL FILTER */}
            <div className="mb-6 flex items-center justify-between gap-3 md:hidden">
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen((open) => !open)
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>

              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                <span>
                  {displayedProducts.length} result
                  {displayedProducts.length === 1 ? "" : "s"} shown
                </span>
              </div>
            </div>

            {mobileFiltersOpen && (
              <div
                className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <div
                  className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">
                        Filters
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setMobileFiltersOpen(false)
                      }
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  {filterPanel}
                </div>
              </div>
            )}
          </>
        )}

        {/* =========================================================
            DESKTOP LAYOUT
            Existing desktop layout preserved
           ========================================================= */}

        <div className="hidden gap-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] xl:gap-10">
          <div>{filterPanel}</div>

          <div>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 h-40 rounded-[20px] bg-slate-200" />
                    <div className="mb-2 h-3 w-20 rounded-full bg-slate-200" />
                    <div className="mb-4 h-4 w-32 rounded-full bg-slate-200" />
                    <div className="mb-4 h-3 w-12 rounded-full bg-orange-100" />
                    <div className="h-10 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-red-100 bg-red-50 p-8 text-center shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-500">
                  Products unavailable
                </p>

                <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">
                  Unable to load products
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => refetchProducts()}
                  className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <Filter className="h-6 w-6" />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                  No products found
                </p>

                <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">
                  {query.trim()
                    ? `No results for “${query.trim()}”`
                    : "Try a different search"}
                </h2>

                {query.trim() && (
                  <p className="mt-2 text-sm text-slate-600">
                    Try a different keyword or clear the current search.
                  </p>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id || product.barcode}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>

                <div
                  ref={loadMoreRef}
                  className="mt-7 flex min-h-12 items-center justify-center"
                >
                  {loadingMore ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Loading more products...
                    </span>
                  ) : loadMoreError ? (
                    <button
                      type="button"
                      onClick={retryLoadMore}
                      className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600 underline"
                    >
                      Couldn't load more products. Try again.
                    </button>
                  ) : hasMore ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Loading more as you scroll
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      No more products
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* MOBILE SHOP-ALL PRODUCTS */}
        {selectedCategory === "all" && (
          <div className="md:hidden">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="mb-3 h-36 rounded-[16px] bg-slate-200" />
                    <div className="mb-2 h-3 w-20 rounded-full bg-slate-200" />
                    <div className="mb-3 h-4 w-28 rounded-full bg-slate-200" />
                    <div className="h-9 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-[24px] border border-red-100 bg-red-50 p-7 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  Products unavailable
                </p>

                <button
                  type="button"
                  onClick={() => refetchProducts()}
                  className="mt-4 rounded-full bg-slate-900 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                >
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-7 text-center">
                <Filter className="mx-auto h-6 w-6 text-slate-400" />

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  No products found
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id || product.barcode}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>

                <div className="mt-7 flex min-h-12 items-center justify-center">
                  {loadingMore ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Loading more products...
                    </span>
                  ) : loadMoreError ? (
                    <button
                      type="button"
                      onClick={retryLoadMore}
                      className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600 underline"
                    >
                      Couldn't load more products. Try again.
                    </button>
                  ) : hasMore ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Loading more as you scroll
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      No more products
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
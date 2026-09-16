import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "discount-desc", label: "Biggest Discounts" },
] as const;

const getNumericPrice = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ShopPage = () => {
  const { allProducts, loading, error, categories, brands, refetchProducts } = useProducts();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const validCategories = useMemo(() => (categories || []).filter((category): category is string => Boolean(category && typeof category === "string" && category.trim())), [categories]);
  const validBrands = useMemo(() => (brands || []).filter((brand): brand is string => Boolean(brand && typeof brand === "string" && brand.trim())), [brands]);
  const validCategorySet = useMemo(() => new Set(validCategories), [validCategories]);
  const validBrandSet = useMemo(() => new Set(validBrands), [validBrands]);

  const [query, setQuery] = useState(() => searchParams.get("search") || searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const category = searchParams.get("category");
    return category && validCategorySet.has(category) ? category : "all";
  });
  const [selectedBrand, setSelectedBrand] = useState(() => {
    const brand = searchParams.get("brand");
    return brand && validBrandSet.has(brand) ? brand : "all";
  });
  const [priceMin, setPriceMin] = useState(() => searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(() => searchParams.get("priceMax") || "");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>(() => {
    const sortValue = searchParams.get("sort");
    return (sortOptions.some((option) => option.value === sortValue) ? sortValue : "featured") as (typeof sortOptions)[number]["value"];
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const nextQuery = searchParams.get("search") || searchParams.get("q") || "";
    const nextCategoryParam = searchParams.get("category") || "all";
    const nextBrandParam = searchParams.get("brand") || "all";
    const nextCategory = validCategorySet.has(nextCategoryParam) ? nextCategoryParam : "all";
    const nextBrand = validBrandSet.has(nextBrandParam) ? nextBrandParam : "all";
    const nextMin = searchParams.get("priceMin") || "";
    const nextMax = searchParams.get("priceMax") || "";
    const nextSort = searchParams.get("sort") || "featured";

    if (nextQuery !== query) setQuery(nextQuery);
    if (nextCategory !== selectedCategory) setSelectedCategory(nextCategory);
    if (nextBrand !== selectedBrand) setSelectedBrand(nextBrand);
    if (nextMin !== priceMin) setPriceMin(nextMin);
    if (nextMax !== priceMax) setPriceMax(nextMax);
    if (nextSort !== sortBy && sortOptions.some((option) => option.value === nextSort)) {
      setSortBy(nextSort as (typeof sortOptions)[number]["value"]);
    }
  }, [searchParams, query, selectedCategory, selectedBrand, priceMin, priceMax, sortBy, validCategorySet, validBrandSet]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (query.trim()) nextParams.set("search", query.trim());
    if (selectedCategory !== "all") nextParams.set("category", selectedCategory);
    if (selectedBrand !== "all") nextParams.set("brand", selectedBrand);
    if (priceMin.trim()) nextParams.set("priceMin", priceMin.trim());
    if (priceMax.trim()) nextParams.set("priceMax", priceMax.trim());
    if (sortBy !== "featured") nextParams.set("sort", sortBy);

    const nextSearch = nextParams.toString();
    const currentSearch = searchParams.toString();

    if (nextSearch !== currentSearch) {
      setSearchParams(nextSearch ? `?${nextSearch}` : "", { replace: true });
    }
  }, [query, selectedCategory, selectedBrand, priceMin, priceMax, sortBy, searchParams, setSearchParams]);

  const filteredProducts = useMemo(() => {
    const searchValue = query.trim().toLowerCase();
    const minValue = Number(priceMin);
    const maxValue = Number(priceMax);
    const hasMinPrice = priceMin.trim() !== "" && Number.isFinite(minValue);
    const hasMaxPrice = priceMax.trim() !== "" && Number.isFinite(maxValue);
    const effectiveMin = hasMinPrice && hasMaxPrice && minValue > maxValue ? maxValue : minValue;
    const effectiveMax = hasMinPrice && hasMaxPrice && minValue > maxValue ? minValue : maxValue;

    const list = allProducts.filter((product) => {
      const productPrice = getNumericPrice(product.price);
      const matchesSearch =
        !searchValue ||
        [product.name, product.brand, product.category, product.subCategory, product.barcode]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchValue));

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand;
      const matchesPriceMin = !hasMinPrice || productPrice >= effectiveMin;
      const matchesPriceMax = !hasMaxPrice || productPrice <= effectiveMax;

      return matchesSearch && matchesCategory && matchesBrand && matchesPriceMin && matchesPriceMax;
    });

    const sorted = [...list];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "discount-desc":
        sorted.sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0));
        break;
      default:
        sorted.sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0) || Number(b.stock || 0) - Number(a.stock || 0));
        break;
    }

    return sorted;
  }, [allProducts, priceMax, priceMin, query, selectedBrand, selectedCategory, sortBy]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setPriceMin("");
    setPriceMax("");
    setSortBy("featured");
    setSearchParams("", { replace: true });
  };

  const filterPanel = (
    <div className="space-y-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Filters</p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-[-0.05em] text-slate-900">Browse</h2>
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
        <label htmlFor="shop-search" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
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
        <label htmlFor="shop-category" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Category
        </label>
        <select
          id="shop-category"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-300"
        >
          <option value="all">All categories</option>
          {(categories || []).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="shop-brand" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
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
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Price</p>
          {allProducts.length > 0 && (
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              ₹{Math.min(...allProducts.map((product) => getNumericPrice(product.price))).toLocaleString()}–₹{Math.max(...allProducts.map((product) => getNumericPrice(product.price))).toLocaleString()}
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
        <label htmlFor="shop-sort" className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Sort by
        </label>
        <select
          id="shop-sort"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number]["value"])}
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
    () => (allProducts.length ? Math.min(...allProducts.map((product) => getNumericPrice(product.price))) : 0),
    [allProducts],
  );

  const maxCatalogPrice = useMemo(
    () => (allProducts.length ? Math.max(...allProducts.map((product) => getNumericPrice(product.price))) : 0),
    [allProducts],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">Store</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.08em] text-slate-900 md:text-4xl">
              {activeFilterLabel ? `Shop ${activeFilterLabel}` : "Shop All Products"}
            </h1>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 shadow-sm">
            {statusMessage}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <div className="hidden lg:block">{filterPanel}</div>

          {mobileFiltersOpen && (
            <div className="lg:hidden">{filterPanel}</div>
          )}

          <div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
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
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-500">Products unavailable</p>
                <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">Unable to load products</h2>
                <p className="mt-2 text-sm text-slate-600">{error}</p>
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
                  {query.trim() ? "No products found" : "No products found"}
                </p>
                <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">
                  {query.trim() ? `No results for “${query.trim()}”` : "Try a different search"}
                </h2>
                {query.trim() && (
                  <p className="mt-2 text-sm text-slate-600">Try a different keyword or clear the current search.</p>
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
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id || product.barcode} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;

import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useCart } from "@/hooks/useCart";
import { formatDisplayName } from "@/lib/store-utils";
import {
  resolveCategoryOption,
  resolveSubcategoryOption,
  useProductCatalog,
  type CatalogSubcategoryOption,
} from "@/hooks/useProductCatalog";

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const selectedSubcategory = searchParams.get("subcategory") || "all";
  const {
    products: allProducts,
    categories,
    categoryOptions,
    subcategoryOptions: allSubcategoryOptions,
    loading,
    error,
  } = useProductCatalog({ pageSize: 20, includeAllSubcategories: true });
  const selectedCategoryOption = resolveCategoryOption(categoryOptions, selectedCategory);
  const selectedCategoryId = selectedCategoryOption?.id;
  const selectedCategoryName = selectedCategoryOption?.name || selectedCategory;
  const categoryCatalog = useProductCatalog({
    pageSize: 20,
    category: selectedCategory || undefined,
    subcategory: selectedSubcategory === "all" ? undefined : selectedSubcategory,
  });
  const {
    hasMore,
    loading: categoryLoading,
    loadingMore,
    loadMore,
    error: categoryError,
    subcategoriesLoading,
    subcategoryError,
  } = categoryCatalog;
  const hasRelatedSubcategories = categoryCatalog.subcategories.length > 0;
  const showSubcategoryNavigation = hasRelatedSubcategories || subcategoriesLoading || Boolean(subcategoryError);
  const selectedSubcategoryOption = selectedCategoryId
    ? resolveSubcategoryOption(categoryCatalog.subcategoryOptions, selectedCategoryId, selectedSubcategory)
    : undefined;
  const selectedSubcategoryName = selectedSubcategoryOption?.name || selectedSubcategory;
  const { addToCart } = useCart();
  const subcategoryImages = useMemo(() => {
    const images: Record<string, string> = {};
    for (const product of categoryCatalog.products) {
      const key = product.subCategory.trim().toLowerCase();
      if (key && product.imageUrl && !images[key]) images[key] = product.imageUrl;
    }
    return images;
  }, [categoryCatalog.products]);
  const productsEndRef = useRef<HTMLDivElement | null>(null);
  const productsScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = productsEndRef.current;
    if (!target || !selectedCategory || !hasMore || categoryLoading || loadingMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    }, { root: productsScrollRef.current, rootMargin: "500px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [categoryLoading, hasMore, loadMore, loadingMore, selectedCategory]);
  const imageByCategory = useMemo(() => {
    const images: Record<string, string> = {};
    for (const product of allProducts) {
      const key = product.category.trim().toUpperCase();
      if (key && product.imageUrl && !images[key]) images[key] = product.imageUrl;
    }
    return images;
  }, [allProducts]);

  const subcategoriesByCategory = useMemo(() => {
    const map: Record<string, CatalogSubcategoryOption[]> = {};
    for (const subcategory of allSubcategoryOptions) {
      if (!map[subcategory.categoryId]) map[subcategory.categoryId] = [];
      map[subcategory.categoryId].push(subcategory);
    }
    return map;
  }, [allSubcategoryOptions]);

  const liveCategories = categories.filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className={`${selectedCategory ? "w-full max-w-none px-0 md:mx-auto md:max-w-[1800px] md:px-6 lg:px-8" : "mx-auto w-full max-w-[1800px] px-3 md:px-8 lg:px-10 xl:px-16"} py-6 md:py-12`}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`${selectedCategory ? "px-5 md:px-10" : ""} mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary`}
        >
          <ArrowLeft size={14} /> Back
        </button>
        {!selectedCategory && (
          <div className="mb-7">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Live store</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">All Categories</h1>
            <p className="mt-2 text-sm text-slate-500">Browse every category currently available in the store.</p>
          </div>
        )}

        {selectedCategory ? (
          <section className="h-[calc(100vh-220px)] min-h-[650px] w-full overflow-hidden rounded-none border-x-0 border-y border-[#d7ebff] bg-[#f8fbff] shadow-sm md:h-auto md:min-h-0 md:rounded-2xl md:border-x md:border-slate-200">
            <div className="flex h-full min-h-0 flex-col gap-3 p-2 md:h-auto md:p-4">
         <div className={`min-h-0 min-w-0 flex-1 md:flex-none ${showSubcategoryNavigation ? "grid grid-cols-[20%_minmax(0,1fr)] gap-2 md:grid-cols-[200px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)]" : "block"}`}>
              {showSubcategoryNavigation && <aside className="min-h-0 min-w-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 md:hidden">
                <p className="mb-2 text-center text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">Sub categories</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ category: selectedCategoryId || selectedCategory })}
                    className={`flex w-full min-w-0 flex-col items-center rounded-lg px-1 py-2 text-center transition ${selectedSubcategory === "all" ? "bg-[#eaf3ff] text-[#0b3b78]" : "text-slate-600 hover:bg-slate-50"}`}
                  >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                      <LayoutGrid className="h-4 w-4 text-slate-500" />
                    </span>
                    <span className="mt-1 line-clamp-2 text-[9px] font-bold leading-tight">All {formatDisplayName(selectedCategoryName)}</span>
                  </button>
                  {categoryCatalog.subcategoryOptions.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      type="button"
                      onClick={() => setSearchParams({ category: selectedCategoryId || selectedCategory, subcategory: subcategory.id })}
                      className={`flex w-full min-w-0 flex-col items-center rounded-lg px-1 py-2 text-center transition ${selectedSubcategoryOption?.id === subcategory.id ? "bg-[#eaf3ff] text-[#0b3b78]" : "text-slate-600 hover:bg-slate-50"}`}
                    >
               <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[9px] font-black uppercase text-slate-500 ring-1 ring-slate-200">
                        {subcategoryImages[subcategory.name.toLowerCase()] ? (
                          <img src={subcategoryImages[subcategory.name.toLowerCase()]} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                        ) : (
                          subcategory.name.slice(0, 2)
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 text-[9px] font-semibold leading-tight">{formatDisplayName(subcategory.name)}</span>
                    </button>
                  ))}
                </div>
              </aside>}

              {showSubcategoryNavigation && <aside className="hidden min-h-0 min-w-0 flex-col gap-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 md:flex md:max-h-[calc(100vh-330px)] md:min-h-[400px]">
                <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Subcategories</p>
                <button
                  type="button"
                  onClick={() => setSearchParams({ category: selectedCategoryId || selectedCategory })}
                  aria-current={!selectedSubcategoryOption ? "page" : undefined}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-sm transition ${!selectedSubcategoryOption ? "bg-[#eaf3ff] font-bold text-[#0b3b78]" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  All
                </button>
                {categoryCatalog.subcategoryOptions.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() => setSearchParams({ category: selectedCategoryId || selectedCategory, subcategory: subcategory.id })}
                    aria-current={selectedSubcategoryOption?.id === subcategory.id ? "page" : undefined}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-sm transition ${selectedSubcategoryOption?.id === subcategory.id ? "bg-orange-50 font-bold text-orange-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {formatDisplayName(subcategory.name)}
                  </button>
                ))}
                {subcategoryError && <p className="mt-2 px-2 text-xs text-red-600">{subcategoryError}</p>}
              </aside>}

              <div className={`${showSubcategoryNavigation ? "" : "w-full"} flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2 md:p-4`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {!selectedSubcategoryOption ? `${formatDisplayName(selectedCategoryName)} products` : formatDisplayName(selectedSubcategoryName)}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/shop?category=${encodeURIComponent(selectedCategoryId || selectedCategory)}${selectedSubcategoryOption ? `&subcategory=${encodeURIComponent(selectedSubcategoryOption.id)}` : ""}`)}
                    className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1d5fbf] hover:text-[#0b3b78]"
                  >
                    Shop all
                  </button>
                </div>
                <div ref={productsScrollRef} className="min-h-0 flex-1 overflow-y-auto pr-2 md:max-h-[calc(100vh-390px)] md:min-h-[420px] md:pr-0">
                  {categoryCatalog.loading ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Loading products...</div>
                  ) : categoryError ? (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">{categoryError}</div>
                  ) : categoryCatalog.products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">No products found in {selectedSubcategoryOption ? formatDisplayName(selectedSubcategoryName) : formatDisplayName(selectedCategoryName)}.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                        {categoryCatalog.products.map((product) => (
                          <ProductCard key={product.id || product.barcode} product={product} onAddToCart={addToCart} />
                        ))}
                      </div>
                      <div ref={productsEndRef} className="h-8" aria-hidden="true" />
                      {categoryCatalog.loadingMore && (
                        <p className="py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Loading more products...</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              </div>
            </div>
          </section>
        ) : loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading categories...</div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-12 text-center text-sm font-semibold text-red-600">{error}</div>
        ) : liveCategories.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No categories available right now.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {liveCategories.map((category) => {
              const categoryOption = categoryOptions.find((item) => item.name === category);
              const image = imageByCategory[category.toUpperCase()];
              const subcategories = categoryOption ? (subcategoriesByCategory[categoryOption.id] || []).slice(0, 4) : [];
              return (
                <div key={category} className="group flex min-h-[170px] flex-col rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
                  <button
                    type="button"
                    onClick={() => categoryOption && navigate(`/categories?category=${encodeURIComponent(categoryOption.id)}`)}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-50 ring-1 ring-slate-100">
                      {image ? <img src={image} alt={category} className="h-full w-full object-contain p-2" loading="lazy" /> : <LayoutGrid className="h-8 w-8 text-slate-400" />}
                    </div>
                    <span className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 group-hover:text-orange-600">{formatDisplayName(category)}</span>
                  </button>

                  {subcategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (categoryOption) navigate(`/categories?category=${encodeURIComponent(categoryOption.id)}&subcategory=${encodeURIComponent(subcategory.id)}`);
                          }}
                          className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
                        >
                          {formatDisplayName(subcategory.name)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

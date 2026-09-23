import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useProductCatalog } from "@/hooks/useProductCatalog";

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const selectedSubcategory = searchParams.get("subcategory") || "all";
  const { products: allProducts, categories, loading, error } = useProductCatalog({ pageSize: 20 });
  const categoryCatalog = useProductCatalog({
    pageSize: 20,
    category: selectedCategory || undefined,
    subcategory: selectedSubcategory === "all" ? undefined : selectedSubcategory,
  });
  const { hasMore, loading: categoryLoading, loadingMore, loadMore } = categoryCatalog;
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
    const map: Record<string, string[]> = {};
    for (const product of allProducts) {
      const category = String(product.category || "").trim();
      const subcategory = String(product.subCategory || "").trim();
      if (!category || !subcategory) continue;
      if (!map[category]) map[category] = [];
      if (!map[category].includes(subcategory)) map[category].push(subcategory);
    }
    return map;
  }, [allProducts]);

  const liveCategories = categories.filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className={`${selectedCategory ? "w-full max-w-none px-0" : "mx-auto w-full max-w-[1800px] px-3 md:px-8 lg:px-10 xl:px-16"} py-6 md:py-12`}>
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
          <section className="h-[calc(100vh-220px)] min-h-[650px] w-full overflow-hidden rounded-none border-x-0 border-y border-[#d7ebff] bg-[#f8fbff] shadow-sm md:h-[calc(100vh-240px)] md:min-h-[720px]">
            <div className="flex h-full min-h-0 flex-col gap-3 p-2 md:p-3">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 md:px-4">
                <h1 className="text-base font-black uppercase tracking-[-0.04em] text-slate-900 md:text-xl">{selectedCategory}</h1>
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Shop by category</span>
              </div>
              <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 md:grid-cols-[260px_minmax(0,1fr)] md:gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="min-h-0 min-w-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 md:p-3">
                <p className="mb-2 text-center text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">Sub categories</p>
                <div className="grid grid-cols-2 gap-1.5 md:grid-cols-5 md:gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ category: selectedCategory })}
                    className={`flex w-full min-w-0 flex-col items-center rounded-lg px-1 py-2 text-center transition ${selectedSubcategory === "all" ? "bg-[#eaf3ff] text-[#0b3b78]" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                      <LayoutGrid className="h-4 w-4 text-slate-500" />
                    </span>
                    <span className="mt-1 line-clamp-2 text-[9px] font-bold leading-tight">All {selectedCategory}</span>
                  </button>
                  {categoryCatalog.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      type="button"
                      onClick={() => setSearchParams({ category: selectedCategory, subcategory })}
                      className={`flex w-full min-w-0 flex-col items-center rounded-lg px-1 py-2 text-center transition ${selectedSubcategory === subcategory ? "bg-[#eaf3ff] text-[#0b3b78]" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[9px] font-black uppercase text-slate-500 ring-1 ring-slate-200">
                        {subcategoryImages[subcategory.toLowerCase()] ? (
                          <img src={subcategoryImages[subcategory.toLowerCase()]} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                        ) : (
                          subcategory.slice(0, 2)
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 text-[9px] font-semibold leading-tight">{subcategory}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2 md:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {selectedSubcategory === "all" ? `${selectedCategory} products` : selectedSubcategory}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/shop?category=${encodeURIComponent(selectedCategory)}${selectedSubcategory !== "all" ? `&subcategory=${encodeURIComponent(selectedSubcategory)}` : ""}`)}
                    className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1d5fbf] hover:text-[#0b3b78]"
                  >
                    Shop all
                  </button>
                </div>
                <div ref={productsScrollRef} className="min-h-0 flex-1 overflow-y-auto pr-2">
                  {categoryCatalog.loading ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Loading products...</div>
                  ) : categoryCatalog.products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">No products found in this sub-category.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
              const image = imageByCategory[category.toUpperCase()];
              const subcategories = (subcategoriesByCategory[category] || []).slice(0, 4);
              return (
                <div key={category} className="group flex min-h-[170px] flex-col rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
                  <button
                    type="button"
                    onClick={() => navigate(`/shop?category=${encodeURIComponent(category)}`)}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-50 ring-1 ring-slate-100">
                      {image ? <img src={image} alt={category} className="h-full w-full object-contain p-2" loading="lazy" /> : <LayoutGrid className="h-8 w-8 text-slate-400" />}
                    </div>
                    <span className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 group-hover:text-orange-600">{category}</span>
                  </button>

                  {subcategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {subcategories.map((subcategory) => (
                        <button
                          key={`${category}-${subcategory}`}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/shop?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`);
                          }}
                          className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
                        >
                          {subcategory}
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

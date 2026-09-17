import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LayoutGrid, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/shop/Header";
import HeroBanner from "@/components/shop/HeroBanner";
import ProductCard from "@/components/shop/ProductCard";
import Footer from "@/components/shop/Footer";
import { fetchActiveBanners } from "@/lib/supabase";
import { supabase } from "@/lib/supabase/client";

export default function HomePage() {
  const navigate = useNavigate();
  const { allProducts, loading: productsLoading, categories, brands, hasMore, loadMore } = useProducts();
  const { addToCart } = useCart();
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [visiblePopularCount, setVisiblePopularCount] = useState(8);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const liveCategories = (categories || []).filter(Boolean).slice(0, 8);
  const liveBrands = (brands || []).filter(Boolean).slice(0, 12);
  const productImageByCategory = useMemo(() => {
    const images: Record<string, string> = {};
    for (const product of allProducts || []) {
      const key = String(product.category || "").trim().toUpperCase();
      if (key && product.imageUrl && !images[key]) images[key] = product.imageUrl;
    }
    return images;
  }, [allProducts]);
  const productImageByBrand = useMemo(() => {
    const images: Record<string, string> = {};
    for (const product of allProducts || []) {
      const key = String(product.brand || "").trim().toUpperCase();
      if (key && product.imageUrl && !images[key]) images[key] = product.imageUrl;
    }
    return images;
  }, [allProducts]);
  const popularProducts = (allProducts || []).filter((product) => Number(product.stock) > 0);
  const visiblePopularProducts = popularProducts.slice(0, visiblePopularCount);
  const offerProducts = (allProducts || [])
    .filter((product) => Number(product.stock) > 0 && Number(product.discount) > 0)
    .sort((a, b) => Number(b.discount) - Number(a.discount))
    .slice(0, 2);

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  const handleBrandClick = (brand: string) => {
    navigate(`/shop?brand=${encodeURIComponent(brand)}`);
  };

  const handleLoadMorePopular = () => {
    const nextCount = visiblePopularCount + 8;
    if (nextCount > allProducts.length && hasMore) loadMore();
    setVisiblePopularCount(nextCount);
  };

  useEffect(() => {
    let mounted = true;

    const loadBanners = async () => {
      setLoadingBanners(true);

      try {
        const fetchedBanners = await fetchActiveBanners();
        if (mounted) {
          setBanners(fetchedBanners);
        }
      } catch (error) {
        if (mounted) {
          setBanners([]);
        }
      } finally {
        if (mounted) {
          setLoadingBanners(false);
        }
      }
    };

    loadBanners();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadCategoryImages = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, image_url, is_visible")
        .eq("is_visible", true);

      if (error || !mounted) return;

      const images: Record<string, string> = {};
      for (const category of data || []) {
        const name = String(category?.name || "").trim().toUpperCase();
        const image = String(category?.image_url || "").trim();
        if (name && image) images[name] = image;
      }
      setCategoryImages(images);
    };

    loadCategoryImages();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        <section className="mb-8">
          <HeroBanner banners={banners} loading={loadingBanners} />
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Shop by category</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">Browse categories</h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 md:flex">
              <Search className="h-3.5 w-3.5" />
              {liveCategories.length} live
            </div>
          </div>

          {liveCategories.length === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 text-slate-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em]">No categories available right now</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {liveCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className="group min-h-[118px] rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow-[0_18px_35px_-25px_rgba(249,115,22,0.6)]"
                  aria-label={`Browse category ${category}`}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white text-slate-700 shadow-sm transition group-hover:scale-105 group-hover:text-orange-600">
                    {(categoryImages[category.toUpperCase()] || productImageByCategory[category.toUpperCase()]) ? (
                      <img
                        src={categoryImages[category.toUpperCase()] || productImageByCategory[category.toUpperCase()]}
                        alt={`${category} category`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <LayoutGrid className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 group-hover:text-slate-900">{category}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Popular picks</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">Popular Products</h2>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 h-40 rounded-[20px] bg-slate-200" />
                  <div className="mb-2 h-3 w-20 rounded-full bg-slate-200" />
                  <div className="mb-4 h-4 w-32 rounded-full bg-slate-200" />
                  <div className="mb-4 h-3 w-12 rounded-full bg-orange-100" />
                  <div className="h-10 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : popularProducts.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-white/60">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">No products available right now</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
                {visiblePopularProducts.map((product) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
                ))}
              </div>

              {(visiblePopularCount < popularProducts.length || hasMore) && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMorePopular}
                    disabled={productsLoading}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {productsLoading ? "Loading Products" : "Load More Products"}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Special deals</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">Special Offers</h2>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 h-40 rounded-[20px] bg-slate-200" />
                  <div className="mb-2 h-3 w-20 rounded-full bg-slate-200" />
                  <div className="mb-4 h-4 w-32 rounded-full bg-slate-200" />
                  <div className="mb-4 h-3 w-12 rounded-full bg-orange-100" />
                  <div className="h-10 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : offerProducts.length === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">No active offers right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {offerProducts.map((product) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Trusted names</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">Shop by Brand</h2>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="h-3 w-20 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : liveBrands.length === 0 ? (
            <div className="flex min-h-[140px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">No brands available right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {liveBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandClick(brand)}
                  className="flex min-h-[112px] flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50"
                  aria-label={`Browse brand ${brand}`}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white text-sm font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm">
                    {productImageByBrand[brand.toUpperCase()] ? (
                      <img
                        src={productImageByBrand[brand.toUpperCase()]}
                        alt={`${brand} brand`}
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                      />
                    ) : (
                      brand.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">{brand}</p>
                </button>
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}

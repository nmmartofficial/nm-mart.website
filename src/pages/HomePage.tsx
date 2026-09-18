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
import { TABLES } from "../lib/supabase/schema";
import { resolveStorageImageUrl } from "@/lib/supabase/productImagesStorage";

export default function HomePage() {
  const navigate = useNavigate();
  const {
    allProducts,
    loading: productsLoading,
    categories,
    brands,
    hasMore,
    loadMore,
    featuredProducts,
    flat50,
    flat33,
  } = useProducts();
  const { addToCart } = useCart();
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [visiblePopularCount, setVisiblePopularCount] = useState(8);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const liveCategories = (categories || []).filter(Boolean).slice(0, 8);
  const liveBrands = (brands || []).filter(Boolean).slice(0, 12);
  const liveFeatured = (featuredProducts || []).filter((p: any) => Number(p?.stock) > 0).slice(0, 8);
  const liveFlat50 = (flat50 || []).filter((p: any) => Number(p?.stock) > 0).slice(0, 8);
  const liveFlat33 = (flat33 || []).filter((p: any) => Number(p?.stock) > 0).slice(0, 8);
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
    .slice(0, 8);

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

  function shouldDisplayBrandLabel(text: string): boolean {
    if (!text) return false;
    const t = String(text).trim();
    if (!t) return false;
    if (/^\d+$/.test(t)) return false;
    if (t.length <= 2 && /\d/.test(t)) return false;
    return true;
  }

  const BrandCategoryCard = ({
    label,
    image,
    alt,
    onClick,
  }: {
    label: string;
    image?: string;
    alt: string;
    onClick: () => void;
  }) => {
    const safeLabel = shouldDisplayBrandLabel(label) ? label : "";
    return (
      <div className="flex w-[92px] shrink-0 flex-col items-center sm:w-[100px] md:w-auto md:flex-1">
        <button
          type="button"
          onClick={onClick}
          className="group flex items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
          aria-label={alt}
        >
          <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] ring-1 ring-slate-100 sm:h-[90px] sm:w-[90px] md:h-[110px] md:w-[110px]">
            {image ? (
              <img
                src={image}
                alt={alt}
                className="h-full w-full rounded-full object-contain p-1.5"
                loading="lazy"
              />
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                {safeLabel ? safeLabel.slice(0, 2).toUpperCase() : "NM"}
              </span>
            )}
          </div>
        </button>
        {safeLabel && (
          <p className="mt-2 max-w-[92px] text-center text-[11px] font-bold uppercase leading-[1.25] tracking-[0.08em] text-slate-700 line-clamp-2 sm:max-w-[100px] sm:text-[11.5px] md:max-w-none md:text-[12px]">
            {safeLabel}
          </p>
        )}
      </div>
    );
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
        .from(TABLES.categories)
        .select("name, image_url, is_active")
        .eq("is_active", true);

      if (error || !mounted) return;

      const images: Record<string, string> = {};
      for (const category of data || []) {
        const name = String(category?.name || "").trim().toUpperCase();
        const image = resolveStorageImageUrl(category?.image_url, "categories");
        if (name && image) images[name] = image;
      }
      setCategoryImages(images);
    };

    loadCategoryImages();
    return () => {
      mounted = false;
    };
  }, []);

  const ProductSkeletonGrid = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-2 gap-[11px] md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[14px] border border-slate-200 bg-white p-2 shadow-sm">
          <div className="mb-2 h-[138px] rounded-[12px] bg-slate-200" />
          <div className="mb-1 h-2.5 w-16 rounded-full bg-slate-200" />
          <div className="mb-2 h-3.5 w-28 rounded-full bg-slate-200" />
          <div className="mb-2 h-2.5 w-10 rounded-full bg-orange-100" />
          <div className="h-[42px] rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );

  const EmptySectionState = ({ text }: { text: string }) => (
    <div className="flex min-h-[160px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{text}</p>
    </div>
  );

  const SectionHeader = ({
    eyebrow,
    title,
    meta,
  }: {
    eyebrow: string;
    title: string;
    meta?: string;
  }) => (
    <div className="mb-2 flex items-center justify-between gap-3 md:mb-5">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500 md:text-[10px]">{eyebrow}</p>
        <h2 className="mt-1 text-[1.05rem] font-black uppercase tracking-[-0.06em] text-slate-900 md:mt-2 md:text-2xl">{title}</h2>
      </div>
      {meta && (
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 md:flex">
          <Search className="h-3.5 w-3.5" />
          {meta}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-[100vw] overflow-x-clip px-3 py-2 md:px-3 lg:py-8">
        <section className="mb-2 md:mb-4">
          <HeroBanner banners={banners} loading={loadingBanners} />
        </section>

        <section className="mb-3 rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader
            eyebrow="SHOP BY CATEGORY"
            title="BROWSE CATEGORIES"
            meta={`${liveCategories.length} live`}
          />

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
            <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {liveCategories.map((category) => (
                <BrandCategoryCard
                  key={category}
                  label={category}
                  image={categoryImages[category.toUpperCase()] || productImageByCategory[category.toUpperCase()]}
                  alt={`Browse category ${category}`}
                  onClick={() => handleCategoryClick(category)}
                />
              ))}
            </div>
          )}
        </section>

        {liveBrands.length > 0 && (
          <section className="mb-3 rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <SectionHeader eyebrow="TOP BRANDS" title="BRANDS YOU LOVE" />

            {productsLoading ? (
              <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex w-[92px] shrink-0 flex-col items-center sm:w-[100px] md:w-auto md:flex-1 md:items-stretch md:rounded-[22px] md:border md:border-slate-200 md:bg-slate-50 md:p-4">
                    <div className="animate-pulse h-[88px] w-[88px] rounded-full bg-slate-200 sm:h-[90px] sm:w-[90px] md:h-[110px] md:w-[110px] md:rounded-2xl" />
                    <div className="mt-2 h-3 w-20 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="hide-scrollbar flex gap-2.5 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-6">
                {liveBrands.map((brand) => (
                  <BrandCategoryCard
                    key={brand}
                    label={brand}
                    image={productImageByBrand[brand.toUpperCase()]}
                    alt={`${brand} brand`}
                    onClick={() => handleBrandClick(brand)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {liveFeatured.length > 0 && !productsLoading && (
          <section className="mb-4 rounded-[18px] border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <SectionHeader eyebrow="Editor's pick" title="FEATURED PRODUCTS" />
            <div className="grid grid-cols-2 gap-[11px] md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {liveFeatured.map((product: any) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mb-4 rounded-[18px] border border-slate-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Popular picks" title="POPULAR PRODUCTS" />

          {productsLoading ? (
            <ProductSkeletonGrid count={8} />
          ) : popularProducts.length === 0 ? (
            <EmptySectionState text="No products available right now" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-[11px] md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
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

        <section className="mb-4 rounded-[28px] border border-slate-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Special deals" title="SPECIAL OFFERS" />

          {productsLoading ? (
            <ProductSkeletonGrid count={4} />
          ) : offerProducts.length === 0 ? (
            <EmptySectionState text="No active offers right now" />
          ) : (
            <div className="grid grid-cols-2 gap-[11px] md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
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

        {liveFlat50.length > 0 && !productsLoading && (
          <section className="mb-4 rounded-[18px] border border-red-200 bg-gradient-to-r from-red-50 via-white to-rose-50 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <SectionHeader eyebrow="Big Savings" title="FLAT 50% OFF" />
            <div className="grid grid-cols-2 gap-[11px] md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {liveFlat50.map((product: any) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>
        )}

        {liveFlat33.length > 0 && !productsLoading && (
          <section className="mb-4 rounded-[18px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <SectionHeader eyebrow="Great Value" title="UP TO 33% OFF" />
            <div className="grid grid-cols-2 gap-[11px] md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {liveFlat33.map((product: any) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

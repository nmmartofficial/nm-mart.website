import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LayoutGrid, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductCatalog } from "@/hooks/useProductCatalog";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/shop/Header";
import HeroBanner from "@/components/shop/HeroBanner";
import ProductCard from "@/components/shop/ProductCard";
import Footer from "@/components/shop/Footer";
import { fetchActiveBanners, getBannerPlacementKey } from "@/lib/supabase";
import { supabase } from "@/lib/supabase/client";
import { subscribeToCatalogChanges } from "@/lib/supabase/realtime";
import { TABLES } from "../lib/supabase/schema";
import { resolveStorageImageUrl } from "@/lib/supabase/productImagesStorage";
import { formatDisplayName, type Product } from "@/lib/store-utils";
import type { WebsiteBanner } from "@/lib/supabase";

function ProductRail({
  products,
  onAddToCart,
}: {
  products: Product[];
  onAddToCart: (product: Product) => void;
}) {
  return (
    <div className="hide-scrollbar flex snap-x snap-mandatory items-stretch gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product) => (
        <div key={product.id || product.barcode} className="flex w-[160px] shrink-0 snap-start sm:w-[180px] md:w-auto md:min-w-0">
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const popularCatalog = useProductCatalog({ pageSize: 6 });
  const offersCatalog = useProductCatalog({ pageSize: 6, offersOnly: true });
  const featuredCatalog = useProductCatalog({ pageSize: 6, featuredOnly: true });
  const newArrivalsCatalog = useProductCatalog({ pageSize: 6, sort: "newest" });
  const allProducts = popularCatalog.products;
  const popularLoading = popularCatalog.loading;
  const offersLoading = offersCatalog.loading;
  const featuredLoading = featuredCatalog.loading;
  const newArrivalsLoading = newArrivalsCatalog.loading;
  const categories = popularCatalog.categories;
  const brands = popularCatalog.brands;
  const featuredProducts = featuredCatalog.products;
  const newArrivals = newArrivalsCatalog.products;
  const { addToCart } = useCart();
  const [banners, setBanners] = useState<WebsiteBanner[]>([]);
  const [topBanners, setTopBanners] = useState<WebsiteBanner[]>([]);
  const [middleBanners, setMiddleBanners] = useState<WebsiteBanner[]>([]);
  const [bottomBanners, setBottomBanners] = useState<WebsiteBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [brandImages, setBrandImages] = useState<Record<string, string>>({});
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const allLiveCategories = (categories || []).filter(Boolean);
  const liveCategories = allLiveCategories.slice(0, 8);
  const allLiveBrands = (brandNames.length > 0 ? brandNames : brands || []).filter(Boolean);
  const liveBrands = allLiveBrands.slice(0, 8);
  const hasMoreCategories = allLiveCategories.length > 8;
  const hasMoreBrands = allLiveBrands.length > 8;
  const allLiveFeatured = featuredProducts || [];
  const liveFeatured = allLiveFeatured.slice(0, 6);
  const liveNewArrivals = (newArrivals || []).slice(0, 6);
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
  const popularProducts = (allProducts || []).slice(0, 6);
  const offerProducts = (offersCatalog.products || []).slice(0, 6);

  const handleCategoryClick = (category: string) => {
    navigate(`/categories?category=${encodeURIComponent(category)}`);
  };

  const handleBrandClick = (brand: string) => {
    navigate(`/shop?brand=${encodeURIComponent(brand)}`);
  };

  const handleLoadMorePopular = () => {
    navigate("/shop?collection=popular");
  };

  const handleLoadMoreOffers = () => {
    navigate("/shop?offers=25");
  };

  const handleLoadMoreFeatured = () => {
    navigate("/shop?collection=featured");
  };

  const handleLoadMoreNewArrivals = () => {
    navigate("/shop?sort=newest");
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
    const safeLabel = shouldDisplayBrandLabel(label) ? formatDisplayName(label) : "";
    return (
      <div className="flex min-w-0 flex-col items-center">
        <button
          type="button"
          onClick={onClick}
          className="group flex items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
          aria-label={alt}
        >
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] ring-1 ring-slate-100 sm:h-[68px] sm:w-[68px] md:h-[110px] md:w-[110px]">
            {image ? (
              <img
                src={image}
                alt={alt}
                className="h-full w-full rounded-full object-contain p-1.5"
                loading="lazy"
              />
            ) : (
                <span className="text-[8px] font-[600] tracking-[0.12em] text-slate-500 uppercase md:text-[10px] md:tracking-[0.15em]">
                {safeLabel ? safeLabel.slice(0, 2).toUpperCase() : "NM"}
              </span>
            )}
          </div>
        </button>
        {safeLabel && (
          <p className="mt-2 w-full max-w-[78px] text-center text-[10px] font-[600] leading-[1.25] tracking-[0.05em] text-slate-700 uppercase line-clamp-2 sm:max-w-[100px] sm:text-[11.5px] md:max-w-none md:text-[12px]">
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
        if (!mounted) return;

        const top = fetchedBanners.filter((banner) => getBannerPlacementKey(banner) === "top");
        const middle = fetchedBanners.filter((banner) => getBannerPlacementKey(banner) === "middle");
        const bottom = fetchedBanners.filter((banner) => getBannerPlacementKey(banner) === "bottom");
        const hasExplicitPlacement = top.length > 0 || middle.length > 0 || bottom.length > 0;
        const fallbackTop = hasExplicitPlacement ? top : fetchedBanners;

        setBanners(fetchedBanners);
        setTopBanners(fallbackTop);
        setMiddleBanners(middle);
        setBottomBanners(bottom);
      } catch (error) {
        if (mounted) {
          setBanners([]);
          setTopBanners([]);
          setMiddleBanners([]);
          setBottomBanners([]);
        }
      } finally {
        if (mounted) {
          setLoadingBanners(false);
        }
      }
    };

    void loadBanners();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadBrandImages = async () => {
      const { data, error } = await supabase
        .from(TABLES.brands)
        .select("name, image_url, logo_url, is_active")
        .eq("is_active", true);

      if (error || !mounted) return;

      const images: Record<string, string> = {};
      const names: string[] = [];
      for (const brand of data || []) {
        const name = String(brand?.name || "").trim().toUpperCase();
        const image = resolveStorageImageUrl(brand?.image_url || brand?.logo_url, "brands");
        if (name) names.push(name);
        if (name && image) images[name] = image;
      }
      setBrandNames([...new Set(names)]);
      setBrandImages(images);
    };

    void loadBrandImages();
    const unsubscribe = subscribeToCatalogChanges((payload) => {
      if (payload.table === "brands") void loadBrandImages();
    });

    return () => {
      mounted = false;
      unsubscribe();
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

  const ProductSkeletonGrid = ({ count = 6 }: { count?: number }) => (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[290px] w-[160px] shrink-0 animate-pulse rounded-[14px] border border-slate-200 bg-white p-2 shadow-sm sm:w-[180px] md:h-[470px] md:w-auto">
          <div className="mb-2 h-[106px] rounded-[12px] bg-slate-200 md:h-[235px]" />
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
      <p className="text-[10px] font-[600] tracking-[0.12em] text-slate-500 uppercase">{text}</p>
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
        <p className="text-[9px] font-[700] tracking-[0.12em] text-[#1d5fbf] uppercase md:text-[10px]">{eyebrow}</p>
        <h2 className="mt-1 text-[1.05rem] font-[800] tracking-[-0.06em] text-slate-900 md:mt-2 md:text-2xl">{title}</h2>
      </div>
      {meta && (
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-[600] tracking-[0.12em] text-slate-600 uppercase md:flex">
          <Search className="h-3.5 w-3.5" />
          {meta}
        </div>
      )}
    </div>
  );

  const PlacementBannerCarousel = ({
    placement,
    items,
    compact = false,
  }: {
    placement: "top" | "middle" | "bottom";
    items: WebsiteBanner[];
    compact?: boolean;
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (items.length <= 1) return;
      const timer = window.setInterval(() => {
        setCurrentIndex((previous) => (previous + 1) % items.length);
      }, 5000);
      return () => window.clearInterval(timer);
    }, [items]);

    if (!items.length) return null;

    const bannerClass = compact
      ? "relative block aspect-[3/1] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      : "relative block aspect-[3.2/1] w-full overflow-hidden rounded-[22px] border border-slate-200 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)]";

    const banner = items[currentIndex] ?? items[0];

    return (
      <section className="mb-3 w-full px-3 md:mb-6 md:px-6">
        <div className="relative">
          <a
            key={`${placement}-${banner.id}`}
            href={banner.link_url || banner.banner_link || banner.whatsapp_link || "#"}
            target={banner.link_url || banner.banner_link ? "_blank" : undefined}
            rel={banner.link_url || banner.banner_link ? "noreferrer" : undefined}
            className={bannerClass}
            aria-label={banner.title || "Promotional banner"}
          >
            <img
              src={banner.image_url || ""}
              alt={banner.title || "Promotional banner"}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
            {banner.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent p-3 md:p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/80 md:text-[10px]">
                  {banner.title}
                </p>
              </div>
            )}
          </a>

          {items.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-4">
              {items.map((item, index) => (
                <button
                  key={`${placement}-dot-${item.id}`}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className="flex h-3 w-3 items-center justify-center transition-all"
                  aria-label={`Go to banner ${index + 1}`}
                >
                  <span className={`block h-1.5 rounded-full transition-all ${index === currentIndex ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/60"}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-[#dfeefd] text-slate-900">
      <Header />

      <section className="w-full relative z-0">
        <HeroBanner banners={topBanners.length > 0 ? topBanners : banners} loading={loadingBanners} />
      </section>

      <PlacementBannerCarousel placement="middle" items={middleBanners} compact={false} />
      <main className="w-full px-0 pt-0 pb-2 md:pb-8 lg:pt-0 lg:pb-8">

        <section id="categories" className="mb-3 w-full rounded-[18px] border border-[#d7ebff] bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <div className="mb-2 flex items-end justify-between gap-3 md:mb-5">
            <div className="min-w-0 flex-1">
              <SectionHeader
                eyebrow="SHOP BY CATEGORY"
                title="BROWSE CATEGORIES"
                meta={`${allLiveCategories.length} live`}
              />
            </div>
            {hasMoreCategories && (
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="mb-1 shrink-0 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] md:px-4 md:text-[10px]"
              >
                Load more categories
              </button>
            )}
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
<div className="grid grid-cols-4 gap-x-2 gap-y-5 pb-1 md:grid-cols-4 md:gap-4 lg:grid-cols-6 xl:grid-cols-8">
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

        <section className="mb-3 w-full rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <div className="mb-2 flex items-end justify-between gap-3 md:mb-5">
              <div className="min-w-0 flex-1">
                <SectionHeader eyebrow="TOP BRANDS" title="SHOP BY BRAND" />
              </div>
              {hasMoreBrands && (
                <button
                  type="button"
                  onClick={() => navigate('/brands')}
                  className="mb-1 shrink-0 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] md:px-4 md:text-[10px]"
                >
                  Load more brands
                </button>
              )}
            </div>

            {popularLoading ? (
              <div className="grid grid-cols-4 gap-x-2 gap-y-5 pb-1 md:grid-cols-4 md:gap-4 lg:grid-cols-6 xl:grid-cols-8">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex min-w-0 flex-col items-center">
                    <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200 sm:h-[68px] sm:w-[68px] md:h-[110px] md:w-[110px]" />
                    <div className="mt-2 h-3 w-16 max-w-full animate-pulse rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : liveBrands.length === 0 ? (
              <EmptySectionState text="No brands available right now" />
            ) : (
              <div className="grid grid-cols-4 gap-x-2 gap-y-5 pb-1 md:grid-cols-4 md:gap-4 lg:grid-cols-6 xl:grid-cols-8">
                {liveBrands.map((brand) => (
                  <BrandCategoryCard
                    key={brand}
                    label={brand}
                    image={brandImages[brand.toUpperCase()] || productImageByBrand[brand.toUpperCase()]}
                    alt={`${brand} brand`}
                    onClick={() => handleBrandClick(brand)}
                  />
                ))}
              </div>
            )}
        </section>

        <section className="mb-4 rounded-[28px] border border-[#d7ebff] bg-gradient-to-br from-[#edf6ff] via-white to-[#dfeefd] p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Special deals" title="HOT DEALS" />

          {offersLoading ? (
            <ProductSkeletonGrid count={6} />
          ) : offerProducts.length === 0 ? (
            <EmptySectionState text="No active offers right now" />
          ) : (
            <>
              <ProductRail products={offerProducts} onAddToCart={addToCart} />
              {offersCatalog.hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMoreOffers}
                    disabled={offersLoading}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] disabled:cursor-wait disabled:opacity-60"
                  >
                    Load More Offers
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/shop?collection=flat50")}
              className="rounded-full border border-[#bdd8ff] bg-white px-4 py-2 text-[10px] font-black uppercase text-[#0b3b78] transition hover:bg-[#eaf3ff]"
            >
              Shop 50%+ Deals
            </button>
            <button
              type="button"
              onClick={() => navigate("/shop?collection=flat33")}
              className="rounded-full border border-[#bdd8ff] bg-white px-4 py-2 text-[10px] font-black uppercase text-[#0b3b78] transition hover:bg-[#eaf3ff]"
            >
              Shop 33%+ Deals
            </button>
          </div>
        </section>

        <section id="products" className="mb-4 rounded-[18px] border border-[#d7ebff] bg-gradient-to-r from-[#edf6ff] via-white to-[#dfeefd] p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Popular picks" title="CUSTOMER FAVORITES" />

          {popularLoading ? (
            <ProductSkeletonGrid count={6} />
          ) : popularProducts.length === 0 ? (
            <EmptySectionState text="No products available right now" />
          ) : (
            <>
              <ProductRail products={popularProducts} onAddToCart={addToCart} />

              {popularCatalog.hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMorePopular}
                    disabled={popularLoading}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bdd8ff] bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#eaf3ff] hover:text-[#0b3b78] disabled:cursor-wait disabled:opacity-60"
                  >
                    Load More Products
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mb-4 rounded-[18px] border border-[#d7ebff] bg-gradient-to-r from-[#dfeefd] via-white to-[#edf6ff] p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Editor's pick" title="TOP PICKS FOR YOU" />
          {featuredLoading ? <ProductSkeletonGrid /> : liveFeatured.length === 0 ? <EmptySectionState text="No featured products right now" /> : <ProductRail products={liveFeatured} onAddToCart={addToCart} />}
          {featuredCatalog.hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMoreFeatured}
                disabled={featuredLoading}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] disabled:cursor-wait disabled:opacity-60"
              >
                Load More Top Picks For You
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        <section className="mb-4 rounded-[18px] border border-[#d7ebff] bg-gradient-to-r from-[#edf6ff] via-white to-[#dfeefd] p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Just landed" title="NEW ARRIVALS" />
          {newArrivalsLoading ? <ProductSkeletonGrid /> : liveNewArrivals.length === 0 ? <EmptySectionState text="No new arrivals right now" /> : <ProductRail products={liveNewArrivals} onAddToCart={addToCart} />}
          {newArrivalsCatalog.hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMoreNewArrivals}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff]"
              >
                View All New Arrivals
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
      </main>

      <PlacementBannerCarousel placement="bottom" items={bottomBanners} compact />
      <Footer />
    </div>
  );
}

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
import type { Product } from "@/lib/store-utils";
import type { WebsiteBanner } from "@/lib/supabase";

export default function HomePage() {
  const navigate = useNavigate();
  const popularCatalog = useProductCatalog({ pageSize: 8 });
  const offersCatalog = useProductCatalog({ pageSize: 8, offersOnly: true });
  const featuredCatalog = useProductCatalog({ pageSize: 8, featuredOnly: true });
  const flat50Catalog = useProductCatalog({ pageSize: 8, minDiscount: 50 });
  const flat33Catalog = useProductCatalog({ pageSize: 8, minDiscount: 33, maxDiscount: 50 });
  const allProducts = popularCatalog.products;
  const popularLoading = popularCatalog.loading;
  const offersLoading = offersCatalog.loading;
  const featuredLoading = featuredCatalog.loading;
  const flat50Loading = flat50Catalog.loading;
  const flat33Loading = flat33Catalog.loading;
  const categories = popularCatalog.categories;
  const brands = popularCatalog.brands;
  const hasMore = popularCatalog.hasMore;
  const featuredProducts = featuredCatalog.products;
  const flat50 = flat50Catalog.products;
  const flat33 = flat33Catalog.products;
  const hasMore50 = flat50Catalog.hasMore;
  const hasMore33 = flat33Catalog.hasMore;
  const hasMoreFeatured = featuredCatalog.hasMore;
  const { addToCart } = useCart();
  const [banners, setBanners] = useState<WebsiteBanner[]>([]);
  const [topBanners, setTopBanners] = useState<WebsiteBanner[]>([]);
  const [middleBanners, setMiddleBanners] = useState<WebsiteBanner[]>([]);
  const [bottomBanners, setBottomBanners] = useState<WebsiteBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [visiblePopularCount, setVisiblePopularCount] = useState(8);
  const [visibleOfferCount, setVisibleOfferCount] = useState(8);
  const [visibleFeaturedCount, setVisibleFeaturedCount] = useState(8);
  const [visibleFlat50Count, setVisibleFlat50Count] = useState(8);
  const [visibleFlat33Count, setVisibleFlat33Count] = useState(8);
  const [visibleCategoryCount] = useState(12);
  const [visibleBrandCount] = useState(12);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [brandImages, setBrandImages] = useState<Record<string, string>>({});
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const allLiveCategories = (categories || []).filter(Boolean);
  const liveCategories = allLiveCategories.slice(0, visibleCategoryCount);
  const allLiveBrands = (brandNames.length > 0 ? brandNames : brands || []).filter(Boolean);
  const liveBrands = allLiveBrands.slice(0, visibleBrandCount);
  const hasMoreCategories = allLiveCategories.length > visibleCategoryCount;
  const hasMoreBrands = allLiveBrands.length > visibleBrandCount;
  const allLiveFeatured = (featuredProducts || []).filter((p: Product) => Number(p.stock) > 0);
  const allLiveFlat50 = (flat50 || []).filter((p: Product) => Number(p.stock) > 0);
  const allLiveFlat33 = (flat33 || []).filter((p: Product) => Number(p.stock) > 0);
  const liveFeatured = allLiveFeatured.slice(0, visibleFeaturedCount);
  const liveFlat50 = allLiveFlat50.slice(0, visibleFlat50Count);
  const liveFlat33 = allLiveFlat33.slice(0, visibleFlat33Count);
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
  const allOfferProducts = offersCatalog.products;
  const offerProducts = allOfferProducts.slice(0, visibleOfferCount);

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

  const handleLoadMoreFlat50 = () => {
    navigate("/shop?collection=flat50");
  };

  const handleLoadMoreFlat33 = () => {
    navigate("/shop?collection=flat33");
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
      <div className="flex w-[72px] shrink-0 flex-col items-center sm:w-[84px] md:w-auto md:flex-1">
        <button
          type="button"
          onClick={onClick}
          className="group flex items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
          aria-label={alt}
        >
          <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] ring-1 ring-slate-100 sm:h-[76px] sm:w-[76px] md:h-[110px] md:w-[110px]">
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
          <p className="mt-2 max-w-[92px] text-center text-[11px] font-[600] leading-[1.25] tracking-[0.08em] text-slate-700 uppercase line-clamp-2 sm:max-w-[100px] sm:text-[11.5px] md:max-w-none md:text-[12px]">
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

        setBanners(fetchedBanners);
        setTopBanners(top.length > 0 ? top : fetchedBanners.slice(0, 1));
        setMiddleBanners(middle.length > 0 ? middle : fetchedBanners.filter((banner) => banner.id !== top[0]?.id).slice(0, 2));
        setBottomBanners(bottom.length > 0 ? bottom : fetchedBanners.filter((banner) => banner.id !== top[0]?.id && !middle.some((item) => item.id === banner.id)).slice(0, 2));
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

  const ProductSkeletonGrid = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
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

  const renderBannerPlacement = (
    placement: "top" | "middle" | "bottom",
    items: WebsiteBanner[],
    compact = false,
  ) => {
    if (!items.length) return null;

    const bannerClass = compact
      ? "relative block aspect-[3/1] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      : "relative block aspect-[3.2/1] w-full overflow-hidden rounded-[22px] border border-slate-200 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)]";

    return (
      <section className="mb-3 w-full px-3 md:mb-6 md:px-6">
        <div className="space-y-3">
          {items.map((banner) => (
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
          ))}
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

      {renderBannerPlacement("middle", middleBanners, false)}
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
          <section className="mb-3 w-full rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <div className="mb-2 flex items-end justify-between gap-3 md:mb-5">
              <div className="min-w-0 flex-1">
                <SectionHeader eyebrow="TOP BRANDS" title="BRANDS " />
              </div>
              {hasMoreBrands && (
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="mb-1 shrink-0 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] md:px-4 md:text-[10px]"
                >
                  Load more brands
                </button>
              )}
            </div>

            {popularLoading ? (
              <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex w-[92px] shrink-0 flex-col items-center sm:w-[100px] md:w-auto md:flex-1 md:items-stretch md:rounded-[22px] md:border md:border-slate-200 md:bg-slate-50 md:p-4">
                    <div className="animate-pulse h-[88px] w-[88px] rounded-full bg-slate-200 sm:h-[90px] sm:w-[90px] md:h-[110px] md:w-[110px] md:rounded-2xl" />
                    <div className="mt-2 h-3 w-20 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <<div className="hide-scrollbar grid grid-cols-3 gap-x-2.5 gap-y-6 pb-1 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
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
        )}

        {liveFeatured.length > 0 && !featuredLoading && (
          <section className="mb-4 rounded-[18px] border border-[#d7ebff] bg-gradient-to-r from-[#dfeefd] via-white to-[#edf6ff] p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <SectionHeader eyebrow="Editor's pick" title="TOP PICKS FOR YOU" />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {liveFeatured.map((product: Product) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
            {(liveFeatured.length < allLiveFeatured.length || hasMoreFeatured) && (
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
        )}

        <section id="products" className="mb-4 rounded-[18px] border border-[#d7ebff] bg-gradient-to-r from-[#edf6ff] via-white to-[#dfeefd] p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Popular picks" title="CUSTOMER FAVORITES" />

          {popularLoading ? (
            <ProductSkeletonGrid count={8} />
          ) : popularProducts.length === 0 ? (
            <EmptySectionState text="No products available right now" />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
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
                    disabled={popularLoading}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bdd8ff] bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#eaf3ff] hover:text-[#0b3b78] disabled:cursor-wait disabled:opacity-60"
                  >
                    {popularLoading ? "Loading Products" : "Load More Products"}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mb-4 rounded-[28px] border border-[#d7ebff] bg-gradient-to-br from-[#edf6ff] via-white to-[#dfeefd] p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
          <SectionHeader eyebrow="Special deals" title="HOT DEALS" />

          {offersLoading ? (
            <ProductSkeletonGrid count={4} />
          ) : offerProducts.length === 0 ? (
            <EmptySectionState text="No active offers right now" />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
                {offerProducts.map((product) => (
                  <ProductCard
                    key={product.id || product.barcode}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
              {(visibleOfferCount < allOfferProducts.length || hasMore) && (
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
        </section>

        {liveFlat50.length > 0 && !flat50Loading && (
          <section className="mb-4 rounded-[18px] border border-red-200 bg-gradient-to-r from-red-50 via-white to-rose-50 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <SectionHeader eyebrow="Big Savings" title="FLAT 50% OFF" />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {liveFlat50.map((product: Product) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
            {(liveFlat50.length < allLiveFlat50.length || hasMore50) && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMoreFlat50}
                  disabled={flat50Loading}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] disabled:cursor-wait disabled:opacity-60"
                >
                  Load More 50% Deals
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {liveFlat33.length > 0 && !flat33Loading && (
          <section className="mb-4 rounded-[18px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50 p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:mb-8 md:p-6">
            <SectionHeader eyebrow="Great Value" title="UP TO 33% OFF" />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {liveFlat33.map((product: Product) => (
                <ProductCard
                  key={product.id || product.barcode}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
            {(liveFlat33.length < allLiveFlat33.length || hasMore33) && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMoreFlat33}
                  disabled={flat33Loading}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b3b78] shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] disabled:cursor-wait disabled:opacity-60"
                >
                  Load More 33% Deals
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {renderBannerPlacement("bottom", bottomBanners, true)}
      <Footer />
    </div>
  );
}

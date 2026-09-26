import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductCatalog } from "@/hooks/useProductCatalog";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/shop/Header";
import HeroBanner from "@/components/shop/HeroBanner";
import ProductCard from "@/components/shop/ProductCard";
import { fetchActiveBanners, getBannerPlacementKey } from "@/lib/supabase";
import { supabase } from "@/lib/supabase/client";
import { subscribeToCatalogChanges } from "@/lib/supabase/realtime";
import { TABLES } from "@/lib/supabase/schema";
import { resolveStorageImageUrl } from "@/lib/supabase/productImagesStorage";
import type { Product } from "@/lib/store-utils";
import type { WebsiteBanner } from "@/lib/supabase";

const homeProductLimit = 6;

type ImageLabelCardProps = {
  label: string;
  image?: string;
  onClick: () => void;
};

function ImageLabelCard({ label, image, onClick }: ImageLabelCardProps) {
  return (
    <button type="button" onClick={onClick} className="group flex min-w-0 flex-col items-center gap-2 text-center">
      <span className="flex aspect-square w-full max-w-[74px] items-center justify-center overflow-hidden rounded-full border border-[#D7E8FF] bg-white p-2 shadow-[0_8px_22px_-18px_rgba(29,95,191,0.65)] transition group-hover:border-[#1D5FBF] group-hover:shadow-md">
        {image ? (
          <img src={image} alt="" loading="lazy" className="h-full w-full rounded-full object-contain" />
        ) : (
          <span className="text-xs font-extrabold tracking-[0.12em] text-[#1D5FBF]">{label.slice(0, 2).toUpperCase()}</span>
        )}
      </span>
      <span className="line-clamp-2 text-[10px] font-bold leading-tight text-slate-700">{label}</span>
    </button>
  );
}

function SectionHeader({ title, onViewAll }: { title: string; onViewAll: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[1.05rem] font-extrabold tracking-[-0.03em] text-slate-900 md:text-2xl">{title}</h2>
      <button type="button" onClick={onViewAll} className="inline-flex shrink-0 items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#1D5FBF] hover:text-[#0B3B78]">
        View All
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ProductRail({ products, loading, onAddToCart }: { products: Product[]; loading: boolean; onAddToCart: (product: Product) => void }) {
  if (loading) {
    return (
      <div className="grid auto-cols-[calc((100%-0.5rem)/2)] grid-flow-col gap-2 overflow-hidden md:auto-cols-[calc((100%-1.5rem)/4)] md:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[250px] animate-pulse rounded-[14px] border border-slate-200 bg-white p-2">
            <div className="h-[132px] rounded-xl bg-slate-200" />
            <div className="mt-3 h-3 w-4/5 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-2/5 rounded bg-slate-200" />
            <div className="mt-5 h-9 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[#C9DFFF] bg-[#F7FBFF] text-xs font-semibold text-slate-500">No products available right now</div>;
  }

  return (
    <div className="hide-scrollbar grid auto-cols-[calc((100%-0.5rem)/2)] grid-flow-col gap-2 overflow-x-auto overscroll-x-contain pb-1 md:auto-cols-[calc((100%-1.5rem)/4)] md:gap-4">
      {products.slice(0, homeProductLimit).map((product) => (
        <ProductCard key={product.id || product.barcode} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const popularCatalog = useProductCatalog({ pageSize: homeProductLimit });
  const dealsCatalog = useProductCatalog({ pageSize: homeProductLimit, offersOnly: true });
  const favoritesCatalog = useProductCatalog({ pageSize: homeProductLimit, featuredOnly: true });
  const newArrivalsCatalog = useProductCatalog({ pageSize: homeProductLimit, sort: "newest" });
  const [banners, setBanners] = useState<WebsiteBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [brandImages, setBrandImages] = useState<Record<string, string>>({});
  const [brandNames, setBrandNames] = useState<string[]>([]);

  const products = popularCatalog.products;
  const categories = popularCatalog.categories.filter(Boolean).slice(0, 8);
  const brands = (brandNames.length > 0 ? brandNames : popularCatalog.brands).filter(Boolean).slice(0, 8);
  const productImageByCategory = useMemo(() => Object.fromEntries(products.filter((product) => product.imageUrl).map((product) => [product.category.toUpperCase(), product.imageUrl])), [products]);
  const productImageByBrand = useMemo(() => Object.fromEntries(products.filter((product) => product.imageUrl).map((product) => [product.brand.toUpperCase(), product.imageUrl])), [products]);

  useEffect(() => {
    let mounted = true;
    void fetchActiveBanners().then((items) => {
      if (!mounted) return;
      const topBanners = items.filter((banner) => getBannerPlacementKey(banner) === "top");
      setBanners(topBanners.length > 0 ? topBanners : items);
    }).finally(() => {
      if (mounted) setLoadingBanners(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBrandImages = async () => {
      const { data, error } = await supabase.from(TABLES.brands).select("name, image_url, logo_url, is_active").eq("is_active", true);
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
    return () => { mounted = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCategoryImages = async () => {
      const { data, error } = await supabase.from(TABLES.categories).select("name, image_url, is_active").eq("is_active", true);
      if (error || !mounted) return;
      const images: Record<string, string> = {};
      for (const category of data || []) {
        const name = String(category?.name || "").trim().toUpperCase();
        const image = resolveStorageImageUrl(category?.image_url, "categories");
        if (name && image) images[name] = image;
      }
      setCategoryImages(images);
    };
    void loadCategoryImages();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-[#F4F8FF] text-slate-900">
      <Header />
      <section className="relative z-0 w-full">
        <HeroBanner banners={banners} loading={loadingBanners} />
      </section>

      <main className="mx-auto w-full max-w-7xl space-y-3 px-3 pb-4 pt-3 md:space-y-6 md:px-6 md:pb-10 md:pt-6">
        <section className="rounded-2xl border border-[#D7E8FF] bg-white p-4 md:p-6">
          <SectionHeader title="BROWSE CATEGORIES" onViewAll={() => navigate("/categories")} />
          {categories.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center gap-2 text-xs font-semibold text-slate-500"><LayoutGrid className="h-4 w-4" /> No categories available</div>
          ) : (
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 md:grid-cols-8 md:gap-5">
              {categories.map((category) => <ImageLabelCard key={category} label={category} image={categoryImages[category.toUpperCase()] || productImageByCategory[category.toUpperCase()]} onClick={() => navigate(`/categories?category=${encodeURIComponent(category)}`)} />)}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#D7E8FF] bg-white p-4 md:p-6">
          <SectionHeader title="SHOP BY BRAND" onViewAll={() => navigate("/brands")} />
          {brands.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center text-xs font-semibold text-slate-500">No brands available</div>
          ) : (
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 md:grid-cols-8 md:gap-5">
              {brands.map((brand) => <ImageLabelCard key={brand} label={brand} image={brandImages[brand.toUpperCase()] || productImageByBrand[brand.toUpperCase()]} onClick={() => navigate(`/shop?brand=${encodeURIComponent(brand)}`)} />)}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#D7E8FF] bg-white p-4 md:p-6">
          <SectionHeader title="HOT DEALS" onViewAll={() => navigate("/shop?offers=25")} />
          <ProductRail products={dealsCatalog.products} loading={dealsCatalog.loading} onAddToCart={addToCart} />
        </section>

        <section className="rounded-2xl border border-[#D7E8FF] bg-white p-4 md:p-6">
          <SectionHeader title="CUSTOMER FAVORITES" onViewAll={() => navigate("/shop?collection=featured")} />
          <ProductRail products={favoritesCatalog.products} loading={favoritesCatalog.loading} onAddToCart={addToCart} />
        </section>

        <section className="rounded-2xl border border-[#D7E8FF] bg-white p-4 md:p-6">
          <SectionHeader title="TOP PICKS FOR YOU" onViewAll={() => navigate("/shop?collection=popular")} />
          <ProductRail products={popularCatalog.products} loading={popularCatalog.loading} onAddToCart={addToCart} />
        </section>

        <section className="rounded-2xl border border-[#D7E8FF] bg-white p-4 md:p-6">
          <SectionHeader title="NEW ARRIVALS" onViewAll={() => navigate("/shop?sort=newest")} />
          <ProductRail products={newArrivalsCatalog.products} loading={newArrivalsCatalog.loading} onAddToCart={addToCart} />
        </section>
      </main>
    </div>
  );
}

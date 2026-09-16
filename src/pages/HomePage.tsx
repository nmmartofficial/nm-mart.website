import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, ChevronRight, ChevronDown, LayoutGrid, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Store, Truck } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/shop/Header";
import HeroBanner from "@/components/shop/HeroBanner";
import ProductCard from "@/components/shop/ProductCard";
import Footer from "@/components/shop/Footer";
import { fetchActiveBanners } from "@/lib/supabase";

const benefitItems = [
  { icon: Truck, title: "Track your order", description: "Use the live order tracker to check your order status and delivery progress.", to: "/tracker" },
  { icon: ShoppingBag, title: "Checkout flow", description: "Complete purchases through the existing checkout process built into the store.", to: "/checkout" },
  { icon: ShieldCheck, title: "Account access", description: "Sign in and manage your profile details from the customer account area.", to: "/profile" },
  { icon: Store, title: "Support", description: "Reach out through the contact page for store assistance and customer support.", to: "/contact" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { allProducts, loading: productsLoading, categories, brands } = useProducts();
  const { addToCart } = useCart();
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const liveCategories = (categories || []).filter(Boolean).slice(0, 8);
  const liveBrands = (brands || []).filter(Boolean).slice(0, 12);
  const featuredProducts = (allProducts || []).filter((product) => Number(product.stock) > 0).slice(0, 8);
  const offerProducts = (allProducts || [])
    .filter((product) => Number(product.stock) > 0 && Number(product.discount) > 0)
    .sort((a, b) => Number(b.discount) - Number(a.discount))
    .slice(0, 4);

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  const handleBrandClick = (brand: string) => {
    navigate(`/shop?brand=${encodeURIComponent(brand)}`);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="hidden items-center gap-2 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              Home
            </NavLink>

            {liveCategories.length > 0 ? (
              <div className="group relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Categories
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                <div className="invisible absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_18px_40px_-25px_rgba(15,23,42,0.35)] transition duration-200 group-hover:visible group-hover:opacity-100">
                  {liveCategories.slice(0, 8).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                disabled
              >
                Categories
              </button>
            )}

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              Contact
            </NavLink>

            <NavLink
              to="/tracker"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              Tracker
            </NavLink>

            <NavLink
              to="/checkout"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              Checkout
            </NavLink>
          </div>

          <div className="flex w-full items-center gap-2 overflow-x-auto md:hidden">
            <NavLink
              to="/"
              className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Contact
            </NavLink>
            <NavLink
              to="/tracker"
              className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Tracker
            </NavLink>
          </div>
        </div>
      </nav>

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
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm transition group-hover:scale-105 group-hover:text-orange-600">
                    <LayoutGrid className="h-5 w-5" />
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 h-40 rounded-[20px] bg-slate-200" />
                  <div className="mb-2 h-3 w-20 rounded-full bg-slate-200" />
                  <div className="mb-4 h-4 w-32 rounded-full bg-slate-200" />
                  <div className="mb-4 h-3 w-12 rounded-full bg-orange-100" />
                  <div className="h-10 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-white/60">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">No products available right now</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.map((product) => (
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
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Special deals</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.06em] text-slate-900">Special Offers</h2>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm">
                    {brand.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">{brand}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-[28px] bg-slate-900 p-5 text-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.9)] md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">Benefits</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.06em] text-white">Why Shop With NM Mart?</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefitItems.map(({ icon: Icon, title, description, to }) => {
              const content = (
                <>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-black uppercase tracking-[-0.05em] text-white">{title}</h3>
                  <p className="text-sm leading-6 text-slate-300">{description}</p>
                </>
              );

              if (to) {
                return (
                  <NavLink
                    key={title}
                    to={to}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-5 transition hover:border-orange-300/70 hover:bg-white/10"
                  >
                    {content}
                  </NavLink>
                );
              }

              return (
                <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

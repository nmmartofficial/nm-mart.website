import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "@/lib/supabase/schema";
import { resolveStorageImageUrl } from "@/lib/supabase/productImagesStorage";
import { subscribeToCatalogChanges } from "@/lib/supabase/realtime";

type Brand = {
  name: string;
  image?: string;
};

const BrandsPage = () => {
  const navigate = useNavigate();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadBrands = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from(TABLES.brands)
        .select("name, image_url, logo_url, is_active")
        .eq("is_active", true);

      if (!mounted) return;

      if (error) {
        console.error("Unable to load brands:", error);
        setBrands([]);
        setLoading(false);
        return;
      }

      const brandMap = new Map<string, Brand>();

      for (const brand of data || []) {
        const name = String(brand?.name || "").trim();

        if (!name) continue;

        const image = resolveStorageImageUrl(
          brand?.image_url || brand?.logo_url,
          "brands",
        );

        const key = name.toUpperCase();

        if (!brandMap.has(key)) {
          brandMap.set(key, {
            name,
            image: image || undefined,
          });
        }
      }

      const sortedBrands = [...brandMap.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      setBrands(sortedBrands);
      setLoading(false);
    };

    void loadBrands();

    const unsubscribe = subscribeToCatalogChanges((payload) => {
      if (payload.table === "brands") {
        void loadBrands();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleBrandClick = (brand: string) => {
    navigate(`/shop?brand=${encodeURIComponent(brand)}`);
  };

  return (
    <div className="min-h-screen bg-[#dfeefd] text-slate-900">
      <Header />

      <main className="w-full px-3 py-4 md:px-6 md:py-8">
        <section className="mx-auto w-full max-w-7xl rounded-[22px] border border-[#d7ebff] bg-white p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] md:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-3 md:mb-8">
            <div className="min-w-0">
              <p className="text-[9px] font-[700] tracking-[0.14em] text-[#1d5fbf] uppercase md:text-[10px]">
                TOP BRANDS
              </p>

              <h1 className="mt-1 text-[1.35rem] font-[800] tracking-[-0.06em] text-slate-900 md:mt-2 md:text-3xl">
                BRANDS
              </h1>

              {!loading && brands.length > 0 && (
                <p className="mt-1 text-[9px] font-[600] tracking-[0.12em] text-slate-400 uppercase md:text-[10px]">
                  {brands.length} brands available
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#bdd8ff] bg-[#eaf3ff] px-3 py-2 text-[9px] font-[700] tracking-[0.12em] text-[#0b3b78] uppercase shadow-sm transition hover:border-[#1677e8] hover:bg-[#d8ebff] md:px-4 md:text-[10px]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {Array.from({ length: 21 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-w-0 flex-col items-center"
                >
                  <div className="h-[82px] w-[82px] animate-pulse rounded-full bg-slate-200 sm:h-[90px] sm:w-[90px] md:h-[105px] md:w-[105px]" />

                  <div className="mt-3 h-3 w-16 animate-pulse rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : brands.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50">
              <p className="text-[10px] font-[700] tracking-[0.16em] text-slate-500 uppercase">
                No brands available right now
              </p>
            </div>
          ) : (
            /* Brands */
            <div className="grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 md:grid-cols-5 md:gap-x-5 md:gap-y-10 lg:grid-cols-6 xl:grid-cols-7">
              {brands.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => handleBrandClick(brand.name)}
                  className="group flex min-w-0 flex-col items-center"
                  aria-label={`View ${brand.name} products`}
                >
                  {/* Brand Circle */}
                  <div className="flex h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_25px_-16px_rgba(15,23,42,0.5)] ring-1 ring-slate-100 transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-md sm:h-[90px] sm:w-[90px] md:h-[105px] md:w-[105px] lg:h-[110px] lg:w-[110px]">
                    {brand.image ? (
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="h-full w-full rounded-full object-contain p-1.5"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm font-[800] tracking-[0.08em] text-slate-500">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Brand Name */}
                  <p className="mt-2.5 w-full max-w-[105px] text-center text-[10px] font-[700] leading-[1.25] tracking-[0.08em] text-slate-700 uppercase sm:text-[11px] md:max-w-[125px] md:text-[12px]">
                    {brand.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BrandsPage;
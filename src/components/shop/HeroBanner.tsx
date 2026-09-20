import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";
import type { WebsiteBanner } from "@/lib/supabase";

interface HeroBannerProps {
  onBannerClick?: (link: { type: string; value: string }) => void;
  banners?: WebsiteBanner[];
  loading?: boolean;
}

const HeroBanner = ({ onBannerClick: _onBannerClick, banners: incomingBanners = [], loading = false }: HeroBannerProps) => {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const banners = useMemo(
    () => [...incomingBanners].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [incomingBanners]
  );

  const next = useCallback(() => {
    if (banners.length === 0) return;
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    if (banners.length === 0) return;
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, banners.length]);

  useEffect(() => {
    if (current > banners.length - 1) setCurrent(0);
  }, [banners.length, current]);

  if (loading) {
    return (
      <div className="flex w-full animate-pulse items-center justify-center bg-transparent py-0">
        <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-300">Loading Offers...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex w-full items-center justify-center bg-transparent py-0">
        <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
          NM Mart • Coming Soon
        </p>
      </div>
    );
  }

  const banner = banners[current];
  const bannerImage = banner?.image_url || "";

  return (
    <div className="w-full">
      <div className="group/banner relative w-full bg-transparent">
        <Link
          to={{ pathname: "/", hash: "products" }}
          className="relative block w-full cursor-pointer focus:outline-none"
          aria-label={banner.title ? `View products: ${banner.title}` : "View products"}
        >
          <img
            src={bannerImage}
            alt={banner.title || "Promotion Banner"}
            decoding="sync"
            className="block w-full h-auto antialiased"
            style={{
              imageRendering: 'auto',
              display: 'block',
              width: '100%'
            }}
          />
        </Link>

        {/* Pagination Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-4">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrent(i);
                }}
                className={`flex h-3 w-3 items-center justify-center transition-all ${i === current ? "scale-110" : "scale-100 opacity-60"}`}
                aria-label={`Go to banner ${i + 1}`}
              >
                <span className={`block h-1.5 w-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white shadow-sm" : "bg-white/60"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;

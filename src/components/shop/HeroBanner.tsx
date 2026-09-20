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

  const bannerRadiusPx = Number(theme.bannerRadius) || 0;
  const radiusStyle = bannerRadiusPx > 0 ? { borderRadius: `${bannerRadiusPx}px` } : undefined;
  const radiusClass = bannerRadiusPx > 0 ? "" : "md:rounded-[32px]";

  if (loading) {
    return (
      <div
        className={`mx-auto flex h-40 w-full max-w-7xl animate-pulse items-center justify-center overflow-hidden bg-slate-100/50 md:h-[400px] ${radiusClass}`}
        style={radiusStyle}
      >
        <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-300">Loading Offers...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div
        className={`mx-auto flex h-32 w-full max-w-7xl items-center justify-center overflow-hidden border border-slate-100 bg-slate-50 md:h-[200px] ${radiusClass}`}
        style={radiusStyle}
      >
        <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
          NM Mart • Coming Soon
        </p>
      </div>
    );
  }

  const banner = banners[current];
  const bannerImage = banner?.image_url || "";

  const imageClass =
    "block aspect-square w-full object-cover object-center transition-transform duration-500 ease-out group-hover/banner:scale-[1.01] antialiased md:aspect-[16/7] md:h-auto";

  return (
    <div className="flex w-full justify-center px-0">
      <div
        className={`group/banner relative w-full max-w-[1400px] overflow-hidden border-0 bg-white shadow-none transition-all duration-500 ${radiusClass}`}
        style={radiusStyle}
      >
        <Link
          to={{ pathname: "/", hash: "products" }}
          className="relative block w-full cursor-pointer overflow-hidden focus:outline-none"
          aria-label={banner.title ? `View products: ${banner.title}` : "View products"}
        >
          <img
            src={bannerImage}
            alt={banner.title || "Promotion Banner"}
            decoding="sync"
            className={imageClass}
            style={{
              imageRendering: 'auto',
              display: 'block'
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
                <span className={`block rounded-full transition-all ${i === current ? "h-2 w-6 bg-white shadow-sm" : "h-2 w-2 bg-white/60"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;

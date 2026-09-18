import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";

interface HeroBannerProps {
  onBannerClick?: (link: { type: string; value: string }) => void;
  banners?: any[];
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

  // Intelligent desktop scaling while preserving integrity
  const imageClass =
    "block h-auto w-full max-h-[75vh] md:max-h-[560px] md:min-w-[500px] object-contain transition-transform duration-500 ease-out group-hover/banner:scale-[1.01] antialiased mx-auto";

  return (
    <div className="flex w-full justify-center px-0 md:px-0">
      <div
        className={`group/banner relative w-full md:w-auto md:min-w-[600px] max-w-7xl overflow-hidden border border-slate-100 bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)] transition-all duration-500 ${radiusClass}`}
        style={radiusStyle}
      >
        <Link
          to={{ pathname: "/", hash: "products" }}
          className="relative block cursor-pointer overflow-hidden focus:outline-none"
          aria-label={banner.title ? `View products: ${banner.title}` : "View products"}
        >
          <img
            src={bannerImage}
            alt={banner.title || "Promotion Banner"}
            decoding="sync"
            fetchPriority="high"
            className={imageClass}
            style={{
              imageRendering: 'auto',
              display: 'block'
            }}
          />
        </Link>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                prev();
              }}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 shadow-lg backdrop-blur-md transition-all hover:bg-white/40 group-hover/banner:opacity-100 focus-visible:opacity-100 md:left-5 md:p-3"
              aria-label="Previous banner"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                next();
              }}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 shadow-lg backdrop-blur-md transition-all hover:bg-white/40 group-hover/banner:opacity-100 focus-visible:opacity-100 md:right-5 md:p-3"
              aria-label="Next banner"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2.5 md:bottom-6">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrent(i);
                  }}
                  className={`flex h-4 w-4 items-center justify-center transition-all ${i === current ? "scale-110" : "scale-100 opacity-60"}`}
                  aria-label={`Go to banner ${i + 1}`}
                >
                  <span className={`block rounded-full transition-all ${i === current ? "h-2 w-8 bg-white shadow-sm" : "h-2 w-2 bg-white/50"}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;

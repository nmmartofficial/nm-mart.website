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
        className={`flex w-full aspect-[16/7] animate-pulse items-center justify-center overflow-hidden bg-gray-100 md:aspect-[3/1] md:max-h-[320px] ${radiusClass}`}
        style={radiusStyle}
      >
        <p className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">Loading Banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div
        className={`flex w-full aspect-[16/7] items-center justify-center overflow-hidden border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-yellow-50 md:aspect-[3/1] md:max-h-[320px] ${bannerRadiusPx > 0 ? "" : `rounded-[32px] ${radiusClass}`}`}
        style={radiusStyle}
      >
        <p className="text-[10px] font-black uppercase italic tracking-widest text-orange-400">
          No offers right now
        </p>
      </div>
    );
  }

  const banner = banners[current];
  const bannerImage = banner?.image_url || "";
  const textPositionClass =
    theme.bannerTextPosition === "center"
      ? "items-center text-center"
      : theme.bannerTextPosition === "right"
        ? "items-end text-right"
        : "items-start text-left";
  const imageLinkClass =
    "absolute inset-0 z-0 block cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80";

  const imageClass =
    "h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover/banner:scale-[1.01]";

  const mediaShellClass =
    "relative aspect-[16/7] w-full overflow-hidden bg-gray-100 md:aspect-[3/1] md:max-h-[320px]";

  return (
    <div className="w-full px-0 md:px-0">
      <div
        className={`group/banner relative w-full overflow-hidden border border-[#f1e7dd] bg-[#f7f2ea] shadow-[0_24px_70px_-35px_rgba(15,23,42,0.4)] ${radiusClass}`}
        style={radiusStyle}
      >
        <div className={mediaShellClass}>
          <Link
            to={{ pathname: "/", hash: "products" }}
            className={imageLinkClass}
            aria-label={banner.title ? `View products: ${banner.title}` : "View products"}
          >
            <img src={bannerImage} alt="" decoding="async" className={imageClass} />
          </Link>

          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#151515]/75 via-[#151515]/30 to-transparent" />

          <div
            className={`absolute inset-0 z-[2] flex p-6 md:p-10 ${textPositionClass}`}
          >
            <div className="max-w-xl text-white">
              <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
                NM Mart
              </span>
              {banner.title && (
                <h3 className="mt-4 text-2xl font-black uppercase leading-[0.95] tracking-[-0.05em] drop-shadow-md md:text-5xl">
                  {banner.title}
                </h3>
              )}
              {banner.subtitle && (
                <p className="mt-3 max-w-md text-xs font-semibold uppercase tracking-[0.18em] text-white/80 md:text-sm">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="hidden md:inline-flex absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-white/40 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover/banner:opacity-100"
          aria-label="Previous banner"
        >
          <ChevronLeft size={22} className="text-white" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="hidden md:inline-flex absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-white/40 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover/banner:opacity-100"
          aria-label="Next banner"
        >
          <ChevronRight size={22} className="text-white" />
        </button>

        <div className="absolute bottom-3 md:bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 md:gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`flex min-h-8 min-w-8 md:min-h-11 md:min-w-11 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${i === current ? "bg-white/10" : "bg-transparent"}`}
              aria-label={`Go to banner ${i + 1}`}
            ><span aria-hidden="true" className={`block h-1.5 rounded-full ${i === current ? "w-6 md:w-8 bg-white shadow-sm" : "w-1.5 md:w-2 bg-white/40"}`} /></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";

interface HeroBannerProps {
  onBannerClick?: (link: { type: string; value: string }) => void;
  banners?: any[];
  loading?: boolean;
}

const DEFAULT_PRODUCTS_HASH = "products";

type BannerTarget =
  | { mode: "router"; to: string; hash?: string }
  | { mode: "external"; href: string };

function resolveBannerTarget(banner: any): BannerTarget {
  const raw = String(banner?.banner_link ?? banner?.link ?? "").trim();
  if (!raw) {
    return { mode: "router", to: "/", hash: DEFAULT_PRODUCTS_HASH };
  }
  if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw) || /^tel:/i.test(raw)) {
    return { mode: "external", href: raw };
  }
  if (raw.startsWith("#")) {
    const hash = raw.slice(1) || DEFAULT_PRODUCTS_HASH;
    return { mode: "router", to: "/", hash };
  }
  if (raw.startsWith("/")) {
    const hashIdx = raw.indexOf("#");
    if (hashIdx !== -1) {
      const path = raw.slice(0, hashIdx) || "/";
      const hash = raw.slice(hashIdx + 1) || undefined;
      return { mode: "router", to: path, hash };
    }
    return { mode: "router", to: raw };
  }
  if (/^www\./i.test(raw)) {
    return { mode: "external", href: `https://${raw}` };
  }
  return { mode: "router", to: `/${raw.replace(/^\/+/, "")}` };
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
        className={`w-full aspect-[21/9] bg-gray-100 animate-pulse flex items-center justify-center md:aspect-auto md:max-h-[400px] md:overflow-hidden ${radiusClass}`}
        style={radiusStyle}
      >
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Loading Banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div
        className={`w-full aspect-[21/9] bg-gradient-to-br from-orange-50 via-white to-yellow-50 border border-orange-100 flex items-center justify-center md:aspect-auto md:max-h-[400px] md:overflow-hidden ${bannerRadiusPx > 0 ? "" : `rounded-[32px] ${radiusClass}`}`}
        style={radiusStyle}
      >
        <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest italic">
          No offers right now
        </p>
      </div>
    );
  }

  const banner = banners[current];
  const bannerImage =
    banner?.image_url ||
    "https://images.unsplash.com/photo-1584473457409-ceb6b7d6a0b5?auto=format&fit=crop&w=1400&q=80";
  const textPositionClass =
    theme.bannerTextPosition === "center"
      ? "items-center text-center"
      : theme.bannerTextPosition === "right"
        ? "items-end text-right"
        : "items-start text-left";
  const ctaClass =
    theme.bannerCtaStyle === "outline"
      ? "bg-white/10 border-2 border-white text-white"
      : theme.bannerCtaStyle === "pill"
        ? "bg-green-500 text-white rounded-full px-7"
        : "bg-green-500 text-white";

  const target = resolveBannerTarget(banner);

  const imageLinkClass =
    "absolute inset-0 z-0 block cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80";

  const imageClass =
    "h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover/banner:scale-[1.01]";

  const mediaShellClass =
    "relative aspect-[21/9] w-full overflow-hidden bg-gray-100 md:aspect-auto md:max-h-[400px] md:min-h-[200px]";

  return (
    <div
      className={`group/banner relative w-full overflow-hidden ${radiusClass}`}
      style={radiusStyle}
    >
      <div className={mediaShellClass}>
        {target.mode === "external" ? (
          <a
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            className={imageLinkClass}
            aria-label={banner.title ? `Open offer: ${banner.title}` : "Open banner link"}
          >
            <img src={bannerImage} alt="" className={imageClass} />
          </a>
        ) : target.hash ? (
          <Link
            to={{ pathname: target.to, hash: target.hash }}
            className={imageLinkClass}
            aria-label={banner.title ? `View products: ${banner.title}` : "View products"}
          >
            <img src={bannerImage} alt="" className={imageClass} />
          </Link>
        ) : (
          <Link to={target.to} className={imageLinkClass} aria-label={banner.title ? `Go to: ${banner.title}` : "Continue"}>
            <img src={bannerImage} alt="" className={imageClass} />
          </Link>
        )}

        <div
          className={`pointer-events-none absolute inset-0 z-[1] flex bg-gradient-to-r from-black/45 via-black/20 to-transparent p-6 md:p-10 ${textPositionClass}`}
        >
          <div className="max-w-xl text-white">
            {banner.title && (
              <h3 className="text-xl font-black uppercase tracking-tight drop-shadow-md md:text-3xl">{banner.title}</h3>
            )}
            {banner.subtitle && (
              <p className="mt-2 text-xs font-bold text-white/90 md:text-sm">{banner.subtitle}</p>
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
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/30 p-3 opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-white/50 group-hover/banner:opacity-100"
        aria-label="Previous banner"
      >
        <ChevronLeft size={24} className="text-black" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/30 p-3 opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-white/50 group-hover/banner:opacity-100"
        aria-label="Next banner"
      >
        <ChevronRight size={24} className="text-black" />
      </button>

      {banner.whatsapp_link && (
        <a
          href={banner.whatsapp_link}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute bottom-10 right-10 z-20 flex items-center gap-2 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-black active:scale-95 ${ctaClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={18} /> Order via WhatsApp
        </a>
      )}

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-white shadow-sm" : "w-2 bg-white/40"}`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

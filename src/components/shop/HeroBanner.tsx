import { useState, useEffect, useMemo } from "react";
import type { WebsiteBanner } from "@/lib/supabase";

interface HeroBannerProps {
  onBannerClick?: (link: { type: string; value: string }) => void;
  banners?: WebsiteBanner[];
  loading?: boolean;
}

const HeroBanner = ({ onBannerClick: _onBannerClick, banners: incomingBanners = [], loading = false }: HeroBannerProps) => {
  const [current, setCurrent] = useState(0);
  const banners = useMemo(
    () => [...incomingBanners].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [incomingBanners]
  );

  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(() => {
      setCurrent((previous) => (previous + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

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
  const bannerHref = banner?.link_url || banner?.banner_link || banner?.whatsapp_link || "/#products";
  const hasExternalLink = /^https?:\/\//i.test(bannerHref);

  return (
    <div className="w-full">
      <div className="group/banner relative w-full bg-transparent">
        <a
          href={bannerHref}
          target={hasExternalLink ? "_blank" : undefined}
          rel={hasExternalLink ? "noreferrer" : undefined}
          className="relative block aspect-[2.4/1] w-full cursor-pointer overflow-hidden focus:outline-none lg:aspect-[4.5/1]"
          aria-label={banner.title ? `View products: ${banner.title}` : "View products"}
        >
          <img
            src={bannerImage}
            alt={banner.title || "Promotion Banner"}
            decoding="sync"
            className="block h-full w-full object-cover object-center antialiased"
            style={{
              imageRendering: 'auto',
              display: 'block',
              width: '100%',
              height: '100%'
            }}
          />
        </a>

      </div>
    </div>
  );
};

export default HeroBanner;

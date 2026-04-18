import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "@/lib/ThemeProvider";

interface HeroBannerProps {
  onBannerClick?: (link: { type: string, value: string }) => void;
}

const HeroBanner = ({ onBannerClick }: HeroBannerProps) => {
  const { theme } = useTheme();
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('website_banners')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setBanners(data || []);
      } catch (err) {
        console.error("Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const next = useCallback(() => {
    if (banners.length === 0) return;
    setCurrent(c => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    if (banners.length === 0) return;
    setCurrent(c => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(next, 5000); // 5 seconds for auto-slide
    return () => clearInterval(t);
  }, [next, banners.length]);

  if (loading) {
    return (
      <div className="w-full aspect-[21/9] bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Loading Banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full aspect-[21/9] bg-gradient-to-br from-orange-50 via-white to-yellow-50 border border-orange-100 flex items-center justify-center rounded-[32px]">
        <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest italic">
          No offers right now
        </p>
      </div>
    );
  }

  const banner = banners[current];
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

  return (
    <div
      className="relative w-full overflow-hidden group"
      style={{ borderRadius: `${theme.bannerRadius || 0}px` }}
    >
      <div className="aspect-[21/9] w-full bg-gray-100">
        <img 
          src={banner.image_url} 
          alt="" 
          className="w-full h-full object-cover transition-opacity duration-700"
        />
      </div>

      <div className={`absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent flex p-6 md:p-10 ${textPositionClass}`}>
        <div className="max-w-xl text-white">
          {banner.title && (
            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight drop-shadow-md">
              {banner.title}
            </h3>
          )}
          {banner.subtitle && (
            <p className="mt-2 text-xs md:text-sm font-bold text-white/90">{banner.subtitle}</p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={(e) => { e.stopPropagation(); prev(); }} 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-3 rounded-2xl hover:bg-white/50 transition-all shadow-xl opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} className="text-black" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); next(); }} 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-3 rounded-2xl hover:bg-white/50 transition-all shadow-xl opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} className="text-black" />
      </button>

      {/* WhatsApp Link Button */}
      {banner.whatsapp_link && (
        <a 
          href={banner.whatsapp_link}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute bottom-10 right-10 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-2xl hover:bg-black transition-all active:scale-95 z-10 ${ctaClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={18} /> Order via WhatsApp
        </a>
      )}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "bg-white w-8 shadow-sm" : "bg-white/40 w-2"}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

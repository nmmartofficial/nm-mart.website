import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface HeroBannerProps {
  onBannerClick?: (link: { type: string, value: string }) => void;
}

const HeroBanner = ({ onBannerClick }: HeroBannerProps) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('website_banners')
          .select('*')
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

  if (loading || banners.length === 0) {
    return (
      <div className="w-full aspect-[21/9] bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Loading Banners...</p>
      </div>
    );
  }

  const banner = banners[current];

  return (
    <div className="relative w-full overflow-hidden group">
      <div className="aspect-[21/9] w-full bg-gray-100">
        <img 
          src={banner.image_url} 
          alt="" 
          className="w-full h-full object-cover transition-opacity duration-700"
        />
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
          className="absolute bottom-10 right-10 bg-green-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-2xl hover:bg-black transition-all active:scale-95 z-10"
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

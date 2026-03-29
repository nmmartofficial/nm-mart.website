import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    title: "🔥 Flat 50% OFF",
    subtitle: "On 500+ products — Limited time!",
    bg: "from-orange-600 to-red-700",
  },
  {
    title: "🏆 Welfare Card",
    subtitle: "Pay ₹599, Get ₹1500 — 6 Month Value!",
    bg: "from-emerald-600 to-teal-800",
  },
  {
    title: "⚡ NM Mart Mega Sale",
    subtitle: "7000+ products at wholesale prices",
    bg: "from-blue-900 to-indigo-900",
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % BANNERS.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length), []);

  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next]);

  const banner = BANNERS[current];

  return (
    <div className="relative w-full overflow-hidden">
      <div className={`bg-gradient-to-r ${banner.bg} py-12 md:py-16 px-6 text-center text-white transition-all duration-500`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-3">{banner.title}</h2>
          <p className="text-sm md:text-base font-medium opacity-90">{banner.subtitle}</p>
        </div>
      </div>

      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors">
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors">
        <ChevronRight size={20} className="text-white" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    title: "🛒 Grocery Essentials",
    subtitle: "Daily needs at wholesale prices — 7000+ items!",
    bg: "from-orange-600 via-orange-700 to-orange-900",
    emoji: "🥦🍚🫘",
  },
  {
    title: "🧴 FMCG Best Deals",
    subtitle: "Top brands at flat discount — Surf, Colgate & more",
    bg: "from-amber-600 via-orange-600 to-red-800",
    emoji: "🧹🧼🪥",
  },
  {
    title: "🥜 Premium Dry Fruits",
    subtitle: "Almonds, Cashews, Raisins — freshest quality",
    bg: "from-yellow-700 via-amber-800 to-orange-900",
    emoji: "🌰🥜🫐",
  },
  {
    title: "🛏️ Bedsheets & Home",
    subtitle: "Cotton bedsheets, towels & home essentials",
    bg: "from-purple-800 via-indigo-900 to-gray-900",
    emoji: "🛏️🧣🪭",
  },
  {
    title: "🔥 Flat 50% OFF",
    subtitle: "On 500+ products — Limited time flash sale!",
    bg: "from-red-600 via-orange-600 to-yellow-600",
    emoji: "🏷️💥⚡",
  },
  {
    title: "🏆 NM Mart Welfare Card",
    subtitle: "Pay ₹599, Get ₹1500 — 6 Month Value!",
    bg: "from-emerald-600 via-teal-700 to-cyan-900",
    emoji: "💳🎁✨",
  },
  {
    title: "⚡ Mega Sale Live",
    subtitle: "7000+ products at unbeatable wholesale prices",
    bg: "from-gray-900 via-black to-gray-800",
    emoji: "🛍️🔥💰",
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % BANNERS.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length), []);

  useEffect(() => {
    const t = setInterval(next, 3500);
    return () => clearInterval(t);
  }, [next]);

  const banner = BANNERS[current];

  return (
    <div className="relative w-full overflow-hidden">
      <div className={`bg-gradient-to-r ${banner.bg} py-16 md:py-24 px-6 text-center text-white transition-all duration-700`}>
        <div className="max-w-3xl mx-auto">
          <p className="text-4xl md:text-5xl mb-4">{banner.emoji}</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">{banner.title}</h2>
          <p className="text-sm md:text-lg font-medium opacity-80">{banner.subtitle}</p>
        </div>
      </div>

      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/60 transition-colors">
        <ChevronLeft size={22} className="text-white" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/60 transition-colors">
        <ChevronRight size={22} className="text-white" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "bg-white w-8" : "bg-white/30 w-4"}`} />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

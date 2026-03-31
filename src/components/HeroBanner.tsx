import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    title: "🛒 Daily Essentials",
    subtitle: "रोज़मर्रा का सामान — सबसे सस्ते दाम पर!",
    bg: "from-orange-600 via-orange-700 to-orange-900",
  },
  {
    title: "🍿 Snacks & Munchies",
    subtitle: "Chips, Namkeen, Biscuits — Flat Discount!",
    bg: "from-amber-600 via-orange-600 to-red-800",
  },
  {
    title: "🥦 Grocery Essentials",
    subtitle: "7000+ आइटम्स होलसेल प्राइस पर",
    bg: "from-green-700 via-emerald-800 to-teal-900",
  },
  {
    title: "🥜 Premium Dry Fruits",
    subtitle: "Almonds, Cashews, Raisins — ताज़ा क्वालिटी",
    bg: "from-yellow-700 via-amber-800 to-orange-900",
  },
  {
    title: "🔥 Flat 50% OFF",
    subtitle: "500+ प्रोडक्ट्स पर — सीमित समय!",
    bg: "from-red-600 via-orange-600 to-yellow-600",
  },
  {
    title: "🏆 NM Mart Welfare Card",
    subtitle: "₹599 में ₹1500 का वैल्यू — 6 महीने!",
    bg: "from-emerald-600 via-teal-700 to-cyan-900",
  },
  {
    title: "⚡ Mega Sale Live",
    subtitle: "अनबीटेबल होलसेल प्राइसेस — अभी खरीदें!",
    bg: "from-gray-900 via-black to-gray-800",
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
      <div className={`bg-gradient-to-r ${banner.bg} py-14 md:py-20 px-6 text-center text-white transition-all duration-700`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2">{banner.title}</h2>
          <p className="text-sm md:text-lg font-medium opacity-80">{banner.subtitle}</p>
        </div>
      </div>

      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-2 rounded-full hover:bg-black/60 transition-colors">
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-2 rounded-full hover:bg-black/60 transition-colors">
        <ChevronRight size={20} className="text-white" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/30 w-3"}`} />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

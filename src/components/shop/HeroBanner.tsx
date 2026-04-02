import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    title: "🛒 Daily Essentials",
    subtitle: "रोज़मर्रा का सामान — सबसे सस्ते दाम पर!",
    bg: "from-[#00A8E1] via-[#0081ad] to-black",
  },
  {
    title: "🍿 Snacks & Munchies",
    subtitle: "Chips, Namkeen, Biscuits — Flat Discount!",
    bg: "from-[#00A8E1] via-[#33b9e7] to-white",
    textColor: "text-black"
  },
  {
    title: "🥦 Grocery Essentials",
    subtitle: "7000+ आइटम्स होलसेल प्राइस पर",
    bg: "from-white via-[#f0f9ff] to-[#00A8E1]",
    textColor: "text-black"
  },
  {
    title: "🥜 Premium Dry Fruits",
    subtitle: "Almonds, Cashews, Raisins — ताज़ा क्वालिटी",
    bg: "from-black via-[#0081ad] to-[#00A8E1]",
  },
  {
    title: "🔥 Flat 50% OFF",
    subtitle: "500+ प्रोडक्ट्स पर — सीमित समय!",
    bg: "from-[#00A8E1] via-white to-white",
    textColor: "text-black"
  },
  {
    title: "🏆 NM Mart Welfare Card",
    subtitle: "₹599 में ₹1500 का वैल्यू — 6 महीने!",
    bg: "from-[#00A8E1] via-[#00A8E1] to-[#0081ad]",
  },
  {
    title: "⚡ Mega Sale Live",
    subtitle: "अनबीटेबल होलसेल प्राइसेस — अभी खरीदें!",
    bg: "from-white via-[#e0f2fe] to-[#00A8E1]",
    textColor: "text-black"
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
      <div className={`bg-gradient-to-r ${banner.bg} py-14 md:py-20 px-6 text-center ${banner.textColor || 'text-white'} transition-all duration-700`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-2 uppercase italic">{banner.title}</h2>
          <p className="text-sm md:text-lg font-bold opacity-90 uppercase tracking-widest">{banner.subtitle}</p>
        </div>
      </div>

      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors shadow-sm">
        <ChevronLeft size={20} className={banner.textColor === 'text-black' ? 'text-black' : 'text-white'} />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors shadow-sm">
        <ChevronRight size={20} className={banner.textColor === 'text-black' ? 'text-black' : 'text-white'} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? (banner.textColor === 'text-black' ? "bg-black w-6" : "bg-white w-6") : (banner.textColor === 'text-black' ? "bg-black/20 w-3" : "bg-white/30 w-3")}`} />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

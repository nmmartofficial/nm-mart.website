import { ShoppingCart, Star, Gift, MessageCircle } from "lucide-react";
import { WA_NUMBER } from "@/lib/store-utils";

const WelfareCardBanner = () => {
  const handleEnquire = () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I want to buy the NM Mart Welfare Card (₹599). Please share details.")}`, "_blank");
  };

  return (
    <section className="my-12 max-w-2xl mx-auto px-4">
      <div className="rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Card gradient */}
        <div className="bg-gradient-to-br from-[hsl(var(--navy))] via-[hsl(213,60%,22%)] to-[hsl(var(--navy))] p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[hsl(var(--secondary))]/10 -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[hsl(var(--secondary))]/10 -ml-8 -mb-8" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-[hsl(var(--secondary))] p-2 rounded-xl">
                <ShoppingCart size={20} className="text-[hsl(var(--navy))]" />
              </div>
              <div>
                <p className="font-black italic text-lg">NM MART</p>
                <p className="text-[9px] uppercase tracking-widest opacity-70">Welfare Card</p>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-black italic">₹599</span>
              <span className="text-sm opacity-60 line-through">₹1500</span>
              <span className="bg-[hsl(var(--secondary))] text-[hsl(var(--navy))] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Save ₹900
              </span>
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <p className="flex items-center gap-2"><Star size={14} className="text-[hsl(var(--secondary))]" /> ₹1500 shopping value for just ₹599</p>
              <p className="flex items-center gap-2"><Gift size={14} className="text-[hsl(var(--secondary))]" /> Valid for 6 months</p>
              <p className="flex items-center gap-2"><MessageCircle size={14} className="text-[hsl(var(--secondary))]" /> Priority WhatsApp support</p>
            </div>

            <button
              onClick={handleEnquire}
              className="w-full bg-[hsl(var(--secondary))] text-[hsl(var(--navy))] py-3 rounded-xl font-black text-sm uppercase hover:opacity-90 transition-opacity active:scale-95"
            >
              Get Welfare Card on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelfareCardBanner;

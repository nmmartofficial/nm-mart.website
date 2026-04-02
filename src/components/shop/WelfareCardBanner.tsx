import { Star, Gift, MessageCircle, CreditCard } from "lucide-react";
import { WA_NUMBER } from "@/lib/store-utils";

const WelfareCardBanner = () => {
  const handleEnquire = () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I want to buy the NM Mart Welfare Card (₹599). Please share details.")}`, "_blank");
  };

  return (
    <section className="my-12 max-w-2xl mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-2xl relative border border-primary/30 animate-pulse-glow">
        <div className="bg-gradient-to-br from-black via-[hsl(0,0%,8%)] to-black p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/10 -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary/10 -ml-8 -mb-8" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="gradient-orange p-2.5 rounded-xl">
                <CreditCard size={22} className="text-white" />
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">NM MART</p>
                <p className="text-[9px] uppercase tracking-widest text-primary">Welfare Card — 6 Months</p>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-black">₹599</span>
              <span className="text-sm opacity-40 line-through">₹1500</span>
              <span className="gradient-orange text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Save ₹900
              </span>
            </div>

            <div className="space-y-2.5 mb-6 text-sm text-foreground/80">
              <p className="flex items-center gap-2"><Star size={14} className="text-primary" /> ₹1500 shopping value for just ₹599</p>
              <p className="flex items-center gap-2"><Gift size={14} className="text-primary" /> Valid for 6 months</p>
              <p className="flex items-center gap-2"><MessageCircle size={14} className="text-primary" /> Priority WhatsApp support</p>
            </div>

            <button
              onClick={handleEnquire}
              className="w-full gradient-orange text-white py-3.5 rounded-xl font-black text-sm uppercase hover:opacity-90 transition-opacity active:scale-[0.98]"
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

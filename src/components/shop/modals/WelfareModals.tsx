import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Gift, CreditCard, MessageCircle } from "lucide-react";
import { WA_NUMBER } from "@/lib/store-utils";

interface WelfareModalsProps {
  showGoldenCard: boolean;
  setShowGoldenCard: (v: boolean) => void;
  welfareCard: { number: string; active: boolean; points: number } | null;
  user: any;
}

const WelfareModals = ({
  showGoldenCard,
  setShowGoldenCard,
  welfareCard,
  user
}: WelfareModalsProps) => {
  return (
    <AnimatePresence>
      {showGoldenCard && welfareCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
            className="relative w-full max-w-md aspect-[1.6/1] bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#b38728] rounded-3xl p-8 shadow-[0_0_50px_rgba(191,149,63,0.4)] border border-white/20 overflow-hidden group"
          >
            {/* Chip Detail */}
            <div className="absolute top-12 left-10 w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-lg shadow-inner opacity-80" />
            
            {/* Logo */}
            <div className="absolute top-8 right-10 flex flex-col items-end">
              <h2 className="text-2xl font-black italic text-yellow-900 tracking-tighter leading-none">NM <span className="text-black">MART</span></h2>
              <p className="text-[8px] font-bold text-yellow-800 uppercase tracking-widest">Welfare Member</p>
            </div>

            {/* Card Number */}
            <div className="mt-20">
              <p className="text-[10px] font-black text-yellow-900/60 uppercase tracking-[4px] mb-1">Card Number</p>
              <p className="text-2xl font-black text-black font-mono tracking-[6px] drop-shadow-sm">
                {welfareCard.number.match(/.{1,4}/g)?.join(' ') || welfareCard.number}
              </p>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
              <div>
                <p className="text-[8px] font-black text-yellow-900/60 uppercase tracking-widest mb-1">Card Holder</p>
                <p className="text-sm font-black text-black uppercase italic tracking-tight">{user?.user_metadata?.full_name || "NM Member"}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-yellow-900/60 uppercase tracking-widest mb-1">Balance</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <Star size={14} className="text-yellow-900 fill-current" />
                  <p className="text-xl font-black text-black italic">{welfareCard.points} <span className="text-[10px]">PTS</span></p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setShowGoldenCard(false)}
              className="absolute top-4 left-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-all text-yellow-900"
            >
              <X size={16} />
            </button>

            {/* Holographic Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
          </motion.div>
          
          {/* Action Button outside the card */}
          <div className="absolute bottom-20 flex flex-col items-center gap-4">
            <button 
              onClick={() => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi NM Mart! I want to redeem my ${welfareCard.points} points for a discount.`)}`, "_blank")}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 italic"
            >
              Redeem Points <Gift size={20} />
            </button>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">1 Point = ₹1 Discount</p>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelfareModals;

import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Gift, CreditCard, MessageCircle } from "lucide-react";
import { WA_NUMBER } from "@/lib/store-utils";

interface WelfareModalsProps {
  showGoldenCard: boolean;
  setShowGoldenCard: (v: boolean) => void;
  showWelfareModal: boolean;
  setShowWelfareModal: (v: boolean) => void;
  welfareCard: { number: string; active: boolean; points: number } | null;
  user: any;
}

const WelfareModals = ({
  showGoldenCard,
  setShowGoldenCard,
  showWelfareModal,
  setShowWelfareModal,
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

      {showWelfareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-yellow-100"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mb-16 blur-3xl" />

            <button 
              onClick={() => setShowWelfareModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star size={32} className="text-white fill-current" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Welfare <span className="text-yellow-600">Card</span></h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Join the Elite NM Circle</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100/50">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Gift size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase italic">Flat 5-10% Extra Discount</p>
                    <p className="text-xs text-gray-500 font-medium">Automatic discount on every order, including existing offers!</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <CreditCard size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase italic">Premium Store Access</p>
                    <p className="text-xs text-gray-500 font-medium">Get priority support and exclusive member-only flash sales.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <MessageCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase italic">Priority Delivery</p>
                    <p className="text-xs text-gray-500 font-medium">Your orders are packed and shipped on high priority.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi NM Mart! I'm interested in the Welfare Card membership. Please guide me on how to join.")}`, "_blank");
                  setShowWelfareModal(false);
                }}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-600 transition-all shadow-xl flex items-center justify-center gap-3 italic"
              >
                Join NM Welfare Now <Star size={18} className="fill-current" />
              </button>
              
              <p className="text-center mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Membership valid for 6 months • ₹599/-
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelfareModals;

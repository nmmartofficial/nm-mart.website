import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Heart, ShieldCheck, Gift, MessageCircle } from "lucide-react";
import { WA_NUMBER } from "@/lib/store-utils";

interface WelfareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelfareModal = ({ isOpen, onClose }: WelfareModalProps) => {
  const whatsappLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hi NM Mart! I want to join the NM Mart Welfare Program and get my Welfare Card. Please guide me on the next steps."
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header / Banner */}
            <div className="bg-gradient-to-br from-primary to-black p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Star size={120} className="fill-current" />
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                  <Star size={32} className="text-yellow-400 fill-current" />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight mb-2">NM Mart Welfare Card</h2>
                <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest">Premium Shopping Benefits</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-black italic uppercase text-black">Why Join NM Welfare?</h3>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <Gift size={20} />
                    </div>
                    <div>
                      <p className="font-black text-[10px] uppercase text-primary tracking-widest mb-1">Extra Discounts</p>
                      <p className="text-sm font-bold text-gray-600 leading-tight">Get exclusive 5-10% extra discount on every purchase above ₹1499.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                      <Star size={20} />
                    </div>
                    <div>
                      <p className="font-black text-[10px] uppercase text-green-600 tracking-widest mb-1">Loyalty Points</p>
                      <p className="text-sm font-bold text-gray-600 leading-tight">Earn points on every ₹100 spend. Redeem points for cash or free gifts.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-black text-[10px] uppercase text-blue-600 tracking-widest mb-1">Priority Delivery</p>
                      <p className="text-sm font-bold text-gray-600 leading-tight">Welfare members get priority processing and fastest delivery in Manjhanpur.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[2px] flex items-center justify-center gap-3 hover:bg-[#20ba5a] transition-all shadow-xl shadow-green-500/20 active:scale-95"
                >
                  <MessageCircle size={20} />
                  Join Now on WhatsApp
                </a>
                <p className="text-[10px] text-gray-400 font-bold uppercase text-center mt-4 tracking-tighter italic">
                  *Joining is free for regular shoppers!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelfareModal;
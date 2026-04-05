import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Banknote, QrCode, Send } from "lucide-react";
import { UPI_ID } from "@/lib/store-utils";

interface CheckoutModalProps {
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
  memberId: string | null;
  cart: any[];
  cartTotal: number;
  welfareDiscount: number;
  finalTotal: number;
  payMethod: "cod" | "upi";
  setPayMethod: (v: "cod" | "upi") => void;
  transactionId: string;
  setTransactionId: (v: string) => void;
  placeOrder: () => void;
}

const CheckoutModal = ({
  checkoutOpen,
  setCheckoutOpen,
  memberId,
  cart,
  cartTotal,
  welfareDiscount,
  finalTotal,
  payMethod,
  setPayMethod,
  transactionId,
  setTransactionId,
  placeOrder
}: CheckoutModalProps) => {
  return (
    <AnimatePresence>
      {checkoutOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50" onClick={() => setCheckoutOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[90vh] bg-card rounded-2xl shadow-2xl z-50 overflow-y-auto border border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-foreground">💳 Checkout</h2>
                <button onClick={() => setCheckoutOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X size={18} /></button>
              </div>
              {memberId && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 text-center">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Member ID</p>
                  <p className="text-primary font-black">{memberId}</p>
                </div>
              )}
              <div className="bg-secondary rounded-xl p-4 mb-6 text-sm space-y-2">
                {cart.map((c, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-foreground text-xs truncate flex-1 mr-2">{c.name} x{c.qty}</span>
                    <span className="font-bold text-foreground">₹{c.saleRate * c.qty}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 space-y-1">
                  <div className="flex justify-between font-bold text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  {welfareDiscount > 0 && (
                    <div className="flex justify-between font-black text-sm text-yellow-600 italic">
                      <span className="flex items-center gap-1"><Star size={12} className="fill-current" /> Welfare Discount (5%)</span>
                      <span>-₹{welfareDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-lg pt-1">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal}</span>
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-sm mb-3 text-foreground uppercase tracking-wider text-center">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => setPayMethod("cod")}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === "cod" ? "border-primary bg-primary/10" : "border-border"}`}>
                  <Banknote size={20} className={payMethod === "cod" ? "text-primary" : "text-muted-foreground"} />
                  <span className="text-[9px] font-bold uppercase">Cash/COD</span>
                </button>
                <motion.button onClick={() => setPayMethod("upi")} whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === "upi" ? "border-primary bg-primary/10" : "border-border"}`}>
                  <QrCode size={20} className={payMethod === "upi" ? "text-primary" : "text-muted-foreground"} />
                  <span className="text-[9px] font-bold uppercase">UPI Pay</span>
                </motion.button>
              </div>
              {payMethod === "upi" && (
                <div className="bg-secondary rounded-xl p-4 mb-4 text-center space-y-4 border-2 border-dashed border-primary/20">
                  <div className="relative group mx-auto w-40 h-40">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}%26pn=NM%20MART%26am=${finalTotal}%26cu=INR`}
                      alt="UPI QR" 
                      className="w-full h-full rounded-lg shadow-md border-4 border-card" 
                    />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[8px] font-black text-white bg-black/50 px-2 py-1 rounded">Scan to Pay</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground font-mono font-bold tracking-tight">{UPI_ID}</p>
                    
                    {/* Mobile Pay Button */}
                    <a 
                      href={`upi://pay?pa=${UPI_ID}&pn=NM%20MART&am=${finalTotal}&cu=INR`}
                      className="md:hidden flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"
                    >
                      <QrCode size={14} /> Pay with Any UPI App
                    </a>
                  </div>

                  <div className="h-[1px] bg-border my-2"></div>

                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Transaction ID / UTR (Required)</label>
                    <input 
                      type="text" 
                      placeholder="Enter 12-digit UTR Number" 
                      className="w-full bg-card border border-border p-3 rounded-xl text-xs font-bold focus:border-primary outline-none transition-all"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                    <p className="text-[8px] text-gray-400 italic px-1">* Payment hone ke baad reference number yahan daalein.</p>
                  </div>
                </div>
              )}
              <button 
                onClick={placeOrder}
                disabled={payMethod === 'upi' && !transactionId}
                className={`w-full py-4 rounded-xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                  payMethod === 'upi' && !transactionId 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "gradient-brand text-white hover:scale-[1.02]"
                }`}
              >
                <Send size={18} /> {payMethod === 'upi' ? "Submit & WhatsApp Order" : "WhatsApp पर Order भेजें"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;

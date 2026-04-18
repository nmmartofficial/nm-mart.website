import { motion, AnimatePresence } from "framer-motion";
import { X, Star, CreditCard, QrCode, Send, Building2, Truck, ShieldCheck, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { UPI_ID, calculateDeliveryFee } from "@/lib/store-utils";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CheckoutModalProps {
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
  memberId: string | null;
  cart: any[];
  cartTotal: number;
  welfareDiscount: number;
  finalTotal: number;
  payMethod: "card" | "upi" | "netbanking";
  setPayMethod: (v: "card" | "upi" | "netbanking") => void;
  transactionId: string;
  setTransactionId: (v: string) => void;
  placeOrder: () => void;
  pincode: string;
  setPincode: (v: string) => void;
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
  placeOrder,
  pincode,
  setPincode
}: CheckoutModalProps) => {
  const deliveryFee = calculateDeliveryFee(cartTotal);
  const totalWithDelivery = finalTotal + deliveryFee;
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [verifyingPincode, setVerifyingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const verifyPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeError("Enter valid 6-digit pincode");
      return;
    }
    setVerifyingPincode(true);
    setPincodeError("");
    try {
      const { data } = await supabase.from('store_config').select('value').eq('key', 'pincodes').maybeSingle();
      const validPincodes = data?.value || ["212207", "212201", "212216"];
      if (validPincodes.includes(pincode)) {
        setPincodeVerified(true);
        toast.success("Delivery available in your area!");
      } else {
        setPincodeError("Delivery not available at this pincode");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingPincode(false);
    }
  };

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[80]" onClick={() => setCheckoutOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[90vh] bg-white rounded-[32px] shadow-2xl z-[90] overflow-y-auto border border-gray-100">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter">Final <span className="text-primary">Checkout</span></h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Secure Payment Gateway</p>
                </div>
                <button onClick={() => setCheckoutOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><X size={20} /></button>
              </div>

              {memberId && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Star size={20} className="fill-current" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">NM Welfare Member</p>
                      <p className="text-sm font-black text-black italic">{memberId}</p>
                    </div>
                  </div>
                  <div className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Active</div>
                </div>
              )}

              {/* Pincode Validator Module */}
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-[2px] italic">Delivery Pincode</h3>
                  {pincodeVerified && <span className="flex items-center gap-1 text-[8px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 size={10} /> Serviceable</span>}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="Enter Pincode (e.g. 212207)"
                      className={`w-full bg-white border ${pincodeError ? 'border-red-500' : 'border-gray-200'} rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-primary transition-all`}
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value.replace(/\D/g, ''));
                        setPincodeVerified(false);
                        setPincodeError("");
                      }}
                    />
                  </div>
                  <button 
                    onClick={verifyPincode}
                    disabled={verifyingPincode || pincodeVerified}
                    className={`px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                      pincodeVerified ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-primary'
                    }`}
                  >
                    {verifyingPincode ? <Loader2 className="animate-spin" size={14} /> : (pincodeVerified ? 'Verified' : 'Check')}
                  </button>
                </div>
                {pincodeError && <p className="text-[9px] font-bold text-red-500 mt-2 ml-1 uppercase tracking-tighter">{pincodeError}</p>}
              </div>

              {/* Order Summary Brief */}
              <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-xs uppercase tracking-widest text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-black">₹{cartTotal}</span>
                  </div>
                  {welfareDiscount > 0 && (
                    <div className="flex justify-between font-black text-xs text-yellow-600 italic">
                      <span>Welfare Discount (5%)</span>
                      <span>-₹{welfareDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1.5"><Truck size={14} /> Delivery Fee</span>
                    <span className={deliveryFee === 0 ? "text-green-600" : "text-black"}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Grand Total</p>
                      <p className="text-3xl font-black text-primary italic leading-none tracking-tighter">₹{totalWithDelivery}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 font-black text-[8px] uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg">
                      <ShieldCheck size={10} /> Secure
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-black text-[10px] mb-4 text-gray-400 uppercase tracking-[3px] italic pl-1">Select Payment Method</h3>
              
              <div className="grid grid-cols-1 gap-3 mb-8">
                <button onClick={() => setPayMethod("upi")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${payMethod === "upi" ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payMethod === "upi" ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-xs font-black uppercase tracking-widest text-black italic">UPI (PhonePe, GPay, Paytm)</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase italic">Instant Verification</span>
                  </div>
                  <div className="flex gap-1.5 opacity-60">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-3 grayscale brightness-0 invert-[0.2]" />
                  </div>
                </button>

                <button onClick={() => setPayMethod("card")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${payMethod === "card" ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payMethod === "card" ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                    <CreditCard size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-xs font-black uppercase tracking-widest text-black italic">Credit / Debit Card</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase italic">Visa, Mastercard, RuPay</span>
                  </div>
                  <div className="flex gap-1 opacity-60">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-2" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-3" />
                  </div>
                </button>

                <button onClick={() => setPayMethod("netbanking")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${payMethod === "netbanking" ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payMethod === "netbanking" ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                    <Building2 size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-xs font-black uppercase tracking-widest text-black italic">Net Banking</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase italic">All Major Indian Banks</span>
                  </div>
                </button>
              </div>

              {payMethod === "upi" && (
                <div className="bg-primary/5 rounded-[32px] p-8 mb-8 text-center space-y-6 border-2 border-dashed border-primary/20 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative group mx-auto w-48 h-48 bg-white p-4 rounded-[32px] shadow-2xl border border-primary/10">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}%26pn=NM%20MART%26am=${totalWithDelivery}%26cu=INR`}
                      alt="UPI QR" 
                      className="w-full h-full rounded-2xl" 
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-[2px] shadow-xl">Scan to Pay</div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[11px] text-gray-400 font-mono font-bold tracking-widest uppercase italic">{UPI_ID}</p>
                    
                    <a 
                      href={`upi://pay?pa=${UPI_ID}&pn=NM%20MART&am=${totalWithDelivery}&cu=INR`}
                      className="md:hidden flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all italic"
                    >
                      <QrCode size={18} /> Pay with Any App
                    </a>
                  </div>

                  <div className="h-[1px] bg-primary/10 mx-10"></div>

                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Transaction ID / UTR (Required)</label>
                    <input 
                      type="text" 
                      placeholder="ENTER 12-DIGIT UTR NUMBER" 
                      className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-black focus:border-primary outline-none transition-all shadow-inner tracking-widest"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                    <p className="text-[8px] text-gray-400 font-bold uppercase text-center italic mt-2 tracking-tighter">Enter the reference number after payment completion</p>
                  </div>
                </div>
              )}

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-6 mb-8 opacity-40 grayscale contrast-125">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rupay-Logo.svg/1200px-Rupay-Logo.svg.png" alt="RuPay" className="h-3" />
              </div>

              <button 
                onClick={placeOrder}
                disabled={payMethod === 'upi' && !transactionId}
                className={`w-full py-5 rounded-[24px] font-black uppercase text-sm shadow-2xl flex items-center justify-center gap-3 transition-all italic tracking-[2px] ${
                  payMethod === 'upi' && !transactionId 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                  : "bg-primary text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <Send size={20} /> {payMethod === 'upi' ? "Verify & Place Order" : "Place Order & Generate Bill"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;

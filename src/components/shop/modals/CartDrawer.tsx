import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Minus, Plus, Trash2, Star, Truck } from "lucide-react";
import { MIN_ORDER, FREE_DELIVERY_THRESHOLD, calculateDeliveryFee } from "@/lib/store-utils";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  cart: any[];
  cartCount: number;
  cartTotal: number;
  updateQty: (i: number, delta: number) => void;
  removeItem: (i: number) => void;
  welfareDiscount: number;
  finalTotal: number;
  remaining: number;
  setCheckoutOpen: (v: boolean) => void;
}

const CartDrawer = ({
  cartOpen,
  setCartOpen,
  cart,
  cartCount,
  cartTotal,
  updateQty,
  removeItem,
  welfareDiscount,
  finalTotal,
  remaining,
  setCheckoutOpen
}: CartDrawerProps) => {
  const navigate = useNavigate();
  const deliveryFee = calculateDeliveryFee(cartTotal);
  const totalWithDelivery = finalTotal + deliveryFee;
  const upsellAmount = FREE_DELIVERY_THRESHOLD - cartTotal;

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60]" onClick={() => setCartOpen(false)} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-background z-[70] flex flex-col md:flex-row shadow-2xl overflow-hidden">
            
            {/* Left Section: Cart Items */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-black text-lg text-black flex items-center gap-2">
                  <ShoppingCart size={20} className="text-primary" /> Shopping Cart ({cartCount})
                </h2>
                <button onClick={() => setCartOpen(false)} className="md:hidden p-2 hover:bg-gray-50 rounded-lg"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <ShoppingCart size={60} className="mx-auto mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-widest text-xs">Your cart is empty</p>
                    <button onClick={() => setCartOpen(false)} className="mt-6 text-primary font-black uppercase text-[10px] border-b-2 border-primary">Start Shopping</button>
                  </div>
                ) : cart.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl p-2.5 transition-colors group">
                    <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100 p-1">
                      <ProductImageDisplay imageUrl={c.imageUrl} name={c.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-black uppercase truncate leading-tight mb-0.5">{c.name}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-primary italic">₹{c.saleRate * c.qty}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">₹{c.saleRate} / unit</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
                      <button onClick={() => updateQty(i, -1)} className="w-7 h-7 rounded-lg hover:bg-primary/10 text-black flex items-center justify-center transition-colors"><Minus size={12} /></button>
                      <span className="w-6 text-center text-xs font-black italic">{c.qty}</span>
                      <button onClick={() => updateQty(i, 1)} className="w-7 h-7 rounded-lg hover:bg-primary/10 text-black flex items-center justify-center transition-colors"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeItem(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section: Sticky Summary */}
            <div className="w-full md:w-[350px] bg-gray-50 border-l border-gray-100 flex flex-col shadow-inner">
              <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-black text-[10px] uppercase tracking-[3px] text-gray-400 italic">Order Summary</h3>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><X size={18} /></button>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-xs uppercase tracking-widest text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  {welfareDiscount > 0 && (
                    <div className="flex justify-between font-black text-xs text-yellow-600 italic">
                      <span className="flex items-center gap-1"><Star size={12} className="fill-current" /> Welfare Discount</span>
                      <span>-₹{welfareDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1.5"><Truck size={14} /> Delivery Fee</span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 leading-none">Total Amount</p>
                        <p className="text-3xl font-black text-black italic leading-none tracking-tighter">₹{totalWithDelivery}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-green-600 uppercase tracking-widest animate-pulse">Prices Inclusive GST</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {upsellAmount > 0 && cartTotal >= MIN_ORDER && (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm shadow-green-200">
                        <Truck size={16} />
                      </div>
                      <p className="text-[10px] font-black text-green-700 uppercase leading-tight tracking-tight">
                        Add <span className="text-sm italic">₹{upsellAmount}</span> more for <br/>
                        <span className="text-green-600">FREE DELIVERY!</span>
                      </p>
                    </div>
                  )}

                  {cartTotal < MIN_ORDER && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-[10px] font-black text-red-600 uppercase text-center italic leading-relaxed tracking-widest">
                      Min order ₹{MIN_ORDER} required <br/>
                      <span className="text-sm">₹{remaining} remaining</span>
                    </div>
                  )}

                  <button 
                    disabled={cartTotal < MIN_ORDER}
                    onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[3px] shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale italic"
                  >
                    Place Order Now
                  </button>
                </div>
              </div>

              {/* Mobile Fixed Bottom Bar (Reflected in UI layout) */}
              <div className="md:hidden sticky bottom-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Payable</p>
                  <p className="text-xl font-black text-black italic leading-none">₹{totalWithDelivery}</p>
                </div>
                <button 
                  disabled={cartTotal < MIN_ORDER}
                  onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-40 italic"
                >
                  Checkout
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

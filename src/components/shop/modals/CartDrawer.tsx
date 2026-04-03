import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Minus, Plus, Trash2, Star } from "lucide-react";
import { MIN_ORDER } from "@/lib/store-utils";
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

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50" onClick={() => setCartOpen(false)} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 flex flex-col shadow-2xl border-l border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-black text-lg text-foreground flex items-center gap-2"><ShoppingCart size={20} className="text-primary" /> Cart ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" /><p className="font-bold">Cart खाली है</p>
                </div>
              ) : cart.map((c, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <ProductImageDisplay imageUrl={c.imageUrl} name={c.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-foreground uppercase truncate">{c.name}</p>
                    <p className="text-sm font-black text-primary">₹{c.saleRate * c.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(i, -1)} className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center"><Minus size={12} /></button>
                    <span className="w-7 text-center text-sm font-bold">{c.qty}</span>
                    <button onClick={() => updateQty(i, 1)} className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center"><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeItem(i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="space-y-1">
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
                  <div className="flex justify-between font-black text-lg border-t border-border/50 pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal}</span>
                  </div>
                </div>
                {remaining > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-center font-bold text-primary">
                    ₹{remaining} और जोड़ें (Min. ₹{MIN_ORDER})
                  </div>
                )}
                <button disabled={cartTotal < MIN_ORDER}
                  onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                  className="w-full gradient-brand text-white py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                  Checkout करें
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

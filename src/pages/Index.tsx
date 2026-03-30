import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, X, Plus, Minus, Trash2, MessageCircle, Send,
  Mic, MicOff, Clock, Star, MapPin, LayoutGrid, ArrowUp, Package, Gift, RotateCcw,
  ChevronRight, Banknote, QrCode
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { Product, productSlug, WA_NUMBER, UPI_ID, ITEMS_PER_PAGE, MIN_ORDER, getOrderHistory, saveOrder, addLoyaltyPoints, getLoyaltyPoints, OrderRecord } from "@/lib/store-utils";
import ProductImageDisplay from "@/components/ProductImageDisplay";
import HeroBanner from "@/components/HeroBanner";
import DiscountTabs from "@/components/DiscountTabs";
import WelfareCardBanner from "@/components/WelfareCardBanner";

/* ─── Countdown Hook ─── */
function useCountdown() {
  const getRemaining = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  };
  const [sec, setSec] = useState(getRemaining);
  useEffect(() => {
    const t = setInterval(() => setSec(getRemaining()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/* ─── Voice Search Hook ─── */
function useVoiceSearch(onResult: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const toggle = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported");
    if (listening && recRef.current) { recRef.current.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.onresult = (e: any) => { onResult(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, onResult]);
  return { listening, toggle };
}

/* ─── Star Rating ─── */
const StarRating = ({ rating = 4 }: { rating?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < rating ? "fill-[hsl(var(--secondary))] text-[hsl(var(--secondary))]" : "text-muted-foreground/30"} />
    ))}
  </div>
);

export default function Index() {
  const navigate = useNavigate();
  const { allProducts, loading, categories, flat33, flat50 } = useProducts();
  const { cart, addToCart, updateQty, removeItem, clearCart, cartTotal, cartCount, setCart } = useCart();

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"cod" | "upi">("cod");
  const [showOrders, setShowOrders] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackStars, setFeedbackStars] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [user, setUser] = useState<any>(null);

  const countdown = useCountdown();
  const { listening, toggle: toggleVoice } = useVoiceSearch(t => setQuery(t));

  // Auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Back to top
  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Filtered products
  const filtered = useMemo(() => {
    let list = selectedCat ? allProducts.filter(p => p.category === selectedCat) : allProducts;
    if (query) {
      const q = query.toLowerCase();
      list = allProducts.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
    }
    return list;
  }, [allProducts, selectedCat, query]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = useMemo(() => filtered.slice(0, page * ITEMS_PER_PAGE), [filtered, page]);
  const remaining = MIN_ORDER - cartTotal;

  const placeOrder = () => {
    if (cartTotal < MIN_ORDER) return alert(`Min order ₹${MIN_ORDER}!`);
    const orderId = "NM" + Date.now().toString(36).toUpperCase();
    const orderRecord: OrderRecord = { id: orderId, items: [...cart], total: cartTotal, date: new Date().toLocaleString("en-IN"), status: "Pending" };
    saveOrder(orderRecord);
    addLoyaltyPoints(10);
    const msg = cart.map(c => `• ${c.name} (x${c.qty}) = ₹${c.saleRate * c.qty}`).join("\n");
    const payLabel = payMethod === "cod" ? "💸 COD" : "💳 UPI";
    const text = `🛒 *NM MART ORDER*\nID: ${orderId}\n\n${msg}\n\n💰 *Total: ₹${cartTotal}*\n💳 *${payLabel}*`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`);
    clearCart(); setCheckoutOpen(false); setCartOpen(false);
  };

  const reorder = (order: OrderRecord) => {
    setCart(order.items.map(i => ({ ...i })));
    setShowOrders(false); setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Flash Sale Timer */}
      <div className="gradient-amber text-accent-foreground text-center py-2 text-xs font-bold tracking-wide flex items-center justify-center gap-2">
        <Clock size={14} />
        <span>⚡ FLASH SALE ENDS IN</span>
        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded font-mono text-sm">{countdown}</span>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 gradient-navy text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={28} className="text-[hsl(var(--secondary))]" />
            <div>
              <h1 className="text-lg font-black italic leading-none">NM MART</h1>
              <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--secondary))]/80">Shop More Save More</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <div className="w-5 h-5 bg-[hsl(var(--secondary))] text-[hsl(var(--navy))] rounded-full flex items-center justify-center text-[10px] font-black">
                  {(user.email || user.phone || "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-bold hidden md:block">{user.email || user.phone}</span>
              </div>
            ) : (
              <button onClick={() => navigate("/login")}
                className="text-[10px] font-black bg-white/20 text-white px-4 py-1.5 rounded-full border border-white/30 hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--navy))] transition-all uppercase tracking-wider">
                Login
              </button>
            )}
            <button onClick={() => setShowOrders(true)} className="relative p-2 hover:bg-white/10 rounded-lg" title="Orders">
              <Package size={20} />
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-white/10 rounded-lg">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[hsl(var(--secondary))] text-accent-foreground text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-4 -mt-5 relative z-10">
        <div className="bg-card rounded-2xl shadow-xl flex items-center overflow-hidden border border-border">
          <Search size={20} className="ml-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search 7000+ products by name or barcode..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            className="flex-1 px-3 py-4 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground"
          />
          <button onClick={toggleVoice}
            className={`p-3 mr-1 rounded-xl transition-colors ${listening ? "bg-destructive text-destructive-foreground" : "hover:bg-muted"}`}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="font-bold text-primary uppercase text-xs tracking-wide">Loading inventory...</p>
          </div>
        ) : (
          <>
            {/* Discount Tabs (only on home view) */}
            {!selectedCat && !query && (
              <DiscountTabs flat33={flat33} flat50={flat50} onAddToCart={addToCart} />
            )}

            {/* Category Grid */}
            {!selectedCat && !query && categories.length > 0 && (
              <div className="mb-10">
                <h3 className="font-bold text-primary text-sm uppercase mb-4 flex items-center gap-2">
                  <LayoutGrid size={16} /> Browse Categories
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categories.map(cat => (
                    <motion.button whileTap={{ scale: 0.94 }} key={cat}
                      onClick={() => { setSelectedCat(cat); setPage(1); }}
                      className="p-4 rounded-2xl shadow-card border bg-card border-border flex flex-col items-center gap-2 transition-all group hover:border-primary">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted group-hover:bg-primary group-hover:text-white transition-colors">
                        <LayoutGrid size={16} />
                      </div>
                      <span className="font-bold text-foreground uppercase text-[9px] tracking-tight text-center leading-tight">{cat}</span>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">Open <ChevronRight size={8} /></span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Active category/search header */}
            {(selectedCat || query) && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-lg text-primary uppercase italic">
                  {query ? `Results for "${query}"` : selectedCat}
                </h2>
                <button onClick={() => { setSelectedCat(null); setQuery(""); setPage(1); }}
                  className="text-[10px] font-bold uppercase text-primary border-b-2 border-primary">← Back</button>
              </div>
            )}

            {(selectedCat || query) && (
              <>
                <p className="text-xs text-muted-foreground mb-4">{filtered.length} products found</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {paged.map((p, idx) => (
                    <motion.div key={`${p.barcode}-${p.name}-${idx}`}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="bg-card rounded-2xl shadow-card border border-border overflow-hidden group hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
                      onClick={() => navigate(`/product/${productSlug(p)}`)}
                    >
                      <div className="relative h-32 bg-white">
                        <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                        {p.discount >= 50 && (
                          <span className="absolute top-2 left-2 gradient-amber text-accent-foreground text-[8px] font-black px-2 py-0.5 rounded-md animate-blink uppercase">
                            50% OFF
                          </span>
                        )}
                        {p.discount > 0 && (
                          <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            -{p.discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className="font-bold text-[10px] text-foreground uppercase leading-tight h-8 overflow-hidden mb-1">{p.name}</h3>
                        <StarRating />
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-lg font-black text-primary">₹{p.saleRate}</span>
                          {p.mrp > p.saleRate && <span className="text-xs text-muted-foreground line-through">₹{p.mrp}</span>}
                        </div>
                        {p.save > 0 && <span className="text-[9px] font-bold text-[hsl(var(--success))] mt-0.5">Save ₹{p.save}</span>}
                        <div className="flex gap-2 mt-auto pt-3">
                          <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                            className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-[9px] font-bold uppercase hover:bg-primary/90 transition-colors">
                            Add to Cart
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Order: ${p.name} - ₹${p.saleRate}`)}`); }}
                            className="p-2 bg-[hsl(var(--success))] rounded-xl text-white hover:opacity-90" title="WhatsApp">
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {page * ITEMS_PER_PAGE < filtered.length && (
                  <div className="text-center mt-8">
                    <button onClick={() => setPage(p => p + 1)}
                      className="gradient-navy text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90">
                      Load More ({filtered.length - page * ITEMS_PER_PAGE} remaining)
                    </button>
                  </div>
                )}
                {filtered.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <Package size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No products found</p>
                  </div>
                )}
              </>
            )}

            {/* Welfare Card Banner (on home view) */}
            {!selectedCat && !query && <WelfareCardBanner />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="gradient-navy text-primary-foreground mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={20} className="text-[hsl(var(--secondary))]" />
                <span className="font-black italic">NM MART</span>
              </div>
              <p className="text-xs text-primary-foreground/70 leading-relaxed">
                Naya Nagar Dhata Road, Manjhanpur, Kaushambi, UP<br />⏰ 8 AM – 10 PM
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/about" className="hover:text-[hsl(var(--secondary))] transition-colors">About Us</a>
              <a href="/contact" className="hover:text-[hsl(var(--secondary))] transition-colors">Contact Us</a>
              <a href="/privacy" className="hover:text-[hsl(var(--secondary))] transition-colors">Privacy Policy</a>
            </div>
            <div className="flex flex-col gap-2">
              <a href="https://maps.google.com/?q=Manjhanpur+Kaushambi+UP" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20">
                <MapPin size={16} /> Store Location
              </a>
              <button onClick={() => { setShowFeedback(true); setFeedbackSent(false); }}
                className="flex items-center gap-2 gradient-amber text-accent-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90">
                <Star size={16} /> Rate Our Store
              </button>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-4 text-center text-[10px] text-white/50 uppercase tracking-widest">
            Powered by NM MART — RETAIL OS v6.0
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a href={`https://wa.me/${WA_NUMBER}?text=Hi NM Mart!`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[hsl(var(--success))] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
        <MessageCircle size={24} />
      </a>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 left-6 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-black text-lg text-foreground flex items-center gap-2"><ShoppingCart size={20} /> Cart ({cartCount})</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" /><p className="font-bold">Cart is empty</p>
                  </div>
                ) : cart.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted rounded-xl p-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
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
                  <div className="flex justify-between font-black text-lg"><span>Total</span><span>₹{cartTotal}</span></div>
                  {remaining > 0 && (
                    <div className="bg-[hsl(var(--secondary))]/10 border border-[hsl(var(--secondary))]/30 rounded-xl p-3 text-xs text-center font-bold">
                      Add ₹{remaining} more (Min. ₹{MIN_ORDER})
                    </div>
                  )}
                  <button disabled={cartTotal < MIN_ORDER}
                    onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                    className="w-full gradient-amber text-accent-foreground py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setCheckoutOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[90vh] bg-card rounded-2xl shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-foreground">💳 Checkout</h2>
                  <button onClick={() => setCheckoutOpen(false)} className="p-2 hover:bg-muted rounded-lg"><X size={18} /></button>
                </div>
                <div className="bg-muted rounded-xl p-4 mb-6 text-sm space-y-2">
                  {cart.map((c, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-foreground text-xs truncate flex-1 mr-2">{c.name} x{c.qty}</span>
                      <span className="font-bold text-foreground">₹{c.saleRate * c.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-black text-lg">
                    <span>Total</span><span>₹{cartTotal}</span>
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-3 text-foreground uppercase tracking-wider text-center">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => setPayMethod("cod")}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${payMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <Banknote size={20} className={payMethod === "cod" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-[9px] font-bold uppercase">Cash/COD</span>
                  </button>
                  <motion.a href={`upi://pay?pa=${UPI_ID}&pn=NMMART&am=${cartTotal}&cu=INR`}
                    onClick={() => setPayMethod("upi")} whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${payMethod === "upi" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <QrCode size={20} className={payMethod === "upi" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-[9px] font-bold uppercase">UPI Pay</span>
                  </motion.a>
                </div>
                {payMethod === "upi" && (
                  <div className="bg-muted rounded-xl p-4 mb-4 text-center space-y-3 border-2 border-dashed border-primary/20">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=NM%20MART&am=${cartTotal}&cu=INR`}
                      alt="UPI QR" className="mx-auto w-40 h-40 rounded-lg shadow-md border-4 border-white" />
                    <p className="text-[10px] text-muted-foreground font-mono font-bold">{UPI_ID}</p>
                  </div>
                )}
                <button onClick={placeOrder}
                  className="w-full gradient-navy text-white py-4 rounded-xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2">
                  <Send size={18} /> Confirm Order {payMethod === "cod" ? "(COD)" : "(UPI)"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Orders Modal */}
      <AnimatePresence>
        {showOrders && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setShowOrders(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-foreground">📦 Order History</h2>
                  <button onClick={() => setShowOrders(false)} className="p-2 hover:bg-muted rounded-lg"><X size={18} /></button>
                </div>
                {getOrderHistory().length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground">No orders yet</p>
                ) : getOrderHistory().map((o, i) => (
                  <div key={i} className="bg-muted rounded-xl p-4 mb-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold uppercase">{o.id}</span>
                      <span className="bg-[hsl(var(--secondary))] px-2 py-0.5 rounded text-[9px] font-bold text-accent-foreground">{o.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{o.date}</p>
                    <p className="font-black">₹{o.total}</p>
                    <button onClick={() => reorder(o)} className="flex items-center gap-1 text-primary text-xs font-bold hover:underline">
                      <RotateCcw size={12} /> Buy Again
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setShowFeedback(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-card rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="text-lg font-black text-foreground mb-4">⭐ Rate NM Mart</h3>
              {feedbackSent ? (
                <div className="text-center py-6">
                  <p className="font-bold">Thank you!</p>
                  <button onClick={() => setShowFeedback(false)} className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold">Close</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 justify-center mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setFeedbackStars(s)}>
                        <Star size={28} className={s <= feedbackStars ? "fill-[hsl(var(--secondary))] text-[hsl(var(--secondary))]" : "text-muted-foreground/30"} />
                      </button>
                    ))}
                  </div>
                  <textarea placeholder="Your experience..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                    className="w-full bg-muted rounded-xl p-3 text-sm h-24 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={() => {
                    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`⭐ Rating: ${"⭐".repeat(feedbackStars)}\n${feedbackText}`)}`);
                    setFeedbackSent(true);
                  }} className="w-full gradient-navy text-white py-3 rounded-xl font-bold mt-4">
                    Submit Feedback
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

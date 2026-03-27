import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, X, Plus, Minus, Trash2, MessageCircle, Send,
  Mic, MicOff, Clock, Star, MapPin, CreditCard, Banknote, QrCode,
  ChevronRight, LayoutGrid, ArrowUp, Package, Gift, RotateCcw,
  StarIcon, ChevronDown
} from "lucide-react";

/* ─── Types ─── */
interface Product {
  name: string;
  mrp: number;
  saleRate: number;
  category: string;
  subCategory: string;
  barcode: string;
  discount: number;
  save: number;
}
interface CartItem extends Product { qty: number }
interface OrderRecord {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: "Pending" | "Packed" | "Out for Delivery";
}

/* ─── CSV Parser ─── */
function parseCSV(text: string): Product[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map(line => {
    // Handle CSV with possible quoted fields
    const cols: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const name = cols[0] || "";
    const barcode = cols[1] || "";
    const category = cols[2] || "General";
    const subCategory = cols[3] || "";
    const mrp = parseFloat(cols[4]) || 0;
    const saleRate = parseFloat(cols[5]) || 0;
    const discount = mrp > 0 ? Math.round(((mrp - saleRate) / mrp) * 100) : 0;
    const save = mrp > 0 ? Math.round(mrp - saleRate) : 0;
    return { name, barcode, category, subCategory, mrp, saleRate, discount, save };
  }).filter(p => p.name && p.mrp > 0 && p.saleRate > 0);
}

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
    if (!SR) return alert("Voice search not supported in this browser");
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

/* ─── Product Image Component ─── */
const ProductImage = ({ barcode, name }: { barcode: string; name: string }) => {
  const [failed, setFailed] = useState(false);
  const initial = (name || "?").charAt(0).toUpperCase();
  if (!barcode || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-xl">
        <span className="text-3xl font-black text-primary/30">{initial}</span>
      </div>
    );
  }
  return (
    <img
      src={`https://images.upcitemdb.com/upc/${barcode}/0.jpg`}
      alt={name}
      loading="lazy"
      className="w-full h-full object-contain p-2"
      onError={() => setFailed(true)}
    />
  );
};

/* ─── Star Rating UI ─── */
const StarRating = ({ rating = 4 }: { rating?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"} />
    ))}
  </div>
);

/* ─── Loyalty Manager ─── */
function getLoyaltyPoints(): number {
  return parseInt(localStorage.getItem("nm_loyalty_points") || "0", 10);
}
function addLoyaltyPoints(n: number) {
  const cur = getLoyaltyPoints();
  localStorage.setItem("nm_loyalty_points", String(cur + n));
}

/* ─── Order History Manager ─── */
function getOrderHistory(): OrderRecord[] {
  try { return JSON.parse(localStorage.getItem("nm_orders") || "[]"); } catch { return []; }
}
function saveOrder(order: OrderRecord) {
  const h = getOrderHistory();
  h.unshift(order);
  localStorage.setItem("nm_orders", JSON.stringify(h.slice(0, 50)));
}

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WA_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys";
const ITEMS_PER_PAGE = 60;
const MIN_ORDER = 500;

/* ═══════════════════════════════════════════ */
/*                   APP                       */
/* ═══════════════════════════════════════════ */
export default function App() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"cod" | "upi">("cod");
  const [showOrders, setShowOrders] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackStars, setFeedbackStars] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const countdown = useCountdown();
  const { listening, toggle: toggleVoice } = useVoiceSearch(t => setQuery(t));

  // Fetch CSV
  useEffect(() => {
    fetch(CSV_URL)
      .then(r => r.text())
      .then(t => { setAllProducts(parseCSV(t)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Back to top visibility
  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Homepage: only >=50% discount
  const hotDeals = useMemo(() => allProducts.filter(p => p.discount >= 50), [allProducts]);

  // Categories from all products
  const categories = useMemo(() => [...new Set(allProducts.map(p => p.category).filter(Boolean))], [allProducts]);

  // Filtered products
  const filtered = useMemo(() => {
    let list = selectedCat ? allProducts.filter(p => p.category === selectedCat) : hotDeals;
    if (query) {
      const q = query.toLowerCase();
      list = (selectedCat ? list : allProducts).filter(p =>
        p.name.toLowerCase().includes(q) || p.barcode.includes(q)
      );
    }
    return list;
  }, [allProducts, hotDeals, selectedCat, query]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = useMemo(() => filtered.slice(0, page * ITEMS_PER_PAGE), [filtered, page]);

  // Cart functions
  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => c.name === p.name && c.barcode === p.barcode);
      if (ex) return prev.map(c => c.name === p.name && c.barcode === p.barcode ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...p, qty: 1 }];
    });
  }, []);
  const updateQty = useCallback((idx: number, delta: number) => {
    setCart(prev => prev.map((c, i) => i === idx ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  }, []);
  const removeItem = useCallback((idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((s, c) => s + c.saleRate * c.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);
  const remaining = MIN_ORDER - cartTotal;

  // Place order
  const placeOrder = () => {
    if (cartTotal < MIN_ORDER) return alert(`कम से कम ₹${MIN_ORDER} का ऑर्डर होना चाहिए!`);
    const orderId = "NM" + Date.now().toString(36).toUpperCase();
    const orderRecord: OrderRecord = { id: orderId, items: [...cart], total: cartTotal, date: new Date().toLocaleString("en-IN"), status: "Pending" };
    saveOrder(orderRecord);
    addLoyaltyPoints(10);
    const msg = cart.map(c => `• ${c.name} (x${c.qty}) = ₹${c.saleRate * c.qty}`).join("\n");
    const payLabel = payMethod === "cod" ? "💸 COD (CASH)" : "💳 PAID via UPI";
    const text = `🛒 *NM MART ORDER*\n━━━━━━━━━━━━━━\nID: ${orderId}\n\n${msg}\n\n💰 *Total: ₹${cartTotal}*\n💳 *Payment: ${payLabel}*\n━━━━━━━━━━━━━━\n_Sent via NM MART_`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`);
    setCart([]); setCheckoutOpen(false); setCartOpen(false);
  };

  const reorder = (order: OrderRecord) => {
    setCart(order.items.map(i => ({ ...i })));
    setShowOrders(false);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══ FLASH SALE TIMER ═══ */}
      <div className="gradient-amber text-accent-foreground text-center py-2 text-xs font-bold tracking-wide flex items-center justify-center gap-2">
        <Clock size={14} />
        <span>⚡ FLASH SALE ENDS IN</span>
        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded font-mono text-sm">{countdown}</span>
      </div>

      {/* ═══ STICKY HEADER ═══ */}
      <header className="sticky top-0 z-50 gradient-navy text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={28} className="text-secondary" />
            <div>
              <h1 className="text-lg font-black italic leading-none">NM MART</h1>
              <p className="text-[9px] uppercase tracking-widest text-secondary opacity-80">Manjhanpur's Pro Store</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowOrders(true)} className="relative p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors" title="Order History">
              <Package size={20} />
            </button>
            <button onClick={() => setShowLoyalty(true)} className="relative p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors" title="Loyalty Points">
              <Gift size={20} className="text-secondary" />
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-accent-foreground text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ SEARCH BAR ═══ */}
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
          <button
            onClick={toggleVoice}
            className={`p-3 mr-1 rounded-xl transition-colors ${listening ? "bg-destructive text-destructive-foreground" : "hover:bg-muted"}`}
            title="Voice Search"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="font-bold text-primary uppercase text-xs tracking-wide">Loading NM Mart inventory...</p>
          </div>
        ) : (
          <>
            {/* Section Title */}
            {!selectedCat && !query && (
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-primary italic">🔥 ADHAA DAAM DEALS</h2>
                <p className="text-muted-foreground text-sm mt-1">50% or more off — grab before time runs out!</p>
              </div>
            )}

            {/* Category Grid (when no search and no category selected) */}
            {!selectedCat && !query && categories.length > 0 && (
              <div className="mb-10">
                <h3 className="font-bold text-primary text-sm uppercase mb-4 flex items-center gap-2">
                  <LayoutGrid size={16} /> Browse Categories
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCat(cat); setPage(1); }}
                      className="bg-card p-4 rounded-2xl shadow-card border border-border flex flex-col items-center gap-2 hover:border-primary hover:shadow-md transition-all active:scale-95 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <LayoutGrid size={16} />
                      </div>
                      <span className="font-bold text-foreground uppercase text-[9px] tracking-tight text-center leading-tight">{cat}</span>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">Open <ChevronRight size={8} /></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active category header */}
            {(selectedCat || query) && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-lg text-primary uppercase italic">
                  {query ? `Results for "${query}"` : selectedCat}
                </h2>
                <button
                  onClick={() => { setSelectedCat(null); setQuery(""); setPage(1); }}
                  className="text-[10px] font-bold uppercase text-primary border-b-2 border-primary"
                >
                  ← Back to Deals
                </button>
              </div>
            )}

            {/* Product Count */}
            <p className="text-xs text-muted-foreground mb-4">{filtered.length} products found</p>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {paged.map((p, idx) => (
                <motion.div
                  key={`${p.barcode}-${p.name}-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  className="bg-card rounded-2xl shadow-card border border-border overflow-hidden group hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-32 bg-muted">
                    <ProductImage barcode={p.barcode} name={p.name} />
                    {p.discount >= 50 && (
                      <span className="absolute top-2 left-2 gradient-amber text-accent-foreground text-[8px] font-black px-2 py-0.5 rounded-md animate-blink uppercase">
                        ADHAA DAAM
                      </span>
                    )}
                    {p.discount > 0 && (
                      <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        -{p.discount}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-bold text-[10px] text-foreground uppercase leading-tight h-8 overflow-hidden mb-1">{p.name}</h3>
                    <StarRating rating={4} />
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-black text-primary">₹{p.saleRate}</span>
                      <span className="text-xs text-muted-foreground line-through">₹{p.mrp}</span>
                    </div>
                    {p.save > 0 && (
                      <span className="text-[9px] font-bold text-success mt-0.5">Save ₹{p.save}</span>
                    )}
                    <div className="flex gap-2 mt-auto pt-3">
                      <button
                        onClick={() => addToCart(p)}
                        className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-[9px] font-bold uppercase hover:bg-primary/90 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi! I want to order: ${p.name} - ₹${p.saleRate}`)}`)}
                        className="p-2 bg-success rounded-xl text-primary-foreground hover:opacity-90 transition-opacity"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {page * ITEMS_PER_PAGE < filtered.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="gradient-navy text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Load More Products ({filtered.length - page * ITEMS_PER_PAGE} remaining)
                </button>
              </div>
            )}

            {filtered.length === 0 && !loading && (
              <div className="text-center py-20 text-muted-foreground">
                <Package size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold">No products found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </>
        )}

        {/* ═══ WELFARE CARD SECTION ═══ */}
        <section className="mt-16 max-w-xl mx-auto">
          <h2 className="text-xl font-black text-primary text-center mb-6 italic">🏆 NM Mart Welfare Card</h2>
          <div className="rounded-3xl p-6 gradient-navy text-primary-foreground shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-secondary/10 -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-secondary/10 -ml-8 -mb-8" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart size={24} className="text-secondary" />
                <div>
                  <p className="font-black italic text-lg">NM MART</p>
                  <p className="text-[9px] uppercase tracking-widest text-secondary/80">Welfare Member</p>
                </div>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <p className="flex items-center gap-2"><Star size={14} className="text-secondary" /> Extra 5% Discount on all items</p>
                <p className="flex items-center gap-2"><Gift size={14} className="text-secondary" /> 6-Month Loyalty Rewards</p>
                <p className="flex items-center gap-2"><MessageCircle size={14} className="text-secondary" /> Priority WhatsApp Support</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="gradient-navy text-primary-foreground mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={20} className="text-secondary" />
                <span className="font-black italic">NM MART</span>
              </div>
              <p className="text-xs text-primary-foreground/70 leading-relaxed">
                Near B.P. Public School, Manjhanpur, Kaushambi, Uttar Pradesh<br />
                ⏰ Open: 9 AM – 9 PM
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/about" className="hover:text-secondary transition-colors">About Us</a>
              <a href="/contact" className="hover:text-secondary transition-colors">Contact Us</a>
              <a href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</a>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="https://maps.google.com/?q=Manjhanpur+Kaushambi+UP"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-foreground/20 transition-colors"
              >
                <MapPin size={16} /> Store Location
              </a>
              <button
                onClick={() => { setShowFeedback(true); setFeedbackSent(false); }}
                className="flex items-center gap-2 gradient-amber text-accent-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Star size={16} /> Rate Our Store
              </button>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-8 pt-4 text-center text-[10px] text-primary-foreground/50 uppercase tracking-widest">
            Powered by NM MART — RETAIL OS v5.0
          </div>
        </div>
      </footer>

      {/* ═══ FLOATING WHATSAPP ═══ */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=Hi NM Mart!`}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-success text-primary-foreground p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
      >
        <MessageCircle size={24} />
      </a>

      {/* ═══ BACK TO TOP ═══ */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 left-6 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══ CART DRAWER ═══ */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-black text-lg text-foreground flex items-center gap-2">
                  <ShoppingCart size={20} /> Cart ({cartCount})
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Cart is empty</p>
                  </div>
                ) : cart.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted rounded-xl p-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <ProductImage barcode={c.barcode} name={c.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground uppercase truncate">{c.name}</p>
                      <p className="text-sm font-black text-primary">₹{c.saleRate * c.qty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(i, -1)} className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted"><Minus size={12} /></button>
                      <span className="w-7 text-center text-sm font-bold">{c.qty}</span>
                      <button onClick={() => updateQty(i, 1)} className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeItem(i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="flex justify-between font-black text-lg">
                    <span>Total</span><span>₹{cartTotal}</span>
                  </div>
                  {remaining > 0 && (
                    <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 text-xs text-center font-bold text-secondary-foreground">
                      Add ₹{remaining} more to continue (Min. ₹{MIN_ORDER})
                    </div>
                  )}
                  <button
                    disabled={cartTotal < MIN_ORDER}
                    onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                    className="w-full gradient-amber text-accent-foreground py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ CHECKOUT MODAL ═══ */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setCheckoutOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[90vh] bg-card rounded-2xl shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-foreground">💳 Checkout</h2>
                  <button onClick={() => setCheckoutOpen(false)} className="p-2 hover:bg-muted rounded-lg"><X size={18} /></button>
                </div>

                {/* Order Summary */}
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

                {/* Payment Method */}
                <h3 className="font-bold text-sm mb-3 text-foreground">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setPayMethod("cod")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <Banknote size={24} className={payMethod === "cod" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                  </button>
                  <button
                    onClick={() => setPayMethod("upi")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === "upi" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <QrCode size={24} className={payMethod === "upi" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-xs font-bold">UPI Payment</span>
                  </button>
                </div>

                {/* UPI QR */}
                {payMethod === "upi" && (
                  <div className="bg-muted rounded-xl p-4 mb-6 text-center space-y-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=NM%20MART&am=${cartTotal}&cu=INR`}
                      alt="UPI QR Code" className="mx-auto w-40 h-40 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground font-mono">{UPI_ID}</p>
                    <div className="flex gap-2 justify-center">
                    </div>
                    {/* ✅ UPI के लिए बटन */}
                    <button
                      onClick={placeOrder}
                      className="w-full mt-6 gradient-navy text-white py-4 rounded-xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Send size={18} /> Confirm & Order on WhatsApp
                    </button>
                  </div>
                )}
                {/* ✅ COD के लिए बटन */}
                {payMethod === "cod" && (
                  <button
                    onClick={placeOrder}
                    className="w-full mt-2 gradient-navy text-white py-4 rounded-xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Send size={18} /> Confirm Order (COD)
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
                    </div>
                  </div>
                )}

                <button onClick={placeOrder}
                  className="w-full gradient-navy text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Send size={16} /> Place Order via WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ ORDER HISTORY MODAL ═══ */}
      <AnimatePresence>
        {showOrders && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setShowOrders(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 overflow-y-auto"
            >
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
                      <span className="font-bold text-foreground">{o.id}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${o.status === "Pending" ? "bg-secondary text-accent-foreground" : "bg-success text-primary-foreground"}`}>{o.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{o.date}</p>
                    <p className="font-black text-foreground">₹{o.total}</p>
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

      {/* ═══ LOYALTY MODAL ═══ */}
      <AnimatePresence>
        {showLoyalty && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setShowLoyalty(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] z-50"
            >
              <div className="gradient-navy rounded-3xl p-6 text-primary-foreground shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-secondary/10 -mr-8 -mt-8" />
                <Gift size={32} className="text-secondary mx-auto mb-3" />
                <h3 className="font-black text-lg italic">Golden Card</h3>
                <p className="text-4xl font-black text-secondary my-4">{getLoyaltyPoints()}</p>
                <p className="text-xs text-primary-foreground/70 uppercase tracking-wide">NM Points Earned</p>
                <p className="text-[10px] text-primary-foreground/50 mt-2">Earn 10 points on every order</p>
                <button onClick={() => setShowLoyalty(false)} className="mt-4 bg-primary-foreground/10 px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-foreground/20 transition-colors">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ FEEDBACK MODAL ═══ */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50" onClick={() => setShowFeedback(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-card rounded-2xl shadow-2xl z-50 p-6"
            >
              <h3 className="text-lg font-black text-foreground mb-4">⭐ Rate NM Mart</h3>
              {feedbackSent ? (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">🙏</p>
                  <p className="font-bold text-foreground">Thank you for your feedback!</p>
                  <button onClick={() => setShowFeedback(false)} className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold">Close</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 justify-center mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setFeedbackStars(s)}>
                        <Star size={28} className={s <= feedbackStars ? "fill-secondary text-secondary" : "text-muted-foreground/30"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Tell us about your experience..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    className="w-full bg-muted rounded-xl p-3 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24 placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => {
                      const msg = `⭐ NM Mart Feedback\nRating: ${"⭐".repeat(feedbackStars)}\n${feedbackText}`;
                      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`);
                      setFeedbackSent(true);
                    }}
                    className="w-full gradient-amber text-accent-foreground py-3 rounded-xl font-bold mt-3 hover:opacity-90 transition-opacity"
                  >
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

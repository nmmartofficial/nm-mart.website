import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, X, Plus, Minus, Trash2, MessageCircle, Send,
  Mic, MicOff, Clock, Star, MapPin, LayoutGrid, ArrowUp, Package, Gift, RotateCcw,
  ChevronRight, Banknote, QrCode, Phone, Instagram, Facebook, Youtube, CreditCard, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { Product, productSlug, WA_NUMBER, UPI_ID, MIN_ORDER, getOrderHistory, saveOrder, addLoyaltyPoints, getLoyaltyPoints, OrderRecord } from "@/lib/store-utils";
import ProductImageDisplay from "@/components/ProductImageDisplay";
import HeroBanner from "@/components/HeroBanner";
import DiscountTabs from "@/components/DiscountTabs";
import WelfareCardBanner from "@/components/WelfareCardBanner";
import ChatBot from "@/components/ChatBot";

const LOGO_URL = "https://i.postimg.cc/9XJ2GS8L/logo.jpg";
const ITEMS_PER_PAGE = 40;

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

/* ─── Category Icons ─── */
const CATEGORY_ICONS: Record<string, string> = {
  "Daily Essentials": "🛒", "Snacks": "🍿", "Grocery": "🥦", "Household": "🏠",
  "Beverages": "🥤", "Personal Care": "🧴", "Dairy": "🥛", "Cleaning": "🧹",
  "Spices": "🌶️", "Dry Fruits": "🥜", "Baby Care": "👶", "Health": "💊",
  "Stationery": "📝", "FMCG": "📦",
};

/* ─── Priority categories (shown first) ─── */
const PRIORITY_CATS = ["Daily Essentials", "Snacks"];
const HIDDEN_CATS = ["Bedsheets", "bedsheets"];

export default function Index() {
  const navigate = useNavigate();
  const { allProducts, loading, categories, flat33, flat50 } = useProducts();
  const { cart, addToCart, updateQty, removeItem, clearCart, cartTotal, cartCount, setCart } = useCart();

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"cod" | "upi">("cod");
  const [showOrders, setShowOrders] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const countdown = useCountdown();
  const { listening, toggle: toggleVoice } = useVoiceSearch(t => setQuery(t));

  // Auth state persistence
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

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + ITEMS_PER_PAGE);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedCat, query]);

  // Reset visible count on filter change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [selectedCat, query]);

  // Filter out Bedsheets, sort priority categories first
  const sortedCategories = useMemo(() => {
    const filtered = categories.filter(c => !HIDDEN_CATS.includes(c));
    const priority = filtered.filter(c => PRIORITY_CATS.includes(c));
    const rest = filtered.filter(c => !PRIORITY_CATS.includes(c));
    return [...priority, ...rest];
  }, [categories]);

  const filtered = useMemo(() => {
    let list = allProducts.filter(p => !HIDDEN_CATS.includes(p.category));
    if (selectedCat) list = list.filter(p => p.category === selectedCat);
    if (query) {
      const q = query.toLowerCase();
      list = allProducts.filter(p => !HIDDEN_CATS.includes(p.category) && (p.name.toLowerCase().includes(q) || p.barcode.includes(q)));
    }
    return list;
  }, [allProducts, selectedCat, query]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const remaining = MIN_ORDER - cartTotal;
  const loyaltyPoints = getLoyaltyPoints();
  const memberId = user ? `NM-MEM-${(user.id || "").slice(0, 4).toUpperCase()}` : null;

  const placeOrder = () => {
    if (cartTotal < MIN_ORDER) return alert(`Min order ₹${MIN_ORDER}!`);
    const orderId = "NM" + Date.now().toString(36).toUpperCase();
    const orderRecord: OrderRecord = { id: orderId, items: [...cart], total: cartTotal, date: new Date().toLocaleString("en-IN"), status: "Pending" };
    saveOrder(orderRecord);
    addLoyaltyPoints(10);

    const msg = cart.map(c => `• ${c.name} (x${c.qty}) = ₹${c.saleRate * c.qty}`).join("\n");
    const payLabel = payMethod === "cod" ? "💸 COD" : "💳 UPI";
    const memberLine = memberId ? `👤 Member: ${memberId}` : "";
    const text = `🛒 *NM MART ORDER*\n🆔 Order ID: ${orderId}\n${memberLine}\n\n${msg}\n\n💰 *Total: ₹${cartTotal}*\n${payLabel}\n📍 Delivery: Manjhanpur Area`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`);
    clearCart(); setCheckoutOpen(false); setCartOpen(false);
  };

  const reorder = (order: OrderRecord) => {
    setCart(order.items.map(i => ({ ...i })));
    setShowOrders(false); setCartOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Flash Sale Timer */}
      <div className="gradient-orange text-white text-center py-2 text-xs font-bold tracking-wide flex items-center justify-center gap-2">
        <Clock size={14} />
        <span>⚡ FLASH SALE ENDS IN</span>
        <span className="bg-black/30 text-white px-2.5 py-0.5 rounded font-mono text-sm">{countdown}</span>
      </div>

      {/* Sticky Header with Logo & Search */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-3 py-2.5">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src={LOGO_URL} alt="NM Mart" className="w-10 h-10 rounded-xl shadow-md" />
            <div className="hidden sm:block">
              <h1 className="text-base font-black tracking-tight leading-none">NM <span className="text-primary">MART</span></h1>
              <p className="text-[7px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Shop More Save More</p>
            </div>
          </a>

          {/* Search Bar - always visible */}
          <div className="flex-1 flex items-center bg-secondary rounded-xl border border-border overflow-hidden">
            <Search size={16} className="ml-3 text-primary shrink-0" />
            <input
              type="text"
              placeholder="7000+ products खोजें..."
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedCat(null); }}
              className="flex-1 px-2 py-2.5 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground text-foreground"
            />
            <button onClick={toggleVoice}
              className={`p-2 mr-1 rounded-lg transition-colors ${listening ? "bg-destructive text-destructive-foreground" : "hover:bg-card text-muted-foreground"}`}>
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {user ? (
              <button onClick={handleLogout} className="text-[9px] font-bold bg-secondary text-foreground px-3 py-2 rounded-lg border border-border hover:border-primary transition-all uppercase">
                Logout
              </button>
            ) : (
              <button onClick={() => navigate("/login")}
                className="text-[9px] font-bold bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-all uppercase flex items-center gap-1">
                <CreditCard size={12} /> Login
              </button>
            )}
            <button onClick={() => setShowOrders(true)} className="relative p-2 hover:bg-secondary rounded-lg transition-colors" title="Orders">
              <Package size={18} />
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 gradient-orange text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="font-bold text-primary uppercase text-xs tracking-wide">Loading 7000+ products...</p>
          </div>
        ) : (
          <>
            {/* Home View */}
            {!selectedCat && !query && (
              <>
                <DiscountTabs flat33={flat33} flat50={flat50} onAddToCart={addToCart} />

                {/* Category Grid */}
                {sortedCategories.length > 0 && (
                  <div className="mb-12">
                    <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
                      <LayoutGrid size={18} className="text-primary" /> Browse Categories
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {sortedCategories.map(cat => (
                        <motion.button whileTap={{ scale: 0.94 }} key={cat}
                          onClick={() => { setSelectedCat(cat); setQuery(""); }}
                          className="p-4 rounded-xl bg-card border border-border flex flex-col items-center gap-2 transition-all group hover:border-primary/50 hover:shadow-glow">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary text-2xl group-hover:bg-primary/20 transition-colors">
                            {CATEGORY_ICONS[cat] || "📦"}
                          </div>
                          <span className="font-bold text-foreground uppercase text-[9px] tracking-tight text-center leading-tight">{cat}</span>
                          <span className="text-[8px] text-primary flex items-center gap-0.5 font-semibold">Shop <ChevronRight size={8} /></span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <WelfareCardBanner />
              </>
            )}

            {/* Product Listing */}
            {(selectedCat || query) && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-lg text-foreground uppercase tracking-tight">
                    {query ? `"${query}" के रिजल्ट` : selectedCat}
                  </h2>
                  <button onClick={() => { setSelectedCat(null); setQuery(""); }}
                    className="text-[10px] font-bold uppercase text-primary border-b-2 border-primary hover:opacity-80">← वापस जाएं</button>
                </div>

                <p className="text-xs text-muted-foreground mb-4">{filtered.length} products मिले</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {visibleProducts.map((p, idx) => (
                    <motion.div key={`${p.barcode}-${idx}`}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.01, 0.2) }}
                      className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
                      onClick={() => navigate(`/product/${productSlug(p)}`)}
                    >
                      <div className="relative h-28 bg-secondary/30">
                        <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                        {p.discount > 0 && (
                          <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                            -{p.discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 flex flex-col flex-1">
                        <h3 className="font-semibold text-[10px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">{p.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-black text-primary">₹{p.saleRate}</span>
                          {p.discount > 0 && p.mrp > p.saleRate && (
                            <span className="text-[10px] text-muted-foreground line-through decoration-destructive/50">₹{p.mrp}</span>
                          )}
                          {p.discount > 0 && (
                            <span className="text-[10px] font-bold text-destructive ml-auto">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>
                        {p.save > 0 && <span className="text-[8px] font-bold text-[hsl(var(--success))] mt-0.5">Save ₹{p.save}</span>}
                        <div className="flex gap-1.5 mt-auto pt-2">
                          <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                            className="flex-1 bg-primary text-primary-foreground py-1.5 rounded-lg text-[9px] font-bold uppercase hover:bg-primary/90 transition-colors">
                            Add
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Order: ${p.name} - ₹${p.saleRate}`)}`); }}
                            className="p-1.5 bg-[hsl(var(--success))] rounded-lg text-white hover:opacity-90" title="WhatsApp">
                            <MessageCircle size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                {visibleCount < filtered.length && (
                  <div ref={loadMoreRef} className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">{filtered.length - visibleCount} और products लोड हो रहे हैं...</p>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <Package size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-bold">कोई प्रोडक्ट नहीं मिला</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={LOGO_URL} alt="NM Mart" className="w-9 h-9 rounded-lg" />
                <span className="font-black text-lg tracking-tight">NM <span className="text-primary">MART</span></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                मंझनपुर का सबसे भरोसेमंद रिटेल स्टोर। 7000+ प्रोडक्ट्स होलसेल रेट पर। क्वालिटी गारंटीड।
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground uppercase mb-3 tracking-wider">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="/about" className="hover:text-primary transition-colors">About Us</a>
                <a href="/contact" className="hover:text-primary transition-colors">Contact Us</a>
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="/admin" className="hover:text-primary transition-colors text-muted-foreground/30 text-xs">Admin</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground uppercase mb-3 tracking-wider">Contact</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Near B.P. Public School, Manjhanpur, Kaushambi, UP - 212207</p>
                <a href="tel:+917081154604" className="flex items-center gap-2 hover:text-primary transition-colors"><Phone size={14} className="text-primary" /> +91 708 115 4604</a>
                <p className="text-xs">⏰ 8 AM – 10 PM Daily</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground uppercase mb-3 tracking-wider">Follow & Rate Us</h4>
              <div className="flex gap-3 mb-4">
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-[hsl(var(--success))] hover:bg-[hsl(var(--success))] hover:text-white transition-all"><MessageCircle size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><Facebook size={18} /></a>
              </div>
              <a href="https://maps.google.com/?q=Manjhanpur+Kaushambi+UP" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-2">
                <MapPin size={14} /> Google Maps पर देखें
              </a>
              <a href="https://g.page/r/YOUR_PLACE_ID/review" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                <Star size={14} /> Rate Our Store ⭐
              </a>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-4 text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            © {new Date().getFullYear()} NM MART — Retail OS v7.0 | Manjhanpur, UP
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a href={`https://wa.me/${WA_NUMBER}?text=Hi NM Mart!`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[hsl(var(--success))] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
        <MessageCircle size={24} />
      </a>

      <ChatBot />

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 left-6 z-40 bg-card border border-border text-foreground p-3 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all">
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
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
                  <div className="flex justify-between font-black text-lg"><span>Total</span><span className="text-primary">₹{cartTotal}</span></div>
                  {remaining > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-center font-bold text-primary">
                      ₹{remaining} और जोड़ें (Min. ₹{MIN_ORDER})
                    </div>
                  )}
                  <button disabled={cartTotal < MIN_ORDER}
                    onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                    className="w-full gradient-orange text-white py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                    Checkout करें
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
                  <div className="border-t border-border pt-2 flex justify-between font-black text-lg">
                    <span>Total</span><span className="text-primary">₹{cartTotal}</span>
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-3 text-foreground uppercase tracking-wider text-center">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => setPayMethod("cod")}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === "cod" ? "border-primary bg-primary/10" : "border-border"}`}>
                    <Banknote size={20} className={payMethod === "cod" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-[9px] font-bold uppercase">Cash/COD</span>
                  </button>
                  <motion.a href={`upi://pay?pa=${UPI_ID}&pn=NMMART&am=${cartTotal}&cu=INR`}
                    onClick={() => setPayMethod("upi")} whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === "upi" ? "border-primary bg-primary/10" : "border-border"}`}>
                    <QrCode size={20} className={payMethod === "upi" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-[9px] font-bold uppercase">UPI Pay</span>
                  </motion.a>
                </div>
                {payMethod === "upi" && (
                  <div className="bg-secondary rounded-xl p-4 mb-4 text-center space-y-3 border-2 border-dashed border-primary/20">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=NM%20MART&am=${cartTotal}&cu=INR`}
                      alt="UPI QR" className="mx-auto w-40 h-40 rounded-lg shadow-md border-4 border-card" />
                    <p className="text-[10px] text-muted-foreground font-mono font-bold">{UPI_ID}</p>
                  </div>
                )}
                <button onClick={placeOrder}
                  className="w-full gradient-orange text-white py-4 rounded-xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2">
                  <Send size={18} /> WhatsApp पर Order भेजें
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
              className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowOrders(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 overflow-y-auto border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-foreground">📦 Order History</h2>
                  <button onClick={() => setShowOrders(false)} className="p-2 hover:bg-secondary rounded-lg"><X size={18} /></button>
                </div>
                {getOrderHistory().length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground">अभी तक कोई ऑर्डर नहीं</p>
                ) : getOrderHistory().map((o, i) => (
                  <div key={i} className="bg-secondary rounded-xl p-4 mb-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold uppercase text-foreground">{o.id}</span>
                      <span className="gradient-orange text-white px-2 py-0.5 rounded text-[9px] font-bold">{o.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{o.date}</p>
                    <p className="font-black text-primary">₹{o.total}</p>
                    <button onClick={() => reorder(o)} className="flex items-center gap-1 text-primary text-xs font-bold hover:underline">
                      <RotateCcw size={12} /> फिर से ऑर्डर करें
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, X, MessageCircle,
  Mic, MicOff, Star, LayoutGrid, ArrowUp, Package, Gift,
  ChevronRight, User as UserIcon, CreditCard
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { productSlug, WA_NUMBER, UPI_ID, MIN_ORDER, saveOrder, addLoyaltyPoints, getLoyaltyPoints, OrderRecord, normalizeCategory } from "@/lib/store-utils";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import HeroBanner from "@/components/shop/HeroBanner";
import ChatBot from "@/components/shop/ChatBot";
import Footer from "@/components/shop/Footer";
import FlashSaleBanner from "@/components/shop/FlashSaleBanner";
import WelfareModals from "@/components/shop/modals/WelfareModals";
import CartDrawer from "@/components/shop/modals/CartDrawer";
import CheckoutModal from "@/components/shop/modals/CheckoutModal";
import OrdersModal from "@/components/shop/modals/OrdersModal";

const LOGO_URL = "/nm-mart-logo.png";
const SLOGAN = "Shop More, Save More";
const ITEMS_PER_PAGE = 40;

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

/* ─── Category Icons (मंझनपुर NM Mart POS Categories) ─── */
const CATEGORY_ICONS: Record<string, string> = {
  "SOAP": "🧼",
  "DIS WASH": "🧽",
  "COIL": "🌀",
  "SPICES": "🌶️",
  "SNACKS": "🍿",
  "GROCERY": "🥦",
  "BEVERAGES": "🥤",
  "PERSONAL CARE": "🧴",
  "DAIRY": "🥛",
  "CLEANING": "🧹",
  "STATIONERY": "📝",
  "FMCG": "📦",
};

/* ─── Priority categories (shown first) ─── */
const PRIORITY_CATS = ["SOAP", "SNACKS", "SPICES"].map(normalizeCategory);
const HIDDEN_CATS: string[] = [];

export default function Index() {
  const navigate = useNavigate();
  const { allProducts, loading, categories, brands, flat33, flat50 } = useProducts();
  const { cart, addToCart, updateQty, removeItem, clearCart, cartTotal, cartCount, setCart } = useCart();

  // Helper for Category Icons
  const getCategoryIcon = (cat: string) => {
    const normalized = normalizeCategory(cat);
    return CATEGORY_ICONS[normalized] || "📦";
  };

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"cod" | "upi">("cod");
  const [showOrders, setShowOrders] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [welfareCard, setWelfareCard] = useState<{ number: string; active: boolean; points: number } | null>(null);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { listening, toggle: toggleVoice } = useVoiceSearch(t => setQuery(t));

  // Auth state persistence
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWelfareStatus(session.user.id);
      } else {
        setWelfareCard(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWelfareStatus(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchWelfareStatus = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('welfare_status, welfare_card_number, points_balance')
          .eq('id', userId)
          .single();
        
        if (data) {
          let cardNumber = data.welfare_card_number;
          
          // Auto-generate 10-digit card number if missing
          if (!cardNumber) {
            cardNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            await supabase
              .from('profiles')
              .update({ welfare_card_number: cardNumber })
              .eq('id', userId);
          }

          setWelfareCard({
            number: cardNumber,
            active: data.welfare_status === 'active',
            points: data.points_balance || 0
          });
        }
      } catch (err) {
        console.error("Welfare status fetch error:", err);
      }
    };

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
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [selectedCat, selectedBrand, query]);

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
    if (selectedBrand) list = list.filter(p => (p as any).brand === selectedBrand);
    if (query) {
      const q = query.toLowerCase();
      list = allProducts.filter(p => !HIDDEN_CATS.includes(p.category) && (p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.category.toLowerCase().includes(q)));
    }
    return list;
  }, [allProducts, selectedCat, selectedBrand, query]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const remaining = MIN_ORDER - cartTotal;
  const loyaltyPoints = getLoyaltyPoints();
  const welfareDiscount = welfareCard?.active ? Math.round(cartTotal * 0.05) : 0;
  const finalTotal = cartTotal - welfareDiscount;
  const memberId = user ? `NM-MEM-${(user.id || "").slice(0, 4).toUpperCase()}` : null;

  const placeOrder = async () => {
     try {
       const { data: { session } } = await supabase.auth.getSession();
       let customerDetails = "";
       let orderCustomerData: any = {};

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          customerDetails = `\n\n👤 *Customer Details:* \nName: ${profile.full_name}\nPhone: ${profile.mobile}\nAddress: ${profile.address || "N/A"}\nLandmark: ${profile.landmark || "N/A"}`;
          if (profile.welfare_status === 'active') {
            customerDetails += `\n🌟 *Welfare Member:* ${profile.welfare_card_number}`;
          }
          // Store customer data in order for Admin view
          orderCustomerData = {
            customer: profile.full_name,
            phone: profile.mobile,
            address: profile.address,
            landmark: profile.landmark
          };
        }
      }

      if (cartTotal < MIN_ORDER) return alert(`Min order ₹${MIN_ORDER}!`);
      const orderId = `NMM-${Date.now()}`;
      const itemsText = cart.map(c => `- ${c.name} (x${c.qty}): ₹${c.saleRate * c.qty}`).join("\n");
      let text = `*New Order from NM Mart Web* 🛒\n\n🆔 *Order ID:* ${orderId}\n📦 *Items:*\n${itemsText}\n\n💰 *Subtotal:* ₹${cartTotal}`;
      
      if (welfareDiscount > 0) {
        text += `\n🌟 *Welfare Discount (5%):* -₹${welfareDiscount}\n✅ *Final Total:* ₹${finalTotal}`;
      } else {
        text += `\n\n💰 *Total:* ₹${cartTotal}`;
      }
      
      text += `\n💳 *Payment:* ${payMethod.toUpperCase()}${customerDetails}\n\n_Please confirm my order!_`;
      
      const orderData = {
        id: orderId,
        customer_id: user?.id || null,
        items: cart,
        total: finalTotal,
        status: "Pending",
        customer_name: orderCustomerData.customer || "Guest",
        customer_phone: orderCustomerData.phone || "",
        shipping_address: orderCustomerData.address || "Store Pickup",
        landmark: orderCustomerData.landmark || "",
        payment_method: payMethod,
        created_at: new Date().toISOString()
      };
      
      // Save to Supabase
      const { error: supabaseError } = await supabase
        .from("orders")
        .insert([orderData]);

      if (supabaseError) {
        console.error("Supabase order save error:", supabaseError);
        toast.error("Failed to save order to database, but sending via WhatsApp...");
      }

      const pointsEarned = Math.floor(finalTotal / 100);
      
      // Update points in database
      if (user) {
        await supabase
          .from('profiles')
          .update({ points_balance: (welfareCard?.points || 0) + pointsEarned })
          .eq('id', user.id);
      }

      saveOrder({
        id: orderId,
        items: cart,
        total: cartTotal,
        date: new Date().toLocaleString(),
        status: "Pending"
      });
      
      addLoyaltyPoints(pointsEarned);
      
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
      clearCart();
      setCheckoutOpen(false);
      setCartOpen(false);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Order process failed", err);
      toast.error("Order process failed");
    }
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <FlashSaleBanner />

      {/* Sticky Header with Logo */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-3 py-2.5">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src={LOGO_URL} alt="NM Mart" className="w-10 h-10 rounded-xl shadow-md" />
            <div className="hidden sm:block">
              <h1 className="text-base font-black tracking-tight leading-none text-black italic uppercase">NM <span className="text-primary">MART</span></h1>
              <p className="text-[7px] uppercase tracking-[0.15em] text-gray-400 font-bold italic">{SLOGAN}</p>
            </div>
          </a>

          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {user ? (
              <button 
                onClick={() => navigate("/profile")} 
                className="flex items-center gap-2 bg-secondary text-foreground px-3 py-2 rounded-lg border border-border hover:border-sky-blue transition-all group"
              >
                <UserIcon size={14} className="text-sky-blue" />
                <span className="text-[9px] font-bold uppercase hidden md:inline">My Profile</span>
              </button>
            ) : (
              <button onClick={() => navigate("/login")}
                className="text-[9px] font-bold bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-all uppercase flex items-center gap-1">
                <CreditCard size={12} /> Login
              </button>
            )}

            {/* Welfare Card Button */}
            {welfareCard?.active ? (
              <button 
                onClick={() => setShowGoldenCard(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 border-2 border-yellow-600 px-2.5 py-1.5 rounded-xl hover:shadow-lg transition-all group shadow-sm animate-pulse-glow"
              >
                <Star size={14} className="text-yellow-800 fill-current" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] font-black uppercase tracking-tighter text-yellow-900">Active Card</span>
                  <span className="text-[9px] font-black text-black hidden sm:inline">{user?.user_metadata?.full_name?.split(' ')[0] || "Active"}</span>
                </div>
              </button>
            ) : (
              <button 
                onClick={() => setShowWelfareModal(true)}
                className="flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-1.5 rounded-xl hover:bg-black hover:text-white transition-all group shadow-sm"
              >
                <Star size={14} className="text-black group-hover:text-white fill-current" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-black group-hover:text-white hidden sm:inline">Welfare Card</span>
              </button>
            )}

            <button onClick={() => setShowOrders(true)} className="relative p-2 hover:bg-secondary rounded-lg transition-colors" title="Orders">
              <Package size={18} />
            </button>

            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 gradient-sky-blue text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Section - Professional & Prominent */}
      <div className="sticky top-[64px] z-40 bg-background/80 backdrop-blur-xl border-b border-border py-4 px-4 shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 bg-secondary border border-border rounded-2xl p-2 md:p-3 focus-within:border-primary/50 transition-all shadow-inner">
              <div className="pl-3 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search size={22} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search over 7,358+ products in NM Mart Manjhanpur..."
                className="flex-1 bg-transparent border-none outline-none text-foreground text-base md:text-lg font-bold placeholder:text-muted-foreground/60 placeholder:font-black placeholder:uppercase placeholder:text-[10px] md:placeholder:text-xs placeholder:tracking-[2px]"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedCat(null); }}
              />
              <div className="flex items-center gap-1 md:gap-2 pr-2">
                {query && (
                  <button 
                    onClick={() => setQuery("")}
                    className="p-2 hover:bg-card rounded-xl text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X size={20} />
                  </button>
                )}
                <div className="w-[1px] h-8 bg-border mx-1"></div>
                <button
                  onClick={toggleVoice}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 group/btn ${
                    listening 
                    ? "bg-destructive text-destructive-foreground animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                    : "bg-card text-muted-foreground hover:bg-secondary hover:text-primary border border-border"
                  }`}
                >
                  {listening ? <Mic size={20} /> : <MicOff size={20} />}
                  <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">
                    {listening ? "Listening..." : "Voice Search"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner onBannerClick={(link) => {
        if (link.type === 'category') setSelectedCat(link.value);
        if (link.type === 'query') setQuery(link.value);
        if (link.type === 'offer') {
          setQuery(""); setSelectedCat(null);
          // Scroll to offer section
          document.getElementById(`offer-${link.value}`)?.scrollIntoView({ behavior: 'smooth' });
        }
      }} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-12">
            {/* Category Skeleton */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <Skeleton className="w-20 h-3" />
                </div>
              ))}
            </div>
            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-4">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-12 h-6" />
                    <Skeleton className="w-16 h-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Home View */}
            {!selectedCat && !selectedBrand && !query && (
              <>
                {/* 50% OFF Section */}
                {flat50.length > 0 && (
                  <div id="offer-50" className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-foreground text-lg uppercase flex items-center gap-2 tracking-tight">
                        <Gift size={18} className="text-primary" /> 50% OFF Deals
                      </h3>
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase italic animate-pulse">Big Savings</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {flat50.slice(0, 6).map((p, idx) => (
                        <motion.div key={`${p.barcode}-${idx}`}
                          whileHover={{ y: -5 }}
                          className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
                          onClick={() => navigate(`/product/${productSlug(p)}`)}
                        >
                          <div className="relative h-24 bg-secondary/30">
                            <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                            <span className="absolute top-1 right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded italic">50% OFF</span>
                          </div>
                          <div className="p-2 flex flex-col flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="bg-primary/10 text-primary text-[6px] font-black px-1 py-0.5 rounded-full uppercase tracking-tighter">
                                {p.category}
                              </span>
                            </div>
                            <h3 className="font-semibold text-[9px] text-foreground uppercase leading-tight h-6 overflow-hidden mb-1">{p.name}</h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-primary">₹{p.price}</span>
                              <span className="text-[8px] text-muted-foreground line-through">₹{p.mrp}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                              className="mt-2 bg-primary text-primary-foreground py-1 rounded-lg text-[8px] font-bold uppercase hover:bg-black transition-colors">
                              Add to Cart
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 33% OFF Section */}
                {flat33.length > 0 && (
                  <div id="offer-33" className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-foreground text-lg uppercase flex items-center gap-2 tracking-tight">
                        <Package size={18} className="text-primary" /> 33% OFF Deals
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {flat33.slice(0, 6).map((p, idx) => (
                        <motion.div key={`${p.barcode}-${idx}`}
                          whileHover={{ y: -5 }}
                          className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
                          onClick={() => navigate(`/product/${productSlug(p)}`)}
                        >
                          <div className="relative h-24 bg-secondary/30">
                            <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                            <span className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded italic">33% OFF</span>
                          </div>
                          <div className="p-2 flex flex-col flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="bg-primary/10 text-primary text-[6px] font-black px-1 py-0.5 rounded-full uppercase tracking-tighter">
                                {p.category}
                              </span>
                            </div>
                            <h3 className="font-semibold text-[9px] text-foreground uppercase leading-tight h-6 overflow-hidden mb-1">{p.name}</h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-primary">₹{p.price}</span>
                              <span className="text-[8px] text-muted-foreground line-through">₹{p.mrp}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                              className="mt-2 bg-primary text-primary-foreground py-1 rounded-lg text-[8px] font-bold uppercase hover:bg-black transition-colors">
                              Add to Cart
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shop by Category Section */}
                {sortedCategories.length > 0 && (
                  <div className="mb-12">
                    <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
                      <LayoutGrid size={18} className="text-primary" /> Shop by Category
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {sortedCategories.map(cat => (
                        <motion.button whileTap={{ scale: 0.94 }} key={cat}
                          onClick={() => { setSelectedCat(cat); setSelectedBrand(null); setQuery(""); }}
                          className="p-4 rounded-xl bg-card border border-border flex flex-col items-center gap-2 transition-all group hover:border-primary/50 hover:shadow-glow">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary text-2xl group-hover:bg-primary/20 transition-colors">
                            {getCategoryIcon(cat)}
                          </div>
                          <span className="font-bold text-foreground uppercase text-[9px] tracking-tight text-center leading-tight">{cat}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shop by Brand Section */}
                {brands.length > 0 && (
                  <div className="mb-12">
                    <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
                      <Star size={18} className="text-primary" /> Shop by Brand
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {brands.map(brand => (
                        <motion.button whileTap={{ scale: 0.95 }} key={brand}
                          onClick={() => { setSelectedBrand(brand); setSelectedCat(null); setQuery(""); }}
                          className="px-5 py-2.5 rounded-full bg-card border border-border text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm">
                          {brand}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Category-wise Product Sections */}
                {sortedCategories.slice(0, 6).map(cat => {
                  const catProducts = allProducts.filter(p => p.category === cat && !HIDDEN_CATS.includes(p.category)).slice(0, 6);
                  if (catProducts.length === 0) return null;
                  return (
                    <div key={cat} className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-foreground text-base uppercase tracking-tight flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(cat)}</span> {cat}
                        </h3>
                        <button onClick={() => { setSelectedCat(cat); setQuery(""); }}
                          className="text-[10px] font-bold uppercase text-primary flex items-center gap-1 hover:underline">
                          View All <ChevronRight size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {catProducts.map((p, idx) => (
                          <motion.div key={`${p.barcode}-${idx}`}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
                            onClick={() => navigate(`/product/${productSlug(p)}`)}
                          >
                            <div className="relative h-24 bg-secondary/30">
                              <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                              {p.discount > 0 && (
                                <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[8px] font-bold px-1 py-0.5 rounded">-{p.discount}%</span>
                              )}
                            </div>
                            <div className="p-2 flex flex-col flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="bg-primary/10 text-primary text-[6px] font-black px-1 py-0.5 rounded-full uppercase tracking-tighter">
                                  {p.category}
                                </span>
                                {p.stock > 0 && (
                                  <span className="text-[6px] font-bold text-[hsl(var(--success))] flex items-center gap-0.5">
                                    <Star size={7} className="fill-current" /> IN STOCK
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-[9px] text-foreground uppercase leading-tight h-6 overflow-hidden mb-1">{p.name}</h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-base font-black text-primary">₹{p.price}</span>
                                {p.mrp > p.price && <span className="text-[8px] text-muted-foreground line-through">₹{p.mrp}</span>}
                              </div>
                              {(p.price === 0) && (
                                <span className="text-[8px] font-bold text-amber-500 mt-1">🕐 Pre-order for Tomorrow Delivery</span>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                                className="mt-auto bg-primary text-primary-foreground py-1 rounded-lg text-[8px] font-bold uppercase hover:bg-primary/90 transition-colors">
                                Add to Cart
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Product Listing */}
            {(selectedCat || selectedBrand || query) && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-lg text-foreground uppercase tracking-tight">
                    {query ? `"${query}" के रिजल्ट` : (selectedCat || selectedBrand)}
                  </h2>
                  <button onClick={() => { setSelectedCat(null); setSelectedBrand(null); setQuery(""); }}
                    className="text-[10px] font-bold uppercase text-primary border-b-2 border-primary hover:opacity-80">← वापस जाएं</button>
                </div>

                <p className="text-xs text-muted-foreground mb-4">{filtered.length} products मिले</p>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                      <Search size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-tight">No products found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                      हमने आपकी खोज के लिए कोई उत्पाद नहीं पाया। कृपया कुछ और खोजें।
                    </p>
                    <button 
                      onClick={() => { setQuery(""); setSelectedCat(null); setSelectedBrand(null); }}
                      className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
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
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-primary/10 text-primary text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                              {p.category}
                            </span>
                            {p.stock > 0 && (
                              <span className="text-[7px] font-bold text-[hsl(var(--success))] flex items-center gap-0.5">
                                <Star size={8} className="fill-current" /> IN STOCK
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-[10px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">{p.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-black text-primary">₹{p.price}</span>
                            {p.discount > 0 && p.mrp > p.price && (
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
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {visibleCount < filtered.length && (
                  <div className="mt-12 text-center">
                    <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                      className="bg-white border-2 border-primary text-primary px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-md active:scale-95">
                      Load More Products
                    </button>
                  </div>
                )}
                
                {/* Infinite Scroll Target */}
                <div ref={loadMoreRef} className="h-10 w-full" />
              </>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* WhatsApp FAB */}
      <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi NM Mart, I need manual support with my order/account.')}`} target="_blank" rel="noopener noreferrer"
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

      <CartDrawer 
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        updateQty={updateQty}
        removeItem={removeItem}
        welfareDiscount={welfareDiscount}
        finalTotal={finalTotal}
        remaining={remaining}
        setCheckoutOpen={setCheckoutOpen}
      />

      <CheckoutModal 
        checkoutOpen={checkoutOpen}
        setCheckoutOpen={setCheckoutOpen}
        memberId={memberId}
        cart={cart}
        cartTotal={cartTotal}
        welfareDiscount={welfareDiscount}
        finalTotal={finalTotal}
        payMethod={payMethod}
        setPayMethod={setPayMethod}
        placeOrder={placeOrder}
      />

      <WelfareModals 
        showGoldenCard={showGoldenCard}
        setShowGoldenCard={setShowGoldenCard}
        showWelfareModal={showWelfareModal}
        setShowWelfareModal={setShowWelfareModal}
        welfareCard={welfareCard}
        user={user}
      />

      <OrdersModal 
        showOrders={showOrders}
        setShowOrders={setShowOrders}
        reorder={reorder}
      />
    </div>
  );
}

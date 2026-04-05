import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import {
  ShoppingCart, Search, X, MessageCircle,
  Mic, MicOff, Star, LayoutGrid, ArrowUp, Package, Gift,
  ChevronRight, User as UserIcon, CreditCard, ScanBarcode,
  Edit3, Save, Loader2 as LoaderIcon, Image as ImageIcon, Upload,
  Database, LogOut
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
import DiscountTabs from "@/components/shop/DiscountTabs";
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
  const { 
    allProducts, loading, categories, brands, 
    flat33, flat50, hasMore, loadMore, totalCount,
    total50, total33, hasMore50, hasMore33, loadMore50, loadMore33
  } = useProducts();
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
  const [transactionId, setTransactionId] = useState("");
  const [showOrders, setShowOrders] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [welfareCard, setWelfareCard] = useState<{ number: string; active: boolean; points: number } | null>(null);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return localStorage.getItem("nm_admin_session") === "true";
  });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const quickEditImageRef = useRef<HTMLInputElement>(null);

  const { listening, toggle: toggleVoice } = useVoiceSearch(t => setQuery(t));

  const startScanner = () => {
    if (scannerRef.current) return;
    setIsScanning(true);
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("search-reader");
      scannerRef.current = html5QrCode;
      html5QrCode.start(
        { facingMode: "environment" },
        { 
          fps: 60, 
          qrbox: (viewfinderWidth, vh) => {
            const minEdge = Math.min(viewfinderWidth, vh);
            const size = Math.floor(minEdge * 0.8);
            return { width: size, height: size / 2 }; // Rectangular for barcodes
          },
          aspectRatio: 1.0,
          disableFlip: true,
          rememberLastUsedCamera: true
        },
        (decodedText) => {
          setQuery(decodedText);
          handleBarcodeSearch(decodedText);
          stopScanner();
        },
        () => {}
      ).catch(err => {
        console.error("Scanner error:", err);
        toast.error("Camera access denied");
        setIsScanning(false);
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setIsScanning(false);
      }).catch(() => {
        scannerRef.current = null;
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  const handleBarcodeSearch = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('RawCodeNew', code)
        .maybeSingle();
      
      if (data) {
        // If found, navigate to product detail immediately for "instant catch"
        const p = {
          id: data.RawCodeNew,
          name: data.RawName,
          barcode: data.RawCodeNew,
          category: normalizeCategory(data.ItemGroupName || "GENERAL")
        };
        navigate(`/product/${productSlug(p)}`);
      } else {
        toast.info("Product not found by barcode, showing search results...");
      }
    } catch (err) {
      console.error("Barcode search error:", err);
    }
  };

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
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  // Reset visible count on filter change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [selectedCat, selectedBrand, query]);

  // Filter out Bedsheets, sort priority categories first
  const sortedCategories = useMemo(() => {
    const filtered = categories.filter(c => !HIDDEN_CATS.includes(c));
    const priority = filtered.filter(c => PRIORITY_CATS.includes(c));
    const rest = filtered.filter(c => !PRIORITY_CATS.includes(c));
    return [...priority, ...rest];
  }, [categories]);

  const handleBannerClick = (link: { type: string, value: string }) => {
    if (link.type === 'category') {
      setSelectedCat(link.value);
      setSelectedBrand(null);
      setQuery("");
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else if (link.type === 'query') {
      setQuery(link.value);
      setSelectedCat(null);
      setSelectedBrand(null);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else if (link.type === 'offer') {
      // Offers are usually at the top, just scroll there or we can add a filter
      setQuery("");
      setSelectedCat(null);
      setSelectedBrand(null);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const filtered = useMemo(() => {
    // 100% Live data from the 'products' table using mapped columns
    let list = allProducts.filter(p => !HIDDEN_CATS.includes(p.category));
    
    // Sort: Products with images first
    list = [...list].sort((a, b) => {
      const aHasImg = !!a.imageUrl;
      const bHasImg = !!b.imageUrl;
      if (aHasImg && !bHasImg) return -1;
      if (!aHasImg && bHasImg) return 1;
      return a.name.localeCompare(b.name);
    });

    if (selectedCat) {
      list = list.filter(p => p.category === selectedCat);
    }
    
    if (selectedBrand) {
      list = list.filter(p => (p as any).brand === selectedBrand);
    }
    
    if (query) {
      const q = query.toLowerCase();
      // Searching through RawName and RawCodeNew columns (mapped as name and barcode)
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProducts, selectedCat, selectedBrand, query]);

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
        text += `\n\n💰 *Total:* ₹${finalTotal}`;
      }
      
      text += `\n💳 *Payment:* ${payMethod.toUpperCase()}${payMethod === 'upi' && transactionId ? `\n🆔 *UTR/Txn ID:* ${transactionId}` : ''}${customerDetails}\n\n_Please confirm my order!_`;
      
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
        transaction_id: payMethod === 'upi' ? transactionId : null,
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

  const handleQuickEdit = (p: any) => {
    setEditingProduct({
      ...p,
      mrp: p.mrp,
      salePrice: p.price,
      stock: p.stock || 0,
      category: p.category || "",
      imageUrl: p.imageUrl || ""
    });
  };

  const handleQuickImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingProduct.barcode}-${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setEditingProduct({ ...editingProduct, imageUrl: publicUrl });
      toast.success("Image uploaded!");
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const submitQuickEdit = async () => {
    if (!editingProduct) return;
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          RawName: editingProduct.name,
          ItemGroupName: editingProduct.category,
          MRP: Number(editingProduct.mrp),
          Rate: Number(editingProduct.salePrice),
          OpStock: Number(editingProduct.stock),
          image_url: editingProduct.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('RawCodeNew', editingProduct.barcode);

      if (error) throw error;
      toast.success("Product updated instantly!");
      setEditingProduct(null);
      // Refresh to show changes
      window.location.reload(); 
    } catch (err) {
      console.error("Quick edit failed", err);
      toast.error("Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Admin Mode Bar */}
      {isAdminMode && (
        <div className="bg-black text-white py-3 px-6 flex items-center justify-between sticky top-0 z-[60] border-b border-white/20 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.9)]"></div>
              <h2 className="text-sm font-black uppercase tracking-[4px] italic text-white">ADMIN MODE ACTIVE</h2>
            </div>
            <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Inventory Control Enabled</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl active:scale-95 group">
              <Database size={14} className="group-hover:rotate-12 transition-transform" /> Return to Inventory
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem("nm_admin_session");
                setIsAdminMode(false);
                toast.info("Admin Mode Disabled");
              }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all px-4 py-2 rounded-2xl border border-white/10 hover:border-red-500/50"
            >
              Exit Mode
            </button>
          </div>
        </div>
      )}
      <FlashSaleBanner />

      {/* Sticky Header with Logo */}
      <header className={`sticky z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 ${isAdminMode ? 'top-[52px]' : 'top-0'}`}>
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
      <div className={`sticky z-40 bg-background/80 backdrop-blur-xl border-b border-border py-4 px-4 shadow-2xl transition-all duration-300 ${isAdminMode ? 'top-[116px]' : 'top-[64px]'}`}>
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
                onChange={(e) => { 
                  const val = e.target.value;
                  setQuery(val); 
                  setSelectedCat(null);
                  // If input looks like a full barcode (usually 8, 12, or 13 digits), try instant catch
                  if (/^\d{8,14}$/.test(val)) {
                    handleBarcodeSearch(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && /^\d+$/.test(query)) {
                    handleBarcodeSearch(query);
                  }
                }}
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
                <button
                  onClick={startScanner}
                  className="p-3 rounded-xl bg-card text-muted-foreground hover:bg-secondary hover:text-primary border border-border transition-all flex items-center gap-2"
                >
                  <ScanBarcode size={20} />
                  <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Scan Barcode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-lg aspect-square bg-black rounded-[40px] overflow-hidden border-4 border-primary relative shadow-2xl">
              <div id="search-reader" className="w-full h-full"></div>
              <div className="absolute inset-0 border-2 border-white/20 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-primary rounded-3xl animate-pulse shadow-[0_0_50px_rgba(255,0,0,0.3)]"></div>
              </div>
            </div>
            <p className="mt-8 text-white font-black uppercase tracking-[4px] text-xs animate-bounce italic">Align barcode inside frame</p>
            <button 
              onClick={stopScanner}
              className="mt-10 bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/20"
            >
              Cancel Scan
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <div className={`${isAdminMode ? 'pt-[116px]' : 'pt-0'}`}>
        <HeroBanner onBannerClick={handleBannerClick} />
      </div>

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
          </div>
        ) : (
          <>
            {/* Home View */}
            {!selectedCat && !selectedBrand && !query && (
              <>
                {/* Discount Collections Tabs (50% & 33%) - MOVED TO TOP */}
                {(flat50.length > 0 || flat33.length > 0) && (
                  <DiscountTabs 
                    flat33={flat33} 
                    flat50={flat50} 
                    total50={total50}
                    total33={total33}
                    hasMore50={hasMore50}
                    hasMore33={hasMore33}
                    loadMore50={loadMore50}
                    loadMore33={loadMore33}
                    onAddToCart={addToCart} 
                    onQuickEdit={handleQuickEdit}
                  />
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
                  const catProducts = allProducts
                    .filter(p => p.category === cat && !HIDDEN_CATS.includes(p.category))
                    .sort((a, b) => {
                      const aHasImg = !!a.imageUrl;
                      const bHasImg = !!b.imageUrl;
                      if (aHasImg && !bHasImg) return -1;
                      if (!aHasImg && bHasImg) return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .slice(0, 6);
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
                                <span className="absolute top-1 right-1 bg-destructive text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                                  {p.discount}% OFF
                                </span>
                              )}
                            </div>
                            <div className="p-2 flex flex-col flex-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="bg-primary/10 text-primary text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                  {p.category}
                                </span>
                                <span className={`text-[7px] font-bold flex items-center gap-0.5 ${p.stock && p.stock > 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                                  <Star size={8} className="fill-current" /> {p.stock && p.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                                </span>
                              </div>
                              <h3 className="font-semibold text-[10px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">{p.name}</h3>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-xl font-black text-primary">₹{p.price}</span>
                                {p.mrp > p.price && (
                                  <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/50 font-medium">₹{p.mrp}</span>
                                )}
                                {p.discount > 0 && (
                                  <span className="text-[10px] font-bold text-destructive ml-auto">
                                    {p.discount}% OFF
                                  </span>
                                )}
                              </div>
                              {p.save > 0 && p.stock && p.stock > 0 && <span className="text-[8px] font-bold text-[hsl(var(--success))] mt-0.5">Save ₹{p.save}</span>}
                              {(p.price === 0) && (
                                <span className="text-[8px] font-bold text-amber-500 mt-1">🕐 Pre-order for Tomorrow Delivery</span>
                              )}
                              <div className="flex gap-1.5 mt-auto pt-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); if(p.stock && p.stock > 0) addToCart(p); }}
                                  disabled={!p.stock || p.stock <= 0}
                                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors ${p.stock && p.stock > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                                  {p.stock && p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                </button>
                                {isAdminMode && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleQuickEdit(p); }}
                                    className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-black transition-all shadow-md active:scale-95"
                                    title="Quick Edit Product"
                                  >
                                    <Edit3 size={14} strokeWidth={2.5} />
                                  </button>
                                )}
                              </div>
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

                <p className="text-xs text-muted-foreground mb-4">
                  {selectedCat 
                    ? `${filtered.length} products found in ${selectedCat}` 
                    : (query ? `Showing ${filtered.length} results for "${query}"` : `${totalCount} items in NM Mart`)}
                </p>

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
                    {filtered.map((p, idx) => (
                      <motion.div key={`${p.barcode}-${idx}`}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.01, 0.2) }}
                        className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
                        onClick={() => navigate(`/product/${productSlug(p)}`)}
                      >
                        <div className="relative h-28 bg-secondary/30">
                          <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                          {p.discount > 0 && (
                            <span className="absolute top-2 right-2 bg-destructive text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="bg-primary/10 text-primary text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                {p.category}
                              </span>
                              <span className={`text-[7px] font-bold flex items-center gap-0.5 ${p.stock && p.stock > 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                                <Star size={8} className="fill-current" /> {p.stock && p.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                              </span>
                            </div>
                            <h3 className="font-semibold text-[10px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">{p.name}</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-xl font-black text-primary">₹{p.price}</span>
                              {p.mrp > p.price && (
                                <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/50 font-medium">₹{p.mrp}</span>
                              )}
                              {p.discount > 0 && (
                                <span className="text-[10px] font-bold text-destructive ml-auto">
                                  {p.discount}% OFF
                                </span>
                              )}
                            </div>
                            {p.save > 0 && p.stock && p.stock > 0 && <span className="text-[8px] font-bold text-[hsl(var(--success))] mt-0.5">Save ₹{p.save}</span>}
                            <div className="flex gap-1.5 mt-auto pt-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(p.stock && p.stock > 0) addToCart(p); }}
                                disabled={!p.stock || p.stock <= 0}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors ${p.stock && p.stock > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                                {p.stock && p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                              </button>
                              {isAdminMode && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleQuickEdit(p); }}
                                  className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-black transition-all shadow-md active:scale-95"
                                  title="Quick Edit Product"
                                >
                                  <Edit3 size={14} strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div className="mt-12 text-center">
                    <button onClick={() => loadMore()}
                      disabled={loading}
                      className="bg-white border-2 border-primary text-primary px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-50">
                      {loading ? "Loading..." : "Load More Products"}
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

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
              onClick={() => setEditingProduct(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] bg-white rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-gray-100"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-black leading-none">Quick Edit</h3>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[2px] mt-1 italic">{editingProduct.barcode}</p>
                  </div>
                  <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Quick Image Edit */}
                  <div className="flex justify-center mb-4">
                    <div className="relative group cursor-pointer" onClick={() => quickEditImageRef.current?.click()}>
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group-hover:border-primary transition-all">
                        {uploadingImage ? (
                          <LoaderIcon className="animate-spin text-primary" size={24} />
                        ) : editingProduct.imageUrl ? (
                          <img src={editingProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-300" size={24} />
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity">
                        <Upload className="text-white" size={20} />
                      </div>
                      <input 
                        type="file" 
                        ref={quickEditImageRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleQuickImageUpload} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Product Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Category</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">MRP (₹)</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-black outline-none focus:border-primary transition-all"
                        value={editingProduct.mrp}
                        onChange={(e) => setEditingProduct({ ...editingProduct, mrp: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Sale Rate (₹)</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-black outline-none focus:border-primary transition-all text-primary"
                        value={editingProduct.salePrice}
                        onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Stock (Pieces)</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-black outline-none focus:border-primary transition-all"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={submitQuickEdit}
                      disabled={editLoading}
                      className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 italic"
                    >
                      {editLoading ? <LoaderIcon className="animate-spin" size={18} /> : <Save size={18} />}
                      Update Instantly
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
        transactionId={transactionId}
        setTransactionId={setTransactionId}
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

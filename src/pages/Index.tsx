import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ShoppingCart, Search, X, MessageCircle,
  Mic, MicOff, Star, LayoutGrid, ArrowUp, Package, Gift,
  ChevronRight, User as UserIcon, CreditCard, ScanBarcode,
  Edit3, Save, Loader2 as LoaderIcon, Image as ImageIcon, Upload,
  Database, LogOut, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useTheme } from "@/lib/ThemeProvider";
import { 
  productSlug, WA_NUMBER, UPI_ID, MIN_ORDER, saveOrder, 
  addLoyaltyPoints, getLoyaltyPoints, OrderRecord, normalizeCategory, getOrderHistory,
  STORE_DETAILS, calculateTaxes, calculateDeliveryFee
} from "@/lib/store-utils";
import { getSectionLayout, SectionLayout } from "@/lib/storeConfig";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import HeroBanner from "@/components/shop/HeroBanner";
import ChatBot from "@/components/shop/ChatBot";
import Footer from "@/components/shop/Footer";
import FlashSaleBanner from "@/components/shop/FlashSaleBanner";
import DiscountTabs from "@/components/shop/DiscountTabs";
import WelfareModal from "@/components/shop/modals/WelfareModal";
import WelfareModals from "@/components/shop/modals/WelfareModals";
import CartDrawer from "@/components/shop/modals/CartDrawer";
import CheckoutModal from "@/components/shop/modals/CheckoutModal";
import OrdersModal from "@/components/shop/modals/OrdersModal";
import Highlights from "@/components/shop/Highlights";
import ProductCard from "@/components/shop/ProductCard";

const LOGO_URL = "/nm-mart-logo.png";
const SLOGAN = "Shop More, Save More";
const ITEMS_PER_PAGE = 40;
const ADMIN_EMAIL = "nmmart07@gmail.com";

const DEFAULT_HOME_LAYOUT: SectionLayout[] = [
  { id: "hero", name: "Hero Banner", order: 0, visible: true },
  { id: "categories", name: "Categories", order: 1, visible: true },
  { id: "flat_50", name: "50% OFF Offers", order: 2, visible: true },
  { id: "flat_33", name: "33% OFF Offers", order: 3, visible: true },
  { id: "products", name: "All Products", order: 4, visible: true },
];

function mergeHomeLayout(remote: SectionLayout[] | null | undefined): SectionLayout[] {
  const base = DEFAULT_HOME_LAYOUT;
  const safeRemote = Array.isArray(remote) ? remote : [];

  const byId = new Map<string, SectionLayout>();
  for (const s of safeRemote) {
    if (s?.id) byId.set(s.id, s);
  }
  for (const s of base) {
    if (!byId.has(s.id)) byId.set(s.id, s);
  }

  return [...byId.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [layout, setLayout] = useState<SectionLayout[]>(DEFAULT_HOME_LAYOUT);
  const [gridStyle, setGridStyle] = useState({ categoryColumns: 6, productColumns: 4 });
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setHomeLoading(true);
      try {
        const { data: bans } = await supabase.from('website_banners').select('*').eq('active', true).order('display_order');
        const [sectionLayout, gridData] = await Promise.all([
          getSectionLayout(),
          import("@/lib/storeConfig").then(m => m.getGridStyle())
        ]);
        
        setBanners(bans || []);
        setLayout(mergeHomeLayout(sectionLayout));
        setGridStyle(gridData);
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        setHomeLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const { 
    allProducts, loading: productsLoading, brands, categories: posCategories,
    flat33, flat50, hasMore, loadMore, totalCount,
    total50, total33, hasMore50, hasMore33, loadMore50, loadMore33
  } = useProducts();
  const loading = productsLoading || homeLoading;
  const { cart, addToCart, updateQty, removeItem, clearCart, cartTotal, cartCount, setCart } = useCart();

  // Helper for Category Icons
  const getCategoryIcon = (cat: string) => {
    const customCat = categories.find(c => (c.name || c.title) === cat);
    const imageUrl = customCat?.image_url || customCat?.icon_url;
    if (imageUrl) {
      return <img src={imageUrl} alt="" className="w-8 h-8 object-contain" />;
    }
    const normalized = normalizeCategory(cat);
    return CATEGORY_ICONS[normalized] || "📦";
  };

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"card" | "upi" | "netbanking">("upi");
  const [pincode, setPincode] = useState("");

  const generatePDFBill = (orderId: string, items: any[], subtotal: number, discount: number, delivery: number, total: number, customer: any) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 200] // POS Roll width
    });

    const margin = 5;
    let y = 10;

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(theme.storeName || STORE_DETAILS.name, 40, y, { align: "center" });
    
    y += 5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const addrLines = doc.splitTextToSize(STORE_DETAILS.address, 70);
    doc.text(addrLines, 40, y, { align: "center" });
    
    y += addrLines.length * 3 + 2;
    doc.text(`Mob: ${STORE_DETAILS.mob}`, 40, y, { align: "center" });
    y += 3;
    doc.text(`GSTIN: ${STORE_DETAILS.gstin}`, 40, y, { align: "center" });
    
    y += 5;
    doc.setLineWidth(0.1);
    doc.line(margin, y, 75, y);
    
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`BILL NO: ${orderId}`, margin, y);
    y += 4;
    doc.text(`DATE: ${new Date().toLocaleString()}`, margin, y);
    
    if (customer?.name) {
      y += 4;
      doc.text(`CUST: ${customer.name} (${customer.phone})`, margin, y);
    }

    y += 5;
    doc.line(margin, y, 75, y);

    // Table Header
    y += 5;
    doc.setFontSize(6);
    doc.text("ITEM", margin, y);
    doc.text("QTY", 40, y);
    doc.text("RATE", 50, y);
    doc.text("AMT", 70, y, { align: "right" });

    y += 2;
    doc.line(margin, y, 75, y);

    // Items
    doc.setFont("helvetica", "normal");
    let totalSaving = 0;
    items.forEach(item => {
      y += 4;
      const itemName = item.name.length > 20 ? item.name.substring(0, 18) + ".." : item.name;
      doc.text(itemName, margin, y);
      doc.text(item.qty.toString(), 40, y);
      doc.text(item.saleRate.toString(), 50, y);
      doc.text((item.qty * item.saleRate).toString(), 70, y, { align: "right" });
      
      if (item.mrp > item.saleRate) {
        totalSaving += (item.mrp - item.saleRate) * item.qty;
      }
      
      if (y > 180) {
        doc.addPage();
        y = 10;
      }
    });

    y += 4;
    doc.line(margin, y, 75, y);

    // Totals
    const taxes = calculateTaxes(total - delivery);
    
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL:", 50, y);
    doc.text(`Rs. ${subtotal}`, 70, y, { align: "right" });
    
    if (discount > 0) {
      y += 4;
      doc.text("WELFARE DISC:", 50, y);
      doc.text(`-Rs. ${discount}`, 70, y, { align: "right" });
    }
    
    y += 4;
    doc.text("CGST (9%):", 50, y);
    doc.text(`Rs. ${taxes.cgst}`, 70, y, { align: "right" });
    
    y += 4;
    doc.text("SGST (9%):", 50, y);
    doc.text(`Rs. ${taxes.sgst}`, 70, y, { align: "right" });
    
    y += 4;
    doc.text("DELIVERY:", 50, y);
    doc.text(delivery === 0 ? "FREE" : `Rs. ${delivery}`, 70, y, { align: "right" });

    y += 6;
    doc.setFontSize(10);
    doc.text("NET PAYABLE:", 40, y);
    doc.text(`Rs. ${total}`, 70, y, { align: "right" });

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(0, 128, 0);
    doc.text(`TOTAL SAVING: Rs. ${totalSaving + discount}`, 40, y, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Footer
    y += 8;
    doc.setFontSize(6);
    doc.setFont("helvetica", "italic");
    doc.text("1. Prices inclusive of all taxes.", 40, y, { align: "center" });
    y += 3;
    doc.text("2. No Return No Exchange.", 40, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("THANK YOU FOR SHOPPING!", 40, y, { align: "center" });

    doc.save(`Bill_${orderId}.pdf`);
    return doc.output('blob');
  };

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
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const quickEditImageRef = useRef<HTMLInputElement>(null);
  const isAdminMode = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const { listening, toggle: toggleVoice } = useVoiceSearch(t => setQuery(t));
  const orders = useMemo(() => getOrderHistory(), []);

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
          disableFlip: true
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
        .gt('OpStock', 0)
        .maybeSingle();
      
      if (data) {
        // If found, navigate to product detail immediately for "instant catch"
        const p = {
          id: data.RawCodeNew,
          name: data.RawName,
          mrp: Number(data.MRP || 0),
          price: Number(data.Rate || 0),
          saleRate: Number(data.Rate || 0),
          category: normalizeCategory(data.ItemGroupName || "GENERAL"),
          brand: "Local",
          subCategory: "",
          barcode: data.RawCodeNew,
          imageUrl: data.image_url || "",
          discount: Number(data.discountPerc || 0),
          save: Math.max(0, Number(data.MRP || 0) - Number(data.Rate || 0)),
          stock: Number(data.OpStock || 0),
          badge: data.badge || ""
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
    console.debug("[Home] categories debug", {
      customCategoriesCount: categories?.length ?? 0,
      posCategoriesCount: posCategories?.length ?? 0,
    });
    // 1. If we have custom categories from DB, use them first
    if (categories && categories.length > 0) {
      const dbCats = categories.map(c => c.name || c.title).filter(Boolean);
      return dbCats;
    }
    
    // 2. Fallback to categories derived from products table (Live Mapping)
    if (posCategories && posCategories.length > 0) {
      const filtered = posCategories.filter(c => !HIDDEN_CATS.includes(c));
      const priority = filtered.filter(c => PRIORITY_CATS.includes(c));
      const rest = filtered.filter(c => !PRIORITY_CATS.includes(c));
      return [...priority, ...rest];
    }

    return [];
  }, [categories, posCategories]);

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
    
    // Sort: Products with images first, then by name
    list = [...list].sort((a, b) => {
      const aHasImg = !!a.imageUrl && a.imageUrl.length > 5;
      const bHasImg = !!b.imageUrl && b.imageUrl.length > 5;
      
      if (aHasImg && !bHasImg) return -1;
      if (!aHasImg && bHasImg) return 1;
      
      // Secondary sort by name
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
      // Searching through RawName, RawCodeNew, and tags
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p as any).brand?.toLowerCase().includes(q) ||
        (p as any).subCategory?.toLowerCase().includes(q)
      );
      
      // Prioritize matches: Name starts with query > Name contains query > Category matches
      list.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        const aCat = a.category.toLowerCase() === q;
        const bCat = b.category.toLowerCase() === q;
        
        if (aCat && !bCat) return -1;
        if (!aCat && bCat) return 1;
        
        return 0;
      });
    }
    return list;
  }, [allProducts, selectedCat, selectedBrand, query]);

  const remaining = MIN_ORDER - cartTotal;
  const loyaltyPoints = getLoyaltyPoints();
  const welfareDiscount = welfareCard?.active ? Math.round(cartTotal * 0.05) : 0;
  const finalTotal = cartTotal - welfareDiscount;
  const memberId = user ? `NM-MEM-${(user.id || "").slice(0, 4).toUpperCase()}` : null;
  const productCardStyle = theme.productCardStyle || "compact";
  const productCardClass =
    productCardStyle === "premium"
      ? "bg-card rounded-2xl border-2 border-primary/20 overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
      : productCardStyle === "offer"
      ? "bg-card rounded-xl border border-destructive/30 overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
      : "bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer";
  const productImageClass = productCardStyle === "premium" ? "relative h-32 bg-secondary/30" : "relative h-28 bg-secondary/30";
  const getSectionBgStyle = (sectionId: string) => {
    const color = theme.sectionBackgrounds?.[sectionId];
    return color ? { backgroundColor: color } : undefined;
  };

  const renderSection = (sectionId: string) => {
    const config = layout.find(s => s.id === sectionId);
    if (config && !config.visible && sectionId !== "categories") return null;

    switch (sectionId) {
      case 'hero':
        return (
          <div key="hero" className={`${isAdminMode ? 'pt-[116px]' : 'pt-0'} mb-8 relative z-0`}>
            <HeroBanner onBannerClick={handleBannerClick} />
          </div>
        );
      case 'highlights':
        return (
          <div key="highlights" className="mb-8 max-w-7xl mx-auto w-full">
            <Highlights />
          </div>
        );
      case 'flash_sale':
        return (
          <div key="flash_sale" className="mb-12 max-w-7xl mx-auto px-4 w-full">
            <FlashSaleBanner />
          </div>
        );
      case 'categories':
        return sortedCategories.length > 0 && (
          <div key="categories" className="mb-12 max-w-7xl mx-auto px-4 py-4 w-full relative z-[30] rounded-3xl" style={getSectionBgStyle("categories")}>
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <LayoutGrid size={18} className="text-primary" /> Shop by Category
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {sortedCategories.map(catName => {
                const cat = categories.find(c => (c.name || c.title) === catName);
                return (
                  <motion.button whileTap={{ scale: 0.94 }} key={catName}
                    onClick={() => { setSelectedCat(catName); setSelectedBrand(null); setQuery(""); }}
                    className={`p-3 md:p-4 rounded-[20px] md:rounded-[24px] border flex flex-col items-center gap-2 md:gap-3 transition-all group hover:border-primary hover:shadow-xl shadow-sm ${
                      theme.categoryCardStyle === "glass"
                        ? "bg-white/70 backdrop-blur-md border-white/50"
                        : theme.categoryCardStyle === "bold"
                        ? "bg-white border-2 border-primary/25"
                        : "bg-white border-gray-100"
                    }`}
                    style={cat?.bg_color ? { backgroundColor: cat.bg_color + '10' } : {}}
                  >
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center bg-gray-50 text-2xl md:text-3xl group-hover:scale-110 transition-transform shadow-sm">
                      {getCategoryIcon(catName)}
                    </div>
                    <span className="font-black text-black uppercase text-[8px] md:text-[10px] tracking-widest text-center leading-tight">{catName}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      case 'flat_50':
        return flat50.length > 0 && (
          <div key="flat_50" className="mb-12 max-w-7xl mx-auto px-4 py-4 w-full rounded-3xl" style={getSectionBgStyle("flat_50")}>
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Star size={18} className="text-primary" /> 50% OFF Offers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {flat50.map(p => (
                <ProductCard key={p.barcode} product={p} onAddToCart={addToCart} />
              ))}
            </div>
            {hasMore50 && (
              <button onClick={loadMore50} className="mt-4 text-primary font-bold text-xs uppercase border-b border-primary">View More</button>
            )}
          </div>
        );
      case 'flat_33':
        return flat33.length > 0 && (
          <div key="flat_33" className="mb-12 max-w-7xl mx-auto px-4 py-4 w-full rounded-3xl" style={getSectionBgStyle("flat_33")}>
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Star size={18} className="text-primary" /> 33% OFF Offers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {flat33.map(p => (
                <ProductCard key={p.barcode} product={p} onAddToCart={addToCart} />
              ))}
            </div>
            {hasMore33 && (
              <button onClick={loadMore33} className="mt-4 text-primary font-bold text-xs uppercase border-b border-primary">View More</button>
            )}
          </div>
        );
      case 'weekly_deals':
        return (
          <div key="weekly_deals" className="mb-12 max-w-7xl mx-auto px-4 w-full">
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Star size={18} className="text-primary" /> Weekly Deals
            </h3>
            {/* We can use ProductGrid or a custom filtered list here */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allProducts.filter(p => p.badge?.toLowerCase().includes('weekly')).slice(0, 6).map(p => (
                <ProductCard key={p.barcode} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        );
      case 'fresh_deals':
        return (
          <div key="fresh_deals" className="mb-12 max-w-7xl mx-auto px-4 w-full">
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Star size={18} className="text-primary" /> Fresh Deals
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allProducts.filter(p => p.category?.toLowerCase().includes('fresh') || p.badge?.toLowerCase().includes('fresh')).slice(0, 6).map(p => (
                <ProductCard key={p.barcode} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        );
      case 'munafa_mela':
        return (
          <div key="munafa_mela" className="mb-12 max-w-7xl mx-auto px-4 w-full">
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Star size={18} className="text-primary" /> Munafa Mela
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allProducts.filter(p => p.discount >= 40).slice(0, 6).map(p => (
                <ProductCard key={p.barcode} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        );
      case 'buy_again':
        // Frequently purchased items
        const buyAgainItems = orders.flatMap(o => o.items).slice(0, 6);
        return buyAgainItems.length > 0 && (
          <div key="buy_again" className="mb-12 max-w-7xl mx-auto px-4 w-full">
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Clock size={18} className="text-primary" /> Buy It Again
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {buyAgainItems.map((p, idx) => (
                <ProductCard key={`${p.barcode}-${idx}`} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        );
      case 'brands':
        return brands.length > 0 && (
          <div key="brands" className="mb-12 max-w-7xl mx-auto px-4 py-4 w-full rounded-3xl" style={getSectionBgStyle("brands")}>
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
        );
      case 'products':
        return (
          <div key="products" className="rounded-3xl px-2 py-2" style={getSectionBgStyle("products")}>
            {/* Dynamic Category-wise Product Sections */}
            {sortedCategories.slice(0, 6).map(cat => {
              const catProducts = allProducts
                .filter(p => p.category === cat && !HIDDEN_CATS.includes(p.category))
                .sort((a, b) => {
                  const aHasImg = !!a.imageUrl && a.imageUrl.length > 5;
                  const bHasImg = !!b.imageUrl && b.imageUrl.length > 5;
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
                        className={productCardClass}
                        onClick={() => navigate(`/product/${productSlug(p)}`)}
                      >
                        <div className={productImageClass}>
                          <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                          {p.badge && (
                            <span className="absolute top-1 left-1 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-sm z-10 animate-pulse">
                              {p.badge}
                            </span>
                          )}
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
          </div>
        );
      default:
        return null;
    }
  };

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
      const deliveryFee = calculateDeliveryFee(cartTotal);
      const totalWithDelivery = finalTotal + deliveryFee;
      
      // Generate PDF Bill
      generatePDFBill(
        orderId, 
        cart, 
        cartTotal, 
        welfareDiscount, 
        deliveryFee, 
        totalWithDelivery, 
        { name: orderCustomerData.customer || "Guest", phone: orderCustomerData.phone || "" }
      );

      const itemsText = cart.map(c => `- ${c.name} (x${c.qty}): ₹${c.saleRate * c.qty}`).join("\n");
      let text = `*New Order from ${theme.storeName || 'NM MART'}* 🛒\n\n🆔 *Order ID:* ${orderId}\n📦 *Items:*\n${itemsText}\n\n💰 *Subtotal:* ₹${cartTotal}`;
      
      if (welfareDiscount > 0) {
        text += `\n🌟 *Welfare Discount (5%):* -₹${welfareDiscount}`;
      }
      
      text += `\n🚚 *Delivery Fee:* ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}`;
      text += `\n✅ *Grand Total:* ₹${totalWithDelivery}`;
      
      text += `\n\n💳 *Payment:* ${payMethod.toUpperCase()}${payMethod === 'upi' && transactionId ? `\n🆔 *UTR/Txn ID:* ${transactionId}` : ''}${customerDetails}\n\n_Note: I have downloaded my POS Bill. Please confirm my order!_`;
      
      const orderData = {
        id: orderId,
        customer_id: user?.id || null,
        items: cart,
        total: totalWithDelivery,
        status: "Pending",
        customer_name: orderCustomerData.customer || "Guest",
        customer_phone: orderCustomerData.phone || "",
        shipping_address: orderCustomerData.address || "Store Pickup",
        landmark: orderCustomerData.landmark || "",
        payment_method: payMethod,
        transaction_id: payMethod === 'upi' ? transactionId : null,
        pincode: pincode,
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
        const { data: profile } = await supabase.from('profiles').select('loyalty_points').eq('id', user.id).single();
        const currentPoints = profile?.loyalty_points || 0;
        await supabase
          .from('profiles')
          .update({ 
            loyalty_points: currentPoints + pointsEarned,
            points_balance: currentPoints + pointsEarned // Sync both for compatibility
          })
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
      const fileName = `${editingProduct.barcode}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('nm-mart-assets')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nm-mart-assets')
        .getPublicUrl(filePath);

      setEditingProduct({ ...editingProduct, imageUrl: publicUrl });
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error("Image upload failed", err);
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const submitQuickEdit = async () => {
    if (!editingProduct) return;
    setEditLoading(true);
    try {
      // ─── REVERSE SYNC: Save to sync_back table for POS update ───
      const { error: syncError } = await supabase
        .from('sync_back')
        .insert([{
          RawCodeNew: editingProduct.barcode,
          NewRate: Number(editingProduct.salePrice),
          NewName: editingProduct.name,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (syncError) throw syncError;

      // Also update local UI state/main table for instant feedback
      const { error: localError } = await supabase
        .from('products')
        .update({
          RawName: editingProduct.name,
          Rate: Number(editingProduct.salePrice),
          updated_at: new Date().toISOString()
        })
        .eq('RawCodeNew', editingProduct.barcode);

      if (localError) console.warn("Local update failed, but sync_back queued:", localError);

      toast.success("POS Sync Queued Successfully!");
      setEditingProduct(null);
      // Optional: window.location.reload(); 
    } catch (err) {
      console.error("Sync back failed", err);
      toast.error("POS Sync failed");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Announcement Bar */}
      {theme.announcementVisible && theme.announcementText && (
        <div className="bg-primary text-white py-2 px-4 relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[2px] italic mx-4">
              {theme.announcementText}
            </span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[2px] italic mx-4">
              {theme.announcementText}
            </span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[2px] italic mx-4">
              {theme.announcementText}
            </span>
          </div>
        </div>
      )}
      {/* Admin Mode Bar */}
      {isAdminMode && (
        <div className="bg-black text-white py-2 px-6 flex items-center justify-between sticky top-0 z-[60] border-b border-white/20 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.9)]"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[3px] italic text-white">NM MART CONTROL CENTER</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl active:scale-95 group">
              <Database size={12} className="group-hover:rotate-12 transition-transform" /> Inventory
            </Link>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                toast.info("Signed out from admin account");
              }}
              className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all"
            >
              Exit
            </button>
          </div>
        </div>
      )}
      
      {/* Sticky Header with Logo */}
      <header className={`sticky z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 ${isAdminMode ? 'top-[40px]' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-3 py-2.5">
          {/* Logo - Hidden in Admin Mode as requested */}
          {!isAdminMode ? (
            <a href="/" className="flex items-center gap-2 shrink-0">
              <img src={LOGO_URL} alt="NM Mart" className="w-10 h-10 rounded-xl shadow-md" />
              <div className="hidden sm:block">
                <h1 className="text-base font-black tracking-tight leading-none text-black italic uppercase">NM <span className="text-primary">MART</span></h1>
                <p className="text-[7px] uppercase tracking-[0.15em] text-gray-400 font-bold italic">{SLOGAN}</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
               <h1 className="text-sm font-black italic uppercase text-black">ADMIN <span className="text-primary">VIEW</span></h1>
            </div>
          )}

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

      {/* Dynamic Layout Sections */}
      {!selectedCat && !selectedBrand && !query && (
        <div className="flex flex-col relative z-10">
          {layout.map(section => renderSection(section.id))}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-12">
            <div className="flex flex-col items-center justify-center py-16">
              <LoaderIcon className="animate-spin text-primary" size={34} />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Loading products...
              </p>
            </div>
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
            {/* Home View Sections that are NOT part of layout (e.g. Brand) */}
            {!selectedCat && !selectedBrand && !query && (
              <>
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
                        className={productCardClass}
                        onClick={() => navigate(`/product/${productSlug(p)}`)}
                      >
                        <div className={productImageClass}>
                          <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                          {p.badge && (
                            <span className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-md z-10 animate-pulse">
                              {p.badge}
                            </span>
                          )}
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

      {/* Modals & Chatbot */}
      {!isAdminMode && <ChatBot />}
      <WelfareModal isOpen={showWelfareModal} onClose={() => setShowWelfareModal(false)} />

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
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Barcode / Product Code</label>
                    <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-black text-primary tracking-widest flex items-center gap-2">
                      <ScanBarcode size={14} />
                      {editingProduct.barcode}
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
        pincode={pincode}
        setPincode={setPincode}
      />

      <WelfareModals 
        showGoldenCard={showGoldenCard}
        setShowGoldenCard={setShowGoldenCard}
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

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ShoppingCart, Search, X, MessageCircle,
  Mic, MicOff, Star, LayoutGrid, ArrowUp, Package, Gift,
  ChevronRight, ScanBarcode,
  Pen, Save, Loader2 as LoaderIcon, Image as ImageIcon, Upload,
  Database, LogOut, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useTheme } from "@/lib/ThemeProvider";
import { fetchActiveBanners, getActiveSession, getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { getProductImagesBucket, getProductImageStoragePath } from "@/lib/supabase/productImagesStorage";
import { 
  productSlug, WA_NUMBER, UPI_ID, MIN_ORDER, saveOrder, 
  addLoyaltyPoints, getLoyaltyPoints, OrderRecord, normalizeCategory, getOrderHistory,
  STORE_DETAILS, calculateTaxes, calculateDeliveryFee
} from "@/lib/store-utils";
import { getSectionLayout, SectionLayout } from "@/lib/storeConfig";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import HeroBanner from "@/components/shop/HeroBanner";
import Navbar from "@/components/Navbar";
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

const ITEMS_PER_PAGE = 40;
const ADMIN_EMAIL = "nmmart07@gmail.com";
const FALLBACK_BANNERS = [
  { id: "fallback-1", image_url: "https://images.unsplash.com/photo-1584473457493-17c4f8d8fcb8?auto=format&fit=crop&w=1400&q=80", title: "Premium Kaaju Offers", subtitle: "Fresh stock at best rates", whatsapp_link: "", active: true, display_order: 0 },
  { id: "fallback-2", image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80", title: "Personal Care Deals", subtitle: "Daily essentials with extra savings", whatsapp_link: "", active: true, display_order: 1 },
  { id: "fallback-3", image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80", title: "Grocery Mega Sale", subtitle: "Stock up your home in one go", whatsapp_link: "", active: true, display_order: 2 },
  { id: "fallback-4", image_url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1400&q=80", title: "Snacks & Munchies", subtitle: "Top picks for your tea-time", whatsapp_link: "", active: true, display_order: 3 },
  { id: "fallback-5", image_url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1400&q=80", title: "Beverages Combo", subtitle: "Cool drinks and juices", whatsapp_link: "", active: true, display_order: 4 },
  { id: "fallback-6", image_url: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1400&q=80", title: "Household Essentials", subtitle: "Everything for your home", whatsapp_link: "", active: true, display_order: 5 },
  { id: "fallback-7", image_url: "https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=1400&q=80", title: "Festival Savings", subtitle: "Special seasonal discounts", whatsapp_link: "", active: true, display_order: 6 },
];

const DEFAULT_HOME_LAYOUT: SectionLayout[] = [
  { id: "hero", name: "Hero Banner", order: 0, visible: true },
  { id: "featured", name: "Munafa Deals", order: 1, visible: true },
  { id: "flat_50", name: "50% OFF Offers", order: 2, visible: true },
  { id: "flat_33", name: "33% OFF Offers", order: 3, visible: true },
  { id: "categories", name: "Categories", order: 4, visible: true },
  { id: "products", name: "All Products", order: 5, visible: true },
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

  // Force key section ordering so offers stay above categories
  const forcedOrder: Record<string, number> = {
    hero: 0,
    featured: 1,
    flat_50: 2,
    flat_33: 3,
    categories: 4,
    products: 5,
  };
  for (const [id, order] of Object.entries(forcedOrder)) {
    const existing = byId.get(id);
    if (existing) byId.set(id, { ...existing, order });
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
  const [banners, setBanners] = useState<any[]>([]);
  const [layout, setLayout] = useState<SectionLayout[]>(DEFAULT_HOME_LAYOUT);
  const [gridStyle, setGridStyle] = useState({ categoryColumns: 6, productColumns: 4 });
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setHomeLoading(true);
      try {
        const [fetched, sectionLayout, gridData] = await Promise.all([
          fetchActiveBanners(),
          getSectionLayout(),
          import("@/lib/storeConfig").then(m => m.getGridStyle())
        ]);

        setBanners(fetched.length > 0 ? fetched : FALLBACK_BANNERS);
        setLayout(mergeHomeLayout(sectionLayout));
        setGridStyle(gridData);
      } catch (err) {
        console.error("Home data fetch error:", err);
        setBanners(FALLBACK_BANNERS);
      } finally {
        setHomeLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const { 
    allProducts, loading: productsLoading, brands, categories: posCategories,
    flat33, flat50, featuredProducts, hasMore, loadMore, totalCount,
    total50, total33, totalFeatured, hasMore50, hasMore33, hasMoreFeatured, 
    loadMore50, loadMore33, loadMoreFeatured,
    refetchProducts,
  } = useProducts();
  const loading = productsLoading || homeLoading;
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
  const [payMethod, setPayMethod] = useState<"card" | "upi" | "netbanking">("upi");
  const [pincode, setPincode] = useState("");
  const [offersOpen, setOffersOpen] = useState<{ flat50: boolean; flat33: boolean }>({
    flat50: false,
    flat33: false,
  });
  const openOffersAndScroll = (which: "flat50" | "flat33" | "both") => {
    setOffersOpen(prev => ({
      flat50: which === "flat50" || which === "both" ? true : prev.flat50,
      flat33: which === "flat33" || which === "both" ? true : prev.flat33,
    }));
    requestAnimationFrame(() => {
      const id =
        which === "flat50" ? "offers-50" : which === "flat33" ? "offers-33" : "offers-50";
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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
  const isAdminMode =
    typeof user?.email === "string" && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
    // Categories are derived live from products table mapping.
    if (posCategories && posCategories.length > 0) {
      const filtered = posCategories.filter(c => !HIDDEN_CATS.includes(c));
      const priority = filtered.filter(c => PRIORITY_CATS.includes(c));
      const rest = filtered.filter(c => !PRIORITY_CATS.includes(c));
      return [...priority, ...rest];
    }

    return [];
  }, [posCategories]);

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
    // Storefront: hide out-of-stock everywhere search/category filters apply
    let list = allProducts.filter(
      (p) => !HIDDEN_CATS.includes(p.category) && (Number(p.stock) > 0)
    );
    
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
          <div key="hero" className={`${isAdminMode ? 'pt-[116px]' : 'pt-20 md:pt-24'} mb-8 relative z-0`}>
            <HeroBanner
              onBannerClick={handleBannerClick}
              banners={banners}
              loading={homeLoading}
            />
          </div>
        );
      case 'featured':
        return (featuredProducts?.length || 0) > 0 && (
          <div key="featured" id="featured-deals" className="mb-8 max-w-7xl mx-auto px-4 w-full scroll-mt-32">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-black flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
                  <Star size={24} className="text-white fill-current animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary leading-none mb-1">Exclusive Offers</div>
                  <h3 className="text-2xl font-black italic uppercase leading-none text-black tracking-tight">Munafa Deals</h3>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Updates</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredProducts?.map(p => (
                <ProductCard 
                  key={p?.barcode} 
                  product={p} 
                  onAddToCart={addToCart} 
                  showAdminQuickEdit={isAdminMode} 
                  onAdminQuickEdit={handleQuickEdit} 
                />
              ))}
            </div>
            {hasMoreFeatured && (
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={loadMoreFeatured} 
                  className="px-8 py-3 rounded-2xl border-2 border-primary text-primary font-black uppercase italic text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                >
                  View More Munafa Deals
                </button>
              </div>
            )}
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
        return (flat50?.length || 0) > 0 && (
          <div key="flat_50" id="offers-50" className="mb-8 max-w-7xl mx-auto px-4 w-full scroll-mt-32">
            <button
              type="button"
              onClick={() => setOffersOpen(s => ({ ...s, flat50: !s.flat50 }))}
              className="w-full flex items-center justify-between rounded-3xl px-6 py-5 shadow-lg hover:shadow-xl transition-all border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-yellow-50 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_20%_20%,rgba(255,153,0,0.18),transparent_55%),radial-gradient(circle_at_85%_30%,rgba(255,215,0,0.18),transparent_55%)]" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center shadow-sm animate-pulse">
                  <Star size={18} className="text-white fill-current" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">Hot Deals Folder</div>
                  <div className="text-base md:text-lg font-black uppercase tracking-tight text-black">50% OFF Offers</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Tap to open • {flat50?.length || 0} items
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                {offersOpen.flat50 ? "Hide" : "Open"}
              </div>
            </button>

            {offersOpen.flat50 && (
              <div className="mt-4 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm" style={getSectionBgStyle("flat_50")}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {flat50?.map(p => (
                    <ProductCard key={p.barcode} product={p} onAddToCart={addToCart} showAdminQuickEdit={isAdminMode} onAdminQuickEdit={handleQuickEdit} />
                  ))}
                </div>
                {hasMore50 && (
                  <button onClick={loadMore50} className="mt-4 text-primary font-bold text-xs uppercase border-b border-primary">
                    View More
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 'flat_33':
        return (flat33?.length || 0) > 0 && (
          <div key="flat_33" id="offers-33" className="mb-8 max-w-7xl mx-auto px-4 w-full scroll-mt-32">
            <button
              type="button"
              onClick={() => setOffersOpen(s => ({ ...s, flat33: !s.flat33 }))}
              className="w-full flex items-center justify-between rounded-3xl px-6 py-5 shadow-lg hover:shadow-xl transition-all border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-yellow-50 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_20%_20%,rgba(255,153,0,0.18),transparent_55%),radial-gradient(circle_at_85%_30%,rgba(255,215,0,0.18),transparent_55%)]" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center shadow-sm animate-pulse">
                  <Star size={18} className="text-white fill-current" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">Hot Deals Folder</div>
                  <div className="text-base md:text-lg font-black uppercase tracking-tight text-black">33% OFF Offers</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Tap to open • {flat33?.length || 0} items
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                {offersOpen.flat33 ? "Hide" : "Open"}
              </div>
            </button>

            {offersOpen.flat33 && (
              <div className="mt-4 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm" style={getSectionBgStyle("flat_33")}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {flat33?.map(p => (
                    <ProductCard key={p.barcode} product={p} onAddToCart={addToCart} showAdminQuickEdit={isAdminMode} onAdminQuickEdit={handleQuickEdit} />
                  ))}
                </div>
                {hasMore33 && (
                  <button onClick={loadMore33} className="mt-4 text-primary font-bold text-xs uppercase border-b border-primary">
                    View More
                  </button>
                )}
              </div>
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
              {(allProducts || []).filter(p => (Number(p?.stock) > 0) && p?.badge?.toLowerCase().includes('weekly')).slice(0, 6).map(p => (
                <ProductCard key={p?.barcode} product={p} onAddToCart={addToCart} showAdminQuickEdit={isAdminMode} onAdminQuickEdit={handleQuickEdit} />
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
              {(allProducts || []).filter(p => (Number(p?.stock) > 0) && (p?.category?.toLowerCase().includes('fresh') || p?.badge?.toLowerCase().includes('fresh'))).slice(0, 6).map(p => (
                <ProductCard key={p?.barcode} product={p} onAddToCart={addToCart} showAdminQuickEdit={isAdminMode} onAdminQuickEdit={handleQuickEdit} />
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
              {(allProducts || []).filter(p => (Number(p?.stock) > 0) && (p?.discount || 0) >= 40).slice(0, 6).map(p => (
                <ProductCard key={p?.barcode} product={p} onAddToCart={addToCart} showAdminQuickEdit={isAdminMode} onAdminQuickEdit={handleQuickEdit} />
              ))}
            </div>
          </div>
        );
      case 'buy_again': {
        const fromOrders = (orders || []).flatMap((o) => o?.items || []);
        const buyAgainItems = fromOrders
          .map((item: any) => (allProducts || []).find((ap) => ap?.barcode === item?.barcode))
          .filter((p): p is NonNullable<typeof p> => Boolean(p && Number(p?.stock || 0) > 0))
          .filter((p, i, arr) => arr.findIndex((x) => x?.barcode === p?.barcode) === i)
          .slice(0, 6);
        return (buyAgainItems?.length || 0) > 0 && (
          <div key="buy_again" className="mb-12 max-w-7xl mx-auto px-4 w-full">
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Clock size={18} className="text-primary" /> Buy It Again
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {buyAgainItems?.map((p, idx) => (
                <ProductCard key={`${p?.barcode}-${idx}`} product={p} onAddToCart={addToCart} showAdminQuickEdit={isAdminMode} onAdminQuickEdit={handleQuickEdit} />
              ))}
            </div>
          </div>
        );
      }
      case 'brands':
        return (brands?.length || 0) > 0 && (
          <div key="brands" className="mb-12 max-w-7xl mx-auto px-4 py-4 w-full rounded-3xl" style={getSectionBgStyle("brands")}>
            <h3 className="font-black text-foreground text-lg uppercase mb-5 flex items-center gap-2 tracking-tight">
              <Star size={18} className="text-primary" /> Shop by Brand
            </h3>
            <div className="flex flex-wrap gap-2">
              {brands?.map(brand => (
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
          <div key="products" id="products" className="scroll-mt-28 rounded-3xl px-2 py-2" style={getSectionBgStyle("products")}>
            {/* Dynamic Category-wise Product Sections */}
            {(sortedCategories || []).slice(0, 6).map(cat => {
              const catProducts = (allProducts || [])
                .filter(p => Number(p?.stock || 0) > 0 && p?.category === cat && !HIDDEN_CATS.includes(p?.category))
                .sort((a, b) => {
                  const aHasImg = !!a?.imageUrl && (a?.imageUrl?.length || 0) > 5;
                  const bHasImg = !!b?.imageUrl && (b?.imageUrl?.length || 0) > 5;
                  if (aHasImg && !bHasImg) return -1;
                  if (!aHasImg && bHasImg) return 1;
                  return (a?.name || "").localeCompare(b?.name || "");
                })
                .slice(0, 6);
              if ((catProducts?.length || 0) === 0) return null;
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
                    {catProducts?.map((p, idx) => (
                      <motion.div key={`${p?.barcode}-${idx}`}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className={productCardClass}
                        onClick={() => navigate(`/product/${productSlug(p)}`)}
                      >
                        <div className={`${productImageClass} relative`}>
                          <ProductImageDisplay imageUrl={p?.imageUrl} name={p?.name} />
                          {p?.badge && (
                            <span className="absolute top-1 left-1 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-sm z-10 animate-pulse">
                              {p?.badge}
                            </span>
                          )}
                          {(p?.discount || 0) > 0 && (
                            <span className="absolute top-1 right-1 bg-destructive text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                              {p?.discount}% OFF
                            </span>
                          )}
                          {isAdminMode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickEdit(p);
                              }}
                              className="absolute bottom-2 right-2 z-[50] rounded-md border border-primary/40 bg-white/95 p-1 text-primary shadow-md ring-1 ring-black/5 transition-all hover:bg-primary hover:text-white"
                              title="Quick edit"
                              aria-label="Edit product"
                            >
                              <Pen size={12} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                        <div className="p-2 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="bg-primary/10 text-primary text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                              {p?.category}
                            </span>
                            <span className={`text-[7px] font-bold flex items-center gap-0.5 ${p?.stock && p?.stock > 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                              <Star size={8} className="fill-current" /> {p?.stock && p?.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                            </span>
                          </div>
                          <h3 className="font-semibold text-[10px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">{p?.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-black text-primary">₹{p?.price}</span>
                            {(p?.mrp || 0) > (p?.price || 0) && (
                              <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/50 font-medium">₹{p?.mrp}</span>
                            )}
                            {(p?.discount || 0) > 0 && (
                              <span className="text-[10px] font-bold text-destructive ml-auto">
                                {p?.discount}% OFF
                              </span>
                            )}
                          </div>
                          {(p?.save || 0) > 0 && p?.stock && p?.stock > 0 && <span className="text-[8px] font-bold text-[hsl(var(--success))] mt-0.5">Save ₹{p?.save}</span>}
                          <div className="mt-auto pt-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); if(p?.stock && p?.stock > 0) addToCart(p); }}
                              disabled={!p?.stock || p?.stock <= 0}
                              className={`w-full py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors ${p?.stock && p?.stock > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                              {p?.stock && p?.stock > 0 ? "Add to Cart" : "Out of Stock"}
                            </button>
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
       const session = await getActiveSession();
       if (!session && user) {
         toast.error("Please login again.");
         return;
       }
       let customerDetails = "";
       let orderCustomerData: any = {};

      if (session?.user) {
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
        logSupabaseDebug("indexPlaceOrder:orderInsert:error", orderData, supabaseError);
        toast.error(getSupabaseErrorMessage(supabaseError, "Unable to save order"));
      }

      const pointsEarned = Math.floor(finalTotal / 100);
      
      // Update points in database
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('loyalty_points').eq('id', user.id).single();
        const currentPoints = profile?.loyalty_points || 0;
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            loyalty_points: currentPoints + pointsEarned,
            points_balance: currentPoints + pointsEarned // Sync both for compatibility
          })
          .eq('id', user.id);
        if (pointsError) {
          logSupabaseDebug("indexPlaceOrder:pointsUpdate:error", { userId: user.id, pointsEarned }, pointsError);
          toast.error(getSupabaseErrorMessage(pointsError, "Unable to update loyalty points"));
        }
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
    } catch (err: any) {
      logSupabaseDebug("indexPlaceOrder:error", { cartCount: cart.length, cartTotal }, err);
      toast.error(getSupabaseErrorMessage(err, "Order process failed"));
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
      mrp: Number(p?.mrp || 0),
      salePrice: Number(p?.price || 0),
      stock: Number(p?.stock || 0),
      unit: String(p?.unit || "pcs").trim(),
      category: normalizeCategory(p?.category || "GENERAL"),
      isFeatured: Boolean(p?.isFeatured),
      imageUrl: String(p?.imageUrl || "").trim(),
    });
  };

  const handleQuickImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
      const ts = Date.now();
      const bucket = getProductImagesBucket();
      const filePath = getProductImageStoragePath(String(editingProduct.barcode), ts, fileExt);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setEditingProduct({ ...editingProduct, imageUrl: publicUrl });
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error("Image upload failed", err);
      const msg = err?.message || "Image upload failed";
      toast.error(
        msg.includes("Bucket not found") || msg.includes("not found")
          ? `Storage bucket missing. Use bucket "${getProductImagesBucket()}" or create "product-images" in Supabase and set VITE_PRODUCT_IMAGES_BUCKET.`
          : msg
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const submitQuickEdit = async () => {
    if (!editingProduct) return;
    
    const mrp = Number(editingProduct.mrp || 0);
    const rate = Number(editingProduct.salePrice || 0);
    
    if (rate > mrp) {
      toast.error("Sale price cannot exceed MRP");
      return;
    }

    setEditLoading(true);
    try {
      const session = await getActiveSession();
      if (!session) {
        toast.error("Please login again.");
        return;
      }
      // ─── REVERSE SYNC: Save to sync_back table for POS update ───
      const { error: syncError } = await supabase
        .from('sync_back')
        .insert([{
          RawCodeNew: String(editingProduct.barcode || ""),
          NewRate: rate,
          NewName: String(editingProduct.name || "").trim(),
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (syncError) throw syncError;

      let discountPerc = 0;
      if (mrp > 0 && rate >= 0 && rate < mrp) {
        discountPerc = Math.min(99, Math.round(100 * (1 - rate / mrp)));
      }

      const imageUrl = String(editingProduct.imageUrl || "").trim() || null;
      const opStock = Math.max(0, Math.floor(Number(editingProduct.stock ?? 0)));

      const { error: localError } = await supabase
        .from('products')
        .update({
          RawName: String(editingProduct.name || "").trim(),
          MRP: mrp,
          Rate: rate,
          OpStock: opStock,
          ItemGroupName: normalizeCategory(editingProduct.category || "GENERAL"),
          unit: String(editingProduct.unit || "pcs").trim(),
          is_featured: Boolean(editingProduct.isFeatured),
          image_url: imageUrl,
          discountPerc,
          updated_at: new Date().toISOString(),
        })
        .eq('RawCodeNew', editingProduct.barcode);

      if (localError) throw localError;

      toast.success("Product updated successfully!");
      setEditingProduct(null);
      
      // Immediate refetch to update homepage (including Munafa Deals)
      await refetchProducts();
    } catch (err: any) {
      logSupabaseDebug("indexQuickEdit:error", editingProduct, err);
      toast.error(getSupabaseErrorMessage(err, "Update failed"));
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
      
      <Navbar />

      {/* Search Section - Professional & Prominent */}
      <div className={`sticky z-40 bg-background/80 backdrop-blur-xl border-b border-border py-4 px-4 shadow-2xl transition-all duration-300 ${isAdminMode ? 'top-[112px]' : 'top-[72px]'}`}>
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

      {/* Quick Action Chips */}
      {!selectedCat && !selectedBrand && !query && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openOffersAndScroll("both")}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              Today Deals
            </button>
            <button
              type="button"
              onClick={() => openOffersAndScroll("flat50")}
              className="px-5 py-2.5 rounded-full bg-white border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md active:scale-95 transition-all"
            >
              50% OFF
            </button>
            <button
              type="button"
              onClick={() => openOffersAndScroll("flat33")}
              className="px-5 py-2.5 rounded-full bg-white border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md active:scale-95 transition-all"
            >
              33% OFF
            </button>
          </div>
        </div>
      )}

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
          {(layout || []).map(section => renderSection(section?.id))}
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
                        <div className={`${productImageClass} relative`}>
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
                          {isAdminMode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickEdit(p);
                              }}
                              className="absolute bottom-2 right-2 z-[50] rounded-md border border-primary/40 bg-white/95 p-1.5 text-primary shadow-md ring-1 ring-black/5 transition-all hover:bg-primary hover:text-white"
                              title="Quick edit"
                              aria-label="Edit product"
                            >
                              <Pen size={13} strokeWidth={2.5} />
                            </button>
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
                            <div className="mt-auto pt-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(p.stock && p.stock > 0) addToCart(p); }}
                                disabled={!p.stock || p.stock <= 0}
                                className={`w-full py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors ${p.stock && p.stock > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                                {p.stock && p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                              </button>
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

      {/* Quick Edit Modal — mobile sheet; desktop: centered max-w-lg, 80vh cap, sticky header/footer + scroll body */}
      <AnimatePresence>
        {editingProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" 
              onClick={() => setEditingProduct(null)} 
            />
            <div className="pointer-events-none fixed inset-0 z-[101] flex items-end justify-center p-0 sm:items-center sm:p-6">
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="pointer-events-auto flex min-h-0 max-h-[min(92dvh,calc(100dvh-1rem))] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-gray-100 bg-white shadow-2xl sm:max-h-[80vh] sm:rounded-[32px]"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 bg-white px-5 pb-4 pt-6 sm:px-8 sm:pb-5 sm:pt-8">
                <div className="min-w-0">
                  <h3 className="text-xl font-black italic uppercase leading-none text-black">Quick Edit</h3>
                  <p className="mt-1 truncate text-[8px] font-black uppercase italic tracking-[2px] text-gray-400">{editingProduct.barcode}</p>
                </div>
                <button type="button" onClick={() => setEditingProduct(null)} className="shrink-0 rounded-xl p-2 transition-colors hover:bg-gray-50" aria-label="Close">
                  <X size={20} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-8 sm:py-5">
                <div className="space-y-6">
                  {/* Image & Identity Row */}
                  <div className="flex items-center gap-5">
                    <div className="relative cursor-pointer group" onClick={() => quickEditImageRef.current?.click()}>
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all group-hover:border-primary">
                        {uploadingImage ? (
                          <LoaderIcon className="animate-spin text-primary" size={24} />
                        ) : editingProduct.imageUrl ? (
                          <img src={editingProduct.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-300" size={24} />
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="text-white" size={20} />
                      </div>
                      <input type="file" ref={quickEditImageRef} className="hidden" accept="image/*" onChange={handleQuickImageUpload} />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Barcode / Code</label>
                      <div className="flex w-full items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs font-black tracking-widest text-primary truncate">
                        <ScanBarcode size={14} className="shrink-0" />
                        {editingProduct?.barcode || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Product Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter product name"
                      className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs font-bold outline-none transition-all focus:border-primary"
                      value={editingProduct?.name || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-2 gap-4 relative">
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">MRP (₹)</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-black outline-none transition-all focus:border-primary"
                        value={editingProduct?.mrp || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, mrp: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Sale Price (₹)</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className={`w-full rounded-xl border p-3 text-sm font-black outline-none transition-all focus:border-primary ${
                          Number(editingProduct?.salePrice) > Number(editingProduct?.mrp) 
                            ? "border-red-500 bg-red-50 text-red-600" 
                            : "border-gray-100 bg-gray-50 text-primary"
                        }`}
                        value={editingProduct?.salePrice || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value })}
                      />
                      {Number(editingProduct?.mrp) > Number(editingProduct?.salePrice) && (
                        <div className="absolute right-2 top-[34px] bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase italic">
                          {Math.round((1 - Number(editingProduct.salePrice) / Number(editingProduct.mrp)) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Category</label>
                    <select 
                      className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs font-black outline-none transition-all focus:border-primary appearance-none"
                      value={editingProduct?.category || "GENERAL"}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    >
                      {posCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stock & Unit Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Op. Stock</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-black outline-none transition-all focus:border-primary"
                        value={editingProduct?.stock || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Unit Type</label>
                      <select 
                        className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-black outline-none transition-all focus:border-primary appearance-none"
                        value={editingProduct?.unit || "pcs"}
                        onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      >
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="gm">Gram (gm)</option>
                        <option value="pack">Pack</option>
                        <option value="ltr">Liter (ltr)</option>
                      </select>
                    </div>
                  </div>

                  {/* Feature Toggle */}
                  <div className="flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase italic tracking-widest text-primary">Munafa Deal</p>
                      <p className="text-[9px] font-bold text-gray-500">Highlight this in featured section</p>
                    </div>
                    <Switch 
                      checked={Boolean(editingProduct?.isFeatured)}
                      onCheckedChange={(val) => setEditingProduct({ ...editingProduct, isFeatured: val })}
                    />
                  </div>
                </div>
              </div>

              <footer className="sticky bottom-0 z-20 shrink-0 border-t border-gray-100 bg-white px-5 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-5">
                <button 
                  type="button"
                  onClick={submitQuickEdit}
                  disabled={editLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-xs font-black uppercase italic tracking-widest text-white shadow-lg transition-all hover:bg-black active:scale-95 disabled:opacity-60"
                >
                  {editLoading ? <LoaderIcon className="animate-spin" size={18} /> : <Save size={18} />}
                  Update Instantly
                </button>
              </footer>
            </motion.div>
            </div>
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

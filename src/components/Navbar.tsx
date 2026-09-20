import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingCart,
  User,
  Package,
  Truck,
  CreditCard,
  Headset,
  LogOut,
  ChevronRight,
  X,
  Wallet,
  Star,
  Bot,
  Search,
  ChevronDown,
  MapPin,
  Bookmark,
  Bell,
  Heart,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "../lib/supabase/schema";
import { useTheme } from "@/lib/ThemeProvider";
import { WA_NUMBER, STORE_DETAILS } from "@/lib/store-utils";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import WelfareModal from "@/components/shop/modals/WelfareModal";
import MoreDrawer from "@/components/shop/MoreDrawer";

import { ThemeConfig } from "@/lib/storeConfig";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  theme?: ThemeConfig;
}

const Navbar = ({ theme: propsTheme }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme: storeTheme } = useTheme();
  const theme = propsTheme || storeTheme;
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState("");
  const [welfareCard, setWelfareCard] = useState<{ number: string; active: boolean; points: number } | null>(null);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [moreOpen, setMoreOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistBarcodes } = useWishlist();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("search") || params.get("q") || "");
  }, [location.search]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = searchTerm.trim();
    navigate(nextSearch ? `/shop?search=${encodeURIComponent(nextSearch)}` : "/shop");
  };

  const moreSectionPaths = [
    "/more",
    "/profile",
    "/addresses",
    "/wallet",
    "/coupons",
    "/orders",
    "/contact",
    "/faq",
    "/settings",
    "/privacy",
    "/terms",
    "/about",
  ];

  const isMoreSection = moreOpen || moreSectionPaths.some((path) => {
    const currentPath = location.pathname;
    return currentPath === path || currentPath.startsWith(`${path}/`);
  });
  const isHomeRoute = location.pathname === "/";

  const headerStyle = theme.headerStyle || "classic";

  const headerClass = "sticky top-0 z-50 w-full max-w-[100vw] overflow-x-hidden border-b border-[#1f5fba] bg-[#0b3b78] text-white shadow-[0_10px_30px_-20px_rgba(11,59,120,0.45)]";

  const mobileHeaderClass = "bg-[#0b3b78] text-white";

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    };

    fetchSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileName("");
        setWelfareCard(null);
        setDeliveryAddress("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from(TABLES.profiles)
      .select("full_name, address, city, state, pincode")
      .eq("id", userId)
      .single();

    if (!data) return;
    setProfileName(data.full_name || "");

    const addrParts: string[] = [];
    if (data.city) addrParts.push(data.city);
    else if (data.address) addrParts.push(data.address);
    if (data.state) addrParts.push(data.state);
    if (addrParts.length > 0) {
      setDeliveryAddress(addrParts[0]);
    } else if (data.pincode) {
      setDeliveryAddress(String(data.pincode));
    }

    setWelfareCard(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (err: unknown) {
      logSupabaseDebug("navbarLogout:error", undefined, err);
      toast.error(getSupabaseErrorMessage(err as { message?: string; code?: string }, "Unable to logout"));
    }
  };

  const handleWelfare = () => {
    if (welfareCard?.active) setShowGoldenCard(true);
    else setShowWelfareModal(true);
  };

  const menuItems = [
    { label: "My Profile", icon: User, action: () => navigate("/profile") },
    { label: "My Orders", icon: Package, action: () => navigate("/orders") },
    { label: "Fast Delivery Info", icon: Truck, action: () => navigate("/delivery") },
    { label: "Secure Payments", icon: CreditCard, action: () => navigate("/contact") },
    { label: "Support", icon: Headset, action: () => navigate("/contact") },
  ];

  const desktopMenuItems = [
    ...(user ? [{ label: "My Profile", icon: User, action: () => navigate("/profile") }] : []),
    { label: "My Orders", icon: Package, action: () => navigate("/orders") },
    { label: "My Addresses", icon: MapPin, action: () => navigate("/addresses") },
    { label: "My Wishlist", icon: Bookmark, action: () => navigate("/wishlist") },
    { label: "My Rewards", icon: Star, action: handleWelfare },
    { label: "Notifications", icon: Bell, action: () => navigate("/orders") },
    { label: "Help & Support", icon: Headset, action: () => navigate("/contact") },
    { label: "FAQ", icon: Bot, action: () => navigate("/faq") },
    { label: "Settings", icon: Star, action: () => navigate("/settings") },
    { label: "Terms & Conditions", icon: CreditCard, action: () => navigate("/terms") },
    { label: "Privacy Policy", icon: Bookmark, action: () => navigate("/privacy") },
  ];

  const resolveDeliveryDisplay = () => {
    if (deliveryAddress) return deliveryAddress;
    const shortStore = "Naya Nagar, Dhata Road, Manjhanpur, Kaushambi";
    const baseAddress = STORE_DETAILS?.address ? STORE_DETAILS.address : shortStore;
    const parts = baseAddress.split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) return parts[parts.length - 2];
    return baseAddress;
  };

  return (
    <header className={headerClass}>
      <div className="w-full max-w-[100vw] overflow-x-hidden px-3 pt-2 pb-0 md:px-5 md:py-3">
        {/* Top Row: Logo and Mobile Actions */}
        <div className="flex h-[52px] items-center justify-between gap-2 md:h-[72px] md:gap-4">
          <Link to="/" className="group flex min-w-0 shrink items-center justify-center text-left md:flex-1">
            <div className="flex w-[170px] max-w-[45vw] flex-col items-center justify-center leading-none text-white md:w-[220px]">
              <span className="text-center text-[26px] font-black uppercase tracking-[-0.06em] text-[#f8d86a] md:text-[34px]">
                NM Mart
              </span>
              <span className="mt-1 w-full text-center text-[7px] font-black uppercase tracking-[0.18em] text-white/80 md:text-[9px]">
                {theme.storeSlogan || "Shop More, Save More"}
              </span>
            </div>
          </Link>

          {!isMoreSection && (
            <div className="hidden flex-1 md:block mx-6 lg:mx-8">
              <form
                className={`flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-sm ${isHomeRoute ? "border-[#1d5fbf] bg-[#1d5fbf]/90" : "border-[#eadcc6] bg-white"}`}
                onSubmit={handleSearchSubmit}
              >
                <Search className={`h-4 w-4 ${isHomeRoute ? "text-white/90" : "text-[#8a8a8a]"}`} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search products"
                  placeholder="Search products, brands & categories"
                  className={`w-full border-0 bg-transparent text-sm focus:outline-none ${isHomeRoute ? "text-white placeholder:text-white/70" : "text-[#1f2937] placeholder:text-[#7b7b7b]"}`}
                />
              </form>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2.5 md:gap-3 md:pl-1">
            {/* Mobile Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
                aria-label="Orders"
              >
                <Bell size={22} className="text-white" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
                aria-label="Wishlist"
              >
                <Heart size={18} className="text-white" fill="currentColor" />
              </button>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-sm transition hover:bg-white/20"
                aria-label="Open wishlist"
              >
                <Bookmark size={17} className="text-white" />
                {wishlistBarcodes.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">{wishlistBarcodes.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-sm transition hover:bg-white/20"
                aria-label="Open order notifications"
              >
                <Bell size={17} className="text-white" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/wallet")}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-sm transition hover:bg-white/20 md:order-2"
              aria-label="Wallet"
            >
              <Wallet size={18} className="text-white" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#d83b3b] text-[9px] font-black text-white shadow-sm">
                1
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-sm transition hover:bg-white/20 md:order-3 md:h-11 md:w-auto md:px-4"
            >
              <ShoppingCart size={21} className="text-white md:size-[15px]" />
              <span className="hidden md:inline ml-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">Cart</span>
              <span className="absolute -top-1.5 -right-1.5 flex min-w-[1.2rem] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[9px] font-bold text-white md:static md:ml-1.5 md:bg-red-500 md:text-[10px]">
                {cartCount > 99 ? "100+" : cartCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="hidden items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-white/20 md:inline-flex"
              aria-label="Open More menu"
            >
              More
            </button>
          </div>
        </div>

        {!isMoreSection && (
          <div className="mt-0 md:hidden">
            <form
              className={`flex h-[52px] w-full items-center gap-3 rounded-xl border px-4 shadow-inner ${isHomeRoute ? "border-[#1d5fbf] bg-[#1d5fbf]" : "border-slate-200 bg-slate-50"}`}
              onSubmit={handleSearchSubmit}
            >
              <Search className={`h-7 w-7 shrink-0 ${isHomeRoute ? "text-white/90" : "text-slate-500"}`} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search product, brand or article..."
                className={`block w-full border-0 bg-transparent text-[17px] font-medium focus:outline-none ${isHomeRoute ? "text-white placeholder:text-white/70" : "text-slate-900 placeholder:text-slate-400"}`}
              />
            </form>
          </div>
        )}
      </div>

      {!isMoreSection && (
        <>
          <div className={`flex items-center justify-between px-4 py-2.5 md:hidden ${isHomeRoute ? "bg-[#dfeefd]" : "bg-slate-50"}`}>
            <div className={`flex items-center gap-2 ${isHomeRoute ? "text-[#0b3b78]" : "text-slate-900"}`}>
              <MapPin size={24} className={isHomeRoute ? "text-[#1d5fbf]" : "text-primary"} />
              <span className="text-[16px] font-bold tracking-tight text-slate-950">
                {resolveDeliveryDisplay()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/addresses")}
              className={`text-[16px] font-bold ${isHomeRoute ? "text-[#0b3b78]" : "text-slate-900"}`}
            >
              Change
            </button>
          </div>

          <div className="hidden border-t border-[#f0e9e2] bg-white md:block">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-2.5">
              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin size={16} className="shrink-0 text-primary" />
                <span className="truncate">{resolveDeliveryDisplay()}</span>
                <button type="button" onClick={() => navigate("/addresses")} className="shrink-0 text-xs font-black uppercase tracking-[0.12em] text-primary hover:underline">
                  Change
                </button>
              </div>
              <nav aria-label="Desktop navigation" className="flex shrink-0 items-center gap-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
                <Link to="/" className="transition hover:text-primary">Home</Link>
                <Link to="/categories" className="transition hover:text-primary">Categories</Link>
                <Link to="/shop?offers=25" className="transition hover:text-primary">Offers</Link>
                <Link to="/contact" className="transition hover:text-primary">Help</Link>
              </nav>
            </div>
          </div>
        </>
      )}

      <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />

      <AnimatePresence>
        {showGoldenCard && welfareCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#b38728] p-8 shadow-[0_0_50px_rgba(191,149,63,0.4)]"
            >
              <button
                onClick={() => setShowGoldenCard(false)}
                className="absolute left-4 top-4 rounded-full bg-black/10 p-2 text-yellow-900 transition-all hover:bg-black/20"
              >
                <X size={16} />
              </button>
              <div className="mt-20">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[4px] text-yellow-900/60">Card Number</p>
                <p className="font-mono text-2xl font-black tracking-[6px] text-black">
                  {welfareCard.number.match(/.{1,4}/g)?.join(" ") || welfareCard.number}
                </p>
              </div>
              <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-yellow-900/60">Card Holder</p>
                  <p className="text-sm font-black uppercase italic tracking-tight text-black">{profileName || "NM Member"}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-yellow-900/60">Balance</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <Star size={14} className="fill-current text-yellow-900" />
                    <p className="text-xl font-black italic text-black">{welfareCard.points} <span className="text-[10px]">PTS</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="absolute bottom-20 flex flex-col items-center gap-4">
              <button
                onClick={() => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi NM Mart! I want to redeem my ${welfareCard.points} points for a discount.`)}`, "_blank")}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-black shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                Redeem Points <Gift size={20} />
              </button>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">1 Point = ₹1 Discount</p>
            </div>
          </div>
        )}
        <WelfareModal isOpen={showWelfareModal} onClose={() => setShowWelfareModal(false)} />
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  User,
  Package,
  Truck,
  CreditCard,
  Headset,
  LogOut,
  ChevronRight,
  X,
  Gift,
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
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

  const headerStyle = theme.headerStyle || "classic";

  const headerClass = headerStyle === "modern"
    ? "sticky top-0 z-50 w-full max-w-[100vw] overflow-x-hidden border-b border-[#f1e4d3] bg-[#fffdf9]/90 backdrop-blur-xl shadow-[0_12px_35px_-25px_rgba(15,23,42,0.35)]"
    : headerStyle === "minimal"
      ? "sticky top-0 z-50 w-full max-w-[100vw] overflow-x-hidden bg-background/60 backdrop-blur-md border-b border-border"
      : "sticky top-0 z-50 w-full max-w-[100vw] overflow-x-hidden border-b border-[#f0e9e2] bg-[#fffdf9]/90 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(0,0,0,0.18)]";

  const mobileHeaderClass = "bg-[#003b73] text-white";

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
    if (data.address) addrParts.push(data.address);
    if (data.city) addrParts.push(data.city);
    if (data.pincode) addrParts.push(data.pincode);
    if (addrParts.length > 0) {
      setDeliveryAddress(addrParts.join(", "));
    }

    setWelfareCard(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setDrawerOpen(false);
      navigate("/");
    } catch (err: unknown) {
      logSupabaseDebug("navbarLogout:error", undefined, err);
      toast.error(getSupabaseErrorMessage(err as { message?: string; code?: string }, "Unable to logout"));
    }
  };

  const handleWelfare = () => {
    setDrawerOpen(false);
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

  const accountMenuItems = [
    { label: user ? "My Profile" : "Login", icon: User, action: () => navigate(user ? "/profile" : "/login") },
    { label: "My Orders", icon: Package, action: () => navigate("/orders") },
    { label: "Checkout", icon: ShoppingCart, action: () => navigate("/checkout") },
    { label: "Track Order", icon: Truck, action: () => navigate("/tracker") },
    { label: "Support", icon: Headset, action: () => navigate("/contact") },
  ];

  const resolveDeliveryDisplay = () => {
    if (deliveryAddress) return deliveryAddress;
    const shortStore = "Naya Nagar, Dhata Road, Manjhanpur, Kaushambi";
    return STORE_DETAILS?.address ? STORE_DETAILS.address.split(", ").slice(0, 4).join(", ") : shortStore;
  };

  return (
    <header className={`${headerClass} md:bg-[#fffdf9]/90 bg-[#064985]`}>
      <div className="w-full max-w-[100vw] overflow-x-hidden px-3 pt-2 pb-0 md:px-5 md:py-3">
        {/* Top Row: Logo and Mobile Actions */}
        <div className="flex h-[52px] items-center justify-between gap-2 md:h-[72px] md:gap-4">
          <Link to="/" className="group flex min-w-0 shrink-1 items-center gap-1 text-left md:gap-3">
            <div className="flex flex-col leading-none">
              <span className="text-[27px] font-black tracking-tighter text-[#ffcc00] md:text-[#111111] md:text-2xl">
                NM MART
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white md:hidden">
                Wholesale
              </span>
              <p className="hidden md:block truncate text-[10px] font-bold uppercase tracking-[0.22em] text-[#5f5a55]">
                {theme.storeSlogan || "Shop More, Save More"}
              </p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden flex-1 md:block mx-8">
            <form
              className="flex items-center gap-3 rounded-full border border-[#eadcc6] bg-white px-4 py-2.5 shadow-sm"
              onSubmit={handleSearchSubmit}
            >
              <Search className="h-4 w-4 text-[#8a8a8a]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search products"
                placeholder="Search products, brands & categories"
                className="w-full border-0 bg-transparent text-sm text-[#1f2937] placeholder:text-[#7b7b7b] focus:outline-none"
              />
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 md:gap-3">
            {/* Mobile Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="text-white transition-opacity hover:opacity-80 md:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <button
                type="button"
                onClick={() => navigate(user ? "/profile" : "/login")}
                className="text-white transition-opacity hover:opacity-80 md:hidden"
                aria-label="Account"
              >
                <User size={22} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fbbf24] text-[#123b6d] transition-opacity hover:opacity-80 md:hidden"
                aria-label="Orders"
              >
                <Bell size={22} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fda4af] text-[#9f1239] transition-opacity hover:opacity-80 md:hidden"
                aria-label="Wishlist"
              >
                <Heart size={18} fill="currentColor" />
              </button>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#f1ddc6] bg-white text-slate-700 shadow-sm transition hover:text-rose-500"
                aria-label="Open wishlist"
              >
                <Bookmark size={17} />
                {wishlistBarcodes.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">{wishlistBarcodes.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#f1ddc6] bg-white text-slate-700 shadow-sm transition hover:text-primary"
                aria-label="Open order notifications"
              >
                <Bell size={17} />
              </button>
            </div>

            <div className="relative hidden md:block">
              <button
                type="button"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#f1ddc6] bg-white px-4 text-[#1e1e1e] shadow-sm transition hover:-translate-y-0.5"
              >
                <User size={15} className="text-[#111111]" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">Account</span>
                <ChevronDown size={12} className={`transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full z-[80] mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.4)]">
                  <p className="px-3 pb-2 pt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Account Menu
                  </p>
                  {accountMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        item.action();
                      }}
                      className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-orange-50 hover:text-slate-900"
                    >
                      <item.icon size={15} className="text-orange-500" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition md:h-11 md:w-auto md:px-4 md:bg-[#111827]"
            >
              <ShoppingCart size={24} className="text-white md:size-[15px]" />
              <span className="hidden md:inline ml-2 text-[10px] font-black uppercase tracking-[0.18em]">Cart</span>
              <span className="absolute -top-1.5 -right-1.5 flex min-w-[1.2rem] items-center justify-center rounded-full bg-red-600 px-1 py-0.5 text-[9px] font-bold text-white md:static md:ml-1.5 md:bg-orange-500 md:text-[10px]">
                {cartCount > 99 ? "100+" : cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-0 md:hidden">
          <form
            className="flex h-[52px] w-full items-center gap-3 rounded-xl border border-white/25 bg-[#4669aa] px-4 shadow-inner"
            onSubmit={handleSearchSubmit}
          >
            <Search className="h-7 w-7 shrink-0 text-white" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search product, brand or article..."
              className="block w-full border-0 bg-transparent text-[17px] font-medium text-white placeholder:text-white/80 focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* Mobile Location Bar */}
      <div className="flex items-center justify-between bg-[#dbeafe] px-4 py-2.5 md:hidden">
        <div className="flex items-center gap-2 text-slate-900">
          <MapPin size={24} className="text-[#69a9ed]" />
          <span className="text-[16px] font-bold tracking-tight text-slate-950">
            {resolveDeliveryDisplay().split(',').slice(0, 2).join(',')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="text-[16px] font-bold text-[#064985]"
        >
          Change
        </button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[90] bg-black/50"
              aria-label="Close menu overlay"
            />
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed right-0 top-0 z-[91] h-full w-[330px] max-w-[88vw] border-l border-slate-200/80 bg-slate-50 shadow-[rgba(15,23,42,0.4)_-28px_0_48px_-12px]"
            >
              <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50 p-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">Store</p>
                  <p className="mt-1 flex items-center gap-1.5 font-black text-lg uppercase tracking-tight">
                    <span className="tracking-tight text-black">NM MART</span>
                    <span className="shrink-0 text-[0.5rem] leading-none text-emerald-500" aria-label="Live online">
                      ●
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl p-2 transition-colors hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 bg-slate-50 p-4">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      item.action();
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors hover:bg-orange-50"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-black">
                      <item.icon size={18} className="text-orange-500" />
                      {item.label}
                    </span>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                ))}

                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors hover:bg-red-50"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-red-600">
                      <LogOut size={18} className="text-red-600" />
                      Logout
                    </span>
                    <ChevronRight size={18} className="text-red-300" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate("/login");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors hover:bg-orange-50"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-black">
                      <User size={18} className="text-orange-500" />
                      Login
                    </span>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                )}
              </div>

              <div className="border-t border-slate-200/90 bg-slate-50 p-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-orange-50 px-4 py-3">
                    <Truck size={16} className="text-orange-500" />
                    <div className="leading-tight">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Fast Delivery</p>
                      <p className="text-xs font-bold text-black">Same day in service area</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-yellow-50 px-4 py-3">
                    <CreditCard size={16} className="text-yellow-600" />
                    <div className="leading-tight">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Secure Payments</p>
                      <p className="text-xs font-bold text-black">UPI, Card, Netbanking</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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

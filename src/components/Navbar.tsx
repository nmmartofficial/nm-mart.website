import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  User,
  Package,
  ShieldCheck,
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
  Heart,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "@/lib/ThemeProvider";
import { WA_NUMBER } from "@/lib/store-utils";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import WelfareModal from "@/components/shop/modals/WelfareModal";

import { ThemeConfig } from "@/lib/storeConfig";

interface NavbarProps {
  theme?: ThemeConfig;
  setIsAiChatOpen?: (isOpen: boolean) => void;
}

const Navbar = ({ theme: propsTheme, setIsAiChatOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme: storeTheme } = useTheme();
  const theme = propsTheme || storeTheme;
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState("");
  const [welfareCard, setWelfareCard] = useState<{ number: string; active: boolean; points: number } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { cartCount } = useCart();

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
    ? "sticky top-0 z-50 w-full border-b border-[#f1e4d3] bg-[#fffdf9]/90 backdrop-blur-xl shadow-[0_12px_35px_-25px_rgba(15,23,42,0.35)]"
    : headerStyle === "minimal"
      ? "sticky top-0 z-50 bg-background/60 backdrop-blur-md border-b border-border h-14"
      : "sticky top-0 z-50 border-b border-[#f0e9e2] bg-[#fffdf9]/90 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(0,0,0,0.18)]";

  const containerClass = headerStyle === "centered"
    ? "max-w-7xl mx-auto px-4 h-20 flex flex-col md:flex-row items-center justify-between"
    : "max-w-7xl mx-auto flex h-[78px] items-center justify-between px-4 md:px-6";

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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, welfare_status, welfare_card_number, points_balance")
      .eq("id", userId)
      .single();

    if (!data) return;
    setProfileName(data.full_name || "");

    let cardNumber = data.welfare_card_number;
    if (!cardNumber) {
      cardNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const { error } = await supabase.from("profiles").update({ welfare_card_number: cardNumber }).eq("id", userId);
      if (error) {
        logSupabaseDebug("navbarCardNumberUpdate:error", { userId }, error);
      }
    }

    setWelfareCard({
      number: cardNumber,
      active: data.welfare_status === "active",
      points: data.points_balance || 0,
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setDrawerOpen(false);
      navigate("/");
    } catch (err: any) {
      logSupabaseDebug("navbarLogout:error", undefined, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to logout"));
    }
  };

  const handleWelfare = () => {
    setDrawerOpen(false);
    if (welfareCard?.active) setShowGoldenCard(true);
    else setShowWelfareModal(true);
  };

  const menuItems = [
    { label: "My Profile", icon: User, action: () => navigate("/profile") },
    { label: "My Orders", icon: Package, action: () => navigate("/tracker") },
    { label: "Welfare Card", icon: ShieldCheck, action: handleWelfare },
    { label: "Fast Delivery Info", icon: Truck, action: () => navigate("/delivery") },
    { label: "Secure Payments", icon: CreditCard, action: () => navigate("/contact") },
    { label: "Support", icon: Headset, action: () => navigate("/contact") },
  ];

  return (
    <header className={headerClass}>
      <div className="mx-auto max-w-7xl px-3 py-3 md:px-5">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/" className="group flex min-w-0 items-center gap-3 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f1ddc6] bg-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)] transition-transform duration-200 group-hover:scale-[1.02] md:h-14 md:w-14">
              {theme.storeLogo ? (
                <img src={theme.storeLogo} alt="NM Mart logo" className="h-9 w-9 object-contain md:h-11 md:w-11" />
              ) : (
                <ShoppingCart className="h-6 w-6 text-[#111111] md:h-7 md:w-7" />
              )}
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="flex items-center gap-2 truncate text-lg font-black uppercase tracking-[-0.05em] text-[#111111]">
                <span>NM MART</span>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#2ecc71] shadow-[0_0_10px_rgba(46,204,113,0.65)]" aria-label="Live online" />
              </p>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-[#5f5a55]">
                Shop More, Save More
              </p>
            </div>
          </Link>

          <div className="hidden flex-1 md:block">
            <form
              className="flex items-center gap-3 rounded-full border border-[#eadcc6] bg-white px-4 py-3 shadow-[0_12px_25px_-22px_rgba(15,23,42,0.55)]"
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

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => navigate(user ? "/profile" : "/login")}
              className="inline-flex items-center gap-2 rounded-full border border-[#f1ddc6] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1e1e1e] shadow-sm transition hover:-translate-y-0.5 hover:border-[#efc28a] md:px-4"
            >
              <User size={16} className="text-[#111111]" />
              <span className="hidden sm:inline">{user ? "Account" : "Login"}</span>
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f1ddc6] bg-white text-[#1e1e1e] shadow-sm transition hover:-translate-y-0.5 hover:border-[#efc28a] md:h-11 md:w-11"
              onClick={() => navigate(user ? "/profile" : "/login")}
            >
              <Heart size={18} className="text-[#111111]" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_-18px_rgba(17,24,39,0.8)] transition hover:bg-[#f59e0b] md:px-4"
            >
              <ShoppingCart size={16} className="text-white" />
              <span className="hidden sm:inline">Cart</span>
              <span className="inline-flex min-w-[1.3rem] items-center justify-center rounded-full bg-[#f59e0b] px-1.5 py-0.5 text-[9px] font-black text-white">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f1ddc6] bg-white shadow-[0_12px_25px_-20px_rgba(0,0,0,0.3)] transition-all hover:shadow-md md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} className="text-[#111111]" />
            </button>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <form
            className="flex items-center gap-3 rounded-full border border-[#eadcc6] bg-white px-4 py-3 shadow-[0_12px_25px_-22px_rgba(15,23,42,0.55)]"
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

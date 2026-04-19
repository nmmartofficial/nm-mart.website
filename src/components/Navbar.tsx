import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "@/lib/ThemeProvider";
import { WA_NUMBER } from "@/lib/store-utils";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { toast } from "sonner";
import WelfareModal from "@/components/shop/modals/WelfareModal";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState("");
  const [welfareCard, setWelfareCard] = useState<{ number: string; active: boolean; points: number } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="shrink-0">
            <div className="rounded-2xl bg-primary p-2.5 shadow-sm">
              {theme.storeLogo ? (
                <img src={theme.storeLogo} alt="Logo" className="h-6 w-6 object-contain" />
              ) : (
                <ShoppingCart className="h-6 w-6 text-white" />
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => navigate(user ? "/profile" : "/login")}
            className="min-w-0 text-left"
          >
            <p className="truncate text-lg font-black tracking-tighter text-black uppercase">
  NM <span className="text-primary">MART</span>
</p>
            <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Shop More, Save More
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-2xl border border-white/70 bg-white/75 p-3 shadow-sm transition-all hover:shadow-md"
          aria-label="Open menu"
        >
          <Menu size={20} />
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
              className="fixed right-0 top-0 z-[91] h-full w-[330px] max-w-[88vw] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">NM Mart</p>
                  <p className="mt-1 text-base font-black text-black">
                    {user ? `Hello, ${profileName?.split(" ")[0] || "Member"}` : "Welcome"}
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

              <div className="space-y-2 p-4">
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

              <div className="border-t border-gray-100 p-4">
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

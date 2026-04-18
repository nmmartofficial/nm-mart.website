import { ShoppingCart, Mail, MapPin, User, Package, Star, X, Gift, MessageCircle, Menu, HelpCircle, LogOut, ChevronRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { WA_NUMBER } from "@/lib/store-utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeProvider";
import WelfareModal from "./modals/WelfareModal";

const SLOGAN = "Shop More, Save More";

const Header = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [welfareCard, setWelfareCard] = useState<{ number: string; active: boolean; points: number } | null>(null);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Helper to split store name for styling
  const renderStoreName = () => {
    const name = theme.storeName || "NM MART";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (
        <>
          {parts[0]} <span className="text-primary">{parts.slice(1).join(" ")}</span>
        </>
      );
    }
    return <span className="text-primary">{name}</span>;
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, welfare_status, welfare_card_number, points_balance')
        .eq('id', userId)
        .single();
      
      if (data) {
        if (data.full_name) setProfileName(data.full_name);
        
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
      console.error("Error fetching profile:", err);
    }
  };

  const handleWelfareClick = () => {
    if (welfareCard?.active) {
      setShowGoldenCard(true);
    } else {
      setShowWelfareModal(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDrawerOpen(false);
    navigate("/");
  };

  return (
    <header className="w-full z-50 sticky top-0">
      {/* Top Thin Bar - Hidden on mobile to save space */}
      <div className="hidden md:flex bg-[#f8f9fa] text-gray-500 py-2.5 px-6 justify-between items-center text-[9px] font-black uppercase tracking-[3px] border-b border-gray-100">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 italic">
            <Mail size={10} className="text-primary"/> support@nmmart.in
          </span>
          <span className="flex items-center gap-2 italic">
            <MapPin size={10} className="text-primary"/> Naya Nagar, Dhata Road, Manjhanpur
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/tracker" className="hover:text-black transition-colors flex items-center gap-1">
            <Package size={10} className="text-primary" /> Track Order
          </Link>
        </div>
      </div>

      {/* Glass Navbar */}
      <div className="backdrop-blur-[10px] bg-white/80 border-b border-white/60">
        <div className="p-3 md:p-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-3 no-underline shrink-0">
              <div className="bg-primary p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm">
                {theme.storeLogo ? (
                  <img src={theme.storeLogo} alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                ) : (
                  <ShoppingCart className="text-white w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
            </Link>

            <div className="min-w-0">
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="text-left leading-tight"
                >
                  <div className="text-[10px] md:text-xs font-semibold text-gray-500">
                    Hello, <span className="text-black">{profileName?.split(" ")[0] || "Member"}</span>
                  </div>
                  <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.22em] text-primary italic truncate max-w-[220px]">
                    {SLOGAN}
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-left leading-tight"
                >
                  <div className="text-[10px] md:text-xs font-semibold text-gray-500">Hello,</div>
                  <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.22em] text-primary italic">
                    Login
                  </div>
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-3 rounded-2xl bg-white/70 border border-white/60 shadow-sm hover:shadow-md transition-all"
            aria-label="Open menu"
          >
            <Menu className="text-black" size={20} />
          </button>
        </div>
      </div>

      {/* Right Drawer */}
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
              className="fixed top-0 right-0 h-full w-[320px] max-w-[86vw] z-[91] bg-white shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">NM MART</div>
                  <div className="mt-1 text-base font-black text-black">
                    {user ? `Hello, ${profileName?.split(" ")[0] || "Member"}` : "Welcome"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-2">
                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-orange-50 transition-colors"
                >
                  <span className="flex items-center gap-3 font-bold text-sm text-black">
                    <User className="text-orange-500" size={18} /> My Profile
                  </span>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>

                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); navigate("/tracker"); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-orange-50 transition-colors"
                >
                  <span className="flex items-center gap-3 font-bold text-sm text-black">
                    <Package className="text-orange-500" size={18} /> My Orders
                  </span>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>

                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); handleWelfareClick(); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-orange-50 transition-colors"
                >
                  <span className="flex items-center gap-3 font-bold text-sm text-black">
                    <ShieldCheck className="text-orange-500" size={18} /> Welfare Card
                  </span>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>

                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); navigate("/contact"); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-orange-50 transition-colors"
                >
                  <span className="flex items-center gap-3 font-bold text-sm text-black">
                    <HelpCircle className="text-orange-500" size={18} /> Help
                  </span>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>

                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors"
                  >
                    <span className="flex items-center gap-3 font-bold text-sm text-red-600">
                      <LogOut className="text-red-600" size={18} /> Logout
                    </span>
                    <ChevronRight size={18} className="text-red-300" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setDrawerOpen(false); navigate("/login"); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-orange-50 transition-colors"
                  >
                    <span className="flex items-center gap-3 font-bold text-sm text-black">
                      <User className="text-orange-500" size={18} /> Login
                    </span>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Welfare Card Modals */}
      <AnimatePresence>
        {showGoldenCard && welfareCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              className="relative w-full max-w-md aspect-[1.6/1] bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#b38728] rounded-3xl p-8 shadow-[0_0_50px_rgba(191,149,63,0.4)] border border-white/20 overflow-hidden group"
            >
              {/* Chip Detail */}
              <div className="absolute top-12 left-10 w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-lg shadow-inner opacity-80" />
              
              {/* Logo */}
              <div className="absolute top-8 right-10 flex flex-col items-end">
                <h2 className="text-2xl font-black italic text-yellow-900 tracking-tighter leading-none">{renderStoreName()}</h2>
                <p className="text-[8px] font-bold text-yellow-800 uppercase tracking-widest">Welfare Member</p>
              </div>

              {/* Card Number */}
              <div className="mt-20">
                <p className="text-[10px] font-black text-yellow-900/60 uppercase tracking-[4px] mb-1">Card Number</p>
                <p className="text-2xl font-black text-black font-mono tracking-[6px] drop-shadow-sm">
                  {welfareCard.number.match(/.{1,4}/g)?.join(' ') || welfareCard.number}
                </p>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-yellow-900/60 uppercase tracking-widest mb-1">Card Holder</p>
                  <p className="text-sm font-black text-black uppercase italic tracking-tight">{profileName || "NM Member"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-yellow-900/60 uppercase tracking-widest mb-1">Balance</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Star size={14} className="text-yellow-900 fill-current" />
                    <p className="text-xl font-black text-black italic">{welfareCard.points} <span className="text-[10px]">PTS</span></p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setShowGoldenCard(false)}
                className="absolute top-4 left-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-all text-yellow-900"
              >
                <X size={16} />
              </button>

              {/* Holographic Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            </motion.div>
            
            {/* Action Button outside the card */}
            <div className="absolute bottom-20 flex flex-col items-center gap-4">
              <button 
                onClick={() => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi NM Mart! I want to redeem my ${welfareCard.points} points for a discount.`)}`, "_blank")}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 italic"
              >
                Redeem Points <Gift size={20} />
              </button>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">1 Point = ₹1 Discount</p>
            </div>
          </div>
        )}

        <WelfareModal isOpen={showWelfareModal} onClose={() => setShowWelfareModal(false)} />
      </AnimatePresence>
    </header>
  );
};

export default Header;

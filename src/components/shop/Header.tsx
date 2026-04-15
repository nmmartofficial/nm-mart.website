import { ShoppingCart, Mail, MapPin, User, Search, Package, Star, X, Gift, CreditCard, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { WA_NUMBER } from "@/lib/store-utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeProvider";

const SLOGAN = "Shop More, Save More";

const Header = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [welfareCard, setWelfareCard] = useState<{ number: string; active: boolean; points: number } | null>(null);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showGoldenCard, setShowGoldenCard] = useState(false);

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

  return (
    <header className="flex flex-col w-full z-50 sticky top-0 shadow-sm">
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

      {/* Main Header - White background */}
      <div className="bg-white p-3 md:p-4 flex justify-between items-center border-b border-primary/10">
        <Link to="/" className="flex items-center gap-3 md:gap-4 group no-underline shrink-0">
          <div className="bg-primary p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
            {theme.storeLogo ? (
              <img src={theme.storeLogo} alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
            ) : (
              <ShoppingCart className="text-white w-5 h-5 md:w-6 md:h-6" />
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-black text-black leading-none italic uppercase tracking-tighter">
              {renderStoreName()}
            </h1>
            <p className="text-[7px] md:text-[9px] font-black text-gray-400 tracking-[0.2em] md:tracking-[0.3em] uppercase mt-0.5 md:mt-1 italic">
              {SLOGAN}
            </p>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 md:gap-4">
          {user ? (
            <Link 
              to="/profile" 
              className="flex items-center gap-2 md:gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl transition-all group"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center text-white font-black">
                <User className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Welcome, {profileName.split(' ')[0] || 'User'}
                </span>
                <span className="text-xs text-black font-bold truncate max-w-[100px]">Dashboard</span>
              </div>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="bg-gray-50 text-black border border-gray-100 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-1.5 md:gap-2 italic"
            >
              <User className="w-3 h-3 md:w-3.5 md:h-3.5" /> Sign In
            </Link>
          )}

          {/* Welfare Card Button */}
          {welfareCard?.active ? (
            <button 
              onClick={handleWelfareClick}
              className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 border border-yellow-600 px-2 md:px-3 py-1.5 rounded-lg md:rounded-xl hover:shadow-lg transition-all group shadow-sm animate-pulse-glow"
            >
              <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-800 fill-current" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter text-yellow-900">Active</span>
                <span className="text-[9px] md:text-[10px] font-black text-black hidden sm:inline">{profileName.split(' ')[0] || "Active"}</span>
              </div>
            </button>
          ) : (
            <button 
              onClick={handleWelfareClick}
              className="flex items-center gap-1 bg-white border border-black px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-black hover:text-white transition-all group shadow-sm"
            >
              <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-black group-hover:text-white fill-current" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-black group-hover:text-white hidden sm:inline">Welfare</span>
            </button>
          )}
          
          <Link 
            to="/contact" 
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2 italic hidden md:flex"
          >
             Contact Us
          </Link>
        </div>
      </div>

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

        {showWelfareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-yellow-100"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mb-16 blur-3xl" />

              <button 
                onClick={() => setShowWelfareModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star size={32} className="text-white fill-current" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Welfare <span className="text-yellow-600">Card</span></h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Join the Elite NM Circle</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100/50">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Gift size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase italic">Flat 5-10% Extra Discount</p>
                      <p className="text-xs text-gray-500 font-medium">Automatic discount on every order, including existing offers!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <CreditCard size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase italic">Premium Store Access</p>
                      <p className="text-xs text-gray-500 font-medium">Get priority support and exclusive member-only flash sales.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <MessageCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase italic">Priority Delivery</p>
                      <p className="text-xs text-gray-500 font-medium">Your orders are packed and shipped on high priority.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi NM Mart! I'm interested in the Welfare Card membership. Please guide me on how to join.")}`, "_blank");
                    setShowWelfareModal(false);
                  }}
                  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-600 transition-all shadow-xl flex items-center justify-center gap-3 italic"
                >
                  Join NM Welfare Now <Star size={18} className="fill-current" />
                </button>
                
                <p className="text-center mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                  Membership valid for 6 months • ₹599/-
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

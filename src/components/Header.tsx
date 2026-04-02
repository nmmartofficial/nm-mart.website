import { ShoppingCart, Mail, MapPin, User, Search, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LOGO_URL = "https://i.postimg.cc/9XJ2GS8L/logo.jpg";
const SLOGAN = "Shop More, Save More";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>("");

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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      
      if (data && data.full_name) {
        setProfileName(data.full_name);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  return (
    <header className="flex flex-col w-full z-50 sticky top-0 shadow-sm">
      {/* Top Thin Bar - Professional & Clean */}
      <div className="bg-[#f8f9fa] text-gray-500 py-2.5 px-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[3px] border-b border-gray-100">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 italic">
            <Mail size={10} className="text-primary"/> support@nmmart.in
          </span>
          <span className="hidden md:flex items-center gap-2 italic">
            <MapPin size={10} className="text-primary"/> Near B.P. Public School, Manjhanpur
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/tracker" className="hover:text-black transition-colors flex items-center gap-1">
            <Package size={10} className="text-primary" /> Track Order
          </Link>
        </div>
      </div>

      {/* Main Header - White background */}
      <div className="bg-white p-4 flex justify-between items-center border-b border-primary/10">
        <Link to="/" className="flex items-center gap-4 group no-underline shrink-0">
          <div className="bg-primary p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
            <ShoppingCart className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-black leading-none italic uppercase tracking-tighter">
              NM <span className="text-primary">MART</span>
            </h1>
            <p className="text-[9px] font-black text-gray-400 tracking-[0.3em] uppercase mt-1 italic">
              {SLOGAN}
            </p>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <Link 
              to="/profile" 
              className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-4 py-2 rounded-2xl transition-all group"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-black">
                <User size={16} />
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
              className="bg-gray-50 text-black border border-gray-100 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-2 italic"
            >
              <User size={14} /> Sign In
            </Link>
          )}
          
          <Link 
            to="/contact" 
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2 italic hidden md:flex"
          >
             Contact Us
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

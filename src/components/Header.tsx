import { ShoppingCart, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex flex-col w-full z-50 sticky top-0 shadow-2xl">
      {/* Top Thin Bar - Black & Orange */}
      <div className="bg-[#0a0a0a] text-gray-500 py-2 px-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[3px] border-b border-white/5">
        <span className="flex items-center gap-2 italic">
          <Mail size={10} className="text-[#FF8C00]"/> support@nmmart.in
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={10} className="text-[#FF8C00]"/> Manjhanpur, UP
        </span>
      </div>

      {/* Main Header - Deep Black to Slate Gradient */}
      <div className="bg-gradient-to-r from-black via-[#050505] to-black backdrop-blur-xl p-4 flex justify-between items-center border-b border-[#FF8C00]/20">
        <Link to="/" className="flex items-center gap-4 group">
          {/* Logo Icon - Caseari/Orange Theme */}
          <div className="bg-[#FF8C00] p-3 rounded-2xl shadow-[0_0_20px_rgba(255,140,0,0.4)] group-hover:scale-110 transition-transform duration-300">
            <ShoppingCart className="text-black" size={24} />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none italic uppercase tracking-tighter">
              NM <span className="text-[#FF8C00]">MART</span>
            </h1>
            <p className="text-[9px] font-black text-gray-500 tracking-[0.3em] uppercase mt-1 italic">
              Shop More, Save More
            </p>
          </div>
        </Link>

        {/* Navigation / Action Button */}
        <div className="flex items-center gap-4">
          <Link 
            to="/contact" 
            className="bg-[#FF8C00] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center gap-2 italic"
          >
             Contact Us
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

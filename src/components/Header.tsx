import { Mail, Clock, ShoppingCart, Search, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col w-full z-50 sticky top-0 shadow-lg">
      {/* Top Blue Bar with Email & Time */}
      <div className="bg-[#0f172a] text-white py-2 px-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-blue-900/30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-blue-200 uppercase tracking-tighter hover:text-white transition-colors">
            <Mail size={12} className="text-orange-400"/> support@nmmart.in
          </span>
          <span className="hidden md:flex items-center gap-1 text-blue-200 border-l border-blue-800 pl-4 uppercase tracking-tighter">
            <Clock size={12} className="text-orange-400"/> 9 AM - 10 PM
          </span>
        </div>
        <span className="italic font-black text-orange-500 text-[8px] tracking-[0.2em]">Manjhanpur, UP</span>
      </div>

      {/* Main Header in Dark Blue */}
      <div className="bg-[#1e293b] p-4 flex justify-between items-center border-b border-blue-900">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-inner">
            <ShoppingCart className="text-[#1e293b]" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white leading-none italic uppercase tracking-tighter">NM MART</h1>
            <p className="text-[10px] font-black text-orange-400 tracking-[0.2em] uppercase mt-1">Shop More, Save More</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <button className="hover:text-orange-400 transition-colors"><Search size={22} /></button>
          <button className="hover:text-orange-400 transition-colors"><Menu size={22} /></button>
        </div>
      </div>
    </header>
  );
};

export default Header;

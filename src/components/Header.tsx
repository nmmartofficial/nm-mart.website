import { ShoppingCart, Mail } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col w-full z-50 sticky top-0 shadow-lg">
      {/* Top Thin Bar - Soft Slate Grey */}
      <div className="bg-[#f8fafc] text-slate-500 py-2.5 px-6 flex justify-between items-center text-[10px] font-medium uppercase tracking-widest border-b border-sky-100">
        <span className="flex items-center gap-2"><Mail size={12}/> support@nmmart.in</span>
        <span>Manjhanpur, UP</span>
      </div>

      {/* Main Header - Pearl White to Sky Blue Gradient */}
      <div className="bg-gradient-to-r from-white via-[#f0f9ff] to-[#e0f2fe]/95 backdrop-blur-md p-5 flex justify-between items-center border-b-2 border-sky-200">
        <div className="flex items-center gap-4">
          {/* Logo Icon with Sky Blue Background */}
          <div className="bg-[#0ea5e9] p-3 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <ShoppingCart className="text-white" size={26} />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-[#1e293b] leading-none italic uppercase tracking-tighter">
              NM <span className="text-[#0ea5e9]">MART</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-1">
              Shop More, Save More
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button className="bg-[#0ea5e9] text-white px-7 py-3 rounded-full font-black text-[11px] uppercase shadow-lg hover:bg-[#0369a1] hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
           Contact Us
        </button>
      </div>
    </header>
  );
};

export default Header;

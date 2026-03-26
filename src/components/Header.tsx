import { ShoppingCart, Mail } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col w-full z-50 sticky top-0">
      {/* Top Thin Bar (Dark) */}
      <div className="bg-[#020617] text-slate-400 py-2 px-6 flex justify-between items-center text-[10px] font-medium uppercase tracking-widest border-b border-slate-800">
        <span className="flex items-center gap-2"><Mail size={12}/> support@nmmart.in</span>
        <span>Manjhanpur, UP</span>
      </div>

      {/* Main Header (Navy Blue) */}
      <div className="bg-[#0f172a]/95 backdrop-blur-md p-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl shadow-lg">
            <ShoppingCart className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-none italic uppercase tracking-tighter">NM MART</h1>
            <p className="text-[9px] font-bold text-amber-500 tracking-[0.2em] uppercase mt-1">Shop More, Save More</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

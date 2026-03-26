import { ShoppingCart } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col w-full z-50 sticky top-0 shadow-2xl">
      {/* Top Orange Bar */}
      <div className="bg-[#f59e0b] text-[#0f172a] py-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span>Email: support@nmmart.in</span>
        <span className="italic">Manjhanpur, UP</span>
      </div>

      {/* Main Navy Header */}
      <div className="bg-[#0f172a] p-5 flex justify-between items-center border-b-4 border-[#fbbf24]">
        <div className="flex items-center gap-4">
          <div className="bg-[#fbbf24] p-3 rounded-2xl rotate-3 shadow-lg">
            <ShoppingCart className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#fbbf24] leading-none italic uppercase tracking-tighter">NM MART</h1>
            <p className="text-[10px] font-bold text-white tracking-[0.2em] uppercase mt-1 italic">Shop More, Save More</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

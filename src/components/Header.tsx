import React from 'react';

const Header = () => {
  return (
    <header className="w-full z-50 sticky top-0 shadow-2xl">
      {/* Top Premium Bar */}
      <div className="bg-[#020617] text-slate-400 py-2 px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-800">
        <span>Quality You Can Trust</span>
        <span className="italic">Manjhanpur, UP</span>
      </div>

      {/* Main Header - Deep Navy & Gold */}
      <div className="bg-[#0f172a] p-5 flex justify-between items-center border-b-2 border-amber-500/50">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-white leading-none italic uppercase tracking-tighter">
            NM <span className="text-amber-500">MART</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">
            Shop More, Save More
          </p>
        </div>

        {/* Navigation Links (Hidden on small screens for safety) */}
        <nav className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-white/80">
          <a href="#" className="hover:text-amber-500 transition-colors">Home</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Offers</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Products</a>
        </nav>

        {/* Contact Button */}
        <button className="bg-amber-500 text-[#0f172a] px-6 py-2.5 rounded-full font-black text-[10px] uppercase shadow-lg hover:bg-white hover:scale-105 transition-all">
           Contact Us
        </button>
      </div>
    </header>
  );
};

export default Header;

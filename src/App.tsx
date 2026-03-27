import React, { useState } from 'react';
import { ShoppingCart, Search, MapPin, Grid, Package, Sparkles, Heart, Home } from 'lucide-react';

function App() {
  const [cartCount, setCartCount] = useState(0);

  // आपकी 7000+ आइटम्स वाली कैटेगरी (FMCG, Stationery, Personal Care)
  const categories = [
    { name: "FMCG & Groceries", icon: <Package size={24}/>, count: "4000+ Items" },
    { name: "Stationery", icon: <Grid size={24}/>, count: "1500+ Items" },
    { name: "Personal Care", icon: <Sparkles size={24}/>, count: "1000+ Items" },
    { name: "Home Cleaning", icon: <Home size={24}/>, count: "500+ Items" }
  ];

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans pb-20">
      
      {/* 1. PREMIUM SKY BLUE NAVBAR */}
      <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b-2 border-sky-100">
        <div className="bg-[#e0f2fe] text-[#0369a1] py-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1"><MapPin size={10}/> Manjhanpur, UP</span>
          <span className="italic font-extrabold tracking-tighter">NM MART - 7000+ High Quality Products</span>
        </div>
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-[#1e293b] italic uppercase leading-none">
              NM <span className="text-[#0ea5e9]">MART</span>
            </h1>
            <p className="text-[8px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1">Shop More, Save More</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-[#0ea5e9]"><Search size={22} /></button>
            <button className="relative p-2.5 bg-[#f0f9ff] rounded-2xl text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm">
              <ShoppingCart size={24} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. CATEGORY SECTION (7000 फाइलों का डेटा यहाँ है) */}
      <section className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
           <div className="h-1 w-12 bg-[#0ea5e9] rounded-full"></div>
           <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Our Product Categories</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div key={index} className="bg-white p-8 rounded-[2.5rem] border border-sky-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center group">
              <div className="bg-[#f0f9ff] p-5 rounded-2xl text-[#0ea5e9] mb-4 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors shadow-inner">
                {cat.icon}
              </div>
              <h3 className="font-black text-[#1e293b] text-sm uppercase italic tracking-tighter">{cat.name}</h3>
              <p className="text-[10px] font-bold text-[#0ea5e9] mt-2 opacity-70">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MEMBER LOGIN (GLASS CARD) */}
      <section className="py-20 flex flex-col items-center bg-gradient-to-b from-transparent to-[#e0f2fe]/30">
        <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tighter mb-8 italic">
          NM <span className="text-[#0ea5e9]">MART</span> CLUB
        </h3>
        <div className="bg-white/60 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm flex flex-col items-center gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Member Dashboard</p>
          <input 
            type="text" 
            placeholder="91XXXXXXXXX" 
            className="w-full py-5 px-6 bg-white/50 border-2 border-sky-50 rounded-2xl text-center text-xl font-bold text-[#0369a1] focus:border-[#0ea5e9] transition-all shadow-inner outline-none"
          />
          <button className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#0369a1] shadow-blue-200 transition-all">
            Enter Dashboard
          </button>
        </div>
      </section>

    </div>
  );
}

export default App;

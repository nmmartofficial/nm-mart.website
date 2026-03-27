import React, { useState } from 'react';
import { ShoppingCart, User, Search, MapPin, Star } from 'lucide-react';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const addToCart = () => setCartCount(cartCount + 1);

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans">
      
      {/* 1. PREMIUM NAVBAR */}
      <header className="w-full sticky top-0 z-50 shadow-md">
        <div className="bg-[#e0f2fe] text-[#0369a1] py-2 px-6 flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest border-b border-sky-200">
          <span className="flex items-center gap-1"><MapPin size={10}/> Manjhanpur, UP</span>
          <span className="italic underline decoration-sky-400">NM MART - Quality You Can Trust</span>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-4 flex justify-between items-center border-b-2 border-sky-100">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-[#1e293b] italic uppercase tracking-tighter leading-none">
              NM <span className="text-[#0ea5e9]">MART</span>
            </h1>
            <p className="text-[8px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1">Shop More, Save More</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-[#0ea5e9]"><Search size={22} /></button>
            
            {/* CART ICON WITH COUNT */}
            <button className="relative p-2.5 bg-[#f0f9ff] rounded-2xl text-[#0ea5e9] border border-sky-100 shadow-sm transition-all hover:scale-110">
              <ShoppingCart size={24} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase shadow-lg">Login</button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="py-16 px-6 text-center bg-gradient-to-b from-white to-[#f0f9ff]">
        <div className="inline-block bg-[#0ea5e9]/10 text-[#0ea5e9] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-sky-100">
          🎉 Special Offer — 7000+ Items Available
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-[#1e293b] mb-6 italic leading-tight uppercase">
          Your Trusted <br/> <span className="text-[#0ea5e9]">Neighbourhood</span> Store
        </h2>
        <button 
          onClick={addToCart}
          className="bg-[#0ea5e9] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-[#0369a1] transition-all active:scale-95"
        >
          Add to Cart
        </button>
      </section>

      {/* 3. WELFARE / LOGIN CARD (GLASS LOOK) */}
      <section className="py-20 flex flex-col items-center">
        <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tighter mb-8 italic">
          NM <span className="text-[#0ea5e9]">MART</span> CLUB
        </h3>
        <div className="bg-white/60 backdrop-blur-xl border border-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm flex flex-col items-center gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Member Login</p>
          <input 
            type="text" 
            placeholder="91XXXXXXXXX" 
            className="w-full py-4 px-6 bg-white border-2 border-sky-50 rounded-2xl text-center text-xl font-bold text-[#0369a1] outline-none focus:border-[#0ea5e9] transition-all shadow-inner"
          />
          <button className="w-full bg-[#0ea5e9] text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:shadow-sky-200">
            Enter Dashboard
          </button>
        </div>
      </section>

    </div>
  );
}

export default App;

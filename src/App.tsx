import React, { useState, createContext, useContext } from 'react';
import { ShoppingCart, User, Search, MapPin } from 'lucide-react';

// 1. कार्ट की सेटिंग (यही आपकी टोकरी चलाएगा)
const CartContext = createContext<any>(null);

function App() {
  const [cartCount, setCartCount] = useState(0);

  // सामान को टोकरी में डालने का फंक्शन
  const addToCart = () => setCartCount(cartCount + 1);

  return (
    <CartContext.Provider value={{ cartCount, addToCart }}>
      <div className="min-h-screen bg-[#f0f9ff]">
        
        {/* --- प्रीमियम स्काई ब्लू नेवबार --- */}
        <header className="w-full sticky top-0 z-50 shadow-md">
          <div className="bg-[#e0f2fe] text-[#0369a1] py-2 px-6 flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest border-b border-sky-200">
            <span className="flex items-center gap-1"><MapPin size={10}/> Manjhanpur, UP</span>
            <span className="italic">NM MART - Quality You Can Trust</span>
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
              
              {/* प्रीमियम कार्ट बटन (टोकरी) */}
              <button className="relative p-2.5 bg-[#f0f9ff] rounded-2xl text-[#0ea5e9] border border-sky-100 hover:bg-[#0ea5e9] hover:text-white transition-all shadow-sm">
                <ShoppingCart size={24} strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button className="bg-[#0ea5e9] text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase shadow-lg hover:bg-[#0369a1] transition-all">
                Login
              </button>
            </div>
          </div>
        </header>

        {/* --- यहाँ आपके बाकी के कॉम्पोनेन्ट्स आएंगे --- */}
        <main className="p-10 text-center">
            <h2 className="text-4xl font-black text-[#1e293b] mb-4">Welcome to NM MART</h2>
            <p className="text-slate-500 mb-8 uppercase tracking-widest text-xs">Premium Sky Blue Experience</p>
            
            {/* टेस्टिंग के लिए एक बटन (टोकरी चेक करने के लिए) */}
            <button 
              onClick={addToCart}
              className="bg-[#0ea5e9] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              Add Item to Cart
            </button>
        </main>

      </div>
    </CartContext.Provider>
  );
}

export default App;

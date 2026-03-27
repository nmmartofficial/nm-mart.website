import React, { useState } from 'react';
import { ShoppingCart, Package, Grid, Sparkles, Home, MapPin, Trash2, X } from 'lucide-react';

// --- MAIN APP ---
export default function App() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // आपकी 7000+ आइटम्स वाली कैटेगरी
  const categories = [
    { id: 1, name: "FMCG & Groceries", icon: <Package size={24}/>, count: "4000+ Items", price: 50 },
    { id: 2, name: "Stationery", icon: <Grid size={24}/>, count: "1500+ Items", price: 20 },
    { id: 3, name: "Personal Care", icon: <Sparkles size={24}/>, count: "1000+ Items", price: 150 },
    { id: 4, name: "Home Cleaning", icon: <Home size={24}/>, count: "500+ Items", price: 100 }
  ];

  // ऑर्डर लगाने (Cart में डालने) का फंक्शन
  const addToCart = (item: any) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
  };

  // आइटम हटाने का फंक्शन
  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans pb-20">
      
      {/* 1. PREMIUM NAVBAR */}
      <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b-2 border-sky-100">
        <div className="bg-[#e0f2fe] text-[#0369a1] py-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1"><MapPin size={10}/> Manjhanpur, UP</span>
          <span>NM MART - 7000+ Products Stock</span>
        </div>
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <h1 className="text-2xl font-black text-[#1e293b] italic uppercase">NM <span className="text-[#0ea5e9]">MART</span></h1>
          
          {/* Cart Icon - Clicking this opens the Stock List */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-[#f0f9ff] rounded-2xl text-[#0ea5e9] border border-sky-100 hover:scale-110 transition-all shadow-sm"
          >
            <ShoppingCart size={24} strokeWidth={2.5} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. CATEGORY SECTION (Click any to Order) */}
      <section className="p-8 max-w-6xl mx-auto">
        <h2 className="text-center text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Click Category to Add Order</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => addToCart(cat)}
              className="bg-white p-8 rounded-[2.5rem] border border-sky-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="bg-[#f0f9ff] p-5 rounded-2xl text-[#0ea5e9] mb-4 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                {cat.icon}
              </div>
              <h3 className="font-black text-[#1e293b] text-sm uppercase italic">{cat.name}</h3>
              <p className="text-[10px] font-bold text-sky-500 mt-2">Stock: {cat.count}</p>
              <button className="mt-4 bg-[#0ea5e9] text-white text-[9px] px-4 py-2 rounded-full font-black uppercase shadow-md group-hover:bg-[#0369a1]">
                Quick Add
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. IN-SITE CART / STOCK VIEW (No Whatsapp needed) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-[#1e293b] italic uppercase">My <span className="text-[#0ea5e9]">Order Stock</span></h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
                <X size={20}/>
              </button>
            </div>

            {/* Order Details */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <Package size={60} className="mx-auto mb-4"/>
                  <p className="font-black uppercase tracking-widest text-xs">No Items Ordered Yet</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="flex justify-between items-center p-4 bg-[#f8fafc] rounded-2xl border border-sky-50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="text-[#0ea5e9] bg-white p-2 rounded-xl shadow-sm">{item.icon}</div>
                      <div>
                        <h4 className="font-black text-sm text-[#1e293b] uppercase italic">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">Price: ₹{item.price}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total & Checkout Button */}
            {cart.length > 0 && (
              <div className="mt-6 pt-6 border-t border-sky-100">
                <div className="flex justify-between mb-4">
                  <span className="font-black text-slate-400 uppercase text-xs tracking-widest">Estimated Total</span>
                  <span className="font-black text-xl text-[#1e293b]">₹{totalPrice}</span>
                </div>
                <button className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-[#0369a1] transition-all">
                  Confirm Order to NM Mart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MEMBER LOGIN CARD */}
      <section className="py-20 flex flex-col items-center">
        <div className="bg-white/60 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm flex flex-col items-center gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Club Membership</p>
          <input type="text" placeholder="Enter Phone Number" className="w-full py-5 px-6 bg-white border border-sky-50 rounded-2xl text-center font-bold text-[#0369a1] outline-none shadow-inner" />
          <button className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black text-xs tracking-widest uppercase">Check Points</button>
        </div>
      </section>

    </div>
  );
}

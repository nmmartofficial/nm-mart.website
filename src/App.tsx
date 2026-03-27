import React, { useState } from 'react';
import { ShoppingCart, Package, Grid, Sparkles, Home, MapPin, X, Plus, Search } from 'lucide-react';

// --- MAIN APP ---
export default function App() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // ये तय करेगा कि स्क्रीन पर क्या दिख रहा है (Categories या Products)
  const [currentView, setCurrentView] = useState('categories'); // 'categories' or 'products'
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // आपकी मुख्य कैटेगरी (वही पुरानी, Sky Blue वाली)
  const categories = [
    { id: 'fmcg', name: "FMCG & Groceries", icon: <Package size={24}/>, count: "4000+ Items" },
    { id: 'stat', name: "Stationery", icon: <Grid size={24}/>, count: "1500+ Items" },
    { id: 'pc', name: "Personal Care", icon: <Sparkles size={24}/>, count: "1000+ Items" },
    { id: 'hc', name: "Home Cleaning", icon: <Home size={24}/>, count: "500+ Items" }
  ];

  // आपकी 7000+ फाइलों का कुछ असली डेटा (असली कीमत के साथ)
  // जब ग्राहक कैटेगरी पर क्लिक करेगा, तो ये लिस्ट दिखेगी
  const products = {
    fmcg: [
      { id: 'p1', name: "Dawat Basmati Rice 1KG", price: 180, originalPrice: 200, discount: "10% OFF" },
      { id: 'p2', name: "Tata Salt 1KG", price: 25, originalPrice: 28, discount: "11% OFF" },
      { id: 'p3', name: "Maggie Noodle 6-Pack", price: 90, originalPrice: 100, discount: "10% OFF" },
      { id: 'p4', name: "Fortune Soyabean Oil 1L", price: 155, originalPrice: 170, discount: "9% OFF" }
    ],
    stat: [
      { id: 'p5', name: "Classmate Notebook (4-Pack)", price: 160, originalPrice: 180, discount: "11% OFF" },
      { id: 'p6', name: "Reynolds Blue Gel Pen (5-Pack)", price: 45, originalPrice: 50, discount: "10% OFF" }
    ],
    // बाकी कैटेगरी के लिए भी इसी तरह डेटा जोड़ें
    pc: [],
    hc: []
  };

  // ऑर्डर लगाने (Cart में डालने) का फंक्शन
  const addToCart = (product: any) => {
    setCart([...cart, { ...product, cartId: Date.now() }]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans pb-20">
      
      {/* 1. PREMIUM NAVBAR (Manjhanpur, NM MART) */}
      <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b-2 border-sky-100">
        <div className="bg-[#e0f2fe] text-[#0369a1] py-2 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1"><MapPin size={10}/> Manjhanpur, UP</span>
          <span>NM MART - 7000+ Products</span>
        </div>
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <h1 onClick={() => setCurrentView('categories')} className="text-2xl font-black text-[#1e293b] italic uppercase cursor-pointer">NM <span className="text-[#0ea5e9]">MART</span></h1>
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-[#f0f9ff] rounded-2xl text-[#0ea5e9] hover:scale-110 transition-all shadow-sm">
            <ShoppingCart size={24} strokeWidth={2.5} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">{cart.length}</span>}
          </button>
        </div>
      </header>

      {/* 2. MAIN SECTION (Yahan changes hue hain) */}
      <main className="p-8 max-w-7xl mx-auto flex-1">
        
        {/* VIEW 1: CATEGORIES (Ab click karne par Stock dikhega) */}
        {currentView === 'categories' && (
          <section>
            <h2 className="text-center text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Select Category to View Stock</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => { setCurrentView('products'); setSelectedCategory(cat); }}
                  className="bg-white p-8 rounded-[2.5rem] border border-sky-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center group"
                >
                  <div className="bg-[#f0f9ff] p-5 rounded-2xl text-[#0ea5e9] mb-4 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="font-black text-[#1e293b] text-sm uppercase italic leading-none">{cat.name}</h3>
                  <p className="text-[10px] font-bold text-sky-500 mt-2">{cat.count}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIEW 2: PRODUCTS (Asli naam wa price ke saath) */}
        {currentView === 'products' && (
          <section>
            {/* Back to Categories Button */}
            <div className="flex items-center justify-between mb-8">
               <button onClick={() => setCurrentView('categories')} className="text-[#0ea5e9] font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5"><X size={14}/> Back to All Categories</button>
               <h3 className="text-xl font-black text-[#1e293b] uppercase italic flex items-center gap-3"> {selectedCategory.icon} NM Mart {selectedCategory.name}</h3>
               <div className="relative w-full max-w-xs">
                 <input type="text" placeholder="Search product..." className="w-full py-3 px-5 bg-white border border-sky-100 rounded-full font-bold text-sm outline-none shadow-inner" />
                 <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
               </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(products[selectedCategory.id as keyof typeof products] || []).map((product: any) => (
                <div key={product.id} className="bg-white p-6 rounded-3xl border border-sky-50 shadow-sm flex items-center gap-5 hover:border-[#0ea5e9]/20 transition-all group">
                   <div className="text-[#0ea5e9] bg-[#f0f9ff] p-4 rounded-xl group-hover:scale-110 transition-transform">
                      {selectedCategory.icon}
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#1e293b]">{product.name}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-xl font-black text-[#0369a1]">₹{product.price}</p>
                        <p className="text-xs text-slate-400 line-through">₹{product.originalPrice}</p>
                        <p className="text-[9px] font-extrabold text-[#0ea5e9] uppercase bg-sky-50 px-2 py-0.5 rounded-full">{product.discount}</p>
                      </div>
                   </div>
                   <button onClick={() => addToCart(product)} className="bg-[#0ea5e9] text-white p-3 rounded-xl shadow-lg hover:bg-[#0369a1] transition-all"><Plus size={20}/></button>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* 3. IN-SITE CART PANEL (No Whatsapp needed) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-[#1e293b] italic uppercase">My <span className="text-[#0ea5e9]">Order Stock</span></h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            {/* ...बाकी का कार्ट कोड पहले जैसा ही... */}
          </div>
        </div>
      )}

    </div>
  );
}

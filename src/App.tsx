import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, MapPin, X, Plus, Package, Grid, Sparkles, Home, Loader2, Star, Phone, ShieldCheck, Mail, Clock } from 'lucide-react';

// आपका Google Sheet CSV लिंक (7000+ Items)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // गूगल शीट से डेटा लोड करना
  useEffect(() => {
    fetch(SHEET_URL)
      .then(response => response.text())
      .then(csvText => {
        const rows = csvText.split('\n').slice(1); 
        const data = rows.map((row, index) => {
          const cols = row.split(',');
          return {
            id: index.toString(),
            name: cols[0]?.trim() || "Item",
            barcode: cols[1]?.trim() || "",
            mainCat: cols[2]?.trim() || "Other",
            subCat: cols[3]?.trim() || "",
            mrp: parseFloat(cols[4]) || 0,
            saleRate: parseFloat(cols[5]) || 0,
            stockStatus: parseFloat(cols[5]) > 0 ? "In Stock" : "Limited Stock"
          };
        });
        setAllProducts(data);
        setLoading(false);
      })
      .catch(err => console.error("Sheet Error:", err));
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => 
      (selectedCategory ? p.mainCat.toLowerCase() === selectedCategory.id.toLowerCase() : true) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm))
    );
  }, [allProducts, selectedCategory, searchTerm]);

  const addToCart = (product: any) => setCart([...cart, { ...product, cartId: Date.now() }]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f0f9ff]">
      <Loader2 className="animate-spin text-[#1e3a8a] mb-4" size={50} />
      <p className="font-bold text-[#1e3a8a] uppercase tracking-widest text-xs">NM MART RETAIL OS v5.0 Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      
      {/* 1. PREMIUM HEADER (Blue & Gold) */}
      <header className="w-full sticky top-0 z-50 bg-[#1e3a8a] text-white shadow-2xl shadow-blue-900/20">
        <div className="bg-[#b4941f] text-[#1e3a8a] py-1.5 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1"><MapPin size={10}/> Manjhanpur, Uttar Pradesh</span>
          <span>Powered by NM MART - RETAIL OS v5.0</span>
        </div>
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="bg-[#b4941f] p-2 rounded-xl shadow-lg"><ShoppingCart size={24} className="text-[#1e3a8a]"/></div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter leading-none text-[#facc15]">NM <span className="text-white">MART</span></h1>
              <p className="text-[9px] font-bold text-blue-200 tracking-widest uppercase">Shop More, Save More</p>
            </div>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#b4941f] text-[#1e3a8a] text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#1e3a8a]">{cart.length}</span>}
          </button>
        </div>
      </header>

      {/* 2. WELFARE MEMBERSHIP CARD (3D Section) */}
      <section className="py-12 px-6 bg-gradient-to-b from-[#1e3a8a] to-[#f8fafc]">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#b4941f] to-[#facc15] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border-4 border-white/30">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[#1e3a8a]">
              <h2 className="text-3xl font-black italic uppercase mb-4">NM Mart Welfare Card</h2>
              <ul className="space-y-2 text-sm font-bold opacity-90 uppercase tracking-tighter">
                <li className="flex items-center gap-2"><ShieldCheck size={18}/> Extra 5% Discount on all orders</li>
                <li className="flex items-center gap-2"><ShieldCheck size={18}/> 6-Month Loyalty Rewards</li>
                <li className="flex items-center gap-2"><ShieldCheck size={18}/> Priority Delivery & Support</li>
              </ul>
            </div>
            <div className="w-64 h-40 bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl p-6 flex flex-col justify-between shadow-inner transform group-hover:rotate-3 transition-transform">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-white/80 uppercase">NM MART Member</span>
                <div className="w-10 h-10 bg-white/30 rounded-full animate-pulse"></div>
              </div>
              <p className="text-white font-black text-xl tracking-[0.2em]">**** **** 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT DISPLAY (Categories & List) */}
      <main className="p-8 max-w-7xl mx-auto">
        {currentView === 'categories' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <CategoryCard title="Daily Essentials" id="FMCG" icon={<Package/>} count="4000+" onClick={(cat:any)=> {setSelectedCategory(cat); setCurrentView('products');}} />
            <CategoryCard title="Stationery" id="STATIONERY" icon={<Grid/>} count="1500+" onClick={(cat:any)=> {setSelectedCategory(cat); setCurrentView('products');}} />
            <CategoryCard title="Premium Textiles" id="DBSHEET" icon={<Home/>} count="Bed Sheets" onClick={(cat:any)=> {setSelectedCategory(cat); setCurrentView('products');}} />
            <CategoryCard title="Personal Care" id="PERSONAL CARE" icon={<Sparkles/>} count="1000+" onClick={(cat:any)=> {setSelectedCategory(cat); setCurrentView('products');}} />
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <button onClick={() => setCurrentView('categories')} className="w-fit px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-100 text-[#1e3a8a] font-bold text-xs uppercase">← Back</button>
              <div className="relative flex-1 max-w-md">
                <input type="text" placeholder="Search product or barcode..." className="w-full py-3 px-6 bg-white border-2 border-blue-50 rounded-full font-bold shadow-sm outline-none focus:border-[#b4941f]" onChange={(e) => setSearchTerm(e.target.value)} />
                <Search size={20} className="absolute right-5 top-3.5 text-blue-300" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.slice(0, 100).map(product => (
                <div key={product.id} className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm flex flex-col justify-between hover:border-[#b4941f] transition-all">
                  <div>
                    <div className={`text-[9px] font-black uppercase px-2 py-1 rounded-full w-fit mb-3 ${product.stockStatus === "In Stock" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{product.stockStatus}</div>
                    <h4 className="font-bold text-[#1e3a8a] text-md leading-tight mb-2">{product.name}</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-black text-[#1e3a8a]">₹{product.saleRate}</span>
                      <span className="text-xs text-slate-300 line-through">₹{product.mrp}</span>
                    </div>
                  </div>
                  <button onClick={() => addToCart(product)} className="w-full bg-[#1e3a8a] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#b4941f] transition-all flex items-center justify-center gap-2 shadow-lg">
                    <Plus size={18}/> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER & TRUST */}
      <footer className="bg-[#1e3a8a] text-white py-16 px-8 mt-20 border-t-8 border-[#b4941f]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h2 className="text-2xl font-black text-[#facc15] italic mb-4">NM MART</h2>
            <p className="text-sm text-blue-200 leading-relaxed mb-6">Manjhanpur's most trusted departmental store. Quality products at wholesale rates.</p>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-sm font-bold"><Mail size={16} className="text-[#facc15]"/> support@nmmart.in</p>
              <p className="flex items-center gap-3 text-sm font-bold"><Clock size={16} className="text-[#facc15]"/> Daily 9 AM - 9 PM</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-black uppercase tracking-widest text-[#facc15]">Legal Links</h3>
            <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors">About Us</a>
            <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors">Contact Us</a>
            <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors">Privacy Policy</a>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h3 className="font-black text-[#facc15] uppercase tracking-widest mb-4 italic">Happy Customers</h3>
            <div className="flex text-[#facc15] mb-2"><Star size={14}/><Star size={14}/><Star size={14}/><Star size={14}/><Star size={14}/></div>
            <p className="text-[11px] italic text-blue-100">"Best rates in Manjhanpur! NM Mart's delivery is very fast." - Local Shopper</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-[10px] font-bold tracking-widest text-blue-400">
          POWERED BY NM MART - RETAIL OS v5.0 | CUSTOM DOMAIN OPTIMIZED
        </div>
      </footer>

      {/* 5. WHATSAPP FLOATING BUTTON */}
      <a href="https://wa.me/917081154604" target="_blank" className="fixed bottom-6 right-6 bg-[#25d366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-[100] border-4 border-white">
        <Phone size={30} fill="white" className="rotate-90"/>
      </a>
    </div>
  );
}

// Category Card Helper
function CategoryCard({ title, icon, count, onClick }: any) {
  return (
    <div onClick={onClick} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center group border-b-4 border-b-blue-100">
      <div className="bg-blue-50 p-6 rounded-2xl text-[#1e3a8a] mb-4 group-hover:bg-[#b4941f] group-hover:text-white transition-all shadow-inner">{icon}</div>
      <h3 className="font-black text-[#1e3a8a] text-[11px] uppercase italic tracking-tighter leading-none">{title}</h3>
      <p className="text-[9px] font-black text-[#b4941f] mt-2 opacity-70">{count}</p>
    </div>
  );
}

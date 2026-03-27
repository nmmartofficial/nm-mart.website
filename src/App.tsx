import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, MapPin, X, Plus, Package, Grid, Sparkles, Home, Loader2 } from 'lucide-react';

// आपका Google Sheet CSV लिंक
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. गूगल शीट से डेटा खींचना (Fetching Data) ---
  useEffect(() => {
    fetch(SHEET_URL)
      .then(response => response.text())
      .then(csvText => {
        const rows = csvText.split('\n').slice(1); // पहली लाइन (Header) छोड़कर
        const data = rows.map((row, index) => {
          const cols = row.split(',');
          return {
            id: index.toString(),
            name: cols[0]?.trim() || "Unnamed Product", // कॉलम 1: नाम
            price: parseFloat(cols[1]) || 0,            // कॉलम 2: कीमत
            category: cols[2]?.trim().toLowerCase() || "fmcg", // कॉलम 3: केटेगरी
            stock: cols[3]?.trim() || "Available"       // कॉलम 4: स्टॉक
          };
        });
        setAllProducts(data);
        setLoading(false);
      })
      .catch(err => console.error("Sheet Error:", err));
  }, []);

  // --- 2. 7000+ आइटम्स में तेज़ सर्च ---
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => 
      (selectedCategory ? p.category === selectedCategory.id : true) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, selectedCategory, searchTerm]);

  const addToCart = (product: any) => setCart([...cart, { ...product, cartId: Date.now() }]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f0f9ff]">
      <Loader2 className="animate-spin text-[#0ea5e9] mb-4" size={40} />
      <p className="font-black text-[#0369a1] uppercase tracking-widest text-xs">NM MART - Loading 7000+ Items...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans pb-20">
      
      {/* Navbar */}
      <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b-2 border-sky-100 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <h1 onClick={() => {setCurrentView('categories'); setSelectedCategory(null);}} className="text-2xl font-black text-[#1e293b] italic uppercase cursor-pointer leading-none">
            NM <span className="text-[#0ea5e9]">MART</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-80">
              <input 
                type="text" 
                placeholder="Search in NM Mart Stock..." 
                className="w-full py-2.5 px-5 bg-sky-50 border border-sky-100 rounded-full text-sm font-bold outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="absolute right-4 top-2.5 text-sky-400" />
            </div>
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-[#f0f9ff] rounded-2xl text-[#0ea5e9] border border-sky-100">
              <ShoppingCart size={24} strokeWidth={2.5} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {currentView === 'categories' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard title="FMCG" id="fmcg" icon={<Package/>} count="4000+" onClick={(cat: any) => {setSelectedCategory(cat); setCurrentView('products');}} />
            <CategoryCard title="Stationery" id="stationery" icon={<Grid/>} count="1500+" onClick={(cat: any) => {setSelectedCategory(cat); setCurrentView('products');}} />
            <CategoryCard title="Personal Care" id="personal" icon={<Sparkles/>} count="1000+" onClick={(cat: any) => {setSelectedCategory(cat); setCurrentView('products');}} />
            <CategoryCard title="Cleaning" id="cleaning" icon={<Home/>} count="500+" onClick={(cat: any) => {setSelectedCategory(cat); setCurrentView('products');}} />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setCurrentView('categories')} className="p-2 bg-white rounded-xl shadow-sm border border-sky-100 text-sky-500">←</button>
              <h2 className="text-xl font-black text-[#1e293b] uppercase italic">{selectedCategory.name} Stock</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.slice(0, 100).map(product => (
                <div key={product.id} className="bg-white p-5 rounded-3xl border border-sky-50 flex justify-between items-center shadow-sm hover:border-sky-200 transition-all">
                  <div>
                    <h4 className="font-bold text-[#1e293b] text-sm">{product.name}</h4>
                    <p className="text-[#0ea5e9] font-black text-lg">₹{product.price}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.stock}</p>
                  </div>
                  <button onClick={() => addToCart(product)} className="bg-[#0ea5e9] text-white p-3 rounded-2xl shadow-lg hover:bg-[#0369a1] active:scale-95 transition-all">
                    <Plus size={20}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// चोटी की केटेगरी का कार्ड
function CategoryCard({ title, id, icon, count, onClick }: any) {
  return (
    <div onClick={() => onClick({id, name: title})} className="bg-white p-8 rounded-[2.5rem] border border-sky-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center group">
      <div className="bg-[#f0f9ff] p-5 rounded-2xl text-[#0ea5e9] mb-4 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">{icon}</div>
      <h3 className="font-black text-[#1e293b] text-sm uppercase italic">{title}</h3>
      <p className="text-[10px] font-bold text-sky-500 mt-2">{count} Items</p>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, Search, X, Plus, Minus, Loader2, Phone, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP = "917081154604";
const ITEMS_PER_PAGE = 50;

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  mrp: number;
  saleRate: number;
}

interface CartItem extends Product {
  qty: number;
}

// कोलम मैपिंग (A=0, B=1, C=2, D=3, E=4, F=5)
function parseCSV(text: string): Product[] {
  const lines = text.split('\n');
  const products: Product[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row.trim()) continue;
    
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of row) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += char;
    }
    cols.push(current.trim());

    if (!cols[0]) continue; // अगर नाम खाली है तो छोड़ दो

    products.push({
      id: `item-${i}`,
      name: cols[0],       // A: Item Name
      barcode: cols[1],    // B: Barcode
      category: cols[2],   // C: Main Category
      mrp: parseFloat(cols[4]?.replace(/[^0-9.]/g, '')) || 0,   // E: Mrp
      saleRate: parseFloat(cols[5]?.replace(/[^0-9.]/g, '')) || 0 // F: Sale Rate
    });
  }
  return products;
}

export default function App() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.text())
      .then(csv => {
        setAllProducts(parseCSV(csv));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(allProducts.map(p => p.category).filter(Boolean))], [allProducts]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allProducts.filter(p =>
      (selectedCategory ? p.category === selectedCategory : true) &&
      (term ? (p.name.toLowerCase().includes(term) || p.barcode.includes(searchTerm)) : selectedCategory ? true : false)
    );
  }, [allProducts, selectedCategory, searchTerm]);

  const paginatedProducts = useMemo(() => filtered.slice(0, page * ITEMS_PER_PAGE), [filtered, page]);
  const hasMore = paginatedProducts.length < filtered.length;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const totalBill = cart.reduce((s, i) => s + (i.saleRate || i.mrp) * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-blue-900">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black italic uppercase tracking-widest text-sm">NM MART Loading Store...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 shadow-xl border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter leading-none"><span className="text-amber-400">NM</span> MART</h1>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-70">Manjhanpur, UP</p>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-blue-950 px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-lg">
            <ShoppingCart size={18}/> <span>₹{totalBill}</span>
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="p-4 max-w-2xl mx-auto -mt-6 relative z-10">
        <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-white">
          <input 
            type="text" placeholder="Search Maggi, Soap, Rice..." 
            className="w-full p-5 pl-14 border-none outline-none font-bold text-slate-800"
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
          />
          <Search className="absolute left-5 top-5 text-slate-400" size={20}/>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!selectedCategory && !searchTerm ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center hover:border-amber-400 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">📦</div>
                <span className="font-black text-xs uppercase text-slate-700 tracking-tight">{cat}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => {setSelectedCategory(null); setSearchTerm('');}} className="bg-white px-4 py-2 rounded-full shadow-sm text-xs font-black text-blue-900 flex items-center gap-2">
                <ArrowLeft size={16}/> BACK
              </button>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filtered.length} Items</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedProducts.map(p => {
                const effectiveRate = p.saleRate > 0 ? p.saleRate : p.mrp;
                const discount = p.mrp > effectiveRate ? Math.round(((p.mrp - effectiveRate)/p.mrp)*100) : 0;
                const inCart = cart.find(i => i.id === p.id);
                
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col group hover:shadow-lg transition-all">
                    <div className="h-32 bg-slate-50 rounded-xl mb-3 flex items-center justify-center relative p-2 overflow-hidden">
                      {discount > 0 && <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10">SAVE {discount}%</span>}
                      <img 
                        src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} 
                        alt={p.name}
                        className="max-h-full object-contain"
                        onError={(e: any) => {
                          e.currentTarget.src = `https://loremflickr.com/300/300/${encodeURIComponent(p.name + " grocery")}`;
                        }}
                      />
                    </div>
                    <h3 className="text-[10px] font-black uppercase text-slate-800 h-8 overflow-hidden mb-2 leading-tight">{p.name}</h3>
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-blue-950 font-black text-lg">₹{effectiveRate}</span>
                        {p.mrp > effectiveRate && <span className="text-[10px] text-slate-400 line-through font-bold">₹{p.mrp}</span>}
                      </div>
                      {inCart ? (
                        <div className="flex items-center justify-between mt-3 bg-blue-50 rounded-xl p-1">
                          <button onClick={() => updateQty(p.id, -1)} className="bg-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm text-blue-900"><Minus size={14}/></button>
                          <span className="text-sm font-black text-blue-900">{inCart.qty}</span>
                          <button onClick={() => updateQty(p.id, 1)} className="bg-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm text-blue-900"><Plus size={14}/></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p)} className="w-full mt-3 bg-blue-950 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-colors">Add to Cart</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {hasMore && <button onClick={() => setPage(p => p + 1)} className="w-full mt-12 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-400 text-xs tracking-[0.2em] hover:border-amber-400 transition-all uppercase">Load More Items</button>}
          </div>

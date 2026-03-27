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

function parseCSV(text: string): Product[] {
  const lines = text.split('\n');
  const products: Product[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || !row.trim()) continue;
    
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of row) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += char;
    }
    cols.push(current.trim());

    if (!cols[0]) continue; 

    // कॉलम मैपिंग: A=0(Name), B=1(Barcode), C=2(Cat), E=4(MRP), F=5(Sale)
    const mrpVal = parseFloat(cols[4]?.replace(/[^0-9.]/g, '')) || 0;
    const saleVal = parseFloat(cols[5]?.replace(/[^0-9.]/g, '')) || 0;

    products.push({
      id: `item-${i}`,
      name: cols[0],
      barcode: cols[1] || '',
      category: cols[2] || 'General',
      mrp: mrpVal,
      saleRate: saleVal > 0 ? saleVal : mrpVal
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
      .catch((err) => {
        console.error("Sheet Load Error:", err);
        setLoading(false);
      });
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

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-900 mb-4" size={40} />
      <p className="font-bold text-blue-900">NM MART: Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 shadow-xl border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter"><span className="text-amber-400">NM</span> MART</h1>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-70">Manjhanpur Store</p>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-blue-950 px-4 py-2 rounded-xl font-black flex items-center gap-2">
            <ShoppingCart size={18}/> <span>₹{totalBill}</span>
          </button>
        </div>
      </header>

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

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {!selectedCategory && !searchTerm ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center hover:border-amber-400 transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl mb-2">📦</div>
                <span className="font-black text-[10px] uppercase text-slate-700">{cat}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => {setSelectedCategory(null); setSearchTerm('');}} className="mb-6 bg-white px-4 py-2 rounded-full shadow-sm text-xs font-black text-blue-900 flex items-center gap-2 border border-slate-200">
              <ArrowLeft size={14}/> ALL CATEGORIES
            </button>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedProducts.map(p => {
                const discount = p.mrp > p.saleRate ? Math.round(((p.mrp - p.saleRate)/p.mrp)*100) : 0;
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col">
                    <div className="h-28 bg-slate-50 rounded-xl mb-2 flex items-center justify-center relative overflow-hidden">
                      {discount > 0 && <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">-{discount}%</span>}
                      
                      <img 
                        // तरीका 1: बारकोड से फोटो
                        src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} 
                        alt={p.name}
                        className="max-h-full object-contain p-2"
                        onError={(e: any) => {
                          // तरीका 2: अगर बारकोड फेल हुआ, तो नाम से फोटो उठाएगा
                          e.currentTarget.onerror = null; 
                          e.currentTarget.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name + " grocery product")}`;
                        }}
                      />
                    </div>
                    
                    <h3 className="text-[10px] font-black uppercase text-slate-800 h-8 overflow-hidden mb-1 leading-tight">{p.name}</h3>
                    
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1">
                        <span className="text-blue-950 font-black text-sm">₹{p.saleRate}</span>
                        {p.mrp > p.saleRate && <span className="text-[9px] text-slate-300 line-through font-bold">₹{p.mrp}</span>}
                      </div>
                      
                      {inCart ? (
                        <div className="flex items-center justify-between mt-2 bg-blue-50 rounded-lg p-1">
                          <button onClick={() => updateQty(p.id, -1)} className="bg-white w-6 h-6 rounded flex items-center justify-center text-blue-900"><Minus size={12}/></button>
                          <span className="text-xs font-black text-blue-900">{inCart.qty}</span>
                          <button onClick={() => updateQty(p.id, 1)} className="bg-white w-6 h-6 rounded flex items-center justify-center text-blue-900"><Plus size={12}/></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p)} className="w-full mt-2 bg-blue-950 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Add</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {hasMore && <button onClick={() => setPage(p => p + 1)} className="w-full mt-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-400 text-xs">LOAD MORE</button>}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-blue-950 z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col">
              <div className="p-4 bg-blue-950 text-white flex justify-between items-center">
                <span className="font-black italic">My Cart ({totalItems})</span>
                <button onClick={() => setIsCartOpen(false)}><X/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase truncate">{item.name}</p>
                      <p className="text-blue-900 font-black text-xs">₹{item.saleRate} x {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 bg-white rounded shadow-sm"><Minus size={14}/></button>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 bg-white rounded shadow-sm"><Plus size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <div className="flex justify-between font-black mb-4 text-blue-950"><span>Total:</span><span>₹{totalBill}</span></div>
                <button onClick={() => {
                  const msg = cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate * i.qty}`).join('\n');
                  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("*NM MART ORDER*\n\n" + msg + "\n\n*Total: ₹" + totalBill + "*")}`);
                }} className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2">
                  <Send size={16}/> Send on WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl z-40 border-4 border-white">
        <Phone size={24} fill="white"/>
      </a>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, Loader2, Phone, Send, ArrowLeft, 
  MapPin, Clock, Star, Info, Share2, Smartphone, Banknote, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- NM MART CONFIG ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys";
const STORE_ADDRESS = "Near B.P. Public School, Manjhanpur, Kaushambi, UP";
const ITEMS_PER_PAGE = 50;

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [payMethod, setPayMethod] = useState<'COD' | 'UPI' | null>(null);

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

  // 1. DEALS Logic (50% OFF)
  const dealProducts = useMemo(() => 
    allProducts.filter(p => p.mrp > 0 && ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50),
  [allProducts]);

  const categories = useMemo(() => 
    ['🔥 50% DEALS', ...new Set(allProducts.map(p => p.category).filter(Boolean))], 
  [allProducts]);

  // 2. Search & Category Logic
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (selectedCategory === '🔥 50% DEALS') return dealProducts.filter(p => p.name.toLowerCase().includes(term));
    return allProducts.filter(p =>
      (selectedCategory ? p.category === selectedCategory : true) &&
      (term ? (p.name.toLowerCase().includes(term) || p.barcode.includes(searchTerm)) : selectedCategory ? true : false)
    );
  }, [allProducts, selectedCategory, searchTerm, dealProducts]);

  const paginatedProducts = useMemo(() => filtered.slice(0, page * ITEMS_PER_PAGE), [filtered, page]);

  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=NMMART&am=${totalBill}&cu=INR`;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-900 mb-4" size={40} />
      <p className="font-black italic text-blue-900 uppercase">NM MART: Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 🚀 HEADER */}
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 shadow-xl border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">NM MART</h1>
            <p className="text-[7px] font-bold uppercase text-amber-400 tracking-widest">Manjhanpur Pro Store</p>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="bg-white text-blue-950 px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-lg">
            <ShoppingCart size={18}/> <span>₹{totalBill}</span>
          </button>
        </div>
      </header>

      {/* 🔍 SEARCH */}
      <div className="p-4 max-w-2xl mx-auto -mt-6 relative z-10">
        <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-white border-2 border-slate-50">
          <input 
            type="text" placeholder="Search Maggi, Soap, Rice..." 
            className="w-full p-5 pl-14 outline-none font-bold text-slate-800"
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
          />
          <Search className="absolute left-5 top-5 text-slate-400" size={20}/>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* 📑 CATEGORIES (FRONT PAGE VIEW) */}
        {!selectedCategory && !searchTerm ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-50 flex flex-col items-center active:scale-95 transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl mb-2">
                  {cat.includes('DEALS') ? '🔥' : '📦'}
                </div>
                <span className="font-black text-[9px] uppercase text-slate-700 tracking-tight text-center">{cat}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => {setSelectedCategory(null); setSearchTerm('');}} className="mb-6 bg-blue-950 text-white px-4 py-2 rounded-full shadow-lg text-[10px] font-black flex items-center gap-2 border-2 border-amber-400">
              <ArrowLeft size={14}/> BACK TO STORE
            </button>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedProducts.map((p, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-50 p-4 flex flex-col relative">
                  {p.mrp > p.saleRate && <span className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full z-10 italic animate-pulse">OFF</span>}
                  
                  <div className="h-28 bg-slate-50 rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} alt={p.name} className="max-h-full object-contain p-2" onError={(e: any) => { e.currentTarget.src = "https://placehold.co/150x150?text=NM+MART"; }} />
                  </div>
                  
                  <h3 className="text-[10px] font-black uppercase text-slate-800 h-8 overflow-hidden mb-1 leading-tight">{p.name}</h3>
                  
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-blue-950 font-black text-sm italic">₹{p.saleRate}</span>
                      {p.mrp > p.saleRate && <span className="text-[8px] text-slate-300 line-through font-bold">₹{p.mrp}</span>}
                    </div>
                    <button onClick={() => setCart(prev => [...prev, {...p, qty: 1}])} className="w-full bg-blue-950 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Add to Bag</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🏠 STORE FOOTER (VAAPAS AA GAYA) */}
        <div className="mt-16 bg-blue-50 p-10 rounded-[3rem] border-2 border-blue-100 text-center space-y-6">
            <h2 className="text-blue-950 font-black italic text-xl uppercase underline decoration-amber-400 underline-offset-8 decoration-4">NM MART - मंझनपुर</h2>
            <div className="grid md:grid-cols-3 gap-6 text-slate-600 font-bold text-[10px] uppercase tracking-wide">
                <div className="flex flex-col items-center gap-2"><MapPin className="text-blue-900" size={20}/> <span>{STORE_ADDRESS}</span></div>
                <div className="flex flex-col items-center gap-2"><Phone className="text-blue-900" size={20}/> <span>Call: +91 7081154604</span></div>
                <div className="flex flex-col items-center gap-2"><Clock className="text-blue-900" size={20}/> <span>Mon-Sun: 9 AM - 9 PM</span></div>
            </div>
            <div className="pt-4 flex justify-center gap-4">
              <button onClick={() => window.open('https://maps.google.com', '_blank')} className="bg-white text-blue-950 px-8 py-3 rounded-full font-black text-[9px] uppercase border-2 border-blue-100 shadow-md">Get Directions</button>
              <button className="bg-blue-950 text-white px-8 py-3 rounded-full font-black text-[9px] uppercase shadow-xl flex items-center gap-2"> <Star size={14} fill="amber"/> 5.0 Google Reviews </button>
            </div>
        </div>
      </main>

      {/* 🛒 CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col border-l-8 border-blue-950">
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs italic tracking-widest">
                <span>Your NM Bag ({cart.length})</span>
                <X size={28} className="cursor-pointer bg-white/10 p-1 rounded-full" onClick={() => setIsCartOpen(false)}/>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-700 truncate w-32">{item.name}</span><span className="text-[8px] font-bold text-blue-900">₹{item.saleRate}</span></div>
                    <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="bg-red-50 text-red-600 p-2 rounded-full"><Minus size={14}/></button>
                  </div>
                ))}

                {totalBill >= 500 && (
                  <div className="mt-8 p-6 bg-white rounded-[2.5rem] border-2 border-blue-50 shadow-lg">
                      <p className="text-center font-black text-[10px] text-blue-950 uppercase italic mb-5 underline decoration-amber-400">Payment Mode</p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                          <button onClick={() => setPayMethod('COD')} className={`p-5 rounded-3xl border-2 font-black text-[9px] uppercase ${payMethod === 'COD' ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-50 text-blue-950 border-slate-100'}`}>CASH</button>
                          <button onClick={() => setPayMethod('UPI')} className={`p-5 rounded-3xl border-2 font-black text-[9px] uppercase ${payMethod === 'UPI' ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-50 text-blue-950 border-slate-100'}`}>ONLINE</button>
                      </div>
                      {payMethod === 'UPI' && (
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-3xl animate-pulse">
                           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`} className="w-40 mb-4 rounded-xl shadow-lg"/>
                           <a href={upiLink} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-center text-[10px]">OPEN GPAY / PHONEPE</a>
                        </div>
                      )}
                  </div>
                )}
            </div>
            <div className="p-8 border-t bg-white">
              <div className="flex justify-between font-black mb-8 text-blue-950 text-xl italic underline decoration-amber-400 decoration-4"><span>TOTAL:</span><span>₹{totalBill}</span></div>
              <button onClick={() => {
                const msg = cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate}`).join('\n');
                window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("*NM MART ORDER*\n\n" + msg + "\n\n*Total: ₹" + totalBill + "*")}`);
              }} className="w-full bg-blue-950 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-2xl">
                <Send size={18} className="text-amber-400"/> {payMethod ? 'Confirm Order Now' : 'Send to WhatsApp'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl z-40 border-4 border-white animate-bounce">
        <Phone size={24} fill="white"/>
      </a>
    </div>
  );
}

// 🛡️ Error-Proof CSV Parser
function parseCSV(text: string) {
  const lines = text.split('\n');
  const products: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || !row.trim()) continue;
    const cols = row.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (!cols[0]) continue;
    const mrpVal = parseFloat(cols[4]) || 0;
    const saleVal = parseFloat(cols[5]) || 0;
    products.push({ id: `item-${i}`, name: cols[0], barcode: cols[1] || '', category: cols[2] || 'General', mrp: mrpVal, saleRate: saleVal > 0 ? saleVal : mrpVal });
  }
  return products;
}

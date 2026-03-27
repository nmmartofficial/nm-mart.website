import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, Loader2, Phone, Send, ArrowLeft, 
  MapPin, Clock, Star, Info, Share2, Smartphone, Banknote, CheckCircle2, Mic, History, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🛠️ NM MART CONFIG (SAB KUCH EK SAATH) ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys";
const MIN_ORDER = 500;
const STORE_NAME = "NM MART - मंझनपुर";

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [payMethod, setPayMethod] = useState<'COD' | 'UPI' | null>(null);
  const [orderStatus, setOrderStatus] = useState('Pending');

  // 1. डेटा लोड करना
  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => {
      const lines = csv.split('\n').slice(1);
      const parsed = lines.map((line, i) => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (!cols[0]) return null;
        return { id: `item-${i}`, name: cols[0], barcode: cols[1], category: cols[2], mrp: parseFloat(cols[4]) || 0, saleRate: parseFloat(cols[5]) || 0 };
      }).filter(Boolean);
      setAllProducts(parsed);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // 2. 50% Deals & Category Logic
  const dealProducts = useMemo(() => 
    allProducts.filter(p => p.mrp > 0 && ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50), [allProducts]
  );

  const categories = useMemo(() => [...new Set(allProducts.map(p => p.category).filter(Boolean))], [allProducts]);

  const displayedProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (selectedCategory) return allProducts.filter(p => p.category === selectedCategory && p.name.toLowerCase().includes(term));
    if (searchTerm) return allProducts.filter(p => p.name.toLowerCase().includes(term));
    return dealProducts; // Default: Only 50% Deals
  }, [allProducts, selectedCategory, searchTerm, dealProducts]);

  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=NMMART&am=${totalBill}&cu=INR`;

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 animate-pulse uppercase italic">NM MART: Loading Store...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      
      {/* 🚀 HEADER */}
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400 shadow-2xl">
        <div onClick={() => {setSelectedCategory(null); setSearchTerm(''); setActiveTab('home');}} className="cursor-pointer">
          <h1 className="text-xl font-black italic leading-none tracking-tighter">NM MART</h1>
          <p className="text-[7px] font-bold text-amber-400 uppercase tracking-widest">Manjhanpur Pro Store</p>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="bg-white text-blue-950 px-4 py-2 rounded-2xl font-black flex items-center gap-2 shadow-lg scale-90 active:scale-100 transition-all">
          <ShoppingCart size={18}/> <span>₹{totalBill}</span>
        </button>
      </header>

      {/* ⏱️ FLASH SALE TIMER */}
      {!selectedCategory && !searchTerm && (
        <div className="bg-red-600 text-white py-1.5 px-4 text-[9px] font-black uppercase text-center flex justify-center items-center gap-2">
           <Clock size={12} className="animate-spin-slow"/> Flash Sale Ends In: 02:45:10
        </div>
      )}

      <main className="p-4 max-w-xl mx-auto">
        {activeTab === 'home' && (
          <>
            {/* 🔍 SEARCH + VOICE */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1 bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
                <input type="text" placeholder="Search Maggi, Soap, Deals..." className="w-full p-4 pl-12 font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
              </div>
              <button className="bg-blue-950 text-white p-4 rounded-2xl shadow-xl active:bg-amber-400 transition-colors"><Mic size={22}/></button>
            </div>

            {/* 📑 CATEGORIES (SMOOTH SCROLL) */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
              <button onClick={() => {setSelectedCategory(null); setSearchTerm('');}} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap shadow-md ${!selectedCategory ? 'bg-red-600 text-white ring-2 ring-amber-400 animate-pulse' : 'bg-white text-slate-400'}`}>🔥 50% DEALS</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => {setSelectedCategory(cat); setSearchTerm('');}} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap shadow-md ${selectedCategory === cat ? 'bg-blue-950 text-white ring-2 ring-amber-400' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
              ))}
            </div>

            {/* 📦 PRODUCTS GRID */}
            <div className="grid grid-cols-2 gap-4">
              {displayedProducts.map((p, idx) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={p.id} className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center relative group">
                  {p.mrp > p.saleRate && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-0.5 text-[7px] font-black uppercase rounded-full tracking-tighter shadow-lg animate-bounce">ADHAA DAAM</div>
                  )}
                  <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain mb-2 group-hover:scale-110 transition-transform" onError={(e: any) => e.target.src = "https://placehold.co/100x100?text=NM+MART"}/>
                  <h3 className="text-[9px] font-black uppercase text-center h-8 leading-tight text-slate-700">{p.name}</h3>
                  <div className="flex items-center gap-1 my-1">
                    <span className="font-black text-blue-950 text-lg">₹{p.saleRate}</span>
                    <span className="text-[8px] text-slate-300 line-through font-bold">₹{p.mrp}</span>
                  </div>
                  <div className="flex gap-1 w-full mt-2">
                    <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="flex-1 bg-blue-950 text-white py-2.5 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all">Add to Bag</button>
                    <button onClick={() => window.open(`https://wa.me/?text=Check this deal at NM MART: ${p.name} only at ₹${p.saleRate}`)} className="bg-green-50 text-green-600 p-2.5 rounded-xl border border-green-100"><Share2 size={14}/></button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 🏛️ STORE FOOTER */}
            <footer className="mt-16 bg-blue-50 p-10 rounded-[3.5rem] border-2 border-blue-100 text-center space-y-4">
               <h2 className="text-blue-950 font-black italic text-lg uppercase underline decoration-amber-400 decoration-4 underline-offset-8">{STORE_NAME}</h2>
               <div className="space-y-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <p className="flex items-center justify-center gap-2"><MapPin size={14} className="text-blue-900"/> Near B.P. Public School, Manjhanpur</p>
                  <p className="flex items-center justify-center gap-2"><Phone size={14} className="text-blue-900"/> +91 7081154604</p>
                  <p className="flex items-center justify-center gap-2 text-green-600"><Star size={12} fill="currentColor"/> 5.0 Google Rated Store</p>
               </div>
               <button onClick={() => window.open('https://maps.google.com')} className="mt-4 bg-white text-blue-950 px-8 py-3 rounded-full font-black text-[10px] uppercase shadow-md border border-blue-100 active:scale-95 transition-all">View On Maps</button>
            </footer>
          </>
        )}

        {/* 📜 ORDER HISTORY VIEW */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase text-amber-400 mb-1">NM Loyalty Rewards</p>
                   <h2 className="text-4xl font-black italic">₹120 <span className="text-xs font-bold text-slate-300 not-italic uppercase">Points</span></h2>
                </div>
                <div className="absolute -right-10 -bottom-10 bg-amber-400 w-40 h-40 rounded-full blur-[80px] opacity-20"></div>
            </div>
            <h3 className="font-black italic uppercase text-blue-950 text-xs px-2">Past Orders & Tracking</h3>
            {[1024, 1021].map(id => (
              <div key={id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border-2 border-slate-50 relative group overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-400 text-blue-950 px-4 py-1.5 rounded-bl-[1.5rem] text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                   <Truck size={10}/> Packed
                </div>
                <p className="text-[10px] font-black text-blue-950 mb-4 italic">ORDER #NM-{id}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 relative overflow-hidden">
                   <div className="absolute h-full w-2/3 bg-blue-950 rounded-full animate-pulse"></div>
                </div>
                <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-50 text-blue-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100 flex items-center justify-center gap-2 active:bg-blue-950 active:text-white transition-all">
                  <RefreshCw size={14}/> One-Click Reorder
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🧭 BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-around shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[3rem] z-[60]">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-blue-950' : 'text-slate-300'}><ShoppingBag size={28}/></button>
        <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'text-blue-950' : 'text-slate-300'}><History size={28}/></button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-blue-950' : 'text-slate-300'}><User size={28}/></button>
      </nav>

      {/* 🛍️ CART DRAWER (WITH UPI & UPSYLLING) */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col border-l-8 border-blue-950">
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs italic tracking-widest">
                <span>Your NM Bag ({cart.length})</span>
                <X size={28} className="cursor-pointer bg-white/10 p-1 rounded-full" onClick={() => setIsCartOpen(false)}/>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                {/* UPSELLING PROGRESS BAR */}
                {totalBill < MIN_ORDER && (
                  <div className="p-5 bg-white rounded-3xl border-2 border-amber-100 shadow-sm animate-in zoom-in-95 duration-500">
                    <p className="text-[9px] font-black uppercase text-amber-600 mb-2 italic">Add ₹{MIN_ORDER - totalBill} more for Home Delivery!</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-amber-400 h-full transition-all duration-700" style={{ width: `${(totalBill/MIN_ORDER)*100}%` }}></div>
                    </div>
                  </div>
                )}

                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-700 truncate w-32">{item.name}</span><span className="text-[10px] font-black text-blue-950 italic">₹{item.saleRate}</span></div>
                    <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="bg-red-50 text-red-600 p-2.5 rounded-full"><Minus size={14}/></button>
                  </div>
                ))}

                {totalBill >= MIN_ORDER && (
                  <div className="mt-8 p-6 bg-white rounded-[2.5rem] border-2 border-blue-50 shadow-xl space-y-4">
                      <p className="text-center font-black text-[10px] text-blue-950 uppercase italic underline decoration-amber-400 decoration-4">Choose Payment Mode</p>
                      <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setPayMethod('COD')} className={`p-5 rounded-3xl border-2 font-black text-[10px] uppercase shadow-sm ${payMethod === 'COD' ? 'bg-blue-950 text-white border-blue-950 scale-105' : 'bg-slate-50 text-blue-950 border-slate-100'}`}><Banknote size={16} className="mx-auto mb-1"/> CASH</button>
                          <button onClick={() => setPayMethod('UPI')} className={`p-5 rounded-3xl border-2 font-black text-[10px] uppercase shadow-sm ${payMethod === 'UPI' ? 'bg-blue-950 text-white border-blue-950 scale-105' : 'bg-slate-50 text-blue-950 border-slate-100'}`}><Smartphone size={16} className="mx-auto mb-1"/> UPI</button>
                      </div>
                      {payMethod === 'UPI' && (
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-blue-100 animate-in slide-in-from-bottom-4 duration-500">
                           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`} className="w-32 mb-4 rounded-xl shadow-2xl p-2 bg-white"/>
                           <a href={upiLink} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-center text-[10px] shadow-lg flex items-center justify-center gap-2"><Smartphone size={14}/> OPEN GPAY / PHONEPE</a>
                        </div>
                      )}
                  </div>
                )}
            </div>
            
            <div className="p-8 border-t bg-white rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between font-black mb-8 text-blue-950 text-xl italic underline decoration-amber-400 decoration-4 underline-offset-4"><span>TOTAL BILL:</span><span>₹{totalBill}</span></div>
              <button onClick={() => {
                const msg = cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate}`).join('\n');
                window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("*NM MART ORDER - मंझनपुर*\n\n" + msg + "\n\n*Total: ₹" + totalBill + "*\n*Method: " + payMethod + "*")}`);
              }} className="w-full bg-blue-950 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-2xl active:bg-amber-400 active:text-blue-950 transition-all">
                <Send size={18}/> {payMethod ? 'Confirm Order Now' : 'Send to WhatsApp'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ShoppingBag = ({ size, className }: any) => <ShoppingBagIcon size={size} className={className}/>;
import { ShoppingBag as ShoppingBagIcon, Truck } from 'lucide-react';

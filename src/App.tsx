import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, User, LogOut, RefreshCw, 
  Flame, Banknote, Smartphone, CheckCircle2, Truck, ExternalLink, Mic, Clock, MapPin, FileText, Share2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- NM MART CONFIG ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; 
const MIN_ORDER_VALUE = 500;

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('DEALS'); // 50% Deals First
  const [payMethod, setPayMethod] = useState<'COD' | 'UPI' | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('NM_MART_LOGGED_IN') === 'true');
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('NM_MART_USER_DATA');
    return saved ? JSON.parse(saved) : { name: '', phone: '', homeAddr: '', officeAddr: '' };
  });

  const [cart, setCart] = useState<any[]>([]);
  const [foundOrders, setFoundOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { setAllProducts(parseCSV(csv)); setLoading(false); }).catch(() => setLoading(false));
    if(isLoggedIn && customer.phone) {
        const allOrders = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
        setFoundOrders(allOrders.filter((o: any) => o.phone === customer.phone));
    }
  }, [isLoggedIn, customer.phone, activeTab]);

  const categories = ['DEALS', ...new Set(allProducts.map(p => p.category))];
  const dealProducts = allProducts.filter(p => p.mrp > 0 && ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50);
  const totalBill = cart.reduce((s, i) => s + i.saleRate * (i.qty || 0), 0);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=NMMART&am=${totalBill}&cu=INR`;

  const handleOrderProcess = () => {
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const orderData = { 
        id: orderID, date: new Date().toLocaleString('en-IN'), ...customer, 
        items: itemsSummary, total: totalBill, method: payMethod, status: 'Packed' // Professional Status
    };
    
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));
    
    // WhatsApp Report (Auto-Bill Style)
    const waMsg = `*NM MART - NEW ORDER*\n--------------------\nID: ${orderID}\nCustomer: ${customer.name}\nTotal: ₹${totalBill}\nStatus: ${orderData.status}\nItems: ${itemsSummary}\nAddress: ${customer.homeAddr}\n--------------------\nNM MART Manjhanpur`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
    setCart([]); setIsCartOpen(false); setActiveTab('history');
  };

  const shareProduct = (p: any) => {
    const msg = `Dekho NM MART par ye deal! \n${p.name} sirf ₹${p.saleRate} mein! \nAbhi order karein: [Site Link Here]`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-950 uppercase italic tracking-widest p-10 text-center bg-white shadow-inner">NM MART... <br/>Sabse Sasta Sabse Achha</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      
      {/* 🚀 BRAND HEADER */}
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400 shadow-2xl">
        <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none">NM MART</h1>
            <span className="text-[7px] font-bold text-amber-400 uppercase tracking-widest">Manjhanpur Pro Store</span>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative bg-white text-blue-950 p-2.5 rounded-2xl shadow-lg active:scale-90 transition-all">
              <ShoppingCart size={20}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white animate-bounce">{cart.length}</span>}
            </button>
        </div>
      </header>

      {/* ⏱️ FLASH SALE BAR (Only on Home/Deals) */}
      {selectedCategory === 'DEALS' && (
        <div className="bg-red-600 text-white py-1.5 px-4 flex justify-between items-center text-[9px] font-black uppercase italic tracking-wider">
           <span className="flex items-center gap-1 animate-pulse"><Clock size={12}/> Flash Sale Live!</span>
           <span>Ending In: 01:29:59</span>
        </div>
      )}

      <main className="p-4 max-w-xl mx-auto mt-2">
        {activeTab === 'shop' && (
          <>
            {/* 🔍 SEARCH & VOICE */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <input type="text" placeholder="Maggi, Soap, Rice..." className="w-full p-4 pl-12 rounded-[1.5rem] border-2 border-slate-100 font-bold outline-none shadow-sm focus:border-blue-950 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                    <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
                </div>
                <button onClick={() => alert("Voice Search Active (NM Mart)")} className="bg-blue-950 text-white p-4 rounded-2xl shadow-xl active:scale-95"><Mic size={22}/></button>
            </div>

            {/* 📑 CATEGORY TABS (DEALS FRONT PAR) */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-md whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-950 text-white scale-105 ring-2 ring-amber-400' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      {cat === 'DEALS' ? '🔥 50% Dhamaka' : cat}
                    </button>
                ))}
            </div>

            {/* 📦 PRODUCT DISPLAY */}
            <div className="grid grid-cols-2 gap-4">
                {(selectedCategory === 'DEALS' ? dealProducts : allProducts.filter(p => p.category === selectedCategory))
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                    <div key={p.id} className={`bg-white p-4 rounded-[2.5rem] border-2 shadow-sm flex flex-col items-center relative transition-transform hover:scale-[1.02] ${selectedCategory === 'DEALS' ? 'border-red-50' : 'border-slate-50'}`}>
                        {selectedCategory === 'DEALS' && <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-0.5 text-[7px] font-black uppercase rounded-full">50% OFF</div>}
                        
                        <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-24 object-contain mb-3" onError={(e: any) => e.target.src = "https://placehold.co/150x150?text=NM+MART"}/>
                        
                        <div className="flex gap-1 mb-1"> {[1,2,3,4,5].map(s => <Star key={s} size={8} className="fill-amber-400 text-amber-400"/>)} </div>
                        
                        <h3 className="text-[10px] font-black uppercase text-center h-8 leading-tight text-slate-700">{p.name}</h3>
                        <p className="font-black text-blue-950 text-lg mt-1 italic">₹{p.saleRate} {p.mrp > p.saleRate && <span className="text-[9px] text-slate-400 line-through ml-1">₹{p.mrp}</span>}</p>
                        
                        <div className="flex w-full gap-2 mt-3">
                            <button onClick={() => {if(!isLoggedIn){setActiveTab('login'); return;} setCart([...cart, {...p, qty: 1}])}} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all ${selectedCategory === 'DEALS' ? 'bg-red-600 text-white italic' : 'bg-blue-950 text-white'}`}>ADD</button>
                            <button onClick={() => shareProduct(p)} className="bg-slate-100 p-3 rounded-2xl text-slate-400"><Share2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
          </>
        )}

        {/* 🔐 LOGIN TAB */}
        {activeTab === 'login' && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-blue-950 mt-10">
                <h2 className="text-center font-black italic text-blue-950 mb-6 uppercase tracking-widest text-lg underline decoration-amber-400 underline-offset-8">Welcome to NM MART</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Your Full Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-blue-950" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-blue-950" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                        <label className="text-[8px] font-black uppercase text-blue-900 block mb-2 flex items-center gap-1"><MapPin size={10}/> Primary Address (Home)</label>
                        <textarea placeholder="Poora Pata Manjhanpur" className="w-full bg-transparent font-bold text-xs outline-none" value={customer.homeAddr} onChange={e => setCustomer({...customer, homeAddr: e.target.value})}/>
                    </div>
                    <button onClick={() => {localStorage.setItem('NM_MART_LOGGED_IN', 'true'); localStorage.setItem('NM_MART_USER_DATA', JSON.stringify(customer)); setIsLoggedIn(true); setActiveTab('shop');}} className="w-full bg-blue-950 text-white py-5 rounded-3xl font-black uppercase shadow-2xl tracking-widest text-xs active:scale-95 transition-all">Start Shopping</button>
                </div>
            </div>
        )}

        {/* 📜 HISTORY & STATUS TAB */}
        {activeTab === 'history' && (
            <div className="space-y-6 pb-20">
                <div className="bg-gradient-to-r from-blue-950 to-blue-800 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-amber-400 italic mb-1">Loyalty Rewards</p>
                    <h2 className="text-2xl font-black italic tracking-tighter">₹{foundOrders.length * 10} Wallet Balance</h2>
                    <p className="text-[8px] mt-2 opacity-70 uppercase tracking-widest">Next Discount at 5 Orders</p>
                    <div className="absolute -right-4 -bottom-4 bg-amber-400 w-24 h-24 rounded-full blur-3xl opacity-20"></div>
                </div>

                <h2 className="text-sm font-black text-blue-950 uppercase italic flex items-center gap-2 mb-4"> <History size={20}/> Recent Orders & Status</h2>
                {foundOrders.length > 0 ? foundOrders.map(o => (
                    <div key={o.id} className="bg-white p-5 rounded-[2rem] shadow-md border-2 border-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-100 text-blue-950 px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase flex items-center gap-2">
                             <Truck size={10} className="animate-bounce"/> {o.status}
                        </div>
                        <div className="flex justify-between items-start mb-3 border-b-2 border-dashed border-slate-50 pb-4 mt-2">
                            <div><p className="text-[10px] font-black text-blue-950">{o.id}</p><p className="text-[8px] font-bold text-slate-400 uppercase italic tracking-tighter">{o.date}</p></div>
                            <p className="font-black text-blue-900 text-lg italic">₹{o.total}</p>
                        </div>
                        <p className="text-[8px] font-bold text-slate-500 mb-5 uppercase leading-tight italic">{o.items}</p>
                        <div className="flex gap-3">
                            <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Track ID: ${o.id}`)} className="flex-1 bg-blue-50 text-blue-950 py-3 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 border border-blue-100"> <FileText size={14}/> BILL REPORT </button>
                            <button onClick={() => { o.items.split(', ').forEach(it => { const m = it.match(/(.+) \(x(\d+)\)/); if(m) { const p = allProducts.find(prod => prod.name === m[1]); if(p) setCart(prev => [...prev, {...p, qty: parseInt(m[2])}]); } }); setIsCartOpen(true); }} className="flex-1 bg-amber-400 text-blue-950 py-3 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 shadow-lg"> <RefreshCw size={14}/> RE-ORDER </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-slate-300 font-bold italic uppercase tracking-widest border-2 border-dashed rounded-[3rem]">No Orders History</div>
                )}
            </div>
        )}
      </main>

      {/* 🧭 STICKY NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-around shadow-[0_-15px_40px_rgba(0,0,0,0.1)] rounded-t-[3rem] z-40">
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'shop' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <ShoppingBag size={28}/> <span className="text-[8px] font-black uppercase">Market</span> </button>
        <button onClick={() => {if(!isLoggedIn){setActiveTab('login'); return;} setActiveTab('history')}} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' || activeTab === 'login' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <History size={28}/> <span className="text-[8px] font-black uppercase">Orders</span> </button>
        <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi NM Mart, Support please!`)} className="text-slate-300 flex flex-col items-center gap-1"> <Share2 size={28}/> <span className="text-[8px] font-black uppercase">Invite</span> </button>
      </nav>

      {/* 🛒 PREMIUM CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col border-l-8 border-blue-950">
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs tracking-widest italic shadow-xl">
                <span className="flex items-center gap-3"> <ShoppingBag size={20} className="text-amber-400"/> YOUR NM BAG ({cart.length}) </span>
                <X size={28} className="cursor-pointer bg-white/10 p-1.5 rounded-full" onClick={() => setIsCartOpen(false)}/>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex justify-between items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm relative group">
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-700 truncate w-32">{item.name}</span><span className="text-[8px] font-bold text-slate-300 uppercase italic">Unit: {item.unit}</span></div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCart(cart.map((i, k) => k === idx ? {...i, qty: Math.max(0, i.qty - 1)} : i).filter(i => i.qty > 0))} className="bg-red-50 text-red-600 p-1.5 rounded-full"><Minus size={14}/></button>
                        <span className="font-black text-blue-950 text-xs w-4 text-center">{item.qty}</span>
                        <button onClick={() => setCart(cart.map((i, k) => k === idx ? {...i, qty: i.qty + 1} : i))} className="bg-green-50 text-green-600 p-1.5 rounded-full"><Plus size={14}/></button>
                        <span className="font-black text-blue-950 text-xs ml-3 italic">₹{item.saleRate * (item.qty || 0)}</span>
                    </div>
                  </div>
                ))}

                {totalBill >= MIN_ORDER_VALUE && (
                    <div className="mt-8 p-6 bg-white rounded-[2.5rem] border-2 border-blue-50 shadow-lg">
                        <p className="text-center font-black text-[10px] text-blue-950 uppercase italic mb-5 flex items-center justify-center gap-2 underline decoration-amber-400 underline-offset-4 tracking-tighter"> <Smartphone size={16}/> Payment Method </p>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button onClick={() => setPayMethod('COD')} className={`p-5 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all shadow-md ${payMethod === 'COD' ? 'bg-blue-950 text-white border-blue-950 scale-105 shadow-xl' : 'bg-slate-50 text-blue-950 border-slate-100 opacity-60'}`}> <Banknote size={24}/><span className="text-[9px] font-black uppercase">Cash</span> </button>
                            <button onClick={() => setPayMethod('UPI')} className={`p-5 rounded-3xl flex flex-col items-center gap-3 border-2 transition-all shadow-md ${payMethod === 'UPI' ? 'bg-blue-950 text-white border-blue-950 scale-105 shadow-xl' : 'bg-slate-50 text-blue-950 border-slate-100 opacity-60'}`}> <Smartphone size={24}/><span className="text-[9px] font-black uppercase">Online</span> </button>
                        </div>
                        {payMethod === 'UPI' && (
                            <div className="mt-6 flex flex-col items-center animate-in zoom-in-95 duration-500">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`} className="w-40 mb-5 shadow-2xl p-3 bg-white rounded-3xl border-2 border-blue-50"/>
                                <a href={upiLink} className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-black text-center text-[11px] flex items-center justify-center gap-3 shadow-xl animate-bounce"> <ExternalLink size={20}/> OPEN GPAY / PHONEPE </a>
                                <p className="text-[7px] text-slate-400 font-black mt-4 uppercase tracking-[0.2em]">100% Secure Transaction</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="p-8 border-t bg-white rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between font-black mb-8 px-4 text-blue-950">
                  <span className="text-[12px] uppercase tracking-[0.1em]">Total Invoice:</span>
                  <span className="text-3xl italic underline decoration-amber-400 decoration-4">₹{totalBill}</span>
              </div>
              {totalBill < MIN_ORDER_VALUE ? (
                <div className="bg-red-50 text-red-600 p-5 rounded-3xl text-[10px] font-black text-center border-2 border-red-100 animate-pulse uppercase tracking-wider">Add ₹{MIN_ORDER_VALUE - totalBill} more for Free Delivery</div>
              ) : (
                <button onClick={handleOrderProcess} className="w-full bg-blue-950 text-white py-6 rounded-[3rem] font-black uppercase text-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center gap-4 active:scale-95 transition-all">
                    <CheckCircle2 size={24} className="text-amber-400"/> {payMethod ? 'Confirm Order Now' : 'Select Payment First'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- CSV PARSER (Professional FMCG Loader) ---
function parseCSV(text: string) {
  const lines = text.split('\n');
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if(!cols[0]) return null;
    return { 
        id: `nm-item-${i}`, 
        name: cols[0], 
        barcode: cols[1], 
        category: cols[2], 
        unit: cols[3], 
        mrp: parseFloat(cols[4]), 
        saleRate: parseFloat(cols[5]) 
    };
  }).filter(Boolean);
}

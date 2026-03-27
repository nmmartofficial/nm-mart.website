import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, User, LogOut, RefreshCw, Flame, Banknote, Smartphone, CheckCircle2, Truck, PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🛠️ CONFIG ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; 
const MIN_ORDER_VALUE = 500;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-0GnSZcmnvqTASMD7_wAcYTAV8rVXMV20c67yT14Gd7Rr0ZfGU1T8EkyVIcEx5Hazkg/exec";

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [payMethod, setPayMethod] = useState<'COD' | 'UPI' | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('NM_MART_LOGGED_IN') === 'true');
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('NM_MART_USER_DATA');
    return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
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

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];
  const dealProducts = allProducts.filter(p => p.mrp > 0 && ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50);
  const totalBill = cart.reduce((s, i) => s + i.saleRate * (i.qty || 0), 0);

  const handleOrderProcess = async () => {
    if(!payMethod) return alert("Pehle Payment Method chunein!");
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty} ${i.unit})`).join(', ');
    const orderData = { id: orderID, date: new Date().toLocaleString('en-IN'), ...customer, items: itemsSummary, total: totalBill, method: payMethod, status: 'Pending' };
    
    try { fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(orderData) }); } catch (e) {}
    
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));
    
    const waMsg = `*NM MART - NAYA ORDER*\nID: ${orderID}\nPayment: ${payMethod}\nTotal: ₹${totalBill}\n\nSaman:\n${itemsSummary}\n\nAddress: ${customer.address}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
    
    setCart([]); setIsCartOpen(false); setPayMethod(null);
    setActiveTab('history');
  };

  const handleTrack = (id: string) => {
    const waMsg = `Hello NM Mart, Mere Order ID: ${id} ka status kya hai?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic">NM MART LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-slate-900">
      <header className="bg-blue-950 text-white p-3 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400 shadow-xl">
        <div onClick={() => setActiveTab('shop')} className="cursor-pointer">
            <h1 className="text-xl font-black italic tracking-tighter leading-none">NM MART</h1>
            <span className="text-[7px] font-bold text-amber-400 uppercase">Manjhanpur Digital</span>
        </div>
        <div className="flex items-center gap-2">
            {isLoggedIn ? (
                <div className="flex items-center gap-1.5 bg-white/10 p-1 pr-2 rounded-full border border-white/20">
                    <span className="text-[8px] font-black uppercase ml-1 italic">{customer.name.split(' ')[0]}</span>
                    <button onClick={() => { localStorage.removeItem('NM_MART_LOGGED_IN'); setIsLoggedIn(false); }} className="text-red-400 ml-1"><LogOut size={12}/></button>
                </div>
            ) : (
                <button onClick={() => setActiveTab('login')} className="bg-amber-400 text-blue-950 px-3 py-1.5 rounded-full font-black text-[9px] uppercase shadow-lg">Login</button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="bg-white text-blue-950 p-2 rounded-full relative shadow-md">
              <ShoppingCart size={18}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full">{cart.length}</span>}
            </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-4">
        {activeTab === 'shop' && (
          <>
            <div className="relative mb-4">
                <input type="text" placeholder="Search Maggi, Soap..." className="w-full p-4 pl-12 rounded-2xl shadow-sm border-2 border-slate-100 font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-950 text-white scale-105' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
                ))}
            </div>

            {/* 50% OFF DEALS SECTION */}
            {searchTerm === '' && selectedCategory === 'All' && dealProducts.length > 0 && (
                <div className="mb-6 bg-amber-50 p-4 rounded-3xl border-2 border-amber-100 shadow-inner">
                    <h2 className="text-[10px] font-black text-blue-950 uppercase italic mb-3 flex items-center gap-1"><Flame className="text-red-600 animate-pulse" size={16}/> NM MART SPECIAL DEALS (50% OFF)</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {dealProducts.map(p => (
                            <div key={`deal-${p.id}`} className="bg-white p-3 rounded-2xl border border-slate-100 w-36 flex-shrink-0 text-center shadow-sm relative">
                                <div className="absolute top-1 left-1 bg-red-600 text-white text-[6px] font-bold px-1 rounded-full animate-bounce">SAVE 50%+</div>
                                <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-16 mx-auto object-contain" onError={(e: any) => e.target.src = `https://loremflickr.com/150/150/${encodeURIComponent(p.name)}`}/>
                                <p className="text-[8px] font-black mt-2 h-6 overflow-hidden uppercase leading-tight">{p.name}</p>
                                <p className="text-blue-950 font-black text-xs mt-1">₹{p.saleRate} <span className="text-[7px] text-slate-400 line-through">₹{p.mrp}</span></p>
                                <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setCart([...cart, {...p, qty: 1}]) }} className="w-full bg-blue-950 text-white py-1.5 mt-2 rounded-lg text-[8px] font-black uppercase shadow active:scale-95 transition-all">ADD</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allProducts.filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-3xl border-2 border-slate-50 flex flex-col items-center shadow-sm hover:shadow-md transition-all">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-16 object-contain" onError={(e: any) => e.target.src = `https://loremflickr.com/150/150/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[8px] font-black uppercase text-center h-8 mt-2 text-slate-700 leading-tight">{p.name}</h3>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{p.unit}</p>
                    <p className="font-black text-blue-950 text-xs mt-1">₹{p.saleRate}</p>
                    <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setCart([...cart, {...p, qty: 1}]) }} className="w-full bg-blue-950 text-white py-2 mt-2 rounded-xl text-[8px] font-black uppercase shadow-md active:scale-95 transition-all">Add to Cart</button>
                  </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'login' && (
            <div className="max-w-md mx-auto mt-6 bg-white p-8 rounded-[2.5rem] shadow-xl text-center border-4 border-blue-50">
                <h2 className="text-lg font-black text-blue-950 uppercase italic mb-6 underline decoration-amber-400">Join NM MART</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Mobile" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <textarea placeholder="Full Address (House No, Gali, Area)" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 h-20 outline-none" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                    <button onClick={() => { if(!customer.name || customer.phone.length<10) return alert("Poora bhariye!"); setIsLoggedIn(true); localStorage.setItem('NM_MART_LOGGED_IN','true'); localStorage.setItem('NM_MART_USER_DATA', JSON.stringify(customer)); setActiveTab('shop'); }} className="w-full bg-blue-950 text-white py-4 rounded-[2rem] font-black uppercase text-xs shadow-lg active:scale-95 transition-transform">Login Now</button>
                </div>
            </div>
        )}

        {/* ORDER HISTORY WITH STATUS TRACKING */}
        {activeTab === 'history' && (
            <div className="max-w-md mx-auto mt-2 px-2">
                <h2 className="text-lg font-black text-blue-950 mb-4 uppercase italic flex items-center gap-2 underline decoration-amber-400"> <History size={20}/> My Orders</h2>
                {foundOrders.length > 0 ? foundOrders.map(o => (
                    <div key={o.id} className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-400 px-3 py-1 rounded-bl-xl text-[7px] font-black uppercase flex items-center gap-1">
                            <PackageCheck size={10}/> {o.status || 'Pending'}
                        </div>
                        <div className="flex justify-between items-start mb-2 border-b border-dashed border-slate-200 pb-2 mt-2">
                            <div><p className="text-[9px] font-black text-blue-950">{o.id}</p><p className="text-[7px] font-bold text-slate-400">{o.date} | {o.method}</p></div>
                            <p className="font-black text-blue-900 text-sm italic">₹{o.total}</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-600 mb-4 uppercase leading-tight italic">{o.items}</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleTrack(o.id)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-xl font-black text-[8px] uppercase flex items-center justify-center gap-1 border border-blue-100"> <Truck size={12}/> Track Now </button>
                            <button onClick={() => { const items = o.items.split(', '); const newCart = items.map(it => { const m = it.match(/(.+) \(x(\d+).+\)/); return {name: m[1], qty: parseInt(m[2]), unit: '...'}; }); setCart(newCart); setIsCartOpen(true); }} className="flex-1 bg-green-50 text-green-700 py-2 rounded-xl font-black text-[8px] uppercase border border-green-200 flex items-center justify-center gap-1"> <RefreshCw size={12}/> Re-Order </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20"><ShoppingBag size={40} className="mx-auto text-slate-200 mb-4"/><p className="text-slate-400 font-bold italic">Abhi tak koi order nahi hai!</p></div>
                )}
            </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex justify-around items-center z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center transition-all ${activeTab === 'shop' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <ShoppingBag size={24}/><span className="text-[8px] font-black uppercase mt-1">Store</span> </button>
        <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setActiveTab('history'); }} className={`flex flex-col items-center transition-all ${activeTab === 'history' || activeTab === 'login' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <History size={24}/><span className="text-[8px] font-black uppercase mt-1">Orders</span> </button>
      </nav>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-xs bg-white z-[70] shadow-2xl flex flex-col border-l-4 border-blue-950">
            <div className="p-4 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-[10px]"><span>Bag ({cart.length})</span><X size={20} className="cursor-pointer" onClick={() => setIsCartOpen(false)}/></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-slate-700 truncate w-24">{item.name}</span><span className="text-[7px] font-bold text-slate-400 uppercase">{item.unit}</span></div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCart(cart.map(i => i.name === item.name ? {...i, qty: Math.max(0, i.qty - 1)} : i).filter(i => i.qty > 0))} className="bg-white p-1 rounded-full border shadow-sm"><Minus size={10}/></button>
                        <span className="font-black text-blue-950 text-xs w-4 text-center">{item.qty}</span>
                        <button onClick={() => setCart(cart.map(i => i.name === item.name ? {...i, qty: i.qty + 1} : i))} className="bg-white p-1 rounded-full border shadow-sm"><Plus size={10}/></button>
                        <span className="font-black text-blue-950 text-xs ml-2">₹{item.saleRate * (item.qty || 0) || '0'}</span>
                    </div>
                  </div>
                ))}

                {totalBill >= MIN_ORDER_VALUE && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-[2rem] border-2 border-blue-100 shadow-inner">
                        <p className="text-[9px] font-black text-blue-900 uppercase italic mb-3 text-center tracking-tighter">Payment Kaise Karenge?</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setPayMethod('COD')} className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all shadow-sm ${payMethod === 'COD' ? 'bg-blue-950 text-white border-blue-950' : 'bg-white text-blue-950 border-slate-100'}`}>
                                <Banknote size={18}/><span className="text-[8px] font-black uppercase">Cash</span>
                            </button>
                            <button onClick={() => setPayMethod('UPI')} className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all shadow-sm ${payMethod === 'UPI' ? 'bg-blue-950 text-white border-blue-950' : 'bg-white text-blue-950 border-slate-100'}`}>
                                <Smartphone size={18}/><span className="text-[8px] font-black uppercase">UPI/QR</span>
                            </button>
                        </div>
                        {payMethod === 'UPI' && (
                            <div className="mt-4 flex flex-col items-center bg-white p-3 rounded-2xl border shadow-inner">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${UPI_ID}%26pn=NMMART%26am=${totalBill}%26cu=INR`} className="h-28 w-28"/>
                                <p className="text-[7px] font-black text-slate-400 mt-2 text-center uppercase">Scan karke ₹{totalBill} pay karein aur Screenshot le lein</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="p-5 border-t bg-slate-100 rounded-t-[2.5rem] shadow-inner">
              <div className="flex justify-between font-black mb-4 uppercase text-[10px] px-2 text-blue-950"><span>Subtotal:</span><span className="text-xl italic">₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <div className="bg-red-100 text-red-600 p-3 rounded-xl text-[8px] font-black text-center mb-4 uppercase border border-red-200 animate-pulse">Min. Order ₹{MIN_ORDER_VALUE} chaiye</div>
              ) : (
                <button onClick={handleOrderProcess} className="w-full bg-blue-950 text-white py-4 rounded-[2rem] font-black uppercase text-[10px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <CheckCircle2 size={16}/> {payMethod ? `Order on WhatsApp (${payMethod})` : 'Select Payment Mode First'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function parseCSV(text: string) {
  const lines = text.split('\n');
  const products: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || !row.trim()) continue;
    const cols = row.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (!cols[0]) continue; 
    products.push({ 
        id: `item-${i}`, 
        name: cols[0], 
        barcode: cols[1] || '', 
        category: cols[2] || 'General', 
        unit: cols[3] || 'Pcs', // Column D
        mrp: parseFloat(cols[4]) || 0, // Column E
        saleRate: parseFloat(cols[5]) || 0 // Column F
    });
  }
  return products;
}

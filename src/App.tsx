import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, User, LogOut, RefreshCw, 
  Flame, Banknote, Smartphone, CheckCircle2, Truck, ExternalLink, Mic, Clock, MapPin, FileText, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🛠️ CONFIG (NM MART SETTINGS) ---
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [payMethod, setPayMethod] = useState<'COD' | 'UPI' | null>(null);
  const [addressType, setAddressType] = useState<'Home' | 'Office'>('Home');
  
  // 🔐 LOGIN & MULTI-ADDRESS
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

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];
  const dealProducts = allProducts.filter(p => p.mrp > 0 && ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50);
  const totalBill = cart.reduce((s, i) => s + i.saleRate * (i.qty || 0), 0);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=NMMART&am=${totalBill}&cu=INR`;

  // 🎤 VOICE SEARCH LOGIC
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser support nahi karta!");
    const rec = new SpeechRecognition();
    rec.onresult = (e: any) => setSearchTerm(e.results[0][0].transcript);
    rec.start();
  };

  const handleLogin = () => {
    if(!customer.name || customer.phone.length < 10 || !customer.homeAddr) return alert("Poora Detail Bhariye!");
    setIsLoggedIn(true);
    localStorage.setItem('NM_MART_LOGGED_IN', 'true');
    localStorage.setItem('NM_MART_USER_DATA', JSON.stringify(customer));
    setActiveTab('shop');
  };

  const handleOrderProcess = () => {
    if(!payMethod) return alert("Payment Method चुनें!");
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const finalAddress = addressType === 'Home' ? customer.homeAddr : customer.officeAddr;
    
    const orderData = { 
        id: orderID, date: new Date().toLocaleString('en-IN'), ...customer, 
        items: itemsSummary, total: totalBill, method: payMethod, status: 'Pending', address: finalAddress 
    };
    
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));
    
    const waMsg = `*NM MART - BILL REPORT*\n--------------------\nID: ${orderID}\nPay: ${payMethod}\nTotal: ₹${totalBill}\nItems: ${itemsSummary}\nAddr: ${finalAddress}\n--------------------\nNM MART Manjhanpur`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
    
    setCart([]); setIsCartOpen(false); setPayMethod(null); setActiveTab('history');
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center font-black text-blue-900 bg-white italic uppercase tracking-widest p-10 text-center animate-pulse">NM MART LOADING... <br/><span className="text-[8px] text-amber-500 mt-2">Checking Manjhanpur Inventory</span></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-slate-900">
      
      {/* 🚀 HEADER (Professional Branding) */}
      <header className="bg-blue-950 text-white p-3 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400 shadow-xl">
        <div onClick={() => setActiveTab('shop')} className="cursor-pointer">
            <h1 className="text-xl font-black italic tracking-tighter leading-none">NM MART</h1>
            <span className="text-[7px] font-bold text-amber-400 uppercase">Manjhanpur Digital</span>
        </div>
        <div className="flex items-center gap-3">
            {isLoggedIn && <button onClick={() => { localStorage.removeItem('NM_MART_LOGGED_IN'); setIsLoggedIn(false); }} className="text-red-400"><LogOut size={16}/></button>}
            <button onClick={() => setIsCartOpen(true)} className="bg-white text-blue-950 p-2 rounded-full relative shadow-md">
              <ShoppingCart size={18}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full">{cart.length}</span>}
            </button>
        </div>
      </header>

      {/* ⏱️ FLASH SALE BAR */}
      <div className="bg-amber-400 text-blue-950 px-4 py-1.5 flex justify-between items-center font-black text-[9px] uppercase tracking-wider">
        <span className="flex items-center gap-1"><Clock size={12}/> Flash Sale Live!</span>
        <span>Ends in: 01:59:59</span>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-4">
        
        {/* 🔐 LOGIN / ADDRESS TAB */}
        {activeTab === 'login' && (
            <div className="max-w-md mx-auto mt-4 bg-white p-6 rounded-[2rem] shadow-xl border-t-8 border-blue-950">
                <h2 className="text-lg font-black text-blue-950 uppercase italic text-center mb-6 underline decoration-amber-400">Join NM MART</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Apna Name" className="w-full p-4 bg-slate-100 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-blue-950" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-100 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-blue-950" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                        <label className="text-[9px] font-black uppercase text-blue-900 block mb-2 flex items-center gap-1"><MapPin size={10}/> Home Address</label>
                        <textarea placeholder="Ghar Ka Pata" className="w-full bg-transparent font-bold text-xs outline-none" value={customer.homeAddr} onChange={e => setCustomer({...customer, homeAddr: e.target.value})}/>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                        <label className="text-[9px] font-black uppercase text-slate-500 block mb-2 flex items-center gap-1"><ShoppingBag size={10}/> Shop/Office Address (Optional)</label>
                        <textarea placeholder="Dukan Ka Pata" className="w-full bg-transparent font-bold text-xs outline-none" value={customer.officeAddr} onChange={e => setCustomer({...customer, officeAddr: e.target.value})}/>
                    </div>
                    <button onClick={handleLogin} className="w-full bg-blue-950 text-white py-4 rounded-[2rem] font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Start Shopping</button>
                </div>
            </div>
        )}

        {/* 🛍️ SHOP TAB (Categories, Voice Search, Deals) */}
        {activeTab === 'shop' && (
          <>
            <div className="relative mb-4 flex gap-2">
                <div className="relative flex-1">
                    <input type="text" placeholder="Bolkar ya Likhkar dhundhein..." className="w-full p-4 pl-12 rounded-2xl shadow-sm border-2 border-slate-100 font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                    <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
                </div>
                <button onClick={startVoiceSearch} className="bg-blue-950 text-white p-4 rounded-2xl shadow-lg animate-pulse"><Mic size={20}/></button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all shadow-sm ${selectedCategory === cat ? 'bg-blue-950 text-white scale-105' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
                ))}
            </div>

            {/* 🔥 50% DEALS SECTION */}
            {searchTerm === '' && selectedCategory === 'All' && dealProducts.length > 0 && (
                <div className="mb-6 bg-red-50 p-4 rounded-3xl border-2 border-red-100 shadow-inner overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-2xl font-black text-[8px] animate-bounce">DHAMAKA</div>
                    <h2 className="text-[10px] font-black text-red-700 uppercase italic mb-3 flex items-center gap-1"> <Flame size={16}/> NM MART 50% OFF DEALS</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {dealProducts.map(p => (
                            <div key={`deal-${p.id}`} className="bg-white p-3 rounded-2xl border border-red-50 w-36 flex-shrink-0 text-center shadow-md relative">
                                <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-16 mx-auto object-contain" onError={(e: any) => e.target.src = `https://loremflickr.com/150/150/${encodeURIComponent(p.name)}`}/>
                                <p className="text-[8px] font-black mt-2 h-6 overflow-hidden uppercase leading-tight">{p.name}</p>
                                <p className="text-blue-950 font-black text-xs mt-1">₹{p.saleRate} <span className="text-[7px] text-slate-400 line-through">₹{p.mrp}</span></p>
                                <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setCart([...cart, {...p, qty: 1}]) }} className="w-full bg-red-600 text-white py-1.5 mt-2 rounded-lg text-[8px] font-black uppercase shadow-md active:scale-95 transition-all italic">Hurry Up!</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {allProducts.filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-3xl border-2 border-slate-50 flex flex-col items-center shadow-sm hover:shadow-md transition-all">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-16 object-contain" onError={(e: any) => e.target.src = "https://placehold.co/100x100?text=NM+MART"}/>
                    <h3 className="text-[8px] font-black uppercase text-center h-8 mt-2 text-slate-700 leading-tight">{p.name}</h3>
                    <p className="text-[7px] font-bold text-slate-400 uppercase">{p.unit}</p>
                    <p className="font-black text-blue-950 text-xs mt-1 italic">₹{p.saleRate}</p>
                    <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setCart([...cart, {...p, qty: 1}]) }} className="w-full bg-blue-950 text-white py-2 mt-2 rounded-xl text-[8px] font-black uppercase shadow-md active:scale-95 transition-all">Add</button>
                  </div>
              ))}
            </div>
          </>
        )}

        {/* 📜 HISTORY TAB (Loyalty, Tracking, Re-Order) */}
        {activeTab === 'history' && (
            <div className="max-w-md mx-auto mt-2 px-2 pb-10">
                <div className="bg-gradient-to-r from-blue-950 to-blue-800 p-5 rounded-3xl mb-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 bg-amber-400 w-20 h-20 rounded-full blur-2xl opacity-20"></div>
                    <p className="text-[10px] font-black italic uppercase tracking-widest text-amber-400">NM MART Rewards</p>
                    <h2 className="text-xl font-black">Loyalty Points: {foundOrders.length * 10}</h2>
                    <p className="text-[8px] mt-1 text-blue-200">Har 5th order par ₹50 Discount!</p>
                </div>
                
                <h2 className="text-lg font-black text-blue-950 mb-4 uppercase italic flex items-center gap-2 underline decoration-amber-400"> <History size={20}/> Old Orders</h2>
                {foundOrders.length > 0 ? foundOrders.map(o => (
                    <div key={o.id} className="bg-white p-4 rounded-3xl mb-4 shadow-md border border-slate-100 relative">
                        <div className="absolute top-2 right-2 bg-amber-400 px-3 py-1 rounded-full text-[7px] font-black uppercase flex items-center gap-1 shadow-sm">
                            <Truck size={10}/> {o.status || 'Dispatch'}
                        </div>
                        <div className="flex justify-between items-start mb-2 border-b-2 border-dashed border-slate-100 pb-3">
                            <div><p className="text-[9px] font-black text-blue-950">{o.id}</p><p className="text-[7px] font-bold text-slate-400 italic">{o.date}</p></div>
                            <p className="font-black text-blue-900 text-sm italic">₹{o.total}</p>
                        </div>
                        <p className="text-[8px] font-bold text-slate-500 mb-4 uppercase leading-tight bg-slate-50 p-2 rounded-lg border border-slate-100">{o.items}</p>
                        <div className="flex gap-2">
                            <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Track ID: ${o.id}`)} className="flex-1 bg-blue-950 text-white py-2.5 rounded-xl font-black text-[8px] uppercase flex items-center justify-center gap-2 shadow-lg"> <FileText size={12}/> Track / Bill </button>
                            <button onClick={() => { const items = o.items.split(', '); items.forEach(it => { const m = it.match(/(.+) \(x(\d+)\)/); if(m) { const p = allProducts.find(prod => prod.name === m[1]); if(p) setCart(prev => [...prev, {...p, qty: parseInt(m[2])}]); } }); setIsCartOpen(true); }} className="flex-1 bg-amber-400 text-blue-950 py-2.5 rounded-xl font-black text-[8px] uppercase flex items-center justify-center gap-2 shadow-lg"> <RefreshCw size={12}/> Re-Order </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-slate-300 font-bold italic underline uppercase tracking-widest">No Orders Yet!</div>
                )}
            </div>
        )}
      </main>

      {/* 🧭 NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex justify-around items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center transition-all ${activeTab === 'shop' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <ShoppingBag size={26}/><span className="text-[8px] font-black uppercase mt-1">Market</span> </button>
        <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setActiveTab('history'); }} className={`flex flex-col items-center transition-all ${activeTab === 'history' || activeTab === 'login' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <History size={26}/><span className="text-[8px] font-black uppercase mt-1">Orders</span> </button>
        <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi NM Mart, Support please!`)} className="text-slate-300 flex flex-col items-center"> <Share2 size={26}/><span className="text-[8px] font-black uppercase mt-1">Help</span> </button>
      </nav>

      {/* 🛒 CART DRAWER (Pay Now, Multi-Address) */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col border-l-4 border-blue-950 overflow-hidden">
            <div className="p-4 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-[11px] shadow-lg">
                <span className="flex items-center gap-2 tracking-widest italic"> <ShoppingBag size={18}/> NM SHOPPING BAG </span>
                <X size={24} className="cursor-pointer bg-white/10 p-1 rounded-full" onClick={() => setIsCartOpen(false)}/>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-slate-700 truncate w-32">{item.name}</span><span className="text-[7px] font-bold text-slate-400 uppercase italic">{item.unit}</span></div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCart(cart.map((i, k) => k === idx ? {...i, qty: Math.max(0, i.qty - 1)} : i).filter(i => i.qty > 0))} className="bg-red-50 text-red-600 p-1 rounded-full"><Minus size={12}/></button>
                        <span className="font-black text-blue-950 text-xs w-4 text-center">{item.qty}</span>
                        <button onClick={() => setCart(cart.map((i, k) => k === idx ? {...i, qty: i.qty + 1} : i))} className="bg-green-50 text-green-600 p-1 rounded-full"><Plus size={12}/></button>
                        <span className="font-black text-blue-950 text-xs ml-2">₹{item.saleRate * (item.qty || 0)}</span>
                    </div>
                  </div>
                ))}

                {totalBill >= MIN_ORDER_VALUE && (
                    <div className="mt-4 p-5 bg-white rounded-[2rem] border-2 border-blue-100 shadow-md">
                        <p className="text-center font-black text-[9px] text-blue-950 uppercase italic mb-4 flex items-center justify-center gap-2 underline"> <MapPin size={14}/> Select Delivery Address</p>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <button onClick={() => setAddressType('Home')} className={`p-3 rounded-2xl border-2 transition-all font-black text-[9px] uppercase ${addressType === 'Home' ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-50 text-slate-400'}`}>Home</button>
                            <button onClick={() => setAddressType('Office')} className={`p-3 rounded-2xl border-2 transition-all font-black text-[9px] uppercase ${addressType === 'Office' ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-50 text-slate-400'}`}>Office</button>
                        </div>

                        <p className="text-center font-black text-[9px] text-blue-950 uppercase italic mb-4 flex items-center justify-center gap-2 underline"> <Smartphone size={14}/> Select Payment Mode</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setPayMethod('COD')} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all shadow-sm ${payMethod === 'COD' ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-50 text-blue-950 border-slate-100'}`}> <Banknote size={20}/><span className="text-[9px] font-black uppercase">COD</span> </button>
                            <button onClick={() => setPayMethod('UPI')} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all shadow-sm ${payMethod === 'UPI' ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-50 text-blue-950 border-slate-100'}`}> <Smartphone size={20}/><span className="text-[9px] font-black uppercase">UPI/QR</span> </button>
                        </div>
                        {payMethod === 'UPI' && (
                            <div className="mt-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`} className="w-36 mb-4 shadow-xl p-2 bg-white rounded-xl border-2 border-blue-100"/>
                                <a href={upiLink} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-center text-[10px] flex items-center justify-center gap-2 shadow-xl animate-bounce"> <ExternalLink size={16}/> PAY NOW (PhonePe/GPay) </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="p-6 border-t bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between font-black mb-6 px-2 text-blue-950">
                  <span className="text-[11px] uppercase tracking-widest">Grand Total:</span>
                  <span className="text-2xl italic underline decoration-amber-400">₹{totalBill}</span>
              </div>
              {totalBill < MIN_ORDER_VALUE ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[9px] font-black text-center border-2 border-red-100 animate-pulse uppercase">Order ₹{MIN_ORDER_VALUE}+ for Delivery</div>
              ) : (
                <button onClick={handleOrderProcess} className="w-full bg-blue-950 text-white py-5 rounded-[2.5rem] font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <CheckCircle2 size={20}/> {payMethod ? 'Confirm My Order' : 'Select Payment First'}
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
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if(!cols[0]) return null;
    return { id: `item-${i}`, name: cols[0], barcode: cols[1], category: cols[2], unit: cols[3], mrp: parseFloat(cols[4]), saleRate: parseFloat(cols[5]) };
  }).filter(Boolean);
}

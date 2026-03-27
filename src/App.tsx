import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, Banknote, Smartphone, User, CheckCircle2, LogOut, RefreshCw
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
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('NM_MART_LOGGED_IN') === 'true');
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('NM_MART_USER_DATA');
    return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
  });

  const [cart, setCart] = useState<any[]>([]);
  const [foundOrders, setFoundOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { 
        setAllProducts(parseCSV(csv)); 
        setLoading(false); 
    }).catch(() => setLoading(false));

    if(isLoggedIn && customer.phone) loadHistory();
  }, [isLoggedIn]);

  const totalBill = cart.reduce((s, i) => s + i.saleRate * (i.qty || 0), 0);

  const loadHistory = () => {
    const allOrders = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    setFoundOrders(allOrders.filter((o: any) => o.phone === customer.phone));
  };

  const handleLogin = () => {
    if(!customer.name || customer.phone.length < 10) return alert("Poora Name aur Number daalein!");
    setIsLoggedIn(true);
    localStorage.setItem('NM_MART_LOGGED_IN', 'true');
    localStorage.setItem('NM_MART_USER_DATA', JSON.stringify(customer));
    setActiveTab('shop');
  };

  const handleLogout = () => {
    if(window.confirm("Logout karna chahte hain?")) {
        setIsLoggedIn(false);
        localStorage.removeItem('NM_MART_LOGGED_IN');
        setActiveTab('shop');
    }
  };

  // --- RE-ORDER MAGIC (अब्दुल भाई, यहाँ है नया फीचर) ---
  const handleReorder = (itemsStr: string) => {
    // आइटम स्ट्रिंग को वापस कार्ट फॉर्मेट में बदलना (e.g. "Maggi (x2), Soap (x1)")
    const itemsArray = itemsStr.split(', ');
    const newCart: any[] = [];

    itemsArray.forEach(itemStr => {
      const match = itemStr.match(/(.+) \(x(\d+)\)/);
      if (match) {
        const name = match[1];
        const qty = parseInt(match[2]);
        const product = allProducts.find(p => p.name === name);
        if (product) {
          newCart.push({ ...product, qty });
        }
      }
    });

    if (newCart.length > 0) {
      setCart(newCart);
      setIsCartOpen(true);
      setActiveTab('shop');
      alert("Pichla order cart mein add ho gaya hai!");
    }
  };

  const handleOrderProcess = async () => {
    if(!isLoggedIn) return alert("Pehle Login karein!");
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const orderData = { id: orderID, date: new Date().toLocaleString('en-IN'), ...customer, items: itemsSummary, total: totalBill, method: 'COD/UPI' };
    
    try { fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(orderData) }); } catch (e) {}
    
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));
    loadHistory();

    const waMsg = `*NM MART - ORDER*\nID: ${orderID}\nItems: ${itemsSummary}\nTotal: ₹${totalBill}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
    setCart([]); setIsCartOpen(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic">NM MART...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* --- HEADER --- */}
      <header className="bg-blue-950 text-white p-3 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400 shadow-2xl">
        <div onClick={() => setActiveTab('shop')} className="cursor-pointer">
            <h1 className="text-xl font-black italic tracking-tighter">NM MART</h1>
            <span className="text-[7px] font-bold text-amber-400 uppercase tracking-widest">Digital Store</span>
        </div>

        <div className="flex items-center gap-2">
            {isLoggedIn ? (
                <div className="flex items-center gap-2 bg-white/10 p-1 pr-3 rounded-full border border-white/20">
                    <div className="bg-amber-400 p-1.5 rounded-full text-blue-950"><User size={12}/></div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase leading-tight">{customer.name.split(' ')[0]}</span>
                        <span className="text-[7px] font-bold text-amber-300">{customer.phone}</span>
                    </div>
                    <button onClick={handleLogout} className="ml-1 text-red-400"><LogOut size={12}/></button>
                </div>
            ) : (
                <button onClick={() => setActiveTab('login')} className="bg-amber-400 text-blue-950 px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg">Login</button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="bg-white text-blue-950 p-2 rounded-full shadow-md relative">
              <ShoppingCart size={18}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full">{cart.length}</span>}
            </button>
        </div>
      </header>

      {/* --- MAIN --- */}
      <main className="max-w-4xl mx-auto px-4 mt-4">
        {activeTab === 'shop' && (
          <>
            <div className="relative mb-6">
                <input type="text" placeholder="Search Maggi, Soap..." className="w-full p-4 pl-12 rounded-3xl shadow-sm border-2 border-slate-100 font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white p-3 rounded-[2rem] border-2 border-slate-50 flex flex-col items-center shadow-sm">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain" onError={(e: any) => e.target.src = `https://loremflickr.com/150/150/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[9px] font-black uppercase text-center h-8 mt-2 text-slate-700 leading-tight">{p.name}</h3>
                    <div className="w-full flex justify-between items-center mt-3 bg-slate-50 p-2 rounded-2xl">
                        <p className="font-black text-blue-950 text-xs">₹{p.saleRate}</p>
                        {inCart ? (
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border">
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: (i.qty || 0) - 1} : i).filter(i => (i.qty || 0) > 0))}><Minus size={10}/></button>
                            <span className="font-black text-[10px]">{inCart.qty}</span>
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: (i.qty || 0) + 1} : i))}><Plus size={10}/></button>
                        </div>
                        ) : ( <button onClick={() => { if(!isLoggedIn) { alert("Pehle Login karein!"); setActiveTab('login'); return; } setCart([...cart, {...p, qty: 1}]); }} className="bg-blue-950 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase">Add</button> )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {activeTab === 'login' && (
            <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-blue-950/5 text-center">
                <h2 className="text-xl font-black text-blue-950 uppercase italic mb-6 underline decoration-amber-400">Customer Registration</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Phone" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <textarea placeholder="Address" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 h-20" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                    <button onClick={handleLogin} className="w-full bg-blue-950 text-white py-4 rounded-[2rem] font-black uppercase text-xs">Login Now</button>
                </div>
            </div>
        )}

        {activeTab === 'history' && (
            <div className="max-w-md mx-auto mt-4 px-2">
                <h2 className="text-lg font-black text-blue-950 mb-4 uppercase italic flex items-center gap-2 underline"> <History size={20}/> My Orders</h2>
                {foundOrders.map(o => (
                    <div key={o.id} className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-2 border-b border-dashed pb-2">
                            <div><p className="text-[9px] font-black text-blue-950 uppercase italic tracking-tighter">{o.id}</p><p className="text-[8px] font-bold text-slate-400">{o.date}</p></div>
                            <p className="font-black text-blue-900 text-sm italic">₹{o.total}</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 mb-4 italic uppercase">{o.items}</p>
                        <button onClick={() => handleReorder(o.items)} className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-xl font-black text-[9px] uppercase border border-green-200 hover:bg-green-600 hover:text-white transition-all">
                            <RefreshCw size={14}/> Re-Order These Items
                        </button>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* --- BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex justify-around items-center z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center ${activeTab === 'shop' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}>
            <ShoppingBag size={24}/><span className="text-[8px] font-black uppercase mt-1">Store</span>
        </button>
        <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setActiveTab('history'); }} className={`flex flex-col items-center ${activeTab === 'history' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}>
            <History size={24}/><span className="text-[8px] font-black uppercase mt-1">My Orders</span>
        </button>
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-xs bg-white z-[70] shadow-2xl flex flex-col border-l-4 border-blue-950">
            <div className="p-4 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-[10px]"><span>Bag ({cart.length})</span><X size={20} onClick={() => setIsCartOpen(false)}/></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-700 truncate w-24">{item.name} x {item.qty}</span>
                    <span className="font-black text-blue-950 text-xs">₹{item.saleRate * (item.qty || 0)}</span>
                  </div>
                ))}
            </div>
            <div className="p-5 border-t bg-slate-100 rounded-t-[2.5rem]">
              <div className="flex justify-between font-black mb-4 uppercase text-[10px]"><span>To Pay:</span><span className="text-xl text-blue-950 italic">₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <div className="bg-red-100 text-red-600 p-2 rounded-xl text-[8px] font-black text-center mb-4 border border-red-200 uppercase">Min Order ₹{MIN_ORDER_VALUE} needed</div>
              ) : (
                <button onClick={handleOrderProcess} className="w-full bg-blue-950 text-white py-4 rounded-[2rem] font-black uppercase text-[10px] shadow-xl active:scale-95 transition-transform">Complete Order</button>
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
    products.push({ id: `item-${i}`, name: cols[0], barcode: cols[1] || '', saleRate: parseFloat(cols[5]) || 0 });
  }
  return products;
}

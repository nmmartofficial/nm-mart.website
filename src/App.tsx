import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, User, LogOut, RefreshCw, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🛠️ CONFIG ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const MIN_ORDER_VALUE = 500;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-0GnSZcmnvqTASMD7_wAcYTAV8rVXMV20c67yT14Gd7Rr0ZfGU1T8EkyVIcEx5Hazkg/exec";

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('NM_MART_LOGGED_IN') === 'true');
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('NM_MART_USER_DATA');
    return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
  });

  const [cart, setCart] = useState<any[]>([]);
  const [foundOrders, setFoundOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.text())
      .then(csv => { 
          setAllProducts(parseCSV(csv)); 
          setLoading(false); 
      })
      .catch(() => setLoading(false));

    if(isLoggedIn && customer.phone) {
        const allOrders = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
        setFoundOrders(allOrders.filter((o: any) => o.phone === customer.phone));
    }
  }, [isLoggedIn, customer.phone]);

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];
  const dealProducts = allProducts.filter(p => p.mrp > 0 && ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50);
  const totalBill = cart.reduce((s, i) => s + i.saleRate * (i.qty || 0), 0);

  const handleLogin = () => {
    if(!customer.name || customer.phone.length < 10) return alert("Poora Name aur Number bhariye!");
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

  const handleReorder = (itemsStr: string) => {
    const itemsArray = itemsStr.split(', ');
    const newCart: any[] = [];
    itemsArray.forEach(itemStr => {
      const match = itemStr.match(/(.+) \(x(\d+)\)/);
      if (match) {
        const product = allProducts.find(p => p.name === match[1]);
        if (product) newCart.push({ ...product, qty: parseInt(match[2]) });
      }
    });
    setCart(newCart);
    setIsCartOpen(true);
  };

  const handleOrderProcess = async () => {
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const orderData = { id: orderID, date: new Date().toLocaleString('en-IN'), ...customer, items: itemsSummary, total: totalBill };
    
    try { fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(orderData) }); } catch (e) {}
    
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("NM MART ORDER: " + orderID + "\nTotal: ₹" + totalBill)}`, '_blank');
    setCart([]); setIsCartOpen(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic">NM MART...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-blue-950 text-white p-3 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400 shadow-xl">
        <div onClick={() => setActiveTab('shop')} className="cursor-pointer">
            <h1 className="text-xl font-black italic tracking-tighter leading-none">NM MART</h1>
            <span className="text-[7px] font-bold text-amber-400 uppercase tracking-widest">Digital Store</span>
        </div>
        <div className="flex items-center gap-2">
            {isLoggedIn ? (
                <div className="flex items-center gap-1.5 bg-white/10 p-1 pr-3 rounded-full border border-white/20">
                    <div className="bg-amber-400 p-1 rounded-full text-blue-950"><User size={12}/></div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase leading-none">{customer.name.split(' ')[0]}</span>
                        <span className="text-[7px] font-bold text-amber-300">{customer.phone}</span>
                    </div>
                    <button onClick={handleLogout} className="text-red-400 ml-1"><LogOut size={12}/></button>
                </div>
            ) : (
                <button onClick={() => setActiveTab('login')} className="bg-amber-400 text-blue-950 px-3 py-1.5 rounded-full font-black text-[9px] uppercase">Login</button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="bg-white text-blue-950 p-2 rounded-full relative">
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
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-950 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
                ))}
            </div>

            {searchTerm === '' && selectedCategory === 'All' && dealProducts.length > 0 && (
                <div className="mb-6 bg-amber-50 p-4 rounded-3xl border-2 border-amber-100">
                    <h2 className="text-xs font-black text-blue-950 uppercase italic mb-3 flex items-center gap-1"><Flame className="text-red-600" size={16}/> NM MART DEALS (50% OFF)</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {dealProducts.map(p => (
                            <div key={`deal-${p.id}`} className="bg-white p-3 rounded-2xl border border-slate-100 w-36 flex-shrink-0 text-center shadow-sm">
                                <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-16 mx-auto object-contain" onError={(e: any) => e.target.src = `https://loremflickr.com/150/150/${encodeURIComponent(p.name)}`}/>
                                <p className="text-[8px] font-black mt-2 h-6 overflow-hidden uppercase leading-tight">{p.name}</p>
                                <p className="text-blue-950 font-black text-xs mt-1">₹{p.saleRate}</p>
                                <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setCart([...cart, {...p, qty: 1}]) }} className="w-full bg-blue-950 text-white py-1.5 mt-2 rounded-lg text-[8px] font-black">ADD</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allProducts
                .filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-3xl border-2 border-slate-50 flex flex-col items-center shadow-sm">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-16 object-contain" onError={(e: any) => e.target.src = `https://loremflickr.com/150/150/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[8px] font-black uppercase text-center h-8 mt-2 text-slate-700 leading-tight">{p.name}</h3>
                    <p className="font-black text-blue-950 text-xs mt-2">₹{p.saleRate}</p>
                    <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setCart([...cart, {...p, qty: 1}]) }} className="w-full bg-blue-950 text-white py-2 mt-2 rounded-xl text-[8px] font-black uppercase">Add to Cart</button>
                  </div>
                ))}
            </div>
          </>
        )}

        {activeTab === 'login' && (
            <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-[2.5rem] shadow-xl text-center border-4 border-blue-50">
                <h2 className="text-xl font-black text-blue-950 uppercase italic mb-6">Customer Login</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Phone Number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <textarea placeholder="Full Address" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 h-20" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                    <button onClick={handleLogin} className="w-full bg-blue-950 text-white py-4 rounded-[2rem] font-black uppercase text-xs">Login Now</button>
                </div>
            </div>
        )}

        {activeTab === 'history' && (
            <div className="max-w-md mx-auto mt-4 px-2">
                <h2 className="text-lg font-black text-blue-950 mb-4 uppercase italic underline">Order History</h2>
                {foundOrders.map(o => (
                    <div key={o.id} className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-2 border-b border-dashed pb-2">
                            <div><p className="text-[9px] font-black text-blue-950">{o.id}</p><p className="text-[7px] font-bold text-slate-400">{o.date}</p></div>
                            <p className="font-black text-blue-900 text-sm italic">₹{o.total}</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-600 mb-3 uppercase leading-tight">{o.items}</p>
                        <button onClick={() => handleReorder(o.items)} className="w-full bg-green-50 text-green-700 py-2 rounded-xl font-black text-[8px] uppercase border border-green-200 flex items-center justify-center gap-1"> <RefreshCw size={12}/> Re-Order </button>
                    </div>
                ))}
            </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex justify-around items-center z-40 shadow-2xl">
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center ${activeTab === 'shop' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <ShoppingBag size={24}/><span className="text-[8px] font-black uppercase mt-1">Store</span> </button>
        <button onClick={() => { if(!isLoggedIn) { setActiveTab('login'); return; } setActiveTab('history'); }} className={`flex flex-col items-center ${activeTab === 'history' || activeTab === 'login' ? 'text-blue-950 scale-110' : 'text-slate-300'}`}> <History size={24}/><span className="text-[8px] font-black uppercase mt-1">Orders</span> </button>
      </nav>

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
            <div className="p-5 border-t bg-slate-100 rounded-t-[2rem]">
              <div className="flex justify-between font-black mb-4 uppercase text-[10px] px-2"><span>Grand Total:</span><span className="text-xl text-blue-950 italic">₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <div className="bg-red-100 text-red-600 p-3 rounded-xl text-[8px] font-black text-center mb-4 uppercase">Min Order ₹{MIN_ORDER_VALUE} needed</div>
              ) : (
                <button onClick={handleOrderProcess} className="w-full bg-blue-950 text-white py-4 rounded-[2rem] font-black uppercase text-[10px]">Complete Order</button>
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
    products.push({ id: `item-${i}`, name: cols[0], barcode: cols[1] || '', category: cols[2] || 'General', mrp: parseFloat(cols[4]) || 0, saleRate: parseFloat(cols[5]) || 0 });
  }
  return products;
}

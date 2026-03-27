import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, User, RefreshCw, 
  Flame, Banknote, Smartphone, CheckCircle2, Truck, ExternalLink, Mic, Clock, MapPin, Share2, Star, Phone, Info
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
  const [selectedCategory, setSelectedCategory] = useState('DEALS');
  const [payMethod, setPayMethod] = useState<'COD' | 'UPI' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', homeAddr: '' });
  const [cart, setCart] = useState<any[]>([]);
  const [foundOrders, setFoundOrders] = useState<any[]>([]);

  // डेटा लोड करने का सबसे सेफ तरीका
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        setAllProducts(parsed);
        
        // लोकल स्टोरेज से डेटा उठाना
        const savedUser = localStorage.getItem('NM_MART_USER_DATA');
        if (savedUser) {
          setCustomer(JSON.parse(savedUser));
          setIsLoggedIn(true);
        }
        setLoading(false);
      } catch (err) {
        console.error("Data Load Error:", err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // फिल्ट्रेशन लॉजिक
  const dealProducts = allProducts.filter(p => p.mrp > 0 && ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50);
  const categories = ['DEALS', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
  
  const totalBill = cart.reduce((s, i) => s + (i.saleRate * (i.qty || 1)), 0);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=NMMART&am=${totalBill}&cu=INR`;

  const handleOrder = () => {
    const orderID = `NM-${Date.now().toString().slice(-4)}`;
    const itemsStr = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const orderData = { id: orderID, date: new Date().toLocaleDateString(), ...customer, items: itemsStr, total: totalBill, status: 'Packed' };
    
    const oldOrders = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...oldOrders]));
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Order%20ID:%20${orderID}%20Total:%20Rs.${totalBill}`, '_blank');
    setCart([]); setIsCartOpen(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900">NM MART LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400 shadow-lg">
        <div><h1 className="text-xl font-black italic">NM MART</h1><p className="text-[7px] text-amber-400 font-bold uppercase">Manjhanpur Pro</p></div>
        <button onClick={() => setIsCartOpen(true)} className="relative bg-white text-blue-950 p-2 rounded-xl">
          <ShoppingCart size={20}/>
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] px-1.5 rounded-full ring-2 ring-white font-bold">{cart.length}</span>}
        </button>
      </header>

      <main className="p-4 max-w-xl mx-auto">
        {activeTab === 'shop' && (
          <>
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <input type="text" placeholder="Search Maggi, Soap..." className="w-full p-4 pl-12 rounded-2xl border-2 border-slate-100 font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
              </div>
              <button className="bg-blue-950 text-white p-4 rounded-2xl shadow-lg"><Mic size={20}/></button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-950 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  {cat === 'DEALS' ? '🔥 50% Deals' : cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(selectedCategory === 'DEALS' ? dealProducts : allProducts.filter(p => p.category === selectedCategory))
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-3xl border-2 border-slate-50 shadow-sm flex flex-col items-center relative">
                    {p.mrp > p.saleRate && <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 text-[7px] font-black rounded-full italic">OFF</div>}
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain mb-2" onError={(e: any) => e.target.src = "https://placehold.co/100x100?text=NM+MART"}/>
                    <h3 className="text-[9px] font-black uppercase text-center h-8 leading-tight">{p.name}</h3>
                    <p className="font-black text-blue-950 mt-1">₹{p.saleRate}</p>
                    <button onClick={() => { if(!isLoggedIn) {setActiveTab('login'); return;} setCart([...cart, {...p, qty: 1}])}} className="w-full bg-blue-950 text-white py-2.5 mt-2 rounded-xl text-[9px] font-black uppercase shadow-md active:scale-95">ADD TO CART</button>
                  </div>
              ))}
            </div>

            <footer className="mt-12 bg-blue-50 p-8 rounded-[2.5rem] border-2 border-blue-100 text-center">
                <h2 className="text-blue-950 font-black italic uppercase underline decoration-amber-400 mb-4 tracking-wider">NM MART - मंझनपुर</h2>
                <p className="text-slate-500 font-bold text-[9px] uppercase leading-relaxed italic">Near B.P. Public School, Manjhanpur, UP<br/>Support: +91 7081154604</p>
            </footer>
          </>
        )}

        {activeTab === 'login' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-blue-950 mt-10">
            <h2 className="text-center font-black italic text-blue-950 mb-6 uppercase">NM Mart Login</h2>
            <input type="text" placeholder="Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 mb-4" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
            <input type="tel" placeholder="Phone" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 mb-4" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
            <textarea placeholder="Address" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 mb-6" value={customer.homeAddr} onChange={e => setCustomer({...customer, homeAddr: e.target.value})}/>
            <button onClick={() => { localStorage.setItem('NM_MART_LOGGED_IN', 'true'); localStorage.setItem('NM_MART_USER_DATA', JSON.stringify(customer)); setIsLoggedIn(true); setActiveTab('shop'); }} className="w-full bg-blue-950 text-white py-5 rounded-3xl font-black uppercase shadow-lg">Login</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-around shadow-2xl rounded-t-[2.5rem] z-40">
        <button onClick={() => setActiveTab('shop')} className={activeTab === 'shop' ? 'text-blue-950' : 'text-slate-300'}><ShoppingBag size={28}/></button>
        <button onClick={() => setActiveTab('login')} className={activeTab === 'login' ? 'text-blue-950' : 'text-slate-300'}><User size={28}/></button>
      </nav>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col border-l-4 border-blue-950">
            <div className="p-5 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs"><span>BAG ({cart.length})</span><X className="cursor-pointer" onClick={() => setIsCartOpen(false)}/></div>
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[9px] font-black uppercase truncate w-32">{item.name}</span>
                  <span className="font-black text-blue-950">₹{item.saleRate}</span>
                </div>
              ))}
              {totalBill >= MIN_ORDER_VALUE && (
                <div className="p-4 bg-white rounded-2xl border-2 border-blue-50 mt-6 shadow-sm">
                  <p className="text-center font-black text-[9px] uppercase mb-4">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPayMethod('COD')} className={`p-3 rounded-xl border-2 font-black text-[10px] ${payMethod === 'COD' ? 'bg-blue-950 text-white' : 'bg-slate-50'}`}>COD</button>
                    <button onClick={() => setPayMethod('UPI')} className={`p-3 rounded-xl border-2 font-black text-[10px] ${payMethod === 'UPI' ? 'bg-blue-950 text-white' : 'bg-slate-50'}`}>UPI</button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-white">
              <div className="flex justify-between font-black mb-6 text-blue-950 text-xl italic underline underline-offset-4 decoration-amber-400"><span>TOTAL:</span><span>₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[9px] font-black text-center mb-4 uppercase animate-pulse border border-red-100 tracking-tighter italic">Min Order ₹{MIN_ORDER_VALUE} for Home Delivery</div>
              ) : (
                <button onClick={handleOrder} className="w-full bg-blue-950 text-white py-5 rounded-[2rem] font-black uppercase shadow-2xl active:scale-95 transition-all text-xs"> <CheckCircle2 size={18} className="inline mr-2 text-amber-400"/> {payMethod ? 'Confirm Order' : 'Select Payment First'} </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// सबसे मजबूत CSV Parser
function parseCSV(text: string) {
  if (!text) return [];
  const lines = text.split('\n');
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length >= 6) {
      result.push({
        id: `item-${i}`,
        name: cols[0],
        barcode: cols[1],
        category: cols[2],
        unit: cols[3],
        mrp: parseFloat(cols[4]) || 0,
        saleRate: parseFloat(cols[5]) || 0
      });
    }
  }
  return result;
}

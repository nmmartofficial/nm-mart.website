import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, User, LogOut, RefreshCw, 
  Flame, Banknote, Smartphone, CheckCircle2, Truck, ExternalLink, Mic, Clock, MapPin, FileText, Share2, Star, Phone, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🛠️ NM MART CONFIG (SAB KUCH EK SAATH) ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; 
const MIN_ORDER_VALUE = 500;
const STORE_ADDRESS = "Near B.P. Public School, Manjhanpur, Kaushambi, UP";

export default function App() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('DEALS'); // 50% Deals on Front
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
    const orderData = { id: orderID, date: new Date().toLocaleString('en-IN'), ...customer, items: itemsSummary, total: totalBill, method: payMethod, status: 'Packed' };
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=NM%20MART%20Order%3A%20${orderID}%0ATotal%3A%20₹${totalBill}%0AAddress%3A%20${customer.homeAddr}`, '_blank');
    setCart([]); setIsCartOpen(false); setActiveTab('history');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-950 uppercase italic p-10 text-center animate-pulse">NM MART LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
      {/* 🚀 HEADER */}
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-4 border-amber-400">
        <div><h1 className="text-xl font-black italic">NM MART</h1><span className="text-[7px] text-amber-400 uppercase font-bold">Manjhanpur Pro</span></div>
        <button onClick={() => setIsCartOpen(true)} className="relative bg-white text-blue-950 p-2.5 rounded-2xl shadow-lg">
          <ShoppingCart size={20}/>
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 rounded-full ring-2 ring-white">{cart.length}</span>}
        </button>
      </header>

      {/* ⏱️ FLASH SALE */}
      {selectedCategory === 'DEALS' && <div className="bg-red-600 text-white py-1 px-4 text-[9px] font-black uppercase text-center animate-pulse">🔥 Flash Sale Live: 50% OFF Dhamaka!</div>}

      <main className="p-4 max-w-xl mx-auto">
        {activeTab === 'shop' && (
          <>
            {/* SEARCH */}
            <div className="flex gap-2 mb-6">
                <input type="text" placeholder="Maggi, Soap, Rice..." className="flex-1 p-4 pl-12 rounded-2xl border-2 border-slate-100 font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <button className="bg-blue-950 text-white p-4 rounded-2xl shadow-lg"><Mic size={22}/></button>
            </div>

            {/* CATEGORIES (DEALS FRONT PAR) */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-md ${selectedCategory === cat ? 'bg-blue-950 text-white ring-2 ring-amber-400' : 'bg-white text-slate-400'}`}>
                      {cat === 'DEALS' ? '🔥 DEALS' : cat}
                    </button>
                ))}
            </div>

            {/* PRODUCTS */}
            <div className="grid grid-cols-2 gap-4">
                {(selectedCategory === 'DEALS' ? dealProducts : allProducts.filter(p => p.category === selectedCategory))
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center relative">
                        {selectedCategory === 'DEALS' && <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-0.5 text-[7px] font-black uppercase rounded-full tracking-tighter">50% OFF</div>}
                        <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain mb-2" onError={(e: any) => e.target.src = "https://placehold.co/100x100?text=NM+MART"}/>
                        <h3 className="text-[10px] font-black uppercase text-center h-8 leading-tight">{p.name}</h3>
                        <p className="font-black text-blue-950 text-lg mt-1 italic">₹{p.saleRate}</p>
                        <button onClick={() => {if(!isLoggedIn){setActiveTab('login'); return;} setCart([...cart, {...p, qty: 1}])}} className={`w-full py-2.5 mt-2 rounded-xl text-[9px] font-black uppercase shadow-lg ${selectedCategory === 'DEALS' ? 'bg-red-600 text-white' : 'bg-blue-950 text-white'}`}>ADD</button>
                    </div>
                ))}
            </div>

            {/* 🏠 STORE FOOTER (VAAPAS AA GAYA) */}
            <div className="mt-12 bg-blue-50 p-8 rounded-[3rem] border-2 border-blue-100 text-center space-y-4">
                <h2 className="text-blue-950 font-black italic text-lg uppercase underline decoration-amber-400">NM MART - मंझनपुर</h2>
                <div className="flex flex-col items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
                    <span className="flex items-center gap-2 text-blue-900"><MapPin size={14}/> {STORE_ADDRESS}</span>
                    <span className="flex items-center gap-2 text-blue-900"><Phone size={14}/> Support: +91 7081154604</span>
                    <span className="flex items-center gap-2 text-blue-900"><Info size={14}/> Monday - Sunday: 9 AM - 9 PM</span>
                </div>
                <button onClick={() => window.open('https://maps.google.com/?q=B.P.Public+School+Manjhanpur', '_blank')} className="bg-white text-blue-950 px-6 py-2 rounded-full font-black text-[9px] uppercase border border-blue-200 shadow-sm">View on Maps</button>
            </div>
          </>
        )}

        {/* LOGIN TAB */}
        {activeTab === 'login' && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-blue-950 mt-10">
                <h2 className="text-center font-black italic text-blue-950 mb-6 uppercase tracking-widest text-lg underline decoration-amber-400">Welcome to NM MART</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <textarea placeholder="Delivery Address" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100" value={customer.homeAddr} onChange={e => setCustomer({...customer, homeAddr: e.target.value})}/>
                    <button onClick={() => {localStorage.setItem('NM_MART_LOGGED_IN', 'true'); localStorage.setItem('NM_MART_USER_DATA', JSON.stringify(customer)); setIsLoggedIn(true); setActiveTab('shop');}} className="w-full bg-blue-950 text-white py-5 rounded-3xl font-black uppercase shadow-2xl">Start Shopping</button>
                </div>
            </div>
        )}

        {/* ORDER HISTORY TAB */}
        {activeTab === 'history' && (
            <div className="space-y-6">
                <div className="bg-blue-950 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                    <h2 className="text-2xl font-black italic">₹{foundOrders.length * 10} Points</h2>
                    <p className="text-[10px] uppercase font-bold text-amber-400">NM Loyalty Rewards</p>
                    <div className="absolute -right-4 -bottom-4 bg-amber-400 w-24 h-24 rounded-full blur-3xl opacity-20"></div>
                </div>
                {foundOrders.map(o => (
                    <div key={o.id} className="bg-white p-5 rounded-[2rem] shadow-md border-2 border-slate-50 relative">
                        <div className="absolute top-0 right-0 bg-blue-100 text-blue-950 px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-tighter"> <Truck size={10} className="inline mr-1"/> {o.status}</div>
                        <p className="text-[10px] font-black text-blue-950">{o.id}</p>
                        <p className="text-[8px] font-bold text-slate-400 italic mb-2">{o.date}</p>
                        <p className="text-[8px] font-bold text-slate-500 mb-4 uppercase leading-tight bg-slate-50 p-2 rounded-lg">{o.items}</p>
                        <div className="flex gap-3">
                            <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Track%20Order%20${o.id}`)} className="flex-1 bg-blue-50 text-blue-950 py-3 rounded-2xl font-black text-[9px] uppercase">TRACKING</button>
                            <button onClick={() => setIsCartOpen(true)} className="flex-1 bg-amber-400 text-blue-950 py-3 rounded-2xl font-black text-[9px] uppercase shadow-lg">RE-ORDER</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-around shadow-[0_-15px_40px_rgba(0,0,0,0.1)] rounded-t-[3rem] z-40">
        <button onClick={() =>

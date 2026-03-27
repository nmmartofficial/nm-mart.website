import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, Banknote, Smartphone, User, CheckCircle2, MapPin, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🛠️ CONFIG (अब्दुल भाई की सेटिंग्स) ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; 
const MIN_ORDER_VALUE = 500;
// आपका नया गूगल स्क्रिप्ट URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-0GnSZcmnvqTASMD7_wAcYTAV8rVXMV20c67yT14Gd7Rr0ZfGU1T8EkyVIcEx5Hazkg/exec";

export default function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  
  // ऑटो-फिल के लिए ग्राहक का डेटा याद रखना
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('NM_MART_USER_DATA');
    return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
  });

  const [cart, setCart] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [foundOrders, setFoundOrders] = useState([]);

  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { 
        setAllProducts(parseCSV(csv)); 
        setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);

  // --- मोबाइल नंबर से हिस्ट्री खोजना ---
  const handleSearchHistory = () => {
    const allOrders = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    const results = allOrders.filter(o => o.phone === searchPhone);
    setFoundOrders(results);
    if(results.length === 0) alert("Is number par koi record nahi mila.");
  };

  // --- असली आर्डर प्रोसेस (Google Sheet + WhatsApp) ---
  const handleOrderProcess = async () => {
    if(!customer.name || !customer.phone || !customer.address) return alert("Bhai, saari jankari bhariye!");
    
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleString('en-IN');
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');

    const orderData = {
        id: orderID,
        date: dateStr,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        items: itemsSummary,
        total: totalBill,
        method: payMethod === 'UPI' ? 'ONLINE' : 'CASH'
    };

    // 1. Google Sheet में डेटा भेजना (Background में)
    try {
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
    } catch (e) { console.log("Sheet error", e); }

    // 2. लोकल मेमोरी अपडेट (History & Auto-fill के लिए)
    localStorage.setItem('NM_MART_USER_DATA', JSON.stringify(customer));
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));

    // 3. व्हाट्सएप मैसेज तैयार करना
    const msg = `*NM MART - NEW ORDER*\n🆔 ID: ${orderID}\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n💰 *PAYMENT: ${orderData.method}*\n\n*ITEMS:*\n${cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate * i.qty}`).join('\n')}\n\n*TOTAL: ₹${totalBill}*`;

    if (payMethod === 'UPI') {
      window.location.href = `upi://pay?pa=${UPI_ID}&pn=NM%20MART&am=${totalBill}&cu=INR`;
      setTimeout(() => { window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank'); }, 3000);
    } else {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    setCart([]); setIsCartOpen(false); setShowForm(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic animate-pulse">NM MART LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans">
      {/* Header Section */}
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-2 border-amber-400 shadow-xl">
        <h1 className="text-xl font-black italic tracking-tighter" onClick={() => setActiveTab('shop')}>NM MART</h1>
        <div className="flex gap-4">
            <button onClick={() => setActiveTab(activeTab === 'shop' ? 'history' : 'shop')} className="text-amber-400 flex flex-col items-center">
               {activeTab === 'shop' ? <History size={22}/> : <ShoppingBag size={22}/>}
               <span className="text-[7px] font-black uppercase mt-1">{activeTab === 'shop' ? 'History' : 'Shop'}</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-blue-950 px-3 py-1 rounded-xl font-black flex items-center gap-1 shadow-md">
              <ShoppingCart size={16}/> ₹{totalBill}
            </button>
        </div>
      </header>

      {activeTab === 'shop' ? (
        <main className="max-w-4xl mx-auto px-4 mt-6">
            {/* Search Bar */}
            <div className="relative mb-6">
                <input type="text" placeholder="Search Maggi, Soap, Oil..." className="w-full p-4 pl-12 rounded-3xl shadow-sm border-2 border-slate-100 font-bold bg-white focus:border-blue-950 outline-none transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
            </div>
            
            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white p-3 rounded-[2rem] border-2 border-slate-50 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-24 object-contain" onError={(e) => e.target.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[10px] font-black uppercase text-center h-8 mt-3 text-slate-700 leading-tight px-2">{p.name}</h3>
                    <div className="w-full flex justify-between items-center mt-4 bg-slate-50 p-2 rounded-2xl">
                        <p className="font-black text-blue-950 text-sm ml-1">₹{p.saleRate}</p>
                        {inCart ? (
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-blue-950/10 shadow-sm">
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))} className="text-blue-950"><Minus size={14}/></button>
                            <span className="font-black text-xs text-blue-950">{inCart.qty}</span>
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i))} className="text-blue-950"><Plus size={14}/></button>
                        </div>
                        ) : ( <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="bg-blue-950 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-transform">Add</button> )}
                    </div>
                  </div>
                )
              })}
            </div>
        </main>
      ) : (
        /* History Section */
        <main className="max-w-md mx-auto px-4 mt-10">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-blue-950/5 relative overflow-hidden">
                <h2 className="text-xl font-black text-blue-950 mb-2 uppercase italic tracking-tighter">My Account</h2>
                <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest italic">Enter mobile number to see past orders</p>
                <div className="flex gap-2">
                    <input type="tel" placeholder="10 Digit Number" className="flex-1 p-4 bg-slate-50 rounded-2xl font-black text-sm outline-none border-2 border-slate-100 focus:border-amber-400" value={searchPhone} onChange={e => setSearchPhone(e.target.value)}/>
                    <button onClick={handleSearchHistory} className="bg-blue-950 text-white px-6 rounded-2xl font-black shadow-lg">GO</button>
                </div>
            </div>
            
            <div className="mt-8 space-y-4">
                {foundOrders.map(o => (
                    <div key={o.id} className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-slate-50 border-l-amber-400 border-l-8">
                        <div className="flex justify-between items-start border-b pb-3 mb-3 border-dashed border-slate-200">
                            <div><p className="font-black text-blue-950 text-[10px] uppercase">{o.id}</p><p className="text-[9px] font-bold text-slate-400">{o.date}</p></div>
                            <div className="text-right"><p className="text-lg font-black text-blue-950 italic">₹{o.total}</p><p className="text-[8px] font-black text-green-600 uppercase italic">Paid</p></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic uppercase">{o.items}</p>
                    </div>
                ))}
            </div>
        </main>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col">
            <div className="p-5 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs"><span>Your Bag ({cart.length})</span><X size={24} onClick={() => setIsCartOpen(false)}/></div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!showForm ? (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-700 truncate w-32">{item.name} x {item.qty}</span>
                    <span className="font-black text-blue-950 text-sm">₹{item.saleRate * item.qty}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => setPayMethod('CASH')} className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'CASH' ? 'border-blue-950 bg-blue-50 shadow-md scale-105' : 'border-slate-100 text-slate-300'}`}>
                        <Banknote size={28}/><span className="text-[9px] font-black uppercase">Cash (COD)</span>
                    </button>
                    <button onClick={() => setPayMethod('UPI')} className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'UPI' ? 'border-blue-950 bg-blue-50 shadow-md scale-105' : 'border-slate-100 text-slate-300'}`}>
                        <Smartphone size={28}/><span className="text-[9px] font-black uppercase">Pay Online</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Your Name" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs outline-none focus:border-blue-950 border-2 border-transparent" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Phone Number" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs outline-none focus:border-blue-950 border-2 border-transparent" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <textarea placeholder="Delivery Address" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs h-24 outline-none focus:border-blue-950 border-2 border-transparent" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-slate-50 rounded-t-[3rem] shadow-inner">
              <div className="flex justify-between font-black mb-6 uppercase text-xs px-2"><span>Grand Total:</span><span className="text-2xl text-blue-950 italic">₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <div className="bg-red-50 text-red-500 p-3 rounded-2xl text-[10px] font-black text-center mb-4 border border-red-100 italic uppercase">⚠️ Minimum Order ₹{MIN_ORDER_VALUE} Required</div>
              ) : (
                showForm ? (
                  <button onClick={handleOrderProcess} className="w-full bg-blue-950 text-white py-5 rounded-[2rem] font-black shadow-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                    {payMethod === 'UPI' ? <><Smartphone size={20}/> PAY & ORDER</> : <><CheckCircle2 size={20}/> CONFIRM COD ORDER</>}
                  </button>
                ) : <button onClick={() => setShowForm(true)} disabled={cart.length === 0} className="w-full bg-blue-950 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 disabled:opacity-50">Checkout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- CSV PARSER (एक्सेल डेटा के लिए) ---
function parseCSV(text) {
  const lines = text.split('\n');
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || !row.trim()) continue;
    const cols = row.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (!cols[0]) continue; 
    products.push({
      id: `item-${i}`, name: cols[0], barcode: cols[1] || '', category: cols[2] || 'General',
      mrp: parseFloat(cols[4]) || 0, saleRate: parseFloat(cols[5]) || 0
    });
  }
  return products;
}

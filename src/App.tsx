import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, Send, 
  CheckCircle2, CreditCard, Clock, History, ShoppingBag, ChevronDown, ChevronUp, Banknote, Tag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIG ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; 
const MIN_ORDER_VALUE = 500;
const KAUSHAMBI_PINCODES = ["212201", "212202", "212204", "212206", "212207", "212208", "212214", "212216", "212217", "212218"];

// --- CSV PARSER ---
function parseCSV(text: string) {
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

export default function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [payMethod, setPayMethod] = useState('CASH');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [cart, setCart] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const [orderHistory, setOrderHistory] = useState(() => {
    const saved = localStorage.getItem('nm_mart_history_v18');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { setAllProducts(parseCSV(csv)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...new Set(allProducts.map(p => p.category))], [allProducts]);
  const filteredProducts = allProducts.filter(p => (activeCat === 'All' || p.category === activeCat) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);
  const isServiceable = useMemo(() => KAUSHAMBI_PINCODES.includes(customer.pincode.trim()), [customer.pincode]);

  const handleFinalSubmit = () => {
    if(!customer.name || !customer.phone || !customer.address || !customer.pincode) return alert("Details bharein!");
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsList = cart.map(i => ({ name: i.name, qty: i.qty, price: i.saleRate }));
    const itemsText = itemsList.map(i => `• ${i.name} [x${i.qty}] = ₹${i.price * i.qty}`).join('\n');
    const msg = `*NM MART - NEW ORDER*\n🆔 ID: ${orderID}\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n💰 *PAYMENT: ${payMethod}*\n\n*ITEMS:*\n${itemsText}\n\n*TOTAL: ₹${totalBill}*`;

    const newOrder = { id: orderID, date: new Date().toLocaleString(), total: totalBill, items: itemsList, method: payMethod };
    setOrderHistory([newOrder, ...orderHistory]);
    localStorage.setItem('nm_mart_history_v18', JSON.stringify([newOrder, ...orderHistory]));

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]); setIsCartOpen(false); setShowForm(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic animate-pulse">NM MART...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
      <header className="bg-[#0F172A] text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-2 border-amber-400 shadow-2xl">
        <h1 className="text-2xl font-black italic tracking-tighter" onClick={() => setActiveTab('shop')}>NM MART</h1>
        <div className="flex gap-5">
            <button onClick={() => setActiveTab(activeTab === 'shop' ? 'history' : 'shop')} className="text-amber-400 flex flex-col items-center justify-center">
               {activeTab === 'shop' ? <History size={22}/> : <ShoppingBag size={22}/>}
               <span className="text-[8px] font-black uppercase mt-1">{activeTab === 'shop' ? 'History' : 'Shop'}</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-[#0F172A] px-4 py-1 rounded-xl font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
              <ShoppingCart size={18}/> ₹{totalBill}
            </button>
        </div>
      </header>

      {activeTab === 'shop' ? (
        <>
          {/* --- BIGGER & BEAUTIFUL CATEGORIES --- */}
          <div className="bg-white shadow-md sticky top-[68px] z-40 p-4 overflow-x-auto no-scrollbar border-b">
            <div className="flex gap-3">
                {categories.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setActiveCat(cat)} 
                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase whitespace-nowrap transition-all duration-300 flex items-center gap-2 border-2 ${activeCat === cat ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl translate-y-[-2px]' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                >
                    <Tag size={12} className={activeCat === cat ? 'text-amber-400' : 'text-slate-300'}/>
                    {cat}
                </button>
                ))}
            </div>
          </div>

          <main className="max-w-4xl mx-auto px-4 mt-6">
            <div className="relative mb-6">
                <input type="text" placeholder="Maggi, Soap, Rice..." className="w-full p-4 pl-12 rounded-2xl shadow-sm border-none font-bold text-slate-700 bg-white ring-1 ring-slate-100 focus:ring-2 focus:ring-amber-400 transition-all outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <Search className="absolute left-4 top-4 text-slate-400" size={20}/>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white p-3 rounded-3xl border border-slate-100 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-24 object-contain" onError={(e) => e.target.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[10px] font-black uppercase text-center h-8 overflow-hidden mt-3 text-slate-700 leading-tight">{p.name}</h3>
                    <div className="w-full flex justify-between items-center mt-3 bg-slate-50 p-2 rounded-2xl">
                        <p className="font-black text-[#0F172A] text-sm">₹{p.saleRate}</p>
                        {inCart ? (
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-inner border border-slate-200">
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))}><Minus size={14}/></button>
                            <span className="font-black text-xs text-[#0F172A]">{inCart.qty}</span>
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i))}><Plus size={14}/></button>
                        </div>
                        ) : ( <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="bg-[#0F172A] text-white p-2 rounded-xl shadow-lg hover:bg-amber-400 hover:text-black transition-colors"><Plus size={16}/></button> )}
                    </div>
                  </div>
                )
              })}
            </div>
          </main>
        </>
      ) : (
        /* History Tab */
        <main className="max-w-2xl mx-auto px-4 mt-8">
            <h2 className="font-black uppercase text-sm mb-6 flex items-center gap-2 text-[#0F172A]"><History size={18}/> My Purchases</h2>
            {orderHistory.map(o => (
                <div key={o.id} className="bg-white rounded-3xl border border-slate-200 mb-3 shadow-sm overflow-hidden">
                    <div className="p-4 flex justify-between items-center cursor-pointer active:bg-slate-50" onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                        <div>
                            <p className="font-black text-[10px] text-[#0F172A] uppercase tracking-widest">{o.id}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{o.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-green-600">₹{o.total}</p>
                            <div className="flex items-center gap-1 justify-end uppercase text-[8px] font-black text-slate-400">
                                {o.method === 'CASH' ? <Banknote size={10}/> : <CreditCard size={10}/>} {o.method}
                            </div>
                        </div>
                    </div>
                    {expandedOrder === o.id && (
                        <div className="px-4 pb-4 bg-[#F8FAFC] border-t border-dashed border-slate-200">
                            <p className="text-[9px] font-black text-slate-400 uppercase py-2">Items Bought:</p>
                            {o.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                                    <span className="text-[10px] font-bold text-slate-600">{item.name} <span className="text-[#0F172A]">x{item.qty}</span></span>
                                    <span className="text-[10px] font-black">₹{item.price * item.qty}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </main>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col">
            <div className="p-5 bg-[#0F172A] text-white flex justify-between items-center font-black uppercase text-sm tracking-widest">
                <span className="flex items-center gap-2"><ShoppingCart size={18} className="text-amber-400"/> Bag ({cart.length})</span>
                <X onClick={() => setIsCartOpen(false)} className="cursor-pointer hover:rotate-90 transition-transform"/>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!showForm ? (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-700 truncate w-32">{item.name}</span><span className="text-[9px] font-bold text-slate-400">₹{item.saleRate} per unit</span></div>
                    <div className="font-black text-[#0F172A] text-xs">₹{item.saleRate * item.qty} <span className="text-[10px] text-slate-400 ml-1">x{item.qty}</span></div>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => setPayMethod('CASH')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'CASH' ? 'border-[#0F172A] bg-blue-50 shadow-md' : 'border-slate-100 text-slate-400'}`}>
                        <Banknote size={24}/>
                        <span className="text-[10px] font-black">CASH</span>
                    </button>
                    <button onClick={() => setPayMethod('UPI')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'UPI' ? 'border-[#0F172A] bg-blue-50 shadow-md' : 'border-slate-100 text-slate-400'}`}>
                        <CreditCard size={24}/>
                        <span className="text-[10px] font-black">UPI PAY</span>
                    </button>
                  </div>
                  {payMethod === 'UPI' && (
                    <div className="bg-white p-4 rounded-3xl text-center border-2 border-[#0F172A] border-dashed shadow-inner">
                      <p className="text-[9px] font-black mb-2 text-[#0F172A] uppercase">Scan QR to pay</p>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${UPI_ID}%26pn=NM%20MART%26am=${totalBill}%26cu=INR`} className="mx-auto w-32 h-32 rounded-xl shadow-lg border-4 border-white"/>
                    </div>
                  )}
                  <div className="space-y-3">
                    <input type="text" placeholder="Your Name" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-[#0F172A]" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-[#0F172A]" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <textarea placeholder="Complete Address" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs h-20 outline-none focus:ring-2 focus:ring-[#0F172A]" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                    <input type="text" placeholder="Pincode" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-[#0F172A]" value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})}/>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-slate-50 rounded-t-[2.5rem] shadow-inner">
              <div className="flex justify-between font-black mb-5">
                <span className="text-slate-400 text-xs uppercase">Order Value:</span>
                <span className="text-2xl text-[#0F172A] italic">₹{totalBill}</span>
              </div>
              {totalBill < MIN_ORDER_VALUE ? (
                <p className="text-[10px] text-red-500 font-black text-center mb-4 italic uppercase">⚠️ Minimum ₹{MIN_ORDER_VALUE} Needed</p>
              ) : (
                showForm ? <button onClick={handleFinalSubmit} className="w-full bg-[#0F172A] text-white py-5 rounded-[2rem] font-black shadow-2xl uppercase tracking-[0.2em] text-xs active:scale-95 transition-transform">Send WhatsApp</button>
                : <button onClick={() => setShowForm(true)} disabled={cart.length === 0} className="w-full bg-[#0F172A] text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-transform">Checkout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

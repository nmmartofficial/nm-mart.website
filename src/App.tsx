import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, Send, 
  CheckCircle2, CreditCard, Clock, History, ShoppingBag, ChevronDown, ChevronUp 
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
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [cart, setCart] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const [orderHistory, setOrderHistory] = useState(() => {
    const saved = localStorage.getItem('nm_mart_history_v12');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { setAllProducts(parseCSV(csv)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...new Set(allProducts.map(p => p.category))], [allProducts]);
  const filteredProducts = allProducts.filter(p => (activeCat === 'All' || p.category === activeCat) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);
  const isServiceable = useMemo(() => KAUSHAMBI_PINCODES.includes(customer.pincode.trim()), [customer.pincode]);
  const isStoreOpen = useMemo(() => { const h = new Date().getHours(); return h >= 8 && h < 22; }, []);

  const handleFinalSubmit = () => {
    if(!customer.name || !customer.phone || !customer.address || !customer.pincode) return alert("Details bharein!");
    
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsList = cart.map(i => ({ name: i.name, qty: i.qty, price: i.saleRate }));
    const itemsText = itemsList.map(i => `• ${i.name} [x${i.qty}] = ₹${i.price * i.qty}`).join('\n');
    const timingMsg = isStoreOpen ? "20 min delivery" : "Morning 8 AM delivery";
    
    const msg = `*NM MART - NEW ORDER*\n🆔 ID: ${orderID}\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n\n*ITEMS:*\n${itemsText}\n\n*TOTAL: ₹${totalBill}*\n_${timingMsg}_`;

    // History Update (Saving Item Details)
    const newOrder = { 
        id: orderID, 
        date: new Date().toLocaleString(), 
        total: totalBill, 
        items: itemsList 
    };
    const updatedHistory = [newOrder, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem('nm_mart_history_v12', JSON.stringify(updatedHistory));

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]); setIsCartOpen(false); setShowForm(false);
    alert("Order Details WhatsApp par bhej di gayi hain!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic uppercase">NM MART LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-2 border-amber-400">
        <h1 className="text-xl font-black italic tracking-tighter" onClick={() => setActiveTab('shop')}>NM MART</h1>
        <div className="flex gap-4">
            <button onClick={() => setActiveTab(activeTab === 'shop' ? 'history' : 'shop')} className="text-amber-400 flex flex-col items-center">
               {activeTab === 'shop' ? <History size={20}/> : <ShoppingBag size={20}/>}
               <span className="text-[7px] font-black uppercase tracking-widest">{activeTab === 'shop' ? 'History' : 'Store'}</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-blue-950 px-3 py-1 rounded-lg font-black flex items-center gap-1">
              <ShoppingCart size={16}/> ₹{totalBill}
            </button>
        </div>
      </header>

      {activeTab === 'shop' ? (
        <>
          <div className="bg-white shadow-sm sticky top-[60px] z-40 flex gap-2 p-2 overflow-x-auto no-scrollbar border-b">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all ${activeCat === cat ? 'bg-blue-950 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-500'}`}>
                {cat}
              </button>
            ))}
          </div>
          <main className="max-w-4xl mx-auto px-4 mt-4">
            <div className="relative mb-4">
                <input type="text" placeholder="Search Maggi, Soap, Rice..." className="w-full p-3 pl-10 rounded-xl shadow-sm border-none font-bold text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white p-2 rounded-2xl border flex flex-col items-center shadow-sm">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain" onError={(e) => e.target.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[9px] font-black uppercase text-center h-6 overflow-hidden mt-2 text-slate-600">{p.name}</h3>
                    <p className="font-black text-blue-900 mt-1">₹{p.saleRate}</p>
                    {inCart ? (
                      <div className="flex items-center gap-4 bg-slate-100 px-3 py-1 rounded-lg mt-1 border">
                        <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))}><Minus size={12}/></button>
                        <span className="font-bold text-xs">{inCart.qty}</span>
                        <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i))}><Plus size={12}/></button>
                      </div>
                    ) : ( <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full mt-1 bg-blue-950 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter">Add to Bag</button> )}
                  </div>
                )
              })}
            </div>
          </main>
        </>
      ) : (
        /* --- DETAILED HISTORY TAB --- */
        <main className="max-w-2xl mx-auto px-4 mt-6">
          <h2 className="font-black uppercase text-sm mb-6 border-l-4 border-amber-400 pl-3 italic tracking-widest">My Order History</h2>
          {orderHistory.length > 0 ? (
            <div className="space-y-3">
              {orderHistory.map(o => (
                <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                  <div className="p-4 flex justify-between items-center cursor-pointer active:bg-slate-50" onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-[10px] text-blue-950 bg-blue-50 px-2 py-0.5 rounded tracking-tighter uppercase">{o.id}</span>
                            <span className="text-[10px] text-green-600 font-black italic">✓ Delivered</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{o.date}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                        <div>
                            <p className="font-black text-blue-950 text-sm">₹{o.total}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{o.items.length} Items</p>
                        </div>
                        {expandedOrder === o.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </div>
                  </div>
                  
                  {/* Expanded Item List */}
                  {expandedOrder === o.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-slate-50 px-4 pb-4 border-t border-dashed">
                        <p className="text-[9px] font-black text-slate-400 uppercase py-2 tracking-widest">Order Details:</p>
                        {o.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-1 border-b border-slate-200 last:border-0">
                                <span className="text-[10px] font-bold text-slate-600 uppercase">{item.name} <span className="text-blue-900">x{item.qty}</span></span>
                                <span className="text-[10px] font-black text-slate-800">₹{item.price * item.qty}</span>
                            </div>
                        ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 opacity-30 font-black italic uppercase tracking-widest">No Orders Yet</div>
          )}
        </main>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col">
            <div className="p-4 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs tracking-widest"><span>My Bag ({cart.length})</span><X onClick={() => setIsCartOpen(false)}/></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!showForm ? (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between text-[10px] font-black border-b border-slate-100 pb-2 uppercase tracking-tighter"><span>{item.name} x {item.qty}</span><span className="text-blue-900 font-black">₹{item.saleRate * item.qty}</span></div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-center border-2 border-white shadow-inner">
                    <p className="text-[9px] font-black mb-1 flex items-center justify-center gap-1 uppercase tracking-widest"><CreditCard size={12}/> Pay via UPI</p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${UPI_ID}%26pn=NM%20MART%26am=${totalBill}%26cu=INR`} className="mx-auto w-28 h-28 rounded-lg shadow-md border-4 border-white"/>
                    <p className="text-[8px] font-bold mt-2 text-slate-400">{UPI_ID}</p>
                  </div>
                  <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-xs" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                  <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-xs" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                  <textarea placeholder="Complete Address" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-xs h-20" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                  <input type="text" placeholder="Pincode" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-xs" value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})}/>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-slate-50 shadow-inner">
              <div className="flex justify-between font-black mb-4 uppercase text-xs"><span>Order Value:</span><span className="text-lg text-blue-950 italic">₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <p className="text-[10px] text-red-500 font-black text-center mb-2 italic">Minimum ₹{MIN_ORDER_VALUE} Order needed</p>
              ) : (
                showForm ? <button onClick={handleFinalSubmit} disabled={!isServiceable} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-xl uppercase tracking-widest text-xs">Confirm & Send WhatsApp</button>
                : <button onClick={() => setShowForm(true)} disabled={cart.length === 0} className="w-full bg-blue-950 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Checkout Now</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

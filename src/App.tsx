import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, Send, 
  CheckCircle2, CreditCard, Clock, History, ShoppingBag, PackageCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIG (अब्दुल भाई, अपना डेटा यहाँ चेक करें) ---
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
  const [orderHistory, setOrderHistory] = useState(() => {
    const saved = localStorage.getItem('nm_mart_history_v10');
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
    if(!customer.name || !customer.phone || !customer.address || !customer.pincode) return alert("Puri jankari bharein!");
    
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsText = cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate * i.qty}`).join('\n');
    const timingMsg = isStoreOpen ? "Hum 20 minute mein deliver kar denge." : "Store abhi band hai, subah 8 baje deliver hoga.";
    
    const msg = `*NM MART - NEW ORDER*\n🆔 ID: ${orderID}\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n📮 ${customer.pincode}\n\n*ITEMS:*\n${itemsText}\n\n*TOTAL: ₹${totalBill}*\n\n_${timingMsg}_`;

    // History Update
    const updatedHistory = [{ id: orderID, date: new Date().toLocaleString(), total: totalBill, items: cart.length }, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem('nm_mart_history_v10', JSON.stringify(updatedHistory));

    // Open WhatsApp & Reset
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]);
    setIsCartOpen(false);
    setShowForm(false);
    alert(`Aapka Order ID: ${orderID} safal raha! WhatsApp par details bhej di gayi hain.`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900">NM MART LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-2 border-amber-400">
        <h1 className="text-xl font-black italic tracking-tighter" onClick={() => setActiveTab('shop')}>NM MART</h1>
        <div className="flex gap-4">
            <button onClick={() => setActiveTab(activeTab === 'shop' ? 'history' : 'shop')} className="text-amber-400 flex flex-col items-center">
               {activeTab === 'shop' ? <History size={20}/> : <ShoppingBag size={20}/>}
               <span className="text-[7px] font-black uppercase">{activeTab === 'shop' ? 'History' : 'Store'}</span>
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
              <button key={cat} onClick={() => setActiveCat(cat)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${activeCat === cat ? 'bg-blue-950 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                {cat}
              </button>
            ))}
          </div>
          <main className="max-w-4xl mx-auto px-4 mt-4 pb-20">
            <input type="text" placeholder="Search..." className="w-full p-3 rounded-xl shadow-sm border-none mb-4 font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white p-2 rounded-xl border flex flex-col items-center shadow-sm">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain" onError={(e) => e.target.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[9px] font-black uppercase text-center h-6 overflow-hidden mt-2">{p.name}</h3>
                    <p className="font-black text-blue-900">₹{p.saleRate}</p>
                    {inCart ? (
                      <div className="flex items-center gap-3 bg-slate-100 px-2 py-1 rounded-lg mt-1">
                        <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))}><Minus size={12}/></button>
                        <span className="font-bold text-xs">{inCart.qty}</span>
                        <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i))}><Plus size={12}/></button>
                      </div>
                    ) : ( <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full mt-1 bg-blue-950 text-white py-1 rounded text-[8px] font-black uppercase">Add</button> )}
                  </div>
                )
              })}
            </div>
          </main>
        </>
      ) : (
        <main className="max-w-4xl mx-auto px-4 mt-6">
          <h2 className="font-black uppercase text-sm mb-4 border-l-4 border-amber-400 pl-2">Order History</h2>
          {orderHistory.map(o => (
            <div key={o.id} className="bg-white p-3 rounded-xl shadow-sm border mb-2 flex justify-between items-center">
              <div><p className="font-black text-[10px] uppercase">Order {o.id}</p><p className="text-[8px] text-slate-400">{o.date}</p></div>
              <p className="font-black text-green-600 text-xs">₹{o.total}</p>
            </div>
          ))}
        </main>
      )}

      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col">
            <div className="p-4 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs"><span>Bag ({cart.length})</span><X onClick={() => setIsCartOpen(false)}/></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!showForm ? (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between text-[10px] font-black border-b pb-2"><span>{item.name} x {item.qty}</span><span>₹{item.saleRate * item.qty}</span></div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-xl text-center border">
                    <p className="text-[9px] font-black mb-1">SCAN & PAY</p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${UPI_ID}%26pn=NM%20MART%26am=${totalBill}%26cu=INR`} className="mx-auto w-24 h-24 border-2 border-white shadow-sm"/>
                  </div>
                  <input type="text" placeholder="Name" className="w-full p-3 bg-slate-100 rounded-lg font-bold text-xs" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                  <input type="tel" placeholder="Mobile" className="w-full p-3 bg-slate-100 rounded-lg font-bold text-xs" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                  <textarea placeholder="Address" className="w-full p-3 bg-slate-100 rounded-lg font-bold text-xs h-16" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                  <input type="text" placeholder="Pincode" className="w-full p-3 bg-slate-100 rounded-lg font-bold text-xs" value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})}/>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex justify-between font-black mb-4"><span>Total:</span><span>₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <p className="text-[9px] text-red-500 font-black text-center mb-2 italic">MIN ORDER ₹{MIN_ORDER_VALUE}</p>
              ) : (
                showForm ? <button onClick={handleFinalSubmit} disabled={!isServiceable} className="w-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg">PLACE ORDER & SEND WHATSAPP</button>
                : <button onClick={() => setShowForm(true)} className="w-full bg-blue-950 text-white py-4 rounded-xl font-black uppercase text-xs">Checkout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

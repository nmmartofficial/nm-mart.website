import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, Banknote, Smartphone, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIG ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; 
const MIN_ORDER_VALUE = 500;

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
  const [payMethod, setPayMethod] = useState('CASH'); // Default is Cash
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { setAllProducts(parseCSV(csv)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...new Set(allProducts.map(p => p.category))], [allProducts]);
  const filteredProducts = allProducts.filter(p => (activeCat === 'All' || p.category === activeCat) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);

  const handleOrderProcess = () => {
    if(!customer.name || !customer.phone || !customer.address) return alert("Bhai, puri details bhariye!");
    
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsText = cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate * i.qty}`).join('\n');
    
    const paymentStatus = payMethod === 'UPI' ? "✅ ONLINE PAYMENT (UPI)" : "💵 CASH ON DELIVERY (COD)";
    const msg = `*NM MART - NEW ORDER*\n🆔 ID: ${orderID}\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n💰 *PAYMENT: ${paymentStatus}*\n\n*ITEMS:*\n${itemsText}\n\n*TOTAL: ₹${totalBill}*`;

    if (payMethod === 'UPI') {
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=NM%20MART&am=${totalBill}&cu=INR`;
      window.location.href = upiUrl;
      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg + "\n\n(Note: Maine Online Pay kar diya hai)")}`, '_blank');
      }, 3000);
    } else {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    setCart([]); setIsCartOpen(false); setShowForm(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic">NM MART LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center border-b-2 border-amber-400">
        <h1 className="text-xl font-black italic tracking-tighter" onClick={() => setActiveTab('shop')}>NM MART</h1>
        <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-blue-950 px-3 py-1 rounded-lg font-black flex items-center gap-1 shadow-md">
          <ShoppingCart size={16}/> ₹{totalBill}
        </button>
      </header>

      {activeTab === 'shop' ? (
        <>
          <div className="bg-white shadow-sm sticky top-[60px] z-40 p-3 overflow-x-auto no-scrollbar border-b flex gap-3">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${activeCat === cat ? 'bg-blue-950 text-white border-blue-950 shadow-lg' : 'bg-white text-slate-500 border-slate-100'}`}>
                {cat}
              </button>
            ))}
          </div>
          <main className="max-w-4xl mx-auto px-4 mt-4">
            <input type="text" placeholder="Search Maggi, Soap..." className="w-full p-4 rounded-2xl shadow-sm border-none font-bold mb-4 bg-white ring-1 ring-slate-100" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white p-3 rounded-3xl border border-slate-100 flex flex-col items-center shadow-sm">
                    <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain" onError={(e) => e.target.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name)}`}/>
                    <h3 className="text-[10px] font-black uppercase text-center h-8 overflow-hidden mt-3 text-slate-700 leading-tight">{p.name}</h3>
                    <div className="w-full flex justify-between items-center mt-3 bg-slate-50 p-2 rounded-xl">
                        <p className="font-black text-blue-950 text-sm">₹{p.saleRate}</p>
                        {inCart ? (
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-inner border border-slate-200">
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))}><Minus size={14}/></button>
                            <span className="font-black text-xs">{inCart.qty}</span>
                            <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i))}><Plus size={14}/></button>
                        </div>
                        ) : ( <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="bg-blue-950 text-white p-2 rounded-lg shadow-md hover:bg-amber-400 transition-colors"><Plus size={16}/></button> )}
                    </div>
                  </div>
                )
              })}
            </div>
          </main>
        </>
      ) : null}

      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col">
            <div className="p-5 bg-blue-950 text-white flex justify-between items-center font-black uppercase text-xs"><span>Bag ({cart.length})</span><X onClick={() => setIsCartOpen(false)}/></div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!showForm ? (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-700 truncate w-32">{item.name} x {item.qty}</span>
                    <span className="font-black text-blue-950 text-xs">₹{item.saleRate * item.qty}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => setPayMethod('CASH')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'CASH' ? 'border-blue-950 bg-blue-50 shadow-md' : 'border-slate-100 text-slate-400'}`}>
                        <Banknote size={24}/>
                        <span className="text-[10px] font-black">CASH (COD)</span>
                    </button>
                    <button onClick={() => setPayMethod('UPI')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'UPI' ? 'border-blue-950 bg-blue-50 shadow-md' : 'border-slate-100 text-slate-400'}`}>
                        <Smartphone size={24}/>
                        <span className="text-[10px] font-black">PAY ONLINE</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                    <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                    <textarea placeholder="Delivery Address" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs h-20" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-slate-50 rounded-t-[2rem]">
              <div className="flex justify-between font-black mb-5 uppercase text-xs"><span>Total Bill:</span><span className="text-2xl text-blue-950 italic">₹{totalBill}</span></div>
              {totalBill < MIN_ORDER_VALUE ? (
                <p className="text-[10px] text-red-500 font-black text-center mb-4 italic uppercase tracking-tighter">⚠️ Minimum ₹{MIN_ORDER_VALUE} needed for delivery</p>
              ) : (
                showForm ? (
                  <button onClick={handleOrderProcess} className="w-full bg-blue-950 text-white py-5 rounded-[1.5rem] font-black shadow-2xl uppercase tracking-[0.1em] text-xs active:scale-95 transition-transform flex items-center justify-center gap-2">
                    {payMethod === 'UPI' ? <><Smartphone size={18}/> PAY NOW & ORDER</> : <><CheckCircle2 size={18}/> CONFIRM COD ORDER</>}
                  </button>
                ) : <button onClick={() => setShowForm(true)} className="w-full bg-blue-950 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">Checkout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

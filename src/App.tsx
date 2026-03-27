import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, Phone, Send, 
  ArrowLeft, MapPin, User, Hash, AlertTriangle, 
  CheckCircle2, ShoppingBag, CreditCard, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SETTINGS (अब्दुल भाई, यहाँ आपका असली डेटा है) ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; // आपका नया UPI ID अपडेट कर दिया गया है
const MIN_ORDER_VALUE = 500;
const KAUSHAMBI_PINCODES = ["212201", "212202", "212204", "212206", "212207", "212208", "212214", "212216", "212217", "212218"];

// --- CSV PARSER ---
function parseCSV(text: string) {
  const lines = text.split('\n');
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || !row.trim()) continue;
    const cols = [];
    let current = '', inQuotes = false;
    for (const char of row) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += char;
    }
    cols.push(current.trim());
    if (!cols[0]) continue; 
    products.push({
      id: `item-${i}`, name: cols[0], barcode: cols[1] || '', category: cols[2] || 'General',
      mrp: parseFloat(cols[4]?.replace(/[^0-9.]/g, '')) || 0,
      saleRate: parseFloat(cols[5]?.replace(/[^0-9.]/g, '')) || 0
    });
  }
  return products;
}

export default function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { setAllProducts(parseCSV(csv)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);
  const isServiceable = useMemo(() => KAUSHAMBI_PINCODES.includes(customer.pincode.trim()), [customer.pincode]);
  const isStoreOpen = useMemo(() => { const h = new Date().getHours(); return h >= 8 && h < 22; }, []);

  const handleOrderSubmit = () => {
    if(!customer.name || !customer.phone || !customer.address || !customer.pincode) return alert("Puri jankari bharein!");
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsText = cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate * i.qty}`).join('\n');
    const fullMsg = `*NM MART - NEW ORDER*\n🆔 ID: ${orderID}\n\n*CUSTOMER:*\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n📮 ${customer.pincode}\n\n*ITEMS:*\n${itemsText}\n\n*TOTAL: ₹${totalBill}*`;

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(fullMsg)}`, '_blank');
    setOrderSuccess(true);
    setCart([]); 
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900">NM MART...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-xl border-b-2 border-amber-400">
        <h1 className="text-xl font-black italic tracking-tighter" onClick={() => window.location.reload()}>NM MART</h1>
        <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-blue-950 px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-lg">
          <ShoppingCart size={18}/> ₹{totalBill}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 pb-20">
        <div className="relative mb-8"><input type="text" placeholder="Maggi, Soap, Rice..." className="w-full p-4 pl-12 rounded-2xl border-none shadow-md font-bold text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/><Search className="absolute left-4 top-4 text-slate-400" size={20}/></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 40).map(p => {
            const inCart = cart.find(i => i.id === p.id);
            return (
              <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm border flex flex-col items-center">
                <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-24 object-contain mb-2" onError={(e) => e.target.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name)}`}/>
                <h3 className="text-[10px] font-black uppercase text-center h-8 overflow-hidden">{p.name}</h3>
                <p className="font-black text-blue-900 mt-1">₹{p.saleRate}</p>
                {inCart ? (
                  <div className="flex items-center gap-3 mt-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))}><Minus size={14}/></button>
                    <span className="font-bold text-xs">{inCart.qty}</span>
                    <button onClick={() => setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i))}><Plus size={14}/></button>
                  </div>
                ) : ( <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full mt-2 bg-blue-950 text-white py-2 rounded-lg text-[9px] font-black">ADD</button> )}
              </div>
            )
          })}
        </div>
      </main>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col">
              {!orderSuccess ? (
                <>
                  <div className="p-4 border-b flex justify-between items-center bg-blue-950 text-white">
                    <span className="font-black">BAG ({cart.length})</span>
                    <X className="cursor-pointer" onClick={() => setIsCartOpen(false)}/>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!showForm ? (
                      cart.map(item => (
                        <div key={item.id} className="flex justify-between bg-slate-50 p-3 rounded-xl border"><span className="text-[9px] font-black uppercase truncate w-32">{item.name}</span><span className="font-bold text-blue-900 text-xs">₹{item.saleRate} x {item.qty}</span></div>
                      ))
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-center border">
                          <p className="text-[10px] font-black text-blue-900 mb-2 uppercase flex items-center justify-center gap-1"><CreditCard size={12}/> Pay via PhonePe/Paytm</p>
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${UPI_ID}%26pn=NM%20MART%26am=${totalBill}%26cu=INR`} className="mx-auto w-32 h-32 rounded border-4 border-white shadow-md"/>
                          <p className="text-[8px] font-bold mt-2 text-slate-500">{UPI_ID}</p>
                        </div>
                        <input type="text" placeholder="Full Name" className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                        <input type="tel" placeholder="Mobile" className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                        <textarea placeholder="Address" className="w-full p-3 bg-slate-100 rounded-xl font-bold h-20" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                        <input type="text" placeholder="Pincode" className={`w-full p-3 rounded-xl font-bold ${!isServiceable && customer.pincode ? 'bg-red-50' : 'bg-slate-100'}`} value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})}/>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t bg-slate-50">
                    <div className="flex justify-between font-black text-blue-950 mb-4"><span>Total:</span><span>₹{totalBill}</span></div>
                    {totalBill < MIN_ORDER_VALUE ? (
                      <p className="text-[10px] text-red-500 font-bold text-center mb-2 italic">Minimum Order ₹{MIN_ORDER_VALUE} required</p>
                    ) : (
                      showForm ? <button onClick={handleOrderSubmit} disabled={!isServiceable} className="w-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg">PLACE ORDER</button>
                      : <button onClick={() => setShowForm(true)} className="w-full bg-blue-950 text-white py-4 rounded-xl font-black uppercase text-xs">Checkout</button>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6">
                  <CheckCircle2 size={64} className="text-green-500" />
                  <h2 className="text-2xl font-black text-blue-950 italic">Order Successful!</h2>
                  <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 font-black text-sm uppercase">
                    आपका ऑर्डर सफल रहा!<br/>
                    {isStoreOpen ? <span className="text-green-600">हम 20 मिनट में सामान पहुँचा देंगे।</span>
                    : <span className="text-amber-600">अभी स्टोर बंद है, सुबह 8 बजे डिलीवरी होगी।</span>}
                  </div>
                  <button onClick={() => {setOrderSuccess(false); setIsCartOpen(false); setShowForm(false);}} className="text-blue-950 font-black text-xs uppercase border-b-2 border-blue-950">Back to Store</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

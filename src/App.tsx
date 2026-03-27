import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, X, Plus, Minus, Loader2, Phone, Send, ArrowLeft, MapPin, User, Hash, AlertTriangle, CheckCircle2, ShoppingBag, CreditCard, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP = "917081154604";
const UPI_ID = "917081154604@paytm"; // Apna sahi UPI ID yahan dalein
const MIN_ORDER_VALUE = 500;
const KAUSHAMBI_PINCODES = ["212201", "212202", "212204", "212206", "212207", "212208", "212214", "212216", "212217", "212218"];

interface Product { id: string; name: string; barcode: string; category: string; mrp: number; saleRate: number; }
interface CartItem extends Product { qty: number; }

function parseCSV(text: string): Product[] {
  const lines = text.split('\n');
  const products: Product[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || !row.trim()) continue;
    const cols: string[] = [];
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nm_mart_cart_final');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('nm_mart_cart_final', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    fetch(SHEET_URL).then(r => r.text()).then(csv => { setAllProducts(parseCSV(csv)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totalBill = cart.reduce((s, i) => s + i.saleRate * i.qty, 0);
  const isServiceable = useMemo(() => KAUSHAMBI_PINCODES.includes(customer.pincode.trim()), [customer.pincode]);
  
  // Store Timing Logic (8 AM to 10 PM)
  const isStoreOpen = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 8 && hour < 22;
  }, []);

  const handleOrderSubmit = () => {
    if(!customer.name || !customer.phone || !customer.address || !customer.pincode) return alert("Puri jankari bharein!");
    if(!isServiceable) return alert("Kshama karein, yahan delivery nahi hai.");

    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " | " + now.toLocaleDateString();
    const itemsText = cart.map(i => `• ${i.name} [x${i.qty}] = ₹${i.saleRate * i.qty}`).join('\n');
    
    const fullMsg = `*NM MART - NEW ORDER*\n🆔 *ID: ${orderID}*\n⏰ *Time: ${timeStr}*\n\n*CUSTOMER:*\n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n📮 ${customer.pincode}\n\n*ITEMS:*\n${itemsText}\n\n*TOTAL: ₹${totalBill}*\n\n_Note: Please send payment screenshot if paid online._`;

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(fullMsg)}`, '_blank');
    setOrderSuccess(true);
    setCart([]); 
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 italic">NM MART...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-50 border-b-2 border-amber-400 flex justify-between items-center shadow-xl">
        <h1 className="text-xl font-black italic tracking-tighter" onClick={() => window.location.assign('/')}>NM MART</h1>
        <button onClick={() => setIsCartOpen(true)} className="bg-amber-400 text-blue-950 px-4 py-2 rounded-xl font-black flex items-center gap-2">
          <ShoppingCart size={18}/> ₹{totalBill}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 mt-12 pb-10">
        <div className="mb-6"><input type="text" placeholder="Search Maggi, Soap, Rice..." className="w-full p-4 rounded-xl shadow-md border font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 40).map(p => {
            const inCart = cart.find(i => i.id === p.id);
            return (
              <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm border flex flex-col hover:border-blue-200">
                <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-28 object-contain mb-2" onError={(e: any) => e.currentTarget.src = `https://loremflickr.com/200/200/${encodeURIComponent(p.name)}`}/>
                <h3 className="text-[10px] font-black uppercase h-8 overflow-hidden">{p.name}</h3>
                <p className="font-black text-blue-900">₹{p.saleRate}</p>
                {inCart ? (
                  <div className="flex justify-between items-center mt-2 bg-blue-50 p-1 rounded-lg">
                    <button onClick={() => setCart(prev => prev.map(i => i.id === p.id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0))}><Minus size={14}/></button>
                    <span className="font-bold text-xs">{inCart.qty}</span>
                    <button onClick={() => setCart(prev => prev.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i))}><Plus size={14}/></button>
                  </div>
                ) : (
                  <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="mt-2 bg-blue-950 text-white py-2 rounded-lg text-[9px] font-black uppercase">Add</button>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-blue-950 z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl p-6 overflow-y-auto">
              
              {!orderSuccess ? (
                <>
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-black italic uppercase">Bag ({cart.length})</h2>
                    <X className="cursor-pointer" onClick={() => setIsCartOpen(false)}/>
                  </div>

                  {!showForm ? (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between bg-slate-50 p-3 rounded-xl border">
                          <span className="text-[9px] font-black uppercase truncate w-32">{item.name}</span>
                          <span className="font-bold text-blue-900 text-xs">₹{item.saleRate} x {item.qty}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-black text-lg py-4 border-t"><span>Total Bill:</span><span>₹{totalBill}</span></div>
                      
                      {totalBill < MIN_ORDER_VALUE ? (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                          <p className="text-[9px] font-black uppercase text-amber-700">Minimum Order ₹{MIN_ORDER_VALUE}</p>
                          <p className="text-[8px] font-bold text-amber-500">Add ₹{MIN_ORDER_VALUE - totalBill} more</p>
                        </div>
                      ) : (
                        <button onClick={() => setShowForm(true)} className="w-full bg-blue-950 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">Checkout Now</button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-2xl mb-4 text-center border-2 border-blue-100">
                        <p className="text-[10px] font-black text-blue-900 uppercase mb-2 flex items-center justify-center gap-1"><CreditCard size={12}/> Pay Online (Optional)</p>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${UPI_ID}%26pn=NM%20MART%26am=${totalBill}%26cu=INR`} className="mx-auto w-32 h-32 rounded-lg border-4 border-white shadow-sm mb-2" alt="UPI QR"/>
                        <p className="text-[10px] font-black text-slate-500">{UPI_ID}</p>
                      </div>

                      <input type="text" placeholder="Customer Name" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/>
                      <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/>
                      <textarea placeholder="Full Delivery Address" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm h-20" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})}/>
                      <input type="text" placeholder="Pincode" className={`w-full p-4 rounded-xl font-bold text-sm ${!isServiceable && customer.pincode ? 'bg-red-50 border-red-200 border' : 'bg-slate-100'}`} value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})}/>
                      
                      <button onClick={handleOrderSubmit} disabled={!isServiceable} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-2xl uppercase text-xs tracking-tighter">Confirm & Send WhatsApp</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={50} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-blue-950 italic">Order Successful!</h2>
                    <div className="mt-4 p-5 bg-blue-50 rounded-3xl border-2 border-blue-100">
                      <p className="text-blue-950 font-black text-sm uppercase leading-relaxed">
                        Order Safal Raha!<br/>
                        {isStoreOpen ? (
                          <span className="text-green-600">20 minute mein delivery pahuch jayegi.</span>
                        ) : (
                          <span className="text-amber-600 flex flex-col items-center gap-1 mt-2">
                             <Clock size={16}/> 
                             Abhi store band hai.<br/>
                             Subah 8 baje ke baad delivery hogi.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => {setOrderSuccess(false); setIsCartOpen(false); setShowForm(false);}} className="text-blue-950 font-black text-xs uppercase border-b-2 border-blue-950 pb-1">Wapas Store par jayein</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

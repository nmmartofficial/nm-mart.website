import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, Plus, Minus, History, ShoppingBag, Banknote, Smartphone, User, CheckCircle2, LogOut, RefreshCw, Tag, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 🛠️ CONFIG ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP_NUMBER = "917081154604";
const UPI_ID = "paytmqr5fwdiq@ptys"; 
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
    fetch(SHEET_URL).then(r => r.text()).then(csv => { 
        setAllProducts(parseCSV(csv)); 
        setLoading(false); 
    }).catch(() => setLoading(false));

    if(isLoggedIn && customer.phone) loadHistory();
  }, [isLoggedIn]);

  // कैटेगरी की लिस्ट बनाना (All + Unique Categories)
  const categories = ['All', ...new Set(allProducts.map(p => p.category))];

  // --- 💡 DEALS CALCULATION (अब्दुल भाई, यहाँ है नया जादू) ---
  // ऐसे प्रोडक्ट्स खोजना जहाँ SaleRate, MRP से 50% या उससे ज्यादा कम हो
  const dealProducts = allProducts.filter(p => {
    if (p.mrp > 0 && p.saleRate > 0) {
      const discountPercent = ((p.mrp - p.saleRate) / p.mrp) * 100;
      return discountPercent >= 50;
    }
    return false;
  });

  const totalBill = cart.reduce((s, i) => s + i.saleRate * (i.qty || 0), 0);

  const loadHistory = () => {
    const allOrders = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    setFoundOrders(allOrders.filter((o: any) => o.phone === customer.phone));
  };

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
        const name = match[1];
        const qty = parseInt(match[2]);
        const product = allProducts.find(p => p.name === name);
        if (product) newCart.push({ ...product, qty });
      }
    });
    if (newCart.length > 0) {
      setCart(newCart);
      setIsCartOpen(true);
      setActiveTab('shop');
      alert("Items Cart mein aa gaye hain!");
    }
  };

  const handleOrderProcess = async () => {
    if(!isLoggedIn) return alert("Pehle Login karein!");
    const orderID = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const orderData = { id: orderID, date: new Date().toLocaleString('en-IN'), ...customer, items: itemsSummary, total: totalBill, method: 'COD/UPI' };
    
    try { fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(orderData) }); } catch (e) {}
    
    const masterDB = JSON.parse(localStorage.getItem('NM_MART_MASTER_DB') || '[]');
    localStorage.setItem('NM_MART_MASTER_DB', JSON.stringify([orderData, ...masterDB]));
    loadHistory();

    const waMsg = `*NM MART - ORDER*\nID: ${orderID}\nItems: ${itemsSummary}\nTotal: ₹${totalBill}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
    setCart([]); setIsCartOpen(false);
  };

  // कार्ट में सामान जोड़ने/घटाने का कॉमन फंक्शन
  const updateCart = (product: any, action: 'add' | 'remove' | 'input', value?: number) => {
    if(!isLoggedIn) { alert("Pehle Login karein!"); setActiveTab('login'); return; }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === product.id);
      if (existingItem) {
        if (action === 'remove') {
          const newQty = (existingItem.qty || 0) - 1;
          return newQty > 0 ? prevCart.map(i => i.id === product.id ? {...i, qty: newQty} : i) : prevCart.filter(i => i.id !== product.id);
        } else if (action === 'add') {
          return prevCart.map(i => i.id === product.id ? {...i, qty: (i.qty || 0) + 1} : i);
        }
      } else if (action === 'add') {
        return [...prevCart, {...product, qty: 1}];
      }
      return prevCart;
    });
  };

  // प्रोडक्ट कार्ड का कॉमन कंपोनेंट (Deals और Main Grid दोनों के लिए)
  const ProductCard = ({ p }: { p: any }) => {
    const inCart = cart.find(i => i.id === p.id);
    const discount = p.mrp > 0 ? Math.round(((p.mrp - p.saleRate) / p.mrp) * 100) : 0;
    
    return (
      <div className="bg-white p-3 rounded-[2rem] border-2 border-slate-50 flex flex-col items-center shadow-sm relative flex-shrink-0 w-40 md:w-auto hover:shadow-lg transition-all">
        {discount >= 50 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 z-10 animate-pulse">
                <Flame size={10}/> {discount}% OFF
            </div>
        )}
        <img src={`https://images.upcitemdb.com/upc/${p.barcode}/0.jpg`} className="h-20 object-contain mt-4" onError={(e: any) => e.target.src = `https://loremflickr.com/150/150/${encodeURIComponent(p.name)}`}/>
        <h3 className="text-[9px] font-black uppercase text-center h-8 mt-2 text-slate-700 leading-tight px-1 overflow-hidden">{p.name}</h3>
        <div className="w-full flex flex-col items-center mt-3 bg-slate-50 p-2 rounded-2xl gap-2">
            <div className="flex items-baseline gap-1.5">
                <p className="font-black text-blue-950 text-xs">₹{p.saleRate}</p>
                {p.mrp > p.saleRate && <p className="text-[9px] font-bold text-slate-400 line-through">₹{p.mrp}</p>}
            </div>
            {inCart ? (
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border shadow-inner">
                <button onClick={() => updateCart(p, 'remove')} className="text-blue-950 p-1"><Minus size={12}/></button>
                <span className="font-black text-[11px] text-blue-950 w-4 text-center">{inCart.qty}</span>
                <button onClick={() => updateCart(p, 'add')} className="text-blue-950 p-1"><Plus size={12}/></button>
            </div>
            ) : (

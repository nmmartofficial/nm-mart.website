import { useState, useEffect } from "react";
import { Search, Send, X, Plus, Minus, Loader2, Zap, LayoutGrid, ChevronRight, ArrowLeft, MessageCircle, CreditCard, Mail, Clock, MapPin } from "lucide-react";

const Index = () => {
  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const WHATSAPP_NUMBER = "917081154604";
  const STORE_EMAIL = "support@nmmart.in";

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch(SHEETDB_URL).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAllProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(allProducts.map((item: any) => item["Main Category"]).filter(Boolean))];

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item["Item Name"] === product["Item Name"]);
    if (existing) {
      setCart(cart.map((item) => item["Item Name"] === product["Item Name"] ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (name: string, delta: number) => {
    setCart(cart.map((item) => item["Item Name"] === name ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter((i) => i.qty > 0));
  };

  const totalBill = cart.reduce((sum, item) => sum + (Number(item["Sale Rate"] || 0) * item.qty), 0);
  const isSearching = query.length > 0;
  
  const filteredProducts = allProducts.filter((item: any) => {
    const matchesCategory = selectedCategory ? item["Main Category"] === selectedCategory : true;
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    return isSearching ? matchesSearch : (selectedCategory ? matchesCategory && matchesSearch : false);
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-32">
      
      {/* --- TOP PROFESSIONAL BAR --- */}
      <div className="bg-blue-950 text-white py-2 px-4 flex flex-wrap justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Mail size={12} className="text-orange-500"/> {STORE_EMAIL}</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-orange-500"/> 9:00 AM - 10:00 PM</span>
        </div>
        <span className="hidden md:block">Welcome to NM Mart Digital Store</span>
      </div>

      {/* --- HEADER & LOGO --- */}
      <header className="bg-white sticky top-0 z-[60] shadow-md border-b-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900 text-white p-2.5 rounded-2xl rotate-3 shadow-lg border-b-4 border-blue-950">
                <LayoutGrid size={28}/>
            </div>
            <div className="text-center">
                <h1 className="text-4xl font-black text-blue-900 italic leading-none tracking-tighter">NM MART</h1>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1">Shop More Save More</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- WELFARE CARD BANNER --- */}
      {!isSearching && !selectedCategory && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex items-center justify-between border-b-8 border-orange-500 overflow-hidden relative group">
                <div className="z-10 relative">
                    <span className="bg-orange-500 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase mb-4 inline-block">Exclusive Offer</span>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-tight mb-2">NM Mart <br/>Welfare Card</h2>
                    <p className="text-xs opacity-90 font-bold mb-6 max-w-[200px]">Shop monthly and unlock special cashback points!</p>
                    <button className="bg-white text-blue-900 px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-orange-500 hover:text-white transition-all">Enroll Now</button>
                </div>
                <CreditCard className="absolute -right-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" size={250}/>
            </div>
        </div>
      )}

      {/* --- SEARCH BAR --- */}
      <div className="max-w-4xl mx-auto px-4 mt-8 sticky top-[100px] z-50">
        <div className="relative shadow-2xl rounded-[2rem] overflow-hidden">
          <input 
            type="text" 
            placeholder="Search from 7000+ items..." 
            className="w-full bg-white border-2 border-transparent p-6 pl-16 font-bold text-xl focus:border-blue-900 focus:ring-0 transition-all"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          <Search className="absolute left-6 top-6 text-blue-900" size={28}/>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 mt-10">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4"><Loader2 className="animate-spin text-blue-900" size={60}/></div>
        ) : (
          <>
            {/* FOLDERS */}
            {!isSearching && !selectedCategory && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {categories.map((cat: any) => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className="bg-white p-10 rounded-[2.5rem] shadow-sm border-2 border-gray-50 flex flex-col items-center hover:border-blue-900 hover:shadow-xl transition-all group"
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                      <LayoutGrid size={28}/>
                    </div>
                    <span className="font-black text-blue-900 uppercase text-sm tracking-tight">{cat}</span>
                    <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase flex items-center gap-1 group-hover:text-orange-500">View All <ChevronRight size={14}/></p>
                  </button>
                ))}
              </div>
            )}

            {/* PRODUCT GRID */}
            {(isSearching || selectedCategory) && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8 px-2 border-l-8 border-orange-500 pl-4">
                   <h2 className="font-black text-2xl text-blue-900 uppercase italic tracking-tighter">
                     {isSearching ? `Search: ${query}` : selectedCategory}
                   </h2>
                   {!isSearching && (
                     <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-blue-900 font-black text-[10px] uppercase bg-white px-6 py-3 rounded-2xl border shadow-sm">
                       <ArrowLeft size={16}/> Back Home
                     </button>
                   )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {filteredProducts.map((item: any, idx: number) => {
                    const mrp = Number(item["Mrp"] || 0);
                    const sale = Number(item["Sale Rate"] || 0);
                    const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;
                    const isSuperSaver = discount >= 50;
                    let bc = String(item["Barcode"] || "").trim().split('.')[0];

                    return (
                      <div key={idx} className={`bg-white rounded-[2.5rem] p-6 flex flex-col relative border-2 transition-all ${isSuperSaver ? 'border-orange-500 ring-4 ring-orange-50 shadow-2xl scale-[1.03] z-10' : 'border-gray-50 shadow-sm'}`}>
                        {isSuperSaver && (
                          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black px-4 py-2 rounded-bl-[1.5rem] z-20 flex items-center gap-1 animate-pulse">
                            <Zap size={10} fill="white"/> 50% SAVING
                          </div>
                        )}
                        <div className="h-32 mb-4 flex items-center justify-center">
                          <img src={`https://images.openfoodfacts.org/images/products/${bc}/front_en.400.jpg`} 
                            alt="" className="max-h-full object-contain hover:scale-110 transition-transform duration-500"
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-900 font-black text-2xl uppercase">${item["Item Name"]?.charAt(0)}</div>`; }}
                          />
                        </div>
                        <h3 className="font-bold text-[11px] uppercase h-8 overflow-hidden mb-3 text-left leading-tight text-gray-800 tracking-tighter">{item["Item Name"]}</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className={`text-2xl font-black italic ${isSuperSaver ? 'text-orange-600' : 'text-blue-900'}`}>₹{sale}</span>
                          {mrp > sale && <span className="text-[12px] text-gray-300 line-through font-bold">₹{mrp}</span>}
                        </div>
                        <button onClick={() => addToCart(item)} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase shadow-lg active:scale-95 transition-all ${isSuperSaver ? 'bg-orange-600 text-white' : 'bg-[#25D366] text-white hover:bg-[#128C7E]'}`}>
                          + Add To Cart
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- FOOTER (Professional Details) --- */}
      <footer className="bg-white py-20 border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="text-xl font-black text-blue-900 italic mb-4">NM MART</h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-widest">Aapki apni dukaan, ab digital avatar mein. Best quality aur best rates ki guarantee.</p>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-[0.2em]">Contact Us</h4>
            <ul className="space-y-3 text-sm font-bold text-blue-900">
              <li className="flex items-center justify-center md:justify-start gap-2"><MapPin size={16} className="text-blue-500"/> Manjhanpur, Uttar Pradesh</li>
              <li className="flex items-center justify-center md:justify-start gap-2"><Mail size={16} className="text-blue-500"/> {STORE_EMAIL}</li>
              <li className="flex items-center justify-center md:justify-start gap-2"><MessageCircle size={16} className="text-blue-500"/> +91 7081154604</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-[0.2em]">Store Timings</h4>
            <p className="text-sm font-bold text-blue-900">Monday - Sunday<br/>09:00 AM - 10:00 PM</p>
            <div className="mt-4 flex justify-center md:justify-start gap-4 text-[10px] font-black uppercase text-blue-500">
              <a href="/privacy" className="hover:text-orange-500">Privacy</a>
              <a href="/about" className="hover:text-orange-500">About</a>
              <a href="/contact" className="hover:text-orange-500">Terms</a>
            </div>
          </div>
        </div>
        <p className="text-center mt-20 text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">© 2026 NM MART - Digital Retail OS v5.0</p>
      </footer>

      {/* WHATSAPP & CART FIXED BUTTONS (Baki logic same hai) */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="fixed right-6 bottom-32 bg-[#25D366] text-white p-5 rounded-full shadow-2xl z-[100] border-4 border-white animate-bounce">
        <MessageCircle size={32} fill="white"/>
      </a>
      
      {/* (Cart Drawer implementation same as previous response...) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[110]">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-900 text-white p-6 rounded-[2.5rem] font-black text-lg flex justify-between items-center shadow-2xl border-4 border-white">
            <div className="flex items-center gap-3"><div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">{cart.length}</div><span className="text-xs uppercase font-black">Review Order</span></div>
            <span className="italic">₹{totalBill}</span>
          </button>
        </div>
      )}

      {/* ... (Cart Sidebar remains identical for functionality) ... */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-8 flex flex-col shadow-2xl animate-in slide-in-from-right">
             <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black text-blue-900 italic uppercase">Your Shopping Bag</h2><button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-3 rounded-full"><X size={24}/></button></div>
             <div className="flex-grow overflow-y-auto space-y-4">
               {cart.map((item: any, i: number) => (
                 <div key={i} className="flex justify-between items-center bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                   <div className="text-left"><p className="font-black text-[10px] uppercase text-gray-800 mb-1">{item["Item Name"]}</p><p className="text-blue-600 font-black italic">₹{Number(item["Sale Rate"] || 0) * item.qty}</p></div>
                   <div className="flex items-center gap-3 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                     <button onClick={() => updateQty(item["Item Name"], -1)} className="text-red-500 p-2"><Minus size={16}/></button>
                     <span className="font-black text-xs w-4 text-center">{item.qty}</span>
                     <button onClick={() => addToCart(item)} className="text-green-500 p-2"><Plus size={16}/></button>
                   </div>
                 </div>
               ))}
             </div>
             <div className="pt-8 border-t mt-6">
               <div className="flex justify-between items-end mb-8"><span className="text-[10px] text-gray-400 font-black uppercase">Total Amount</span><span className="text-4xl font-black text-blue-900 italic">₹{totalBill}</span></div>
               <button onClick={() => {
                   let msg = `*NM MART ORDER*%0A------------------%0A`;
                   cart.forEach((i, idx) => msg += `${idx+1}. *${i["Item Name"]}* (x${i.qty}) = ₹${Number(i["Sale Rate"] || 0) * i.qty}%0A`);
                   msg += `------------------%0A*TOTAL BILL: ₹${totalBill}*`;
                   window.open(`https://wa.me/${+917081154604}text=${msg}`);
                }} className="w-full bg-[#25D366] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl flex items-center justify-center gap-4 border-b-8 border-[#128C7E] active:scale-95"><Send size={28}/> PLACE ORDER ON WHATSAPP</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

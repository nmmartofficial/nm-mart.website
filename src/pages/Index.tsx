import { useState, useEffect } from "react";
import { Search, Send, X, Plus, Minus, Loader2, Zap, LayoutGrid, ChevronRight, ArrowLeft, MessageCircle, CreditCard } from "lucide-react";

const Index = () => {
  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const WHATSAPP_NUMBER = "917081154604";

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
      
      {/* --- 1. FIXED LOGO HEADER (Original Branding) --- */}
      <header className="bg-white sticky top-0 z-[60] shadow-md border-b-4 border-blue-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900 text-white p-2 rounded-xl rotate-3 shadow-lg">
                <LayoutGrid size={24}/>
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-black text-blue-900 italic leading-none tracking-tighter">NM MART</h1>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Shop More Save More</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- 2. WELFARE CARD BANNER (Welfare Section Back) --- */}
      {!isSearching && !selectedCategory && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between border-b-8 border-orange-500 overflow-hidden relative">
                <div className="z-10">
                    <h2 className="text-xl font-black uppercase italic tracking-tight">NM Mart Welfare Card</h2>
                    <p className="text-[10px] opacity-80 font-bold mb-4">Har Mahine Karo Shopping, Paao Cashback!</p>
                    <button className="bg-white text-blue-900 px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg">Join Now</button>
                </div>
                <CreditCard className="absolute -right-6 opacity-10 rotate-12" size={150}/>
            </div>
        </div>
      )}

      {/* --- 3. SEARCH BOX --- */}
      <div className="max-w-4xl mx-auto px-4 mt-6 sticky top-[92px] z-50">
        <div className="relative shadow-2xl rounded-2xl overflow-hidden">
          <input 
            type="text" 
            placeholder="Kishmish, Sabun ya kuch bhi search karein..." 
            className="w-full bg-white border-none p-5 pl-14 font-bold text-lg focus:ring-4 focus:ring-blue-500"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          <Search className="absolute left-5 top-5 text-blue-900" size={24}/>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4"><Loader2 className="animate-spin text-blue-600" size={48}/></div>
        ) : (
          <>
            {/* 4. CATEGORY FOLDERS */}
            {!isSearching && !selectedCategory && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
                {categories.map((cat: any) => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col items-center hover:border-blue-900 transition-all active:scale-95 group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                      <LayoutGrid size={20}/>
                    </div>
                    <span className="font-black text-blue-900 uppercase text-xs tracking-tighter">{cat}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 5. PRODUCT LISTING */}
            {(isSearching || selectedCategory) && (
              <div>
                <div className="flex items-center justify-between mb-6 px-2">
                   <h2 className="font-black text-xl text-blue-900 uppercase italic flex items-center gap-2">
                     <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                     {isSearching ? `Sahi Item Mila!` : selectedCategory}
                   </h2>
                   {!isSearching && (
                     <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase bg-white px-4 py-2 rounded-full border shadow-sm">
                       <ArrowLeft size={14}/> Back to Sections
                     </button>
                   )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {filteredProducts.map((item: any, idx: number) => {
                    const mrp = Number(item["Mrp"] || 0);
                    const sale = Number(item["Sale Rate"] || 0);
                    const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;
                    const isSuperSaver = discount >= 50;
                    let bc = String(item["Barcode"] || "").trim().split('.')[0];

                    return (
                      <div key={idx} className={`bg-white rounded-[2rem] p-4 flex flex-col relative border-2 transition-all ${isSuperSaver ? 'border-orange-500 ring-2 ring-orange-50 shadow-xl scale-[1.02]' : 'border-gray-50 shadow-sm'}`}>
                        {isSuperSaver && (
                          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-black px-3 py-1.5 rounded-bl-xl z-20">50% SPECIAL</div>
                        )}
                        <div className="h-28 mb-3 flex items-center justify-center">
                          <img src={`https://images.openfoodfacts.org/images/products/${bc}/front_en.400.jpg`} 
                            alt="" className="max-h-full object-contain"
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 font-black text-xl uppercase">${item["Item Name"]?.charAt(0)}</div>`; }}
                          />
                        </div>
                        <h3 className="font-bold text-[10px] uppercase h-8 overflow-hidden mb-2 text-left leading-tight">{item["Item Name"]}</h3>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className={`text-xl font-black italic ${isSuperSaver ? 'text-orange-600' : 'text-blue-900'}`}>₹{sale}</span>
                          {mrp > sale && <span className="text-[10px] text-gray-300 line-through">₹{mrp}</span>}
                        </div>
                        <button onClick={() => addToCart(item)} className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 ${isSuperSaver ? 'bg-orange-500 text-white shadow-orange-200 shadow-lg' : 'bg-[#25D366] text-white'}`}>
                          + Add Item
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

      {/* --- 6. FLOATING WHATSAPP BUTTON (Back) --- */}
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Namaste NM Mart!`}
        target="_blank"
        className="fixed right-6 bottom-32 bg-[#25D366] text-white p-4 rounded-full shadow-2xl z-[100] border-4 border-white animate-bounce"
      >
        <MessageCircle size={32} fill="white"/>
      </a>

      {/* --- 7. CART SYSTEM --- */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[110]">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-900 text-white p-5 rounded-[2.5rem] font-black text-lg flex justify-between items-center shadow-2xl border-4 border-white">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner">{cart.length}</div>
              <span className="text-xs uppercase tracking-widest font-black italic">Checkout Bill</span>
            </div>
            <span className="italic">₹{totalBill}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer Logic remains the same... */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-blue-900 italic uppercase">Order Review</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-3 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4">
              {cart.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <div className="text-left"><p className="font-bold text-[10px] uppercase text-gray-800 mb-1">{item["Item Name"]}</p><p className="text-blue-600 font-black italic">₹{Number(item["Sale Rate"] || 0) * item.qty}</p></div>
                  <div className="flex items-center gap-3 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                    <button onClick={() => updateQty(item["Item Name"], -1)} className="text-red-500 p-2"><Minus size={16}/></button>
                    <span className="font-black text-xs w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="text-green-500 p-2"><Plus size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t mt-6">
              <div className="flex justify-between items-center mb-8 px-2"><span className="text-[10px] text-gray-400 font-black uppercase">Grand Total</span><span className="text-4xl font-black text-blue-900 italic tracking-tighter">₹{totalBill}</span></div>
              <button onClick={() => {
                   let msg = `*NM MART NEW ORDER*%0A------------------%0A`;
                   cart.forEach((i, idx) => msg += `${idx+1}. *${i["Item Name"]}* (x${i.qty}) = ₹${Number(i["Sale Rate"] || 0) * i.qty}%0A`);
                   msg += `------------------%0A*BILL TOTAL: ₹${totalBill}*%0A------------------%0A_Shop More Save More_`;
                   window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
                }} className="w-full bg-[#25D366] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl flex items-center justify-center gap-4 border-b-8 border-[#128C7E]">
                <Send size={28}/> SEND ORDER TO STORE
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-50 py-16 text-center border-t border-gray-100 mt-20">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">© 2026 NM MART - Manjhanpur, Uttar Pradesh</p>
      </footer>
    </div>
  );
};

export default Index;

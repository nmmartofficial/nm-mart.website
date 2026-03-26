import { useState, useEffect } from "react";
import { Search, Send, X, Plus, Minus, Loader2, Zap, LayoutGrid, ChevronRight, ArrowLeft } from "lucide-react";

const Index = () => {
  // --- SETTINGS ---
  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const WHATSAPP_NUMBER = "917081154604";

  // --- STATES ---
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- DATA FETCH ---
  useEffect(() => {
    fetch(SHEETDB_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(allProducts.map((item: any) => item["Main Category"]).filter(Boolean))];

  // --- CART LOGIC ---
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
      {/* 1. Header & Search Combined */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center">
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tighter uppercase mb-4">NM MART</h1>
          <div className="relative max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="Search Items..." 
              className="w-full bg-gray-100 border-none p-4 rounded-2xl pl-12 font-bold focus:ring-2 focus:ring-blue-500 shadow-inner"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={22}/>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 mt-6">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48}/>
            <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">NM Mart Loading...</p>
          </div>
        ) : (
          <>
            {/* 2. Folder View (Home Screen) */}
            {!isSearching && !selectedCategory && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500">
                {categories.map((cat: any) => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className="bg-white p-10 rounded-[2.5rem] shadow-sm border-b-8 border-blue-600 flex flex-col items-center text-center hover:scale-105 transition-all group"
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                      <LayoutGrid className="text-blue-600 group-hover:text-white" size={28}/>
                    </div>
                    <span className="font-black text-blue-900 uppercase text-lg leading-tight">{cat}</span>
                    <p className="text-[9px] text-gray-400 mt-3 font-bold uppercase flex items-center gap-1">Browse <ChevronRight size={10}/></p>
                  </button>
                ))}
              </div>
            )}

            {/* 3. Products Grid (Inside Folder or Search) */}
            {(isSearching || selectedCategory) && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8 px-2">
                   <h2 className="font-black text-2xl text-blue-900 uppercase italic">
                     {isSearching ? `Found ${filteredProducts.length} Items` : selectedCategory}
                   </h2>
                   {!isSearching && (
                     <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                       <ArrowLeft size={16}/> Go Back
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
                      <div key={idx} className={`bg-white rounded-[2rem] p-5 flex flex-col relative border-2 transition-all ${isSuperSaver ? 'border-orange-400 ring-4 ring-orange-50 scale-[1.02] z-10 shadow-xl' : 'border-transparent shadow-sm'}`}>
                        {isSuperSaver && (
                          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl z-20 animate-pulse flex items-center gap-1">
                            <Zap size={10} fill="white"/> 50% OFF
                          </div>
                        )}
                        <div className="h-36 mb-4 flex items-center justify-center p-2">
                          <img src={`https://images.openfoodfacts.org/images/products/${bc}/front_en.400.jpg`} 
                            alt="" className="max-h-full object-contain"
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                              const p = e.currentTarget.parentElement;
                              if (p) p.innerHTML = `<div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 font-black text-3xl uppercase shadow-inner">${item["Item Name"]?.charAt(0)}</div>`;
                            }}
                          />
                        </div>
                        <h3 className="font-bold text-[11px] uppercase h-8 overflow-hidden mb-3 text-left leading-tight text-gray-800">{item["Item Name"]}</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className={`text-2xl font-black italic ${isSuperSaver ? 'text-orange-600' : 'text-blue-900'}`}>₹{sale}</span>
                          {mrp > sale && <span className="text-[11px] text-gray-300 line-through font-bold">₹{mrp}</span>}
                        </div>
                        <button onClick={() => addToCart(item)} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase shadow-lg active:scale-95 transition-all ${isSuperSaver ? 'bg-orange-500 text-white' : 'bg-[#25D366] text-white hover:bg-[#128C7E]'}`}>
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

      {/* 4. WhatsApp Checkout Button (Floating) */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70]">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-900 text-white p-6 rounded-[2.5rem] font-black text-xl flex justify-between items-center shadow-2xl border-4 border-white">
            <div className="flex items-center gap-4">
              <div className="bg-white text-blue-900 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black">{cart.length}</div>
              <span className="text-xs uppercase font-black tracking-[0.2em]">View Bill</span>
            </div>
            <span className="italic">₹{totalBill}</span>
          </button>
        </div>
      )}

      {/* 5. Cart Sidebar (Drawer) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80] flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-10 border-b pb-4">
              <h2 className="text-2xl font-black text-blue-900 italic uppercase tracking-tighter">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-3 rounded-full hover:bg-red-50 hover:text-red-500"><X size={24}/></button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-5">
              {cart.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                  <div className="text-left flex-grow mr-4">
                    <p className="font-black text-[11px] uppercase text-gray-800 leading-tight mb-2">{item["Item Name"]}</p>
                    <p className="text-blue-600 font-black italic text-md">₹{Number(item["Sale Rate"] || 0) * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white rounded-2xl px-2 py-1 shadow-inner border border-gray-100">
                    <button onClick={() => updateQty(item["Item Name"], -1)} className="text-red-500 p-2"><Minus size={18}/></button>
                    <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="text-green-500 p-2"><Plus size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-10 border-t mt-6">
              <div className="flex justify-between items-center mb-8 px-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Bill</span>
                <span className="text-4xl font-black text-blue-900 italic tracking-tighter">₹{totalBill}</span>
              </div>
              <button 
                onClick={() => {
                   let msg = `*NM MART ORDER*%0A------------------%0A`;
                   cart.forEach((i, idx) => msg += `${idx+1}. *${i["Item Name"]}* (x${i.qty}) = ₹${Number(i["Sale Rate"] || 0) * i.qty}%0A`);
                   msg += `------------------%0A*TOTAL BILL: ₹${totalBill}*%0A------------------%0A_Sent via NM Mart Online_`;
                   window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
                }}
                className="w-full bg-[#25D366] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-green-500/30 flex items-center justify-center gap-4 border-b-8 border-[#128C7E]"
              >
                <Send size={28}/> ORDER ON WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 py-16 text-center border-t border-gray-100 mt-20">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">© 2026 NM MART - Manjhanpur, Uttar Pradesh</p>
      </footer>
    </div>
  );
};

export default Index;

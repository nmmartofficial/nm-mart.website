import { useState, useEffect } from "react";
import { Search, ShoppingCart, Send, X, Plus, Minus, Loader2, MessageCircle, CreditCard, Mail, Clock, MapPin, LayoutGrid } from "lucide-react";

const Index = () => {
  // --- AAPKI OLD SETTINGS ---
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
  const filteredProducts = allProducts.filter((item: any) => {
    const matchesCategory = selectedCategory ? item["Main Category"] === selectedCategory : true;
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white font-sans pb-24 text-blue-900">
      
      {/* --- PEHLE WAALA HEADER --- */}
      <div className="bg-blue-900 text-white py-2 px-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-2"><Mail size={12}/> {STORE_EMAIL}</span>
        <span className="hidden md:block italic">NM MART - Digital Store</span>
      </div>

      <header className="p-6 flex flex-col items-center border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-blue-900 text-white p-2 rounded-lg rotate-3 shadow-lg">
            <LayoutGrid size={24}/>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black italic tracking-tighter leading-none">NM MART</h1>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Shop More Save More</p>
          </div>
        </div>
      </header>

      {/* --- SEARCH BAR (Old Look) --- */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="relative shadow-xl rounded-2xl overflow-hidden">
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full bg-gray-50 border-none p-5 pl-14 font-bold text-lg"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-5 top-5 text-gray-400" size={24}/>
        </div>
      </div>

      {/* --- WELFARE CARD (Original Style) --- */}
      {!selectedCategory && !query && (
        <div className="max-w-6xl mx-auto px-4 mt-10">
          <div className="bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-b-8 border-orange-500">
            <div className="relative z-10">
              <h2 className="text-2xl font-black italic uppercase mb-2">NM Mart Welfare Card</h2>
              <p className="text-xs opacity-70 mb-6 font-bold uppercase tracking-widest">Join our monthly shopping program</p>
              <button className="bg-white text-blue-900 px-8 py-3 rounded-full font-black text-xs uppercase shadow-lg">Activate Now</button>
            </div>
            <CreditCard className="absolute -right-10 top-0 opacity-10 rotate-12" size={200}/>
          </div>
        </div>
      )}

      {/* --- STORE CONTENT --- */}
      <main className="max-w-7xl mx-auto p-4 mt-10">
        {loading ? (
          <div className="flex justify-center py-40"><Loader2 className="animate-spin text-blue-900" size={40}/></div>
        ) : (
          <>
            {/* Categories Folders */}
            {!selectedCategory && !query && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((cat: any) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-900"><LayoutGrid size={20}/></div>
                    <span className="font-black text-xs uppercase tracking-tight">{cat}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Product Listing */}
            {(selectedCategory || query) && (
              <div>
                <div className="flex justify-between items-center mb-8 px-2">
                  <h2 className="font-black text-2xl uppercase italic">{selectedCategory || "Search Results"}</h2>
                  <button onClick={() => {setSelectedCategory(null); setQuery("")}} className="text-xs font-black uppercase text-blue-500 border-b-2 border-blue-500 pb-1">Back Home</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {filteredProducts.map((item: any, idx: number) => {
                    let bc = String(item["Barcode"] || "").trim().split('.')[0];
                    return (
                      <div key={idx} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col">
                        <div className="h-32 mb-4 flex items-center justify-center">
                           <img 
                             src={`https://images.openfoodfacts.org/images/products/${bc}/front_en.400.jpg`} 
                             className="max-h-full object-contain" 
                             onError={(e: any) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class='w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center font-black text-xl'>${item["Item Name"]?.charAt(0)}</div>` }}
                           />
                        </div>
                        <h3 className="font-bold text-[10px] uppercase h-8 overflow-hidden mb-2">{item["Item Name"]}</h3>
                        <p className="text-2xl font-black italic mb-4">₹{item["Sale Rate"]}</p>
                        <button onClick={() => addToCart(item)} className="w-full bg-blue-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">+ Add to Bag</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- FOOTER (Old Style) --- */}
      <footer className="bg-gray-50 py-16 px-6 mt-20 border-t border-gray-100 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div><h3 className="font-black italic text-xl mb-4">NM MART</h3><p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest leading-loose">Shop More Save More. Your daily essentials at wholesale prices.</p></div>
          <div><h4 className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest">Store Info</h4><p className="text-xs font-bold leading-relaxed flex flex-col gap-2"><span className="flex items-center gap-2"><MapPin size={14}/> Manjhanpur, UP</span><span className="flex items-center gap-2"><Clock size={14}/> 09:00 AM - 10:00 PM</span></p></div>
          <div><h4 className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest">Contact</h4><p className="text-xs font-bold underline italic text-blue-600">support@nmmart.in</p></div>
        </div>
        <p className="text-center mt-20 text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">© 2026 NM MART - Manjhanpur</p>
      </footer>

      {/* --- FLOATING WHATSAPP --- */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="fixed right-6 bottom-32 bg-[#25D366] text-white p-5 rounded-full shadow-2xl z-[100] border-4 border-white animate-bounce">
        <MessageCircle size={32} fill="white"/>
      </a>

      {/* --- CART DRAWER (Same Logic) --- */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[110]">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-900 text-white p-5 rounded-[2rem] font-black text-lg flex justify-between items-center shadow-2xl border-4 border-white">
            <span className="text-xs uppercase font-black italic tracking-widest flex items-center gap-2"><div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-[10px]">{cart.length}</div> View Cart</span>
            <span className="italic">₹{totalBill}</span>
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-8 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black italic uppercase">Order Review</h2><button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-2 rounded-full"><X size={24}/></button></div>
            <div className="flex-grow overflow-y-auto space-y-4">
              {cart.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-5 rounded-3xl">
                  <div className="text-left"><p className="font-black text-[10px] uppercase mb-1">{item["Item Name"]}</p><p className="text-blue-600 font-black italic">₹{Number(item["Sale Rate"] || 0) * item.qty}</p></div>
                  <div className="flex items-center gap-3 bg-white rounded-2xl p-1 border">
                    <button onClick={() => updateQty(item["Item Name"], -1)} className="text-red-500 p-2"><Minus size={16}/></button>
                    <span className="font-black text-xs w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="text-green-500 p-2"><Plus size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t mt-6">
              <div className="flex justify-between items-center mb-8"><span className="text-4xl font-black italic">₹{totalBill}</span></div>
              <button onClick={() => {
                 let msg = `*NM MART ORDER*%0A------------------%0A`;
                 cart.forEach((i, idx) => msg += `${idx+1}. *${i["Item Name"]}* (x${i.qty}) = ₹${Number(i["Sale Rate"] || 0) * i.qty}%0A`);
                 msg += `------------------%0A*TOTAL: ₹${totalBill}*`;
                 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
              }} className="w-full bg-[#25D366] text-white py-6 rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-4">
                <Send size={28}/> SEND ORDER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

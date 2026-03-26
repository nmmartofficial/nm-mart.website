import { useState, useEffect } from "react";
import { Search, ShoppingCart, Send, X, Plus, Minus, Loader2, Tag, Percent } from "lucide-react";

const ProductSearch = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const WHATSAPP_NUMBER = "917081154604";

  useEffect(() => {
    fetch(SHEETDB_URL).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAllProducts(data);
      setLoading(false);
    });
  }, []);

  // Aapki sheet ke "Main Category" column ka upayog
  const categories = ["All", ...new Set(allProducts.map(item => item["Main Category"]).filter(Boolean))];

  const addToCart = (product: any) => {
    const existing = cart.find(item => item["Item Name"] === product["Item Name"]);
    if (existing) {
      setCart(cart.map(item => item["Item Name"] === product["Item Name"] ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (name: string, delta: number) => {
    setCart(cart.map(item => item["Item Name"] === name ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter(i => i.qty > 0));
  };

  const totalBill = cart.reduce((sum, item) => sum + (Number(item["Sale Rate"]) * item.qty), 0);
  const totalSavings = cart.reduce((sum, item) => sum + ((Number(item["Mrp"]) - Number(item["Sale Rate"])) * item.qty), 0);

  const filtered = allProducts.filter(item => {
    const matchesCategory = selectedCategory === "All" || item["Main Category"] === selectedCategory;
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24 font-sans text-gray-900">
      <div className="bg-white p-6 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-blue-900 italic tracking-tighter">NM MART</h1>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase italic">Best Price Guaranteed</div>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search items (e.g. PAPAD, STAR)..." 
              className="w-full bg-gray-100 border-none p-4 rounded-2xl pl-12 focus:ring-2 focus:ring-blue-500 font-bold"
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={20}/>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="bg-white py-3 shadow-sm overflow-x-auto whitespace-nowrap px-4 border-b border-gray-100 scrollbar-hide">
          <div className="max-w-6xl mx-auto flex gap-2">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                  selectedCategory === cat ? "bg-blue-600 text-white shadow-md scale-105" : "bg-gray-100 text-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-32"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
      ) : (
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, idx) => {
            const mrp = Number(item["Mrp"]);
            const sale = Number(item["Sale Rate"]);
            const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;

            return (
              <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-all relative group">
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg z-10 flex items-center gap-1 shadow-lg">
                    <Percent size={10}/> {discount}% OFF
                  </div>
                )}
                
                <div className="h-40 bg-white flex items-center justify-center p-4">
                  <img 
                    src={`https://images.openfoodfacts.org/images/products/${item["Barcode"]}/front_en.400.jpg`}
                    alt={item["Item Name"]}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.innerHTML = `<div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 font-black text-2xl uppercase">${item["Item Name"]?.charAt(0)}</div>`;
                    }}
                  />
                </div>

                <div className="p-4 pt-0 flex-grow flex flex-col text-left">
                  <p className="text-[8px] text-gray-400 font-bold uppercase mb-1">{item["Sub Category"] || item["Main Category"]}</p>
                  <h3 className="font-bold text-gray-800 text-[11px] uppercase h-8 overflow-hidden leading-tight mb-2">
                    {item["Item Name"]}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-blue-900 italic">₹{item["Sale Rate"]}</span>
                    {mrp > sale && <span className="text-[10px] text-gray-300 line-through">₹{item["Mrp"]}</span>}
                  </div>

                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full bg-[#25D366] text-white py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-[#128C7E] active:scale-95 transition-all"
                  >
                    <Plus size={14}/> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black text-lg flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-3 text-left">
              <div className="bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">{cart.length}</div>
              <div>
                <p className="text-[8px] uppercase tracking-widest opacity-80">View Order</p>
                <p className="text-sm italic">₹{totalBill}</p>
              </div>
            </div>
            {totalSavings > 0 && <span className="text-[10px] bg-blue-500 px-3 py-1 rounded-full">Save ₹{totalSavings}</span>}
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-8 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-xl font-black text-blue-900 italic uppercase tracking-tighter">Your Shopping Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <div className="text-left max-w-[55%]">
                    <p className="font-bold text-[10px] uppercase text-gray-800 leading-tight mb-1">{item["Item Name"]}</p>
                    <p className="text-blue-600 font-black italic text-sm">₹{Number(item["Sale Rate"]) * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                    <button onClick={() => updateQty(item["Item Name"], -1)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"><Minus size={14}/></button>
                    <span className="font-black text-xs w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="text-green-500 hover:bg-green-50 p-2 rounded-xl transition-colors"><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 mt-6">
              {totalSavings > 0 && (
                <div className="bg-green-50 text-green-700 p-3 rounded-2xl text-[11px] font-bold text-center mb-4 italic">
                  Abdur, you are saving ₹{totalSavings} on this order! 🎉
                </div>
              )}
              <div className="flex justify-between text-3xl font-black text-blue-900 mb-6 italic tracking-tighter">
                <span className="text-[10px] text-gray-400 not-italic uppercase self-center tracking-widest">Grand Total</span>
                <span>₹{totalBill}</span>
              </div>
              <button 
                onClick={() => {
                   let msg = `*NM MART - NEW ORDER*%0A------------------%0A`;
                   cart.forEach((i, idx) => msg += `${idx+1}. *${i["Item Name"]}* (x${i.qty}) = ₹${Number(i["Sale Rate"]) * i.qty}%0A`);
                   msg += `------------------%0A*TOTAL BILL: ₹${totalBill}*%0A*SAVINGS: ₹${totalSavings}*%0A------------------`;
                   window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
                }}
                className="w-full bg-[#25D366] text-white py-5 rounded-[2.5rem] font-black text-lg shadow-xl shadow-green-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Send size={24}/> CONFIRM ORDER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;

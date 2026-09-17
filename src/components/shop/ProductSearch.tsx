import { useState, useEffect } from "react";
import { Search, ShoppingCart, Send, X, Plus, Minus, Loader2, Zap, LayoutGrid, ChevronRight } from "lucide-react";
import { WA_NUMBER } from "@/lib/store-utils";

const ProductSearch = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const WHATSAPP_NUMBER = WA_NUMBER;

  useEffect(() => {
    fetch(SHEETDB_URL).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAllProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(8);
  }, [query, selectedCategory]);

  // Categories extraction
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

  // Logic: Agar search ho rahi hai to products dikhao, warna folders
  const isSearching = query.length > 0;
  
  const filteredProducts = allProducts.filter((item: any) => {
    const matchesCategory = selectedCategory ? item["Main Category"] === selectedCategory : true;
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    return isSearching ? matchesSearch : (selectedCategory ? matchesCategory && matchesSearch : false);
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-24 font-sans text-gray-900">
      {/* Premium Header */}
      <div className="bg-white p-6 shadow-md sticky top-0 z-50 border-b-2 border-blue-100">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-blue-900 italic tracking-tighter">NM MART</h1>
            {selectedCategory && !isSearching && (
              <button onClick={() => setSelectedCategory(null)} className="text-blue-600 font-bold text-xs flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                <LayoutGrid size={14}/> All Categories
              </button>
            )}
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-gray-100 border-2 border-transparent p-4 rounded-2xl pl-12 focus:border-blue-500 focus:bg-white transition-all font-bold shadow-inner"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={22}/>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48}/>
            <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Opening Store...</p>
          </div>
        ) : (
          <>
            {/* FOLDER VIEW: Jab tak kuch search na ho aur category select na ho */}
            {!isSearching && !selectedCategory && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300">
                {categories.map((cat: any) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-blue-600 hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center group"
                  >
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                      <LayoutGrid className="text-blue-600 group-hover:text-white" size={32}/>
                    </div>
                    <h3 className="font-black text-blue-900 text-lg uppercase tracking-tight leading-tight">{cat}</h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold flex items-center gap-1 uppercase">Browse Items <ChevronRight size={12}/></p>
                  </button>
                ))}
              </div>
            )}

            {/* PRODUCT VIEW: Jab search ho ya category select ho */}
            {(isSearching || selectedCategory) && (
              <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 xl:grid-cols-6 animate-in slide-in-from-bottom-4 duration-500">
                {filteredProducts.slice(0, visibleCount).map((item: any, idx: number) => {
                  const mrp = Number(item["Mrp"] || 0);
                  const sale = Number(item["Sale Rate"] || 0);
                  const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;
                  const isSuperSaver = discount >= 50;

                  let bc = item["Barcode"];
                  if (typeof bc === 'number') bc = bc.toLocaleString('fullwide', {useGrouping:false});
                  const cleanBC = String(bc || "").trim().split('.')[0];

                  return (
                    <div key={idx} className={`bg-white rounded-[2rem] shadow-sm overflow-hidden flex flex-col relative transition-all border-2 
                      ${isSuperSaver ? "border-orange-400 ring-4 ring-orange-50 scale-[1.02] z-10" : "border-transparent"}`}>
                      
                      {isSuperSaver && (
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl z-20 flex items-center gap-1 animate-pulse">
                          <Zap size={10} fill="white"/> 50% SPECIAL
                        </div>
                      )}

                      <div className="h-40 bg-white flex items-center justify-center p-4">
                        {cleanBC && cleanBC.length > 5 ? (
                          <img src={`https://images.openfoodfacts.org/images/products/${cleanBC}/front_en.400.jpg`}
                            alt={item["Item Name"]} className="w-full h-full object-contain"
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                              const p = e.currentTarget.parentElement;
                              if (p && !p.querySelector('.icon')) {
                                p.innerHTML = `<div class="icon w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 font-black text-2xl uppercase">${item["Item Name"]?.charAt(0)}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 font-black text-2xl uppercase">{item["Item Name"]?.charAt(0)}</div>
                        )}
                      </div>

                      <div className="p-4 pt-0 flex-grow flex flex-col text-left">
                        <p className="text-[8px] text-blue-400 font-black uppercase mb-1">{item["Sub Category"]}</p>
                        <h3 className="font-bold text-gray-800 text-[11px] uppercase h-8 overflow-hidden mb-2 leading-tight">{item["Item Name"]}</h3>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className={`text-xl font-black italic ${isSuperSaver ? "text-orange-600" : "text-blue-900"}`}>₹{sale}</span>
                          {mrp > sale && <span className="text-[10px] text-gray-300 line-through font-bold">₹{mrp}</span>}
                        </div>
                        <button onClick={() => addToCart(item)} className={`w-full py-3 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all ${isSuperSaver ? "bg-orange-500 text-white" : "bg-[#25D366] text-white"}`}>
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {visibleCount < filteredProducts.length && (
                <div className="mt-6 flex justify-center">
                  <button type="button" onClick={() => setVisibleCount((count) => count + 8)} className="rounded-full border border-blue-900 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-blue-900">
                    Load More Products
                  </button>
                </div>
              )}
              </>
            )}
          </>
        )}
      </div>

      {/* Cart Summary Button (Same as before) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-900 text-white p-5 rounded-[2rem] font-black text-lg flex justify-between items-center shadow-2xl border-2 border-white">
            <div className="flex items-center gap-3">
              <div className="bg-white text-blue-900 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">{cart.length}</div>
              <span className="text-xs uppercase font-black tracking-widest">Order Summary</span>
            </div>
            <span className="italic">₹{totalBill}</span>
          </button>
        </div>
      )}
      
      {/* Drawer Logic is same as previous code... */}
    </div>
  );
};

export default ProductSearch;

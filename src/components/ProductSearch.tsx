import { useState, useEffect } from "react";
import { Search, ShoppingCart, Send, X, Plus, Minus, Loader2, Star, Percent } from "lucide-react";

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
    const fetchData = async () => {
      try {
        const res = await fetch(SHEETDB_URL);
        const data = await res.json();
        if (Array.isArray(data)) setAllProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = ["All", ...new Set(allProducts.map((item: any) => item["Main Category"]).filter(Boolean))];

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

  const filtered = allProducts.filter((item: any) => {
    const matchesCategory = selectedCategory === "All" || item["Main Category"] === selectedCategory;
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 text-center">
            <h1 className="text-3xl font-black text-blue-900 italic tracking-tighter">NM MART</h1>
            <input 
              type="text" 
              placeholder="Saman dhoondhein..." 
              className="w-full bg-gray-100 border-none p-4 rounded-2xl pl-6 focus:ring-2 focus:ring-blue-500 font-bold"
              onChange={(e) => setQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Categories */}
      {!loading && (
        <div className="bg-white py-3 overflow-x-auto px-4 border-b flex gap-2 no-scrollbar">
            {categories.map((cat: any) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase transition-all whitespace-nowrap ${selectedCategory === cat ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}>
                {cat}
              </button>
            ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
      ) : (
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item: any, idx: number) => {
            const mrp = Number(item["Mrp"] || 0);
            const sale = Number(item["Sale Rate"] || 0);
            const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;
            
            // HIGHLIGHT LOGIC: Agar naam me "*" hai to highlight karo
            const isHighlighted = item["Item Name"]?.includes("*");
            const displayName = item["Item Name"]?.replace("*", "");

            let bc = item["Barcode"];
            if (typeof bc === 'number') bc = bc.toLocaleString('fullwide', {useGrouping:false});
            const cleanBC = String(bc || "").trim().split('.')[0];

            return (
              <div key={idx} className={`bg-white rounded-[2rem] shadow-sm overflow-hidden flex flex-col relative transition-all border-2 
                ${isHighlighted ? "border-blue-500 shadow-blue-100 shadow-xl scale-[1.02]" : "border-transparent"}`}>
                
                {isHighlighted && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl z-20 flex items-center gap-1">
                    <Star size={10} fill="white"/> TRENDING
                  </div>
                )}

                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg z-10 shadow-md italic">
                    {discount}% OFF
                  </div>
                )}
                
                <div className="h-40 bg-white flex items-center justify-center p-4">
                  {cleanBC && cleanBC.length > 5 ? (
                    <img src={`https://images.openfoodfacts.org/images/products/${cleanBC}/front_en.400.jpg`}
                      alt={displayName} className="w-full h-full object-contain"
                      onError={(e: any) => {
                        e.currentTarget.style.display = 'none';
                        const p = e.currentTarget.parentElement;
                        if (p && !p.querySelector('.icon')) {
                          p.innerHTML = `<div class="icon w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 font-black text-2xl uppercase">${displayName?.charAt(0)}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 font-black text-2xl uppercase">{displayName?.charAt(0)}</div>
                  )}
                </div>

                <div className="p-4 pt-0 flex-grow flex flex-col text-left">
                  <p className="text-[8px] text-gray-400 font-bold uppercase mb-1">{item["Sub Category"]}</p>
                  <h3 className="font-bold text-gray-800 text-[11px] uppercase h-8 overflow-hidden mb-2 leading-tight">
                    {displayName}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-blue-900 italic">₹{sale}</span>
                    {mrp > sale && <span className="text-[10px] text-gray-300 line-through">₹{mrp}</span>}
                  </div>

                  <button onClick={() => addToCart(item)}
                    className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all
                    ${isHighlighted ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-[#25D366] text-white hover:bg-[#128C7E]"}`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Summary & Panel (Wahi same logic jo pehle tha) */}
      {/* ... (Main Cart and Order Button) ... */}
    </div>
  );
};

export default ProductSearch;

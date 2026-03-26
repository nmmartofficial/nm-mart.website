import { useState, useEffect } from "react";
import { Search, ShoppingCart, Send, X, Plus, Minus, Loader2, Star } from "lucide-react";

const ProductSearch = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
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

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.Name === product.Name);
    if (existing) {
      setCart(cart.map(item => item.Name === product.Name ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const filtered = allProducts.filter(item => 
    item.Name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-20 font-sans">
      {/* Search Header */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-black text-blue-900">NM Mart</h1>
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-gray-100 border-none p-4 rounded-xl pl-12 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={20}/>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
      ) : (
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item, idx) => {
            const discount = Math.round(((item.Mrp - item.Salerate) / item.Mrp) * 100);
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
                {/* Discount Tag */}
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md">
                    -{discount}%
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-md">In Stock</span>
                
                {/* Product Image Placeholder */}
                <div className="h-40 bg-gray-50 flex items-center justify-center p-8">
                   <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-2xl">
                     {item.Name?.charAt(0)}
                   </div>
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 uppercase h-10 overflow-hidden leading-tight">
                    {item.Name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-black text-blue-900">₹{item.Salerate}</span>
                    <span className="text-xs text-gray-400 line-through">₹{item.Mrp}</span>
                  </div>
                  
                  <div className="flex items-center text-orange-400 mb-4">
                    <Star size={12} fill="currentColor"/>
                    <Star size={12} fill="currentColor"/>
                    <Star size={12} fill="currentColor"/>
                    <Star size={12} fill="currentColor"/>
                    <span className="text-[10px] text-gray-400 ml-1">4.5</span>
                  </div>

                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-auto"
                  >
                    <Send size={14}/> Order on WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 z-50 hover:scale-105 transition-transform"
        >
          <ShoppingCart size={24}/>
          <span className="bg-white text-blue-600 font-bold px-2 rounded-lg">{cart.length}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button onClick={() => setIsCartOpen(false)}><X/></button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-bold text-sm uppercase">{item.Name}</p>
                    <p className="text-blue-600 font-bold">₹{item.Salerate}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                    <button onClick={() => addToCart({...item, qty: -1})} className="text-gray-500">-</button>
                    <span className="font-bold text-sm">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="text-gray-500">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total:</span>
                <span>₹{cart.reduce((s, i) => s + (i.Salerate * i.qty), 0)}</span>
              </div>
              <button 
                onClick={() => {
                   let msg = `*NEW ORDER FROM NM MART*%0A`;
                   cart.forEach(i => msg += `- ${i.Name} (x${i.qty})%0A`);
                   window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
                }}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg"
              >
                Checkout on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;

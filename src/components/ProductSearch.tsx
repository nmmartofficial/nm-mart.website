import { useState, useEffect } from "react";
import { Search, ShoppingCart, Send, X, Plus, Minus, Loader2, Star, ShoppingBag } from "lucide-react";

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

  const updateQty = (name: string, delta: number) => {
    setCart(cart.map(item => item.Name === name ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter(i => i.qty > 0));
  };

  const totalBill = cart.reduce((sum, item) => sum + (Number(item.Salerate) * item.qty), 0);

  const filtered = allProducts.filter(item => 
    item.Name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans text-gray-900">
      {/* Premium Header */}
      <div className="bg-white p-6 shadow-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-black text-blue-900 italic tracking-tighter">NM MART</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manjhanpur, UP</p>
          </div>
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Saman ka naam likhein (e.g. STAR)..." 
              className="w-full bg-gray-100 border-2 border-transparent p-4 rounded-2xl pl-12 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={22}/>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-32">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={50}/>
          <p className="text-gray-400 font-bold animate-pulse uppercase text-xs">Connecting to Inventory...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((item, idx) => {
            const discount = Math.round(((Number(item.Mrp) - Number(item.Salerate)) / Number(item.Mrp)) * 100);
            return (
              <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-all relative group">
                {/* Discount Tag */}
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg z-10 shadow-lg shadow-red-500/20">
                    -{discount}%
                  </span>
                )}
                
                {/* Auto Barcode Image Logic */}
                <div className="h-44 bg-white flex items-center justify-center p-4 relative overflow-hidden">
                  {item.Barcode && item.Barcode.length > 5 ? (
                    <img 
                      src={`https://images.openfoodfacts.org/images/products/${item.Barcode}/front_en.400.jpg`}
                      alt={item.Name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.placeholder-box')) {
                          parent.innerHTML = `<div class="placeholder-box w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 font-black text-3xl shadow-inner uppercase">${item.Name?.charAt(0)}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 font-black text-3xl shadow-inner uppercase">
                      {item.Name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 uppercase h-10 overflow-hidden leading-tight group-hover:text-blue-600 transition-colors">
                    {item.Name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2 mb-4">
                    <span className="text-2xl font-black text-blue-900 italic">₹{item.Salerate}</span>
                    <span className="text-xs text-gray-300 line-through font-bold">₹{item.Mrp}</span>
                  </div>

                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/10"
                  >
                    <Plus size={16}/> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black text-lg flex justify-between items-center shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">{cart.length}</div>
              <span className="text-sm uppercase tracking-widest">Order Summary</span>
            </div>
            <span className="italic">₹{totalBill}</span>
          </button>
        </div>
      )}

      {/* Modern Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-blue-900 italic">MY CART</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-6">
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase text-gray-800 leading-tight mb-1">{item.Name}</p>
                    <p className="text-blue-600 font-black italic">₹{Number(item.Salerate) * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 border border-gray-100">
                    <button onClick={() => updateQty(item.Name, -1)} className="text-red-500 hover:bg-white p-1 rounded-lg transition-colors"><Minus size={18}/></button>
                    <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="text-green-500 hover:bg-white p-1 rounded-lg transition-colors"><Plus size={18}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 mt-6">
              <div className="flex justify-between text-3xl font-black text-blue-900 italic mb-8 border-t border-gray-100 pt-6">
                <span className="text-sm text-gray-400 not-italic uppercase self-center">Grand Total</span>
                <span>₹{totalBill}</span>
              </div>
              <button 
                onClick={() => {
                   let msg = `*NEW ORDER - NM MART*%0A---------------------------%0A`;
                   cart.forEach((i, idx) => msg += `${idx+1}. *${i.Name}* (x${i.qty}) - ₹${Number(i.Salerate) * i.qty}%0A`);
                   msg += `---------------------------%0A*TOTAL BILL: ₹${totalBill}*%0A---------------------------`;
                   window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
                }}
                className="w-full bg-[#25D366] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Send size={24}/> PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;

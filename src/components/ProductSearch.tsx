import { useState, useEffect } from "react";
import { Search, Barcode, Loader2, ShoppingBasket, Plus, Minus, ShoppingCart, Send } from "lucide-react";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const MY_WHATSAPP_NUMBER = "917081154604"; // यहाँ अपना 10 अंकों का नंबर डालें (91 के साथ)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        if (Array.isArray(data)) setAllProducts(data);
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Cart Functions
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

  const placeOrder = () => {
    let message = `*NEW ORDER - NM MART*%0A%0A`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.Name} x ${item.qty} = ₹${Number(item.Salerate) * item.qty}%0A`;
    });
    message += `%0A*TOTAL BILL: ₹${totalBill}*%0A%0Aकृपया आर्डर कन्फर्म करें।`;
    window.open(`https://wa.me/${MY_WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const filteredResults = allProducts.filter(item => 
    item.Name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="py-12 bg-[#050505] min-h-screen text-white relative">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-black mb-8 text-[#FFD700] text-center italic tracking-tighter">NM MART STORE</h3>

        {/* Search Box */}
        <div className="relative max-w-xl mx-auto mb-8">
          <input 
            type="text" 
            placeholder="Search Items..." 
            className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl outline-none focus:border-[#FFD700] text-lg font-bold"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute right-5 top-5 text-[#FFD700]" size={24}/>
        </div>

        {/* Product List */}
        <div className="grid gap-4 max-w-2xl mx-auto mb-24">
          {query.length >= 2 && filteredResults.map((item, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
              <div className="text-left">
                <h4 className="font-bold text-lg uppercase leading-tight">{item.Name}</h4>
                <p className="text-[#FFD700] font-black text-xl">₹{item.Salerate}</p>
                <p className="text-[10px] opacity-40 line-through text-white">MRP: ₹{item.Mrp}</p>
              </div>
              <button 
                onClick={() => addToCart(item)}
                className="bg-[#FFD700] text-black p-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={18}/> ADD
              </button>
            </div>
          ))}
        </div>

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#FFD700] text-black p-5 rounded-2xl font-black text-lg flex justify-between items-center shadow-2xl shadow-[#FFD700]/20 animate-bounce"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={24}/>
                <span>{cart.length} ITEMS IN CART</span>
              </div>
              <span>VIEW BILL ₹{totalBill}</span>
            </button>
          </div>
        )}

        {/* Cart Sidebar/Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-end sm:items-center justify-center p-4">
            <div className="bg-[#111] w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setIsCartOpen(false)} className="absolute top-6 right-6 text-white/40 font-bold">CLOSE</button>
              <h2 className="text-2xl font-black mb-6 text-[#FFD700]">YOUR CART</h2>
              
              <div className="space-y-4 mb-8">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="text-left">
                      <p className="font-bold uppercase text-sm">{item.Name}</p>
                      <p className="text-[#FFD700] text-xs">₹{item.Salerate} x {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
                      <button onClick={() => updateQty(item.Name, -1)} className="p-1 hover:text-red-500"><Minus size={18}/></button>
                      <span className="font-bold w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.Name, 1)} className="p-1 hover:text-green-500"><Plus size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-8 border-t border-white/10 pt-4">
                <p className="font-bold opacity-50 uppercase tracking-widest text-xs">Total Bill</p>
                <p className="text-3xl font-black text-[#FFD700]">₹{totalBill}</p>
              </div>

              <button 
                onClick={placeOrder}
                className="w-full bg-green-500 text-white p-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 hover:bg-green-600 transition-all"
              >
                <Send size={20}/> PLACE ORDER ON WHATSAPP
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSearch;

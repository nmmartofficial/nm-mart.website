import { useState, useEffect } from "react";
import { Search, ShoppingBasket, Loader2, Plus, Minus, ShoppingCart, Send, X } from "lucide-react";

const ProductSearch = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const MY_WHATSAPP_NUMBER = "917081154604"; // आपका नंबर यहाँ सेट कर दिया है

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
    let message = `*NEW ORDER - NM MART*%0A---------------------------%0A`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.Name}*%0A   Qty: ${item.qty} | Price: ₹${Number(item.Salerate) * item.qty}%0A`;
    });
    message += `---------------------------%0A*TOTAL BILL: ₹${totalBill}*%0A---------------------------%0Aकृपया मेरा आर्डर तैयार रखें।`;
    window.open(`https://wa.me/${MY_WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const displayProducts = query.length >= 1 
    ? allProducts.filter(item => item.Name?.toLowerCase().includes(query.toLowerCase()))
    : allProducts;

  return (
    <section className="py-12 bg-[#050505] min-h-screen text-white px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-[#FFD700] italic">NM MART</h2>
          <p className="text-white/40 uppercase tracking-[0.3em] text-xs mt-2 font-bold">Smart Inventory & Ordering</p>
        </div>

        {/* Search Box */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <input 
            type="text" 
            placeholder="Search products (e.g. STAR, PAPAD)..." 
            className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl outline-none focus:border-[#FFD700] text-lg transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute right-5 top-5 text-[#FFD700]" size={24}/>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">

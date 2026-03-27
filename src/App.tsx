import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, Search, MapPin, X, Plus, Minus, Package, Grid3X3, Sparkles, Home, Loader2, Star, Phone, ShieldCheck, Mail, Clock, ChevronRight, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";
const WHATSAPP = "917081154604";
const ITEMS_PER_PAGE = 60;

interface Product {
  id: string;
  name: string;
  barcode: string;
  mainCat: string;
  subCat: string;
  mrp: number;
  saleRate: number;
}

interface CartItem extends Product {
  qty: number;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  'FMCG': { label: 'Daily Groceries', icon: '🛒', color: 'from-green-500 to-green-700' },
  'STATIONERY': { label: 'Stationery', icon: '✏️', color: 'from-amber-500 to-orange-600' },
  'DBSHEET': { label: 'Household Plastic', icon: '🪑', color: 'from-cyan-500 to-blue-700' },
  'PERSONAL CARE': { label: 'Personal Care', icon: '✨', color: 'from-pink-500 to-rose-600' },
};

// CSV Parsing Logic Fix - कॉलम सही से पकड़ने के लिए
function parseCSV(text: string): Product[] {
  const lines = text.split('\n');
  const products: Product[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row.trim()) continue;
    
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of row) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += char;
    }
    cols.push(current.trim());

    // कोलम मैपिंग (Index सुधार):
    // 0: Name, 1: Barcode, 2: MainCat, 3: SubCat, 4: MRP, 5: SaleRate
    const rawMrp = cols[4] ? cols[4].replace(/[^0-9.]/g, '') : "0";
    const rawSale = cols[5] ? cols[5].replace(/[^0-9.]/g, '') : "0";
    
    const mrp = parseFloat(rawMrp) || 0;
    const sale = parseFloat(rawSale) || 0;

    if (!cols[0]) continue; // नाम खाली है तो छोड़ दो

    products.push({ 
      id: String(i), 
      name: cols[0], 
      barcode: cols[1] || '', 
      mainCat: cols[2] || 'Other', 
      subCat: cols[3] || '', 
      mrp: mrp, 
      saleRate: sale > 0 ? sale : mrp // अगर सेल रेट 0 है तो MRP दिखाओ
    });
  }
  return products;
}

export default function App() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.text())
      .then(csv => { setAllProducts(parseCSV(csv)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(allProducts.map(p => p.mainCat).filter(Boolean))], [allProducts]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allProducts.filter(p =>
      (selectedCategory ? p.mainCat === selectedCategory : true) &&
      (term ? (p.name.toLowerCase().includes(term) || p.barcode.includes(searchTerm)) : selectedCategory ? true : false)
    );
  }, [allProducts, selectedCategory, searchTerm]);

  const paginatedProducts = useMemo(() => filtered.slice(0, page * ITEMS_PER_PAGE), [filtered, page]);
  const hasMore = paginatedProducts.length < filtered.length;

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  }, []);

  const totalBill = useMemo(() => cart.reduce((s, i) => s + i.saleRate * i.qty, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const sendWhatsApp = () => {
    const msg = cart.map(i => `• ${i.name} x${i.qty} = ₹${i.saleRate * i.qty}`).join('\n');
    const text = `🛒 *NM MART ORDER*\n\n${msg}\n\n💰 *Total: ₹${totalBill}*`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isSearching = searchTerm.length > 0;
  const showProducts = isSearching || selectedCategory;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary mb-4" size={50} />
      <p className="font-bold text-primary uppercase tracking-widest text-xs tracking-[0.2em]">NM MART: Loading Store...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* HEADER */}
      <header className="w-full sticky top-0 z-50 shadow-lg">
        <div className="gradient-gold text-primary py-1.5 px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1"><MapPin size={10}/> Manjhanpur, UP</span>
          <span className="hidden sm:inline">9 AM – 9 PM Daily</span>
        </div>
        <div className="gradient-navy p-4 flex justify-between items-center">
          <div className="flex items-center gap-3 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="gradient-gold p-2.5 rounded-xl shadow-lg"><ShoppingCart size={22} className="text-primary"/></div>
              <div>
                <h1 className="text-2xl font-black italic tracking-tighter leading-none font-display">
                  <span className="text-gold">NM</span> <span className="text-primary-foreground">MART</span>
                </h1>
                <p className="text-[9px] font-bold text-primary-foreground/60 tracking-widest uppercase">Your trusted neighborhood store</p>
              </div>
            </div>
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all">
              <ShoppingCart size={22} className="text-primary-foreground"/>
              {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 gradient-gold text-primary text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-primary">{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="max-w-2xl mx-auto px-4 -mt-5 relative z-10">
        <div className="relative shadow-card rounded-2xl overflow-hidden">
          <input
            type="text" placeholder="Search products (Maggi, Soap, Bucket)..."
            className="w-full bg-card text-foreground border-none p-5 pl-14 font-bold text-sm focus:ring-2 focus:ring-primary outline-none rounded-2xl"
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
          />
          <Search className="absolute left-5 top-5 text-muted-foreground" size={20}/>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!showProducts ? (
          <div>
            <h2 className="text-2xl font-black text-foreground italic mb-8 text-center font-display">Shop by <span className="text-gold">Category</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat] || { label: cat, icon: '📦', color: 'from-slate-500 to-slate-700' };
                return (
                  <motion.button key={cat} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                    className="bg-card p-6 md:p-8 rounded-[2rem] shadow-card border border-border flex flex-col items-center text-center group cursor-pointer">
                    <div className={`bg-gradient-to-br ${meta.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      {meta.icon}
                    </div>
                    <h3 className="font-black text-foreground text-xs uppercase tracking-tight">{meta.label}</h3>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => { setSelectedCategory(null); setSearchTerm(''); setPage(1); }}
                className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
                <ArrowLeft size={14}/> Back Home
              </button>
              <p className="text-sm text-muted-foreground font-bold ml-auto">{filtered.length} products found</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {paginatedProducts.map((product) => {
                const discount = product.mrp > product.saleRate ? Math.round(((product.mrp - product.saleRate) / product.mrp) * 100) : 0;
                const inCart = cart.find(i => i.id === product.id);
                
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl shadow-card border border-border overflow-hidden flex flex-col relative group">
                    
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-black px-2 py-0.5 rounded-full z-10">{discount}% OFF</div>
                    )}
                    
                    {/* PHOTO: Barcode first, then Name fallback */}
                    <div className="h-28 flex items-center justify-center p-4 bg-muted/30 relative">
                      <img
                        src={`https://images.upcitemdb.com/upc/${product.barcode}/0.jpg`}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e: any) => {
                          e.currentTarget.src = `https://loremflickr.com/320/240/${encodeURIComponent(product.name + " grocery")}`;
                          e.currentTarget.onerror = () => {
                            e.currentTarget.style.display = 'none';
                            const p = e.currentTarget.parentElement;
                            if (p && !p.querySelector('.fallback')) {
                              const d = document.createElement('div');
                              d.className = 'fallback w-12 h-12 rounded-full gradient-navy flex items-center justify-center text-primary-foreground font-black';
                              d.textContent = 'NM';
                              p.appendChild(d);
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="p-4 flex-grow flex flex-col">
                      <p className="text-[8px] text-accent font-black uppercase mb-1">{product.mainCat}</p>
                      <h3 className="font-bold text-foreground text-[11px] uppercase leading-tight h-8 overflow-hidden mb-2">{product.name}</h3>
                      
                      <div className="flex items-baseline gap-2 mb-3 mt-auto">
                        <span className="text-lg font-black text-primary">₹{product.saleRate}</span>
                        {product.mrp > product.saleRate && (
                          <span className="text-[10px] text-muted-foreground line-through">₹{product.mrp}</span>
                        )}
                      </div>

                      {inCart ? (
                        <div className="flex items-center justify-between bg-primary/5 rounded-xl p-1">
                          <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 rounded-lg gradient-navy text-primary-foreground flex items-center justify-center"><Minus size={14}/></button>
                          <span className="font-black text-primary text-sm">{inCart.qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 rounded-lg gradient-gold text-primary flex items-center justify-center"><Plus size={14}/></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)}
                          className="w-full py-2.5 rounded-xl gradient-navy text-primary-foreground font-black text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity">
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => setPage(p => p + 1)}
                  className="gradient-gold text-primary px-8 py-3 rounded-full font-black text-xs uppercase shadow-lg">
                  Load More Items
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* WHATSAPP FLOAT */}
      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[hsl(142,71%,45%)] text-white p-4 rounded-full shadow-2xl z-40 border-4 border-white">
        <Phone size={26} fill="white"/>
      </a>

      {/* CART DRAWER (SAME AS PREVIOUS) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50" onClick={() => setIsCartOpen(false)}/>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-2xl flex flex-col">
              <div className="gradient-navy p-6 flex justify-between items-center text-primary-foreground">
                <h2 className="text-xl font-black italic font-display">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)}><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-muted/50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-xs uppercase truncate">{item.name}</h4>
                      <p className="text-sm font-black text-primary">₹{item.saleRate} x {item.qty} = ₹{item.saleRate * item.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><Minus size={14}/></button>
                      <span className="font-black text-foreground text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Plus size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-muted-foreground uppercase text-xs">Final Bill</span>
                  <span className="text-2xl font-black text-primary">₹{totalBill}</span>
                </div>
                <button onClick={sendWhatsApp}
                  className="w-full bg-[hsl(142,71%,45%)] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg">
                  <Send size={16}/> Send Order on WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

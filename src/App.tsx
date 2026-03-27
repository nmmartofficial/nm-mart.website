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
  'FMCG': { label: 'Daily Essentials', icon: '🛒', color: 'from-blue-500 to-blue-700' },
  'STATIONERY': { label: 'Stationery', icon: '✏️', color: 'from-amber-500 to-orange-600' },
  'DBSHEET': { label: 'Premium Textiles', icon: '🛏️', color: 'from-purple-500 to-purple-700' },
  'PERSONAL CARE': { label: 'Personal Care', icon: '✨', color: 'from-pink-500 to-rose-600' },
};

function parseCSV(text: string): Product[] {
  const lines = text.split('\n');
  const products: Product[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row.trim()) continue;
    // Handle CSV with possible quoted fields
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of row) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += char;
    }
    cols.push(current.trim());
    const mrp = parseFloat(cols[4]) || 0;
    const sale = parseFloat(cols[5]) || 0;
    if (!cols[0]) continue;
    products.push({ id: String(i), name: cols[0], barcode: cols[1] || '', mainCat: cols[2] || 'Other', subCat: cols[3] || '', mrp, saleRate: sale > 0 ? sale : mrp });
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
      <p className="font-bold text-primary uppercase tracking-widest text-xs">NM MART Loading 7000+ Items...</p>
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
                <p className="text-[9px] font-bold text-primary-foreground/60 tracking-widest uppercase">Shop More, Save More</p>
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
            type="text" placeholder="Search 7000+ items by name or barcode..."
            className="w-full bg-card text-foreground border-none p-5 pl-14 font-bold text-sm focus:ring-2 focus:ring-primary outline-none rounded-2xl"
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
          />
          <Search className="absolute left-5 top-5 text-muted-foreground" size={20}/>
        </div>
      </div>

      {/* WELFARE CARD */}
      {!showProducts && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="gradient-gold p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-4 border-white/30"
              style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"/>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-primary">
                  <h2 className="text-3xl font-black italic uppercase mb-4 font-display">NM Mart Welfare Card</h2>
                  <ul className="space-y-3 text-sm font-bold opacity-90">
                    <li className="flex items-center gap-2"><ShieldCheck size={18}/> Extra 5% Discount on all orders</li>
                    <li className="flex items-center gap-2"><ShieldCheck size={18}/> 6-Month Loyalty Rewards</li>
                    <li className="flex items-center gap-2"><ShieldCheck size={18}/> Priority Support & Delivery</li>
                  </ul>
                </div>
                <motion.div whileHover={{ rotateY: 8, rotateX: -5 }} transition={{ type: 'spring' }}
                  className="w-64 h-40 bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl p-6 flex flex-col justify-between shadow-inner cursor-pointer">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">NM MART Member</span>
                    <div className="w-10 h-10 bg-white/30 rounded-full animate-pulse"/>
                  </div>
                  <p className="text-white font-black text-xl tracking-[0.2em] font-display">**** **** 2026</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!showProducts ? (
          /* CATEGORY GRID */
          <div>
            <h2 className="text-2xl font-black text-foreground italic mb-8 text-center font-display">Shop by <span className="text-gold">Category</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat] || { label: cat, icon: '📦', color: 'from-slate-500 to-slate-700' };
                const count = allProducts.filter(p => p.mainCat === cat).length;
                return (
                  <motion.button key={cat} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                    className="bg-card p-6 md:p-8 rounded-[2rem] shadow-card border border-border flex flex-col items-center text-center group cursor-pointer">
                    <div className={`bg-gradient-to-br ${meta.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      {meta.icon}
                    </div>
                    <h3 className="font-black text-foreground text-xs uppercase tracking-tight">{meta.label}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1">{count} Items</p>
                    <p className="text-[9px] text-accent font-bold mt-2 flex items-center gap-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Browse <ChevronRight size={10}/></p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          /* PRODUCTS VIEW */
          <div>
            <div className="flex items-center justify-between mb-6">
              {selectedCategory && !isSearching && (
                <button onClick={() => { setSelectedCategory(null); setPage(1); }}
                  className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
                  <ArrowLeft size={14}/> All Categories
                </button>
              )}
              <p className="text-sm text-muted-foreground font-bold ml-auto">{filtered.length} items found</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {paginatedProducts.map((product) => {
                const discount = product.mrp > product.saleRate ? Math.round(((product.mrp - product.saleRate) / product.mrp) * 100) : 0;
                const inCart = cart.find(i => i.id === product.id);
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl shadow-card border border-border overflow-hidden flex flex-col relative group hover:shadow-lg transition-shadow">
                    {discount >= 20 && (
                      <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[9px] font-black px-2 py-0.5 rounded-full z-10">{discount}% OFF</div>
                    )}
                    <div className={`absolute top-3 right-3 text-[8px] font-black px-2 py-0.5 rounded-full z-10 ${product.saleRate > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.saleRate > 0 ? 'In Stock' : 'Limited'}
                    </div>
                    <div className="h-28 flex items-center justify-center p-4 bg-muted/30">
                      <div className="w-14 h-14 rounded-full gradient-navy flex items-center justify-center text-primary-foreground font-black text-xl">
                        {product.name.charAt(0)}
                      </div>
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <p className="text-[8px] text-accent font-black uppercase mb-1">{product.subCat || product.mainCat}</p>
                      <h3 className="font-bold text-foreground text-[11px] uppercase leading-tight h-8 overflow-hidden mb-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3 mt-auto">
                        <span className="text-lg font-black text-primary">₹{product.saleRate}</span>
                        {product.mrp > product.saleRate && <span className="text-[10px] text-muted-foreground line-through">₹{product.mrp}</span>}
                      </div>
                      {inCart ? (
                        <div className="flex items-center justify-between bg-primary/5 rounded-xl p-1">
                          <button onClick={() => updateQty(product.id, -1)} className="w-9 h-9 rounded-lg gradient-navy text-primary-foreground flex items-center justify-center"><Minus size={14}/></button>
                          <span className="font-black text-primary text-sm">{inCart.qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} className="w-9 h-9 rounded-lg gradient-gold text-primary flex items-center justify-center"><Plus size={14}/></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)}
                          className="w-full py-2.5 rounded-xl gradient-navy text-primary-foreground font-black text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
                          <Plus size={14}/> Add to Cart
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
                  className="gradient-gold text-primary px-8 py-3 rounded-full font-black text-xs uppercase shadow-lg hover:opacity-90 transition-opacity">
                  Load More Items
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* REVIEWS */}
      {!showProducts && (
        <section className="py-16 bg-muted/50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-black text-foreground italic mb-8 text-center font-display">Happy <span className="text-gold">Customers</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { name: 'Ravi Kumar', text: 'Best rates in Manjhanpur! Delivery is always on time.', loc: 'Manjhanpur' },
                { name: 'Sunita Devi', text: 'Great variety of products. My family shops here every week.', loc: 'Kaushambi' },
                { name: 'Amit Singh', text: 'Wholesale rates for retail customers. Highly recommended!', loc: 'Bharwari' },
              ].map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent"/>)}</div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">"{r.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-navy flex items-center justify-center text-primary-foreground text-xs font-bold">{r.name[0]}</div>
                    <div><p className="text-sm font-bold text-foreground">{r.name}</p><p className="text-xs text-muted-foreground">{r.loc}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="gradient-navy text-primary-foreground py-16 px-6 border-t-4 border-accent">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h2 className="text-2xl font-black italic mb-4 font-display"><span className="text-gold">NM</span> MART</h2>
            <p className="text-sm text-primary-foreground/60 leading-relaxed mb-6">Manjhanpur's most trusted departmental store. Quality products at wholesale rates.</p>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-sm font-bold"><MapPin size={16} className="text-gold"/> Near B.P. Public School, Manjhanpur, UP</p>
              <p className="flex items-center gap-3 text-sm font-bold"><Mail size={16} className="text-gold"/> support@nmmart.in</p>
              <p className="flex items-center gap-3 text-sm font-bold"><Clock size={16} className="text-gold"/> Daily 9 AM – 9 PM</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-black uppercase tracking-widest text-gold text-sm mb-2">Quick Links</h3>
            <a href="#" className="text-sm text-primary-foreground/60 hover:text-gold transition-colors">About Us</a>
            <a href="#" className="text-sm text-primary-foreground/60 hover:text-gold transition-colors">Contact Us</a>
            <a href="#" className="text-sm text-primary-foreground/60 hover:text-gold transition-colors">Privacy Policy</a>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h3 className="font-black text-gold uppercase tracking-widest mb-4 italic text-sm">Store Info</h3>
            <p className="text-sm text-primary-foreground/60">We serve Manjhanpur & nearby areas with free local delivery on orders above ₹500.</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-[10px] font-bold tracking-widest text-primary-foreground/40 uppercase">
          Powered by NM MART – RETAIL OS v5.0 &nbsp;|&nbsp; © {new Date().getFullYear()} NM Mart. All rights reserved.
        </div>
      </footer>

      {/* CART FLOATING BAR */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
            <button onClick={() => setIsCartOpen(true)}
              className="w-full gradient-navy text-primary-foreground p-5 rounded-[2rem] font-black text-lg flex justify-between items-center shadow-2xl border-2 border-accent/30">
              <div className="flex items-center gap-3">
                <div className="gradient-gold text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">{totalItems}</div>
                <span className="text-xs uppercase tracking-widest">View Cart</span>
              </div>
              <span className="font-display italic">₹{totalBill}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50" onClick={() => setIsCartOpen(false)}/>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-2xl flex flex-col">
              <div className="gradient-navy p-6 flex justify-between items-center">
                <h2 className="text-xl font-black text-primary-foreground italic font-display">Your Cart ({totalItems})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-muted/50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl gradient-navy flex items-center justify-center text-primary-foreground font-black text-sm flex-shrink-0">{item.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-xs uppercase truncate">{item.name}</h4>
                      <p className="text-sm font-black text-primary">₹{item.saleRate * item.qty}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"><Minus size={14}/></button>
                      <span className="font-black text-foreground text-sm w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"><Plus size={14}/></button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && <p className="text-center text-muted-foreground py-20">Cart is empty</p>}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-muted-foreground uppercase text-xs">Total</span>
                    <span className="text-2xl font-black text-primary font-display">₹{totalBill}</span>
                  </div>
                  <button onClick={sendWhatsApp}
                    className="w-full bg-[hsl(142,71%,45%)] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
                    <Send size={16}/> Order on WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WHATSAPP FLOATING */}
      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[hsl(142,71%,45%)] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 border-4 border-white animate-float">
        <Phone size={26} fill="white"/>
      </a>
    </div>
  );
}

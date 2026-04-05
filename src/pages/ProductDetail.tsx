import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShoppingCart, Star, Share2, Loader2, Package, CheckCircle2, Plus, Minus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { parseProductSlug, WA_NUMBER, normalizeCategory, Product } from "@/lib/store-utils";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

const SLOGAN = "Shop More, Save More";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { allProducts, loading: productsLoading } = useProducts();
  const { addToCart, cart, updateQty } = useCart();
  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [fetching, setFetching] = useState(true);

  const { name, barcode } = parseProductSlug(slug || "");

  useEffect(() => {
    const findProduct = async () => {
      setFetching(true);
      // 1. Try finding in loaded products first
      let found = allProducts.find(p => p.barcode === barcode || p.id === barcode);
      
      if (found) {
        setProduct(found);
        setFetching(false);
        return;
      }

      // 2. If not found and products are loaded, fetch from Supabase
      if (!productsLoading) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('RawCodeNew', barcode)
            .maybeSingle();

          if (data) {
            const rate = Number(data.Rate || data.salerate || data.saleRate || 0);
            const mrp = Number(data.MRP || data.mrp || 0);
            const disc = Number(data.discountPerc || data.discount || 0);
            
            const mapped: Product = {
              id: data.RawCodeNew,
              name: data.RawName || "Unknown Product",
              price: rate,
              saleRate: rate,
              category: normalizeCategory(data.ItemGroupName || data.category || "GENERAL"),
              mrp: mrp,
              barcode: data.RawCodeNew,
              brand: data.brand || "Local",
              subCategory: data.sub_category || "",
              imageUrl: data.image_url || "",
              discount: disc,
              stock: Number(data.OpStock || 0),
              save: Math.max(0, Math.round(mrp - rate))
            };
            setProduct(mapped);
          }
        } catch (err) {
          console.error("Error fetching product:", err);
        } finally {
          setFetching(false);
        }
      }
    };

    findProduct();
  }, [slug, barcode, allProducts, productsLoading]);

  const cartItem = product ? cart.find(item => item.id === product.id) : null;
  const cartIndex = product ? cart.findIndex(item => item.id === product.id) : -1;

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addToCart(product);
    toast.success("Added to cart!");
    setTimeout(() => setAdding(false), 500);
  };

  if (fetching || (productsLoading && !product)) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">Syncing NM Database...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
          <Package size={40} />
        </div>
        <p className="text-xl font-black text-black uppercase tracking-tighter italic">Product not found</p>
        <button 
          onClick={() => navigate("/")} 
          className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase italic text-sm hover:bg-black transition-all shadow-sm"
        >
          ← Back to Store
        </button>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi NM Mart, I want to order this product:\n\n🛒 *Product:* ${product.name}\n💰 *Price:* ₹${product.price}\n📦 *MRP:* ₹${product.mrp}\n\nCan you please confirm the availability?`
  )}`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black font-sans flex flex-col">
      <Header />

      <main className="flex-1 py-6 md:py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Navigation */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-[10px] mb-4 md:mb-8 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
          </button>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left: Image Card */}
            <div className="bg-white border border-gray-100 rounded-[24px] md:rounded-[40px] p-4 md:p-12 shadow-sm lg:sticky lg:top-28">
              <div className="aspect-[4/3] md:aspect-square flex items-center justify-center overflow-hidden bg-gray-50/50 rounded-2xl md:rounded-3xl">
                <ProductImageDisplay 
                  imageUrl={product.imageUrl} 
                  name={product.name} 
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" 
                />
              </div>
              
              {/* Trust Badges - Hidden on mobile to save space, shown on md+ */}
              <div className="hidden md:grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Quality</p>
                    <p className="text-[10px] font-black uppercase text-black italic">100% Purity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Wholesale</p>
                    <p className="text-[10px] font-black uppercase text-black italic">Best Rates</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-8 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/5 border border-primary/20 text-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">
                    {product.category}
                  </span>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic ${product.stock && product.stock > 0 ? "bg-green-50 border border-green-200 text-green-600" : "bg-red-50 border border-red-200 text-red-600"}`}>
                    {product.stock && product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  {product.subCategory && (
                    <span className="text-gray-300 font-bold">/</span>
                  )}
                  {product.subCategory && (
                    <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest italic">
                      {product.subCategory}
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter leading-tight italic">
                  {product.name}
                </h1>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={16} className={i < 4 ? "fill-primary text-primary" : "text-gray-200"} />
                  ))}
                  <span className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest italic">Verified Quality</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-primary italic">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-gray-300 line-through font-bold">₹{product.mrp}</span>
                      {product.discount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest animate-pulse">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {product.save > 0 && (
                  <div className="flex items-center gap-2 text-green-600 font-black uppercase tracking-widest text-[10px] italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                    🎉 Mega Savings: You save ₹{product.save}
                  </div>
                )}

                <div className="h-[1px] bg-gray-50 my-6"></div>

                <div className="space-y-4">
                  {cartItem ? (
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      <button 
                        onClick={() => updateQty(cartIndex, -1)}
                        className="w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-black hover:text-primary transition-colors shadow-sm"
                      >
                        <Minus size={20} />
                      </button>
                      <div className="flex-1 text-center">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Quantity in Cart</p>
                        <p className="text-xl font-black italic">{cartItem.qty}</p>
                      </div>
                      <button 
                        onClick={() => updateQty(cartIndex, 1)}
                        className="w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-black hover:text-primary transition-colors shadow-sm"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAddToCart}
                      disabled={adding || !product.stock || product.stock <= 0}
                      className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-[2px] shadow-sm transition-all active:scale-[0.98] italic text-sm ${
                        product.stock && product.stock > 0 
                        ? "bg-primary text-white hover:bg-black" 
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {adding ? <Loader2 className="animate-spin" size={20} /> : (product.stock && product.stock > 0 ? <ShoppingCart size={20} /> : <Package size={20} />)} 
                      {product.stock && product.stock > 0 ? "Add to Basket" : "Out of Stock"}
                    </button>
                  )}
                  
                  <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-green-500 text-white py-5 rounded-2xl font-black uppercase tracking-[2px] shadow-sm hover:bg-black transition-all active:scale-[0.98] italic text-sm"
                  >
                    <MessageCircle size={20} /> Order on WhatsApp
                  </a>
                  <button 
                    onClick={() => navigate("/")}
                    className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-white hover:text-black border border-transparent hover:border-gray-100 transition-all text-[10px] italic"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>

              {/* Product Promise */}
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] mb-6 italic">NM Mart Promise</h4>
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase">
                    "This product is directly sourced from manufacturers to ensure the lowest wholesale price in Manjhanpur. 100% genuine quality guarantee."
                  </p>
                </div>
              </div>

              {/* Trust Badges - Mobile Only (Already hidden in the main image card for mobile) */}
              <div className="grid grid-cols-2 gap-3 md:hidden">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Quality</p>
                    <p className="text-[9px] font-black uppercase text-black italic">100% Purity</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Wholesale</p>
                    <p className="text-[9px] font-black uppercase text-black italic">Best Rates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

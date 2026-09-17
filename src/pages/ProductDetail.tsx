import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Star, Share2, Loader2, Package, CheckCircle2, Plus, Minus, ChevronRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { calculateSalePrice, parseProductSlug, normalizeCategory, Product, productSlug } from "@/lib/store-utils";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";

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

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.barcode !== product.barcode)
      .slice(0, 6);
  }, [product, allProducts]);

  useEffect(() => {
    const findProduct = async () => {
      setFetching(true);

      const queryBarcode = barcode || "";
      let found = allProducts.find(p => p.barcode === queryBarcode || p.id === queryBarcode);

      if (!found) {
        found = allProducts.find((p) => {
          const candidateValues = [p.name, p.barcode, p.category, p.brand].filter(Boolean);
          return candidateValues.some(value => value && value.toString().toLowerCase().includes(queryBarcode.toLowerCase()));
        });
      }

      if (found) {
        setProduct(found);
        setFetching(false);
        return;
      }

      if (!productsLoading) {
        try {
          const candidateColumns = [
            'barcode', 'RawCodeNew', 'code', 'id', 'product_code', 'item_code'
          ];
          let data: any = null;
          let error: any = null;

          for (const col of candidateColumns) {
            const response = await supabase
              .from('products')
              .select('*')
              .eq(col, barcode)
              .maybeSingle();

            if (response.error) {
              error = response.error;
              continue;
            }

            if (response.data) {
              data = response.data;
              break;
            }
          }

          if (!data && barcode) {
            const response = await supabase
              .from('products')
              .select('*')
              .or(`barcode.eq.${barcode},RawCodeNew.eq.${barcode},code.eq.${barcode},id.eq.${barcode}`)
              .maybeSingle();
            data = response.data;
            error = response.error;
          }

          if (data) {
            const mrp = Number(data.mrp ?? data.MRP ?? 0);
            const unitRate = Number(data.sale_rate ?? data.Rate ?? data.onlinerate ?? data.restrate ?? data.salerate ?? data.saleRate ?? 0);
            const disc = Number(data.discount_percent ?? data.discountPerc ?? data.discperc ?? data.discount ?? 0);
            const rate = calculateSalePrice(mrp, unitRate, disc);
            const stock = Number(data.stock ?? data.opstock ?? data.OpStock ?? 0);

            const mapped: Product = {
              id: String(data.barcode || data.RawCodeNew || data.id || barcode),
              name: String(data.name || data.RawName || data.itname || "Unknown Product").trim(),
              price: rate,
              saleRate: rate,
              category: normalizeCategory(String(data.category_name || data.ItemGroupName || data.category || "GENERAL")),
              mrp,
              barcode: String(data.barcode || data.RawCodeNew || data.id || barcode),
              brand: String(data.brand_name || data.brand || "Local").trim(),
              subCategory: String(data.subcategory_name || data.sub_category || "").trim(),
              imageUrl: String(data.image_url || data.picture || data.imagename || "").trim(),
              discount: disc,
              stock,
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

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | NM Mart - Best Wholesale Price in Manjhanpur`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Buy ${product.name} at wholesale price ₹${product.price}. Shop daily essentials, grocery, and more at NM Mart Manjhanpur.`);
      }
    }
  }, [product]);

  const cartItem = product ? cart.find(item => item.id === product.id) : null;
  const cartIndex = product ? cart.findIndex(item => item.id === product.id) : -1;
  const productDescription = product?.description?.trim();

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
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-6 px-4 text-center">
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
              <div className="aspect-[4/3] md:aspect-square flex items-center justify-center overflow-hidden bg-white rounded-2xl md:rounded-3xl">
                <ProductImageDisplay 
                  imageUrl={product.imageUrl} 
                  name={product.name} 
                  className="h-full w-full object-contain p-4" 
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

                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {product.brand && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">{product.brand}</span>}
                  {product.unit && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">{product.unit}</span>}
                  {product.stock !== undefined && (
                    <span className={`rounded-full border px-2.5 py-1 ${product.stock > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  )}
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
                  
                  <button 
                    onClick={() => navigate("/")}
                    className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-white hover:text-black border border-transparent hover:border-gray-100 transition-all text-[10px] italic"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>

              {productDescription ? (
                <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] mb-4 italic">Product Details</h4>
                  <p className="text-sm leading-7 text-slate-600">{productDescription}</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] mb-4 italic">Product Details</h4>
                  <p className="text-sm leading-7 text-slate-500">No description available for this product.</p>
                </div>
              )}

              {/* Trust Badges - Mobile Only */}
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

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter italic flex items-center gap-3">
                  <Package className="text-primary" size={24} /> Similar Products
                </h3>
                <Link to="/" className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-1 italic">
                  View All Collection <ChevronRight size={14} />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 xl:grid-cols-6">
                {relatedProducts.map((p, idx) => (
                  <motion.div 
                    key={`${p.barcode}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all flex flex-col cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => {
                      navigate(`/product/${productSlug(p)}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="relative h-28 bg-gray-50/50">
                      <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
                      {p.discount > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-destructive text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                          {p.discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 flex flex-col flex-1">
                      <h3 className="font-bold text-[9px] text-gray-800 uppercase leading-tight h-7 overflow-hidden mb-1.5">{p.name}</h3>
                      <div className="mt-auto flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-primary italic">₹{p.price}</span>
                        {p.mrp > p.price && (
                          <span className="text-[8px] text-gray-300 line-through font-bold">₹{p.mrp}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShoppingCart, Star } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { parseProductSlug, WA_NUMBER } from "@/lib/store-utils";
import ProductImageDisplay from "@/components/ProductImageDisplay";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { allProducts, loading } = useProducts();

  const { name, barcode } = parseProductSlug(slug || "");
  const product = allProducts.find(p => p.name === name && p.barcode === barcode)
    || allProducts.find(p => p.name === name);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-xl font-black text-primary">Product not found</p>
        <button onClick={() => navigate("/")} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm">
          ← Back to Store
        </button>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi NM Mart! I want to order:\n\n🛒 ${product.name}\n💰 Price: ₹${product.saleRate}\n📦 MRP: ₹${product.mrp}\n\nPlease confirm!`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 gradient-navy text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[hsl(var(--secondary))]" />
            <span className="font-black italic text-sm">NM MART</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Product Image */}
        <div className="bg-card rounded-3xl shadow-card border border-border p-6 mb-6">
          <div className="h-64 md:h-80 flex items-center justify-center">
            <ProductImageDisplay imageUrl={product.imageUrl} name={product.name} className="max-h-full max-w-full object-contain" />
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-card rounded-3xl shadow-card border border-border p-6 space-y-4">
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-wider">{product.category} / {product.subCategory}</p>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase">{product.name}</h1>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={16} className={i < 4 ? "fill-[hsl(var(--secondary))] text-[hsl(var(--secondary))]" : "text-muted-foreground/30"} />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.0)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">₹{product.saleRate}</span>
            {product.mrp > product.saleRate && (
              <>
                <span className="text-lg text-muted-foreground line-through">₹{product.mrp}</span>
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-md">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {product.save > 0 && (
            <p className="text-sm font-bold text-[hsl(var(--success))]">You save ₹{product.save}</p>
          )}

          <div className="pt-4 space-y-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--success))] text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg hover:opacity-90 transition-opacity active:scale-95"
            >
              <MessageCircle size={18} /> Order on WhatsApp
            </a>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-muted text-foreground py-3 rounded-2xl font-bold text-sm hover:bg-muted/80 transition-colors"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

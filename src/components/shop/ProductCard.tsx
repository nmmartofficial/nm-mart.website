import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ShoppingCart, Star, Pen } from "lucide-react";
import { Product, productSlug, WA_NUMBER } from "@/lib/store-utils";
import ProductImageDisplay from "./ProductImageDisplay";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";
import { supabase } from "@/lib/supabase/client";

const ADMIN_STORE_EMAIL = "nmmart07@gmail.com";

const ProductCard = ({
  product,
  onAddToCart,
  showAdminQuickEdit: _showAdminQuickEdit,
  onAdminQuickEdit,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
  showAdminQuickEdit?: boolean;
  onAdminQuickEdit?: (p: Product) => void;
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isAdminEditor, setIsAdminEditor] = useState(false);

  useEffect(() => {
    const applyEmail = (email: string | null | undefined) => {
      setIsAdminEditor((email?.toLowerCase() ?? "") === ADMIN_STORE_EMAIL);
    };
    supabase.auth.getSession().then(({ data }) => applyEmail(data.session?.user?.email));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyEmail(session?.user?.email);
    });
    return () => subscription.unsubscribe();
  }, []);

  const productStyle = theme.productCardStyle || "compact";
  const cardClass =
    productStyle === "premium"
      ? "rounded-2xl border-2 border-primary/20 shadow-xl"
      : productStyle === "offer"
        ? "rounded-xl border border-destructive/30"
        : "rounded-xl border border-border";
  const imageHeightClass = productStyle === "premium" ? "h-32" : productStyle === "offer" ? "h-24" : "h-28";

  const whatsappLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi NM Mart! I'd like to buy:\n\n🛒 Product: ${product.name}\n🆔 Barcode: ${product.barcode}\n💰 Price: ₹${product.price}\n\nPlease confirm my order. Thank you!`
  )}`;

  const showPen = isAdminEditor && typeof onAdminQuickEdit === "function";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group/card bg-card ${cardClass} flex cursor-pointer flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-glow`}
      onClick={() => navigate(`/product/${productSlug(product)}`)}
    >
      <div className={`relative isolate ${imageHeightClass} bg-secondary/30`}>
        <ProductImageDisplay imageUrl={product.imageUrl} name={product.name} />
        {product.badge && (
          <span className="absolute left-2 top-2 z-10 animate-pulse rounded-lg bg-primary px-2 py-1 text-[8px] font-black text-white shadow-md">
            {product.badge}
          </span>
        )}
        {product.discount > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-lg bg-destructive px-2 py-1 text-[9px] font-black text-white shadow-md">
            {product.discount}% OFF
          </span>
        )}

        {!product.stock || product.stock <= 0 ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-black">
              Out of stock
            </span>
          </div>
        ) : null}

        {showPen ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdminQuickEdit!(product);
            }}
            className="absolute bottom-2 right-2 z-[50] rounded-lg border border-primary/40 bg-white/95 p-1.5 text-primary shadow-md ring-1 ring-black/5 transition-all hover:bg-primary hover:text-white"
            title="Quick edit"
            aria-label="Edit product"
          >
            <Pen size={13} strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-tighter text-primary">
            {product.category}
          </span>
          <span
            className={`flex items-center gap-0.5 text-[7px] font-bold ${
              product.stock && product.stock > 0 ? "text-[hsl(var(--success))]" : "text-destructive"
            }`}
          >
            <Star size={8} className="fill-current" /> {product.stock && product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
          </span>
        </div>

        <h3 className="mb-1 h-7 overflow-hidden text-[10px] font-semibold uppercase leading-tight text-foreground">{product.name}</h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-black text-primary">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="text-[10px] font-medium text-muted-foreground line-through decoration-muted-foreground/50">
              ₹{product.mrp}
            </span>
          )}
        </div>

        {product.save > 0 && product.stock && product.stock > 0 && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[8px] font-bold text-[hsl(var(--success))]">Save ₹{product.save}</span>
            <span className="rounded-full bg-[hsl(var(--success))]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[hsl(var(--success))]">
              Best Deal
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (product.stock && product.stock > 0) onAddToCart(product);
            }}
            disabled={!product.stock || product.stock <= 0}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-[9px] font-bold uppercase transition-colors ${
              product.stock && product.stock > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            }`}
          >
            <ShoppingCart size={12} />
            {product.stock && product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-1.5 text-[9px] font-bold uppercase text-white shadow-md transition-all hover:bg-[#20ba5a] active:scale-95"
          >
            <MessageCircle className="h-3 w-3" /> Order on WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

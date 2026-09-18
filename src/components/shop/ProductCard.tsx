import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Pen } from "lucide-react";
import { Product, productSlug } from "@/lib/store-utils";
import ProductImageDisplay from "./ProductImageDisplay";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";
import { supabase } from "@/lib/supabase/client";
import { isActiveAdminUser } from "@/lib/adminAccess";

import { ThemeConfig } from "@/lib/storeConfig";

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  showAdminQuickEdit?: boolean;
  onAdminQuickEdit?: (p: Product) => void;
  theme?: ThemeConfig;
  className?: string;
}

const ProductCard = ({
  product,
  onAddToCart,
  showAdminQuickEdit,
  onAdminQuickEdit,
  theme: propsTheme,
  className = "",
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { theme: storeTheme } = useTheme();
  const theme = propsTheme || storeTheme;
  const [isAdminEditor, setIsAdminEditor] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const applyAdminState = async (authUserId: string | null | undefined) => {
      setIsAdminEditor(await isActiveAdminUser(supabase, authUserId ?? null));
    };

    supabase.auth.getSession().then(({ data }) => applyAdminState(data.session?.user?.id));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      applyAdminState(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const productStyle = theme.productCardStyle || "compact";
  const buttonStyle = theme.buttonStyle || "flat";

  const cardClass =
    productStyle === "premium"
      ? "rounded-[16px] border border-[#f2e6da] bg-white shadow-[0_16px_35px_-26px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-22px_rgba(255,120,0,0.16)] transition-all"
      : productStyle === "offer"
        ? "rounded-[14px] border border-[#f8d4c8] bg-[#fff7f4] hover:bg-[#fff1eb] transition-colors"
        : "rounded-[14px] border border-[#f1ece7] bg-white hover:border-[#f7c59f] transition-colors shadow-[0_10px_18px_-16px_rgba(15,23,42,0.22)]";

  function shouldDisplayLabel(text: string): boolean {
    if (!text) return false;
    const t = String(text).trim();
    if (!t) return false;
    if (/^\d+$/.test(t)) return false;
    if (t.length <= 2 && /\d/.test(t)) return false;
    return true;
  }

  const buttonClass = `h-[42px] w-full rounded-full text-[11px] md:text-[11px] font-black uppercase tracking-[0.14em] transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
    buttonStyle === "gradient"
      ? "bg-gradient-to-r from-[#ff8a00] via-[#ff7200] to-[#ff5c00] text-white border-none shadow-[0_12px_24px_-16px_rgba(255,120,0,0.8)]"
      : buttonStyle === "outline"
        ? "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white"
        : buttonStyle === "shadow"
          ? "bg-primary text-white shadow-[0_10px_18px_-14px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_22px_-16px_rgba(0,0,0,0.35)]"
          : "bg-[#111111] text-white hover:bg-[#ff7a00]"
  }`;

  const imageHeightClass = productStyle === "premium" ? "h-[138px] md:h-[210px]" : productStyle === "offer" ? "h-[134px] md:h-[200px]" : "h-[138px] md:h-[210px]";

  const productName = (product?.name || "Product").trim() || "Product";
  const rawProductUnit = (product?.unit || product?.subCategory || "").trim();
  const productUnit = shouldDisplayLabel(rawProductUnit) ? rawProductUnit : "";
  const numericPrice = Number(product?.price ?? (product as Product & { selling_price?: number }).selling_price ?? product?.saleRate ?? 0);
  const numericMrp = Number(product?.mrp ?? 0);
  const numericStock = Number(product?.stock ?? 0);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;
  const hasMrp = Number.isFinite(numericMrp) && numericMrp > 0;
  const hasStock = numericStock > 0;
  const discountPercent = useMemo(() => {
    if (hasMrp && hasPrice && numericMrp > numericPrice) {
      return Math.round(((numericMrp - numericPrice) / numericMrp) * 100);
    }
    if (Number(product?.discount) > 0) return Number(product.discount);
    return 0;
  }, [hasMrp, hasPrice, numericMrp, numericPrice, product?.discount]);
  const savingsAmount = hasMrp && hasPrice && numericMrp > numericPrice
    ? numericMrp - numericPrice
    : 0;

  const goToProduct = () => navigate(`/product/${productSlug(product)}`);
  const showPen = isAdminEditor && typeof onAdminQuickEdit === "function";

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToProduct();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${productName}`}
      onClick={goToProduct}
      onKeyDown={handleCardKeyDown}
      className={`group/card bg-card ${cardClass} flex w-full cursor-pointer flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ${className}`}
    >
      <div className={`relative isolate shrink-0 overflow-hidden ${imageHeightClass} bg-white`}>
        <ProductImageDisplay imageUrl={product.imageUrl} name={productName} className="h-full w-full object-contain p-1.5" />

        {discountPercent > 0 && (
          <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-[#ff5a36] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow-md">
            {discountPercent}% OFF
          </span>
        )}

        {!hasStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-black">
              Out of stock
            </span>
          </div>
        )}

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

      <div className="flex flex-col p-2 md:p-4">
        <h3 className="mb-1 text-[12.5px] font-semibold leading-snug text-[#111111] line-clamp-2 break-words md:text-[14px]">
          {productName}
        </h3>

        {productUnit && (
          <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">{productUnit}</p>
        )}

        <div className="mb-2">
          <div className="flex items-end gap-2">
            {hasMrp && numericMrp > numericPrice && (
              <span className="pb-0.5 text-[10.5px] font-medium text-slate-500 line-through decoration-slate-400">
                ₹{numericMrp.toLocaleString("en-IN")}
              </span>
            )}

            {hasPrice ? (
              <span className="text-[16px] font-black leading-none tracking-[-0.05em] text-[#111111] md:text-[1.5rem]">
                ₹{numericPrice.toLocaleString("en-IN")}
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-500">Price unavailable</span>
            )}
          </div>

          {savingsAmount > 0 && (
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a7d42]">
              Save ₹{savingsAmount.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        <div className="mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (hasStock) {
                onAddToCart(product);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 900);
              }
            }}
            disabled={!hasStock}
            aria-label={hasStock ? `Add ${productName} to cart` : `${productName} is out of stock`}
            className={buttonClass}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ShoppingCart size={12} />
              {hasStock ? (added ? "Added" : "Add to Cart") : "Out of Stock"}
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;

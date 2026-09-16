import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ShoppingCart, Pen } from "lucide-react";
import { Product, productSlug, WA_NUMBER } from "@/lib/store-utils";
import ProductImageDisplay from "./ProductImageDisplay";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";
import { supabase } from "@/lib/supabase/client";

import { ThemeConfig } from "@/lib/storeConfig";

const ADMIN_STORE_EMAIL = "nmmart07@gmail.com";

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  showAdminQuickEdit?: boolean;
  onAdminQuickEdit?: (p: Product) => void;
  theme?: ThemeConfig;
}

const ProductCard = ({
  product,
  onAddToCart,
  showAdminQuickEdit,
  onAdminQuickEdit,
  theme: propsTheme,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { theme: storeTheme } = useTheme();
  const theme = propsTheme || storeTheme;
  const [isAdminEditor, setIsAdminEditor] = useState(false);
  const [added, setAdded] = useState(false);

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
  const buttonStyle = theme.buttonStyle || "flat";

  const cardClass =
    productStyle === "premium"
      ? "rounded-[26px] border border-[#f2e6da] bg-white shadow-[0_20px_45px_-26px_rgba(15,23,42,0.28)] hover:-translate-y-1 hover:shadow-[0_24px_55px_-22px_rgba(255,120,0,0.16)] transition-all"
      : productStyle === "offer"
        ? "rounded-[22px] border border-[#f8d4c8] bg-[#fff7f4] hover:bg-[#fff1eb] transition-colors"
        : "rounded-[24px] border border-[#f1ece7] bg-white hover:border-[#f7c59f] transition-colors shadow-[0_12px_25px_-18px_rgba(15,23,42,0.22)]";

  const buttonClass = `min-h-11 w-full rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
    buttonStyle === "gradient"
      ? "bg-gradient-to-r from-[#ff8a00] via-[#ff7200] to-[#ff5c00] py-2.5 text-white border-none shadow-[0_16px_30px_-18px_rgba(255,120,0,0.8)]"
      : buttonStyle === "outline"
        ? "border-2 border-primary bg-transparent py-2.5 text-primary hover:bg-primary hover:text-white"
        : buttonStyle === "shadow"
          ? "bg-primary py-2.5 text-white shadow-[0_12px_24px_-15px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_28px_-16px_rgba(0,0,0,0.35)]"
          : "bg-[#111111] py-2.5 text-white hover:bg-[#ff7a00]"
  }`;

  const imageHeightClass = productStyle === "premium" ? "h-40 md:h-44" : productStyle === "offer" ? "h-32 md:h-36" : "h-36 md:h-40";

  const productName = (product?.name || "Product").trim() || "Product";
  const productBrand = (product?.brand || "").trim();
  const productCategory = (product?.category || "").trim();
  const productUnit = (product?.unit || product?.subCategory || "").trim();
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

  const whatsappLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi NM Mart, I want to buy: ${productName} (Code: ${product.barcode}) for ₹${numericPrice || product.mrp || 0}`)}`;
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
      className={`group/card bg-card ${cardClass} flex h-full min-h-[360px] cursor-pointer flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2`}
    >
      <div className={`relative isolate overflow-hidden ${imageHeightClass} bg-white`}>
        <ProductImageDisplay imageUrl={product.imageUrl} name={productName} className="h-full w-full object-contain p-3" />

        {discountPercent > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-[#ff5a36] px-2 py-1 text-[7px] font-black uppercase tracking-[0.12em] text-white shadow-md">
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

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          {productCategory ? (
            <span className="rounded-full bg-[#fff3e9] px-2 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-[#e16c00]">
              {productCategory}
            </span>
          ) : (
            <span className="h-5 w-14 rounded-full bg-slate-100" aria-hidden="true" />
          )}
          <span
            className={`text-[7px] font-black uppercase tracking-[0.12em] ${
              hasStock ? "text-[#0d8b48]" : "text-[#d83131]"
            }`}
          >
            {hasStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {productBrand && (
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{productBrand}</p>
        )}

        <h3 className="mb-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[#111111] line-clamp-2 break-words md:text-[0.96rem]">
          {productName}
        </h3>

        {productUnit && (
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">{productUnit}</p>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-end gap-2">
            {hasMrp && numericMrp > numericPrice && (
              <span className="pb-0.5 text-[10px] font-medium text-slate-500 line-through decoration-slate-400">
                ₹{numericMrp.toLocaleString("en-IN")}
              </span>
            )}

            {hasPrice ? (
              <span className="text-xl font-black leading-none tracking-[-0.05em] text-[#111111] md:text-[1.45rem]">
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

        <div className="mt-3 flex flex-col gap-2">
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

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToProduct();
            }}
            className="min-h-11 rounded-full border border-slate-200 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            aria-label={`View details for ${productName}`}
          >
            View Details
          </button>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_24px_-20px_rgba(0,0,0,0.4)] transition-all hover:bg-[#20ba5a] active:scale-95"
            aria-label={`Order ${productName} on WhatsApp`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;

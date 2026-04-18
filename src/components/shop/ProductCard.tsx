import { motion } from "framer-motion";
import { MessageCircle, ShoppingCart, Star } from "lucide-react";
import { Product, productSlug, WA_NUMBER } from "@/lib/store-utils";
import ProductImageDisplay from "./ProductImageDisplay";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (p: Product) => void }) => {
  const navigate = useNavigate();
  
  // व्हाट्सएप लिंक (NM Mart Order)
  const whatsappLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi NM Mart! I'd like to buy:\n\n🛒 Product: ${product.name}\n🆔 Barcode: ${product.barcode}\n💰 Price: ₹${product.price}\n\nPlease confirm my order. Thank you!`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all flex flex-col cursor-pointer"
      onClick={() => navigate(`/product/${productSlug(product)}`)}
    >
      <div className="relative h-28 bg-secondary/30">
        <ProductImageDisplay imageUrl={product.imageUrl} name={product.name} />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-md z-10 animate-pulse">
            {product.badge}
          </span>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-destructive text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md">
            {product.discount}% OFF
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="bg-primary/10 text-primary text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
            {product.category}
          </span>
          <span className={`text-[7px] font-bold flex items-center gap-0.5 ${product.stock && product.stock > 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
            <Star size={8} className="fill-current" /> {product.stock && product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
          </span>
        </div>
        
        <h3 className="font-semibold text-[10px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">
          {product.name}
        </h3>
        
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-black text-primary">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/50 font-medium">₹{product.mrp}</span>
          )}
        </div>

        {product.save > 0 && product.stock && product.stock > 0 && (
          <span className="text-[8px] font-bold text-[hsl(var(--success))] mt-0.5">Save ₹{product.save}</span>
        )}

        <div className="flex flex-col gap-1.5 mt-auto pt-2">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if(product.stock && product.stock > 0) onAddToCart(product); 
            }}
            disabled={!product.stock || product.stock <= 0}
            className={`w-full py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors flex items-center justify-center gap-2 ${product.stock && product.stock > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
            <ShoppingCart size={12} />
            {product.stock && product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
          
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-[#25D366] text-white text-[9px] font-bold uppercase hover:bg-[#20ba5a] transition-all shadow-md active:scale-95"
          >
            <MessageCircle className="w-3 h-3" /> Order on WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

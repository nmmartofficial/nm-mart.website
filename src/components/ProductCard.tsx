import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/data/products";

const ProductCard = ({ product }: { product: Product }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const whatsappLink = `https://wa.me/917081154604?text=${encodeURIComponent(
    `Hi NM Mart! I'd like to buy:\n\n🛒 Product: ${product.name}\n💰 Price: ₹${product.price}\n\nPlease confirm my order. Thank you!`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl shadow-card overflow-hidden group hover:shadow-lg transition-shadow"
    >
      <div className="relative p-6 bg-muted flex items-center justify-center h-40">
        <span className="text-6xl">{product.image}</span>
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md gradient-gold text-xs font-bold text-secondary-foreground">
            -{discount}%
          </span>
        )}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-xs font-semibold text-primary-foreground ${
          product.stock === "in-stock" ? "bg-success" : "bg-warning"
        }`}>
          {product.stock === "in-stock" ? "In Stock" : "Limited Stock"}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-card-foreground text-sm leading-tight">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-xs ${i < Math.floor(product.rating) ? "text-gold" : "text-muted-foreground/30"}`}>★</span>
          ))}
          <span className="text-xs text-muted-foreground ml-1">{product.rating}</span>
        </div>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-success text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          <MessageCircle className="w-4 h-4" /> Order on WhatsApp
        </a>
      </div>
    </motion.div>
  );
};

export default ProductCard;

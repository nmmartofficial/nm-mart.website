import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

// Product टाइप को यहाँ डिफाइन कर देते हैं ताकि कोई एरर न आए
interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  image: string; // यह आपकी शीट के 'Image URL' कॉलम से आएगा
  rating: number;
  stock: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  // डिस्काउंट कैलकुलेशन
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // व्हाट्सएप लिंक (NM Mart Order)
  const whatsappLink = `https://wa.me/917081154604?text=${encodeURIComponent(
    `Hi NM Mart! I'd like to buy:\n\n🛒 Product: ${product.name}\n💰 Price: ₹${product.price}\n\nPlease confirm my order. Thank you!`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl shadow-card overflow-hidden group hover:shadow-lg transition-shadow border border-gray-100"
    >
      {/* इमेज सेक्शन */}
      <div className="relative p-2 bg-white flex items-center justify-center h-48 border-b border-gray-50">
        <img 
          // यहाँ 'product.image' आपकी शीट के 'Image URL' कॉलम का डेटा उठाएगा
          src={product.image || "https://nmmart.in/logo.jpeg"} 
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // अगर लिंक काम न करे तो लोगो दिखेगा
            e.currentTarget.src = "https://nmmart.in/logo.jpeg";
          }}
        />
        
        {/* डिस्काउंट टैग */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
        
        {/* स्टॉक स्टेटस */}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase text-white ${
          product.stock === "in-stock" ? "bg-green-500" : "bg-orange-500"
        }`}>
          {product.stock === "in-stock" ? "In Stock" : "Limited"}
        </span>
      </div>

      {/* डिटेल्स सेक्शन */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-800 text-sm h-10 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-[#1a3a8a]">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* स्टार रेटिंग */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-[12px] ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200"}`}>
              ★
            </span>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({product.rating})</span>
        </div>

        {/* व्हाट्सएप बटन */}
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:bg-[#20ba5a] transition-all shadow-md active:scale-95"
        >
          <MessageCircle className="w-4 h-4" /> Order on WhatsApp
        </a>
      </div>
    </motion.div>
  );
};

export default ProductCard;

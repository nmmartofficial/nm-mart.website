import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Flame, Edit3 } from "lucide-react";
import { Product, productSlug } from "@/lib/store-utils";
import ProductImageDisplay from "./ProductImageDisplay";

interface Props {
  flat33: Product[];
  flat50: Product[];
  total50: number;
  total33: number;
  hasMore50: boolean;
  hasMore33: boolean;
  loadMore50: () => void;
  loadMore33: () => void;
  onAddToCart: (p: Product) => void;
  onQuickEdit?: (p: Product) => void;
}

const DiscountTabs = ({ 
  flat33, flat50, total50, total33, 
  hasMore50, hasMore33, loadMore50, loadMore33, 
  onAddToCart, onQuickEdit
}: Props) => {
  const [activeTab, setActiveTab] = useState<"33" | "50">("50");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminSession = localStorage.getItem("nm_admin_session") === "true";
    setIsAdminMode(adminSession);
  }, []);

  const products = activeTab === "50" ? flat50 : flat33;
  const hasMore = activeTab === "50" ? hasMore50 : hasMore33;
  const loadMore = activeTab === "50" ? loadMore50 : loadMore33;

  return (
    <section className="mb-12">
      <h2 className="text-xl md:text-2xl font-black text-primary mb-4 text-center tracking-tight uppercase italic">
        🏷️ Discount Collections
      </h2>

      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab("50")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all ${
            activeTab === "50"
              ? "bg-red-600 text-white shadow-lg shadow-red-500/20 scale-105"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          <Zap size={16} /> 50% OFF ({total50})
        </button>
        <button
          onClick={() => setActiveTab("33")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all ${
            activeTab === "33"
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          <Flame size={16} /> 33% OFF ({total33})
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {products.map((p, idx) => (
          <div key={`${p.barcode}-${idx}`}
            className="bg-card rounded-xl border border-border overflow-hidden flex flex-col cursor-pointer hover:border-primary/50 hover:shadow-glow transition-all"
            onClick={() => navigate(`/product/${productSlug(p)}`)}
          >
            <div className="relative h-28 bg-secondary/50">
              <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
              <span className={`absolute top-1.5 right-1.5 text-[10px] font-black px-2 py-1 rounded shadow-md text-white ${activeTab === "50" ? "bg-red-600" : "bg-orange-500"}`}>
                -{p.discount}% OFF
              </span>
            </div>
            <div className="p-2.5 flex flex-col flex-1">
              <h3 className="font-semibold text-[9px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">{p.name}</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-primary">₹{p.saleRate}</span>
                <span className="text-[9px] text-muted-foreground line-through">₹{p.mrp}</span>
              </div>
              <div className="flex gap-1.5 mt-auto pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                  className="flex-1 bg-primary text-primary-foreground py-1.5 rounded-lg text-[8px] font-bold uppercase hover:bg-primary/90 transition-colors"
                >
                  + Add to Cart
                </button>
                {isAdminMode && onQuickEdit && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onQuickEdit(p); }}
                    className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-black transition-all shadow-md active:scale-95"
                    title="Quick Edit Product"
                  >
                    <Edit3 size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button 
            onClick={loadMore}
            className="bg-white border-2 border-primary text-primary px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
          >
            Load More Offers
          </button>
        </div>
      )}
    </section>
  );
};

export default DiscountTabs;

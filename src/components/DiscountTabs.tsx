import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Flame } from "lucide-react";
import { Product, productSlug } from "@/lib/store-utils";
import ProductImageDisplay from "./ProductImageDisplay";

interface Props {
  flat33: Product[];
  flat50: Product[];
  onAddToCart: (p: Product) => void;
}

const DiscountTabs = ({ flat33, flat50, onAddToCart }: Props) => {
  const [activeTab, setActiveTab] = useState<"33" | "50">("50");
  const navigate = useNavigate();
  const products = activeTab === "50" ? flat50.slice(0, 12) : flat33.slice(0, 12);

  return (
    <section className="mb-12">
      <h2 className="text-xl md:text-2xl font-black text-primary italic mb-4 text-center">🏷️ Discount Collections</h2>

      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setActiveTab("50")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all ${
            activeTab === "50"
              ? "bg-orange-500 text-white shadow-lg scale-105"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Zap size={16} /> Flat 50% OFF ({flat50.length})
        </button>
        <button
          onClick={() => setActiveTab("33")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all ${
            activeTab === "33"
              ? "bg-amber-500 text-white shadow-lg scale-105"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Flame size={16} /> Flat 33% OFF ({flat33.length})
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((p, idx) => (
          <div key={`${p.barcode}-${idx}`}
            className={`bg-card rounded-2xl shadow-card border overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-all ${
              activeTab === "50" ? "border-orange-200 ring-1 ring-orange-100" : "border-amber-200 ring-1 ring-amber-100"
            }`}
            onClick={() => navigate(`/product/${productSlug(p)}`)}
          >
            <div className="relative h-28 bg-white">
              <ProductImageDisplay imageUrl={p.imageUrl} name={p.name} />
              <span className={`absolute top-1 right-1 text-[8px] font-black px-2 py-0.5 rounded-md text-white ${
                activeTab === "50" ? "bg-orange-500" : "bg-amber-500"
              }`}>
                -{p.discount}%
              </span>
            </div>
            <div className="p-2 flex flex-col flex-1">
              <h3 className="font-bold text-[9px] text-foreground uppercase leading-tight h-7 overflow-hidden mb-1">{p.name}</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-primary">₹{p.saleRate}</span>
                <span className="text-[9px] text-muted-foreground line-through">₹{p.mrp}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                className="mt-auto pt-2 w-full bg-primary text-primary-foreground py-1.5 rounded-lg text-[8px] font-bold uppercase hover:bg-primary/90 transition-colors"
              >
                + Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiscountTabs;

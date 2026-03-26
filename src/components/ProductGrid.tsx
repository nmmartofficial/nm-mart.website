import { useState } from "react";
import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";

const ProductGrid = () => {
  const [active, setActive] = useState<string>("All");

  const filtered = active === "All" ? products : products.filter(p => p.category === active);

  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Our <span className="text-gold">Products</span></h2>
          <p className="text-muted-foreground mt-2">Quality products at the best prices</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["All", ...categories].map((cat) => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === cat
                  ? "gradient-gold text-secondary-foreground shadow-gold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;

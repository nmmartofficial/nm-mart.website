import { useState, useEffect } from "react";
import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";

const ProductGrid = () => {
  const [active, setActive] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail;
      setSearch(query);
      setActive("All");
    };
    window.addEventListener("nm-search", handler);
    return () => window.removeEventListener("nm-search", handler);
  }, []);

  const filtered = products.filter((p) => {
    const matchCategory = active === "All" || p.category === active;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">Our <span className="text-gold">Products</span></h2>
          <p className="text-muted-foreground mt-2">Quality products at the best prices</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["All", ...categories].map((cat) => (
            <button key={cat} onClick={() => { setActive(cat); setSearch(""); }}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                active === cat
                  ? "gradient-gold text-secondary-foreground shadow-gold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {search && (
          <div className="text-center mb-4">
            <span className="text-sm text-muted-foreground">Showing results for "<strong>{search}</strong>"</span>
            <button onClick={() => setSearch("")} className="ml-2 text-sm text-gold hover:underline">Clear</button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">No products found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;

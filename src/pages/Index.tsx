import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import WelfareCard from "@/components/WelfareCard";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import { useState, useEffect } from "react";

const Index = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NM MART NEW INVENTORY LINK ---
  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";

  useEffect(() => {
    fetch(SHEETDB_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-700">
      {/* 1. Purana Header (support@nmmart.in ke saath) */}
      <Header />
      
      {/* 2. Welcome Section */}
      <Hero />
      
      {/* 3. Products Section (Ab isme 7000+ items aayenge) */}
      <ProductGrid products={products} isLoading={loading} />
      
      {/* 4. Aapka Favorite Welfare Card Section */}
      <WelfareCard />
      
      {/* 5. Customer Reviews */}
      <Reviews />
      
      {/* 6. Professional Footer */}
      <Footer />
      
      {/* 7. Floating Buttons */}
      <WhatsAppButton />
      <BackToTop />
    </div>
  );
};

export default Index;

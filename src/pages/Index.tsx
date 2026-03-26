import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import WelfareCard from "@/components/WelfareCard";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  // --- AAPKI OLD SETTINGS & NEW PRODUCTS ---
  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-white font-sans text-blue-900 pb-24">
      
      {/* 1. Header (Blue Bar + support@nmmart.in) */}
      <Header />
      
      {/* 2. Hero Section ("Our Products" likha hua) */}
      <Hero />
      
      {/* 3. Product Grid (Ab isme 7000+ items, Search aur Category aayenge) */}
      <ProductGrid products={products} isLoading={loading} />
      
      {/* 4. Welfare Card (Wahi Puraana Style) */}
      <WelfareCard />
      
      {/* 5. Reviews */}
      <Reviews />
      
      {/* 6. Footer (Manjhanpur, UP ke saath) */}
      <Footer />
      
      {/* 7. Floating Buttons (WhatsApp & Back to Top) */}
      <WhatsAppButton />
      <BackToTop />
    </div>
  );
};

export default Index;

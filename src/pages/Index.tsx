import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import WelfareCard from "@/components/WelfareCard";
import ProductSearch from "@/components/ProductSearch"; // यह नई लाइन है
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";

const Index = () => (
  <div className="min-h-screen flex flex-col bg-[#000814]">
    <Header />
    <Hero />
    
    {/* 5000 Products Search Section */}
    <ProductSearch /> 

    <ProductGrid />
    <WelfareCard />
    <Reviews />
    <Footer />
    <WhatsAppButton />
    <BackToTop />
  </div>
);

export default Index;

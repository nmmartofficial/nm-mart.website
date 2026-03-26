import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import WelfareCard from "@/components/WelfareCard";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <Hero />
    <ProductGrid />
    <WelfareCard />
    <Reviews />
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Index;

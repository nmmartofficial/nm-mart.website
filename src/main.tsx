import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail, User } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Index = () => {
  // आपका लोगो और स्लाइडर की इमेजेज
  const logoUrl = "https://i.postimg.cc/9XJ2GS8L/531976177-762679876312111-5423677765888496149-n-jpg-nc-cat-105-ccb-1-7-nc-sid-1d70fc-nc-ohc-Pr-Bci.jpg";
  
  const sliderImages = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200", // Grocery
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200", // Electronics
    "https://images.unsplash.com/photo-1610832958506-aa56338406cd?auto=format&fit=crop&q=80&w=1200", // Fresh Fruits
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=1200", // Sale
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200", // Offers
    "https://images.unsplash.com/photo-1534452203294-49c8913721b2?auto=format&fit=crop&q=80&w=1200", // Shopping Card
    "https://images.unsplash.com/photo-1583258292688-d5bb682b6b21?auto=format&fit=crop&q=80&w=1200"  // Store Interior
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="NM Mart Logo" className="h-10 w-10 rounded-full" />
            <h1 className="text-xl font-bold tracking-tight">NM MART</h1>
          </div>
          <p className="hidden md:block text-orange-400 font-bold">SHOP MORE SAVE MORE</p>
          <Button variant="ghost" className="text-white" onClick={() => window.location.href='/login'}>
            <User className="mr-2 h-5 w-5" /> Login
          </Button>
        </div>
      </header>

      {/* Hero Slider */}
      <section className="container mx-auto mt-4 px-4">
        <Carousel className="w-full shadow-lg rounded-xl overflow-hidden" opts={{ loop: true }}>
          <CarouselContent>
            {sliderImages.map((img, index) => (
              <CarouselItem key={index}>
                <div className="h-[250px] md:h-[450px] w-full relative">
                  <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to NM Mart</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Manjhanpur's Best Supermarket. 7,000+ Products coming soon!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Example Placeholder Cards */}
          <div className="bg-white p-6 rounded-lg shadow border border-orange-100">
            <h3 className="font-bold text-lg">Best Quality</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-orange-100">
            <h3 className="font-bold text-lg">Low Prices</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-orange-100">
            <h3 className="font-bold text-lg">Home Delivery</h3>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-4 mt-auto">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-bold mb-4">NM MART Support</h3>
            <p className="flex items-center gap-2 mb-2"><Mail size={18} /> support@nmmart.in</p>
            <p className="flex items-center gap-2"><Phone size={18} /> +917081154604</p>
          </div>
          <div className="text-right">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.open('https://wa.me/917081154604', '_blank')}
            >
              <MessageCircle className="mr-2" /> Chat on WhatsApp
            </Button>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp for Mobile */}
      <a 
        href="https://wa.me/917081154604" 
        target="_blank" 
        className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full shadow-2xl text-white z-50 hover:scale-110 transition-transform"
      >
        <MessageCircle size={30} />
      </a>
    </div>
  );
};

export default Index;

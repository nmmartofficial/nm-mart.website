import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // NM Mart Premium Banners (Bedsheets Removed)
  const slides = [
    {
      title: "FRESH GROCERY",
      subtitle: "Daily Essentials at Wholesale Rates",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
      offer: "Up to 50% OFF"
    },
    {
      title: "PREMIUM DRY FRUITS",
      subtitle: "Directly Sourced for NM Mart Customers",
      image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&q=80&w=1200",
      offer: "Mega Savings"
    },
    {
      title: "FMCG & HOUSEHOLD",
      subtitle: "Branded Products, Unbeatable Prices",
      image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&q=80&w=1200",
      offer: "Best Deals"
    },
    {
      title: "SNACKS & BEVERAGES",
      subtitle: "Stock up your pantry today",
      image: "https://images.unsplash.com/photo-1534483507468-3858c4f615f3?auto=format&fit=crop&q=80&w=1200",
      offer: "Buy More, Save More"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[500px] w-full overflow-hidden bg-black pt-20">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Dark Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          </div>

          {/* Text Content - Black & Sky Blue Theme */}
          <div className="relative h-full flex flex-col justify-center px-8 md:px-20">
            <span className="text-[#00A8E1] font-bold tracking-widest mb-4">
              {slide.offer}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight">
              {slide.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              {slide.subtitle}
            </p>
            <div className="flex gap-4">
              <button className="bg-[#00A8E1] text-black font-bold py-3 px-8 rounded-full flex items-center hover:bg-[#0081ad] transition shadow-lg shadow-[#00A8E1]/20">
                Shop Now <ShoppingCart className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Manual Controls */}
      <button 
        onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length-1 : currentSlide-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-[#00A8E1] transition"
      >
        <ArrowLeft />
      </button>
      <button 
        onClick={() => setCurrentSlide(currentSlide === slides.length-1 ? 0 : currentSlide+1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-[#00A8E1] transition"
      >
        <ArrowRight />
      </button>
    </section>
  );
};

export default Hero;

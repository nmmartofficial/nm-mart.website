import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { ShoppingCart, ShieldCheck, Truck, Users, Award, TrendingUp, Database, Cloud, Zap, Laptop, ArrowRight } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FFFAF5] text-black flex flex-col font-sans">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-black">
              The <span className="text-primary">Vision</span> of NM Mart
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest text-[10px]">
              Bringing Wholesale Prices Directly to the Doorsteps of Manjhanpur
            </p>
          </div>
        </div>

        {/* Vision Grid */}
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-100 p-10 rounded-[40px] space-y-6 hover:border-primary/30 transition-all group shadow-sm">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-black">Wholesale Revolution</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              We eliminate middlemen to provide you with genuine wholesale rates on over 7,000 products, ensuring your monthly budget goes further.
            </p>
          </div>

          <div className="bg-white border border-gray-100 p-10 rounded-[40px] space-y-6 hover:border-primary/30 transition-all group shadow-sm">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-black">Quality Assurance</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Every item in our store undergoes a rigorous quality check. We only stock brands that meet our premium standards for freshness and purity.
            </p>
          </div>

          <div className="bg-white border border-gray-100 p-10 rounded-[40px] space-y-6 hover:border-primary/30 transition-all group shadow-sm">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-black">Community First</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Based in Manjhanpur, we are more than just a store. NM Mart is built on the values of trust and transparency, serving our local community with pride.
            </p>
          </div>
        </div>

        {/* Modern Architecture Section - Reflecting the Infographic Prompt */}
        <div className="bg-[#0f172a] py-32 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                Modern <span className="text-primary">Technology</span> Bridge
              </h2>
              <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto uppercase tracking-widest">
                Our proprietary Sync System ensures real-time pricing and stock availability
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 items-center">
              {/* Local ERP System */}
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white group-hover:border-primary/50 group-hover:bg-primary/10 transition-all shadow-2xl">
                  <Database size={40} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold uppercase italic">Local SQL ERP</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Our on-ground manager, <strong>Abdul</strong>, manages the inventory on our professional POS software, ensuring every soap, spice, and snack is accounted for.
                  </p>
                </div>
              </div>

              {/* Sync Bridge */}
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="flex items-center gap-4 text-primary">
                  <Zap size={24} className="animate-pulse" />
                  <span className="font-black italic uppercase tracking-tighter text-2xl">sync.js</span>
                  <Zap size={24} className="animate-pulse" />
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black p-2 rounded-full shadow-lg">
                    <ArrowRight size={20} />
                  </div>
                </div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[4px]">Data Bridge in Action</p>
              </div>

              {/* Cloud Storefront */}
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white group-hover:border-primary/50 group-hover:bg-primary/10 transition-all shadow-2xl">
                  <Cloud size={40} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold uppercase italic">Live Cloud Website</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    The premium e-commerce platform displays live prices and discounts directly from our local warehouse to your screen in 8k clarity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-20 border-y border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <p className="text-4xl md:text-6xl font-black text-primary italic">7K+</p>
              <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Products</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-6xl font-black text-black italic">10K+</p>
              <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Happy Customers</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-6xl font-black text-primary italic">24H</p>
              <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Max Delivery Time</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-6xl font-black text-black italic">100%</p>
              <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Purity Guarantee</p>
            </div>
          </div>
        </div>

        {/* Team/Store Details */}
        <div className="max-w-5xl mx-auto px-6 py-32 text-center space-y-10">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black">Your Trusted <span className="text-primary">Local Partner</span></h2>
          <p className="text-gray-500 text-lg leading-relaxed font-medium uppercase tracking-widest text-[12px]">
            NM Mart was founded with a single mission: to make high-quality daily essentials affordable for every family in Kaushambi. By leveraging technology and direct sourcing, we bring you a shopping experience that matches international standards while maintaining the warmth of a local neighborhood store.
          </p>
          <div className="pt-10">
            <button className="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase italic text-sm hover:scale-105 transition-transform shadow-sm">
              Start Shopping Now
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

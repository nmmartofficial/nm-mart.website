import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, ShoppingBag, MapPin, Star, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      
      <main className="flex-1 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Main Title Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
              About <span className="text-[#FF8C00]">NM Mart</span>
            </h2>
            <div className="w-24 h-1 bg-[#FF8C00] mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-500 uppercase tracking-[4px] font-bold text-[10px]">
              The Ultimate Shopping Destination in Manjhanpur
            </p>
          </div>

          {/* Intro Card - Professional English Version */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-[50px] mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Award size={100} className="text-[#FF8C00]" />
            </div>
            
            <p className="text-2xl md:text-3xl font-black italic text-white mb-8 leading-tight">
              "Your Trusted Local Partner for Quality & Savings."
            </p>
            
            <div className="space-y-6 text-gray-400 text-base md:text-lg leading-relaxed">
              <p>
                <strong className="text-white">NM Mart</strong> is the leading modern departmental store in Manjhanpur, dedicated to providing a premium shopping experience to our community at the most affordable prices.
              </p>
              <p>
                We take pride in offering an extensive collection of over <span className="text-[#FF8C00] font-black text-2xl">7,000+</span> products. From daily essentials and groceries to high-quality cosmetics and our exclusive range of premium dry fruits—we guarantee 100% purity and freshness in everything we sell.
              </p>
              <p>
                At NM Mart, we believe that everyone deserves access to top-tier brands. By sourcing directly, we ensure that you get the best value for your money every time you walk through our doors.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 text-center group hover:border-[#FF8C00]/30 transition-all">
              <ShoppingBag className="text-[#FF8C00] mx-auto mb-4" size={40} />
              <h3 className="font-black text-sm uppercase tracking-widest text-white italic">7000+ Items</h3>
              <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">Grocery to Cosmetics</p>
            </div>
            
            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 text-center group hover:border-[#FF8C00]/30 transition-all">
              <ShieldCheck className="text-[#FF8C00] mx-auto mb-4" size={40} />
              <h3 className="font-black text-sm uppercase tracking-widest text-white italic">Guaranteed Purity</h3>
              <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">100% Quality Assurance</p>
            </div>

            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 text-center group hover:border-[#FF8C00]/30 transition-all">
              <MapPin className="text-[#FF8C00] mx-auto mb-4" size={40} />
              <h3 className="font-black text-sm uppercase tracking-widest text-white italic">Local Pride</h3>
              <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">Manjhanpur, Kaushambi</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="inline-block px-12 py-5 bg-[#FF8C00] text-black font-black uppercase italic rounded-2xl shadow-[0_15px_40px_rgba(255,140,0,0.3)] hover:scale-105 transition-transform">
               Shop More, Save More
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

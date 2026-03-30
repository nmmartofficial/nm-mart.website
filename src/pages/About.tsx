import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Info, Star, ShieldCheck } from "lucide-react";

const About = () => (
  <div className="min-h-screen flex flex-col bg-black">
    <Header />
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Title with NM Mart Identity */}
        <h2 className="text-3xl md:text-5xl font-black font-display text-white mb-8 italic uppercase tracking-tighter">
          About <span className="text-[#FF8C00]">NM Mart</span>
        </h2>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-[14px] md:text-[16px]">
          {/* Main Intro */}
          <div className="border-l-4 border-[#FF8C00] pl-4 bg-white/5 p-4 rounded-r-2xl">
            <p className="font-bold text-white mb-2 italic">मंझनपुर का अपना सुपरमार्केट!</p>
            <p>NM Mart is Manjhanpur's most trusted neighborhood retail store, serving our community with quality daily essentials and premium home textiles at unbeatable prices since our founding.</p>
          </div>

          {/* Mission */}
          <p>Our mission is simple: to provide every household in Manjhanpur and the surrounding areas with access to genuine, high-quality products without breaking the bank. We believe that great quality shouldn't come at a premium.</p>
          
          {/* Welfare Card - Highlighting your specific project */}
          <div className="bg-gradient-to-r from-[#FF8C00]/20 to-transparent p-5 rounded-3xl border border-[#FF8C00]/10 flex gap-4 items-center">
            <div className="bg-[#FF8C00] p-2 rounded-full text-black shrink-0">
              <Star size={24} fill="currentColor" />
            </div>
            <p>With our innovative <strong className="text-[#FF8C00]">Welfare Card</strong> membership, we reward our loyal customers with extra discounts, loyalty rewards, and priority support — because we truly believe in the motto <strong className="text-white uppercase italic">"Shop More, Save More."</strong></p>
          </div>

          <p>Visit us at our store in Manjhanpur, Uttar Pradesh, or order conveniently through WhatsApp. We're open daily from 9 AM to 9 PM and always happy to serve you.</p>
        </div>

        {/* Small Trust Badge */}
        <div className="mt-12 flex justify-center gap-8 opacity-50">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck size={20} className="text-[#FF8C00]"/>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white">100% Genuine</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Info size={20} className="text-[#FF8C00]"/>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white">Local Support</span>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;

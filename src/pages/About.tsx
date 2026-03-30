import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, ShoppingBag, Users } from "lucide-react";

const About = () => (
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
        </div>

        {/* Story Section */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-[50px] mb-10 shadow-2xl">
          <p className="text-xl md:text-2xl font-bold italic text-white mb-6 leading-tight">
            "मंझनपुर की अपनी बचत वाली दुकान - शुद्धता और विश्वास का दूसरा नाम।"
          </p>
          <div className="space-y-6 text-gray-400 text-sm md:text-base leading-relaxed">
            <p>
              <strong className="text-white">NM Mart</strong> मंझनपुर का सबसे बड़ा और आधुनिक स्टोर है। हमारा मिशन है कि हम अपने क्षेत्र के हर परिवार को बेहतरीन क्वालिटी का सामान सबसे कम दाम पर उपलब्ध करा सकें।
            </p>
            <p>
              आज हमारे पास <span className="text-[#FF8C00] font-bold text-lg">7000+</span> से ज्यादा प्रोडक्ट्स की रेंज मौजूद है। चाहे वह रोज़ाना का किराना (Grocery) हो, घरेलू सामान हो, या फिर हमारे खास प्रीमियम ड्राई फ्रूट्स—हम हर चीज़ की क्वालिटी की गारंटी लेते हैं।
            </p>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
            <ShoppingBag className="text-[#FF8C00] mx-auto mb-3" size={32} />
            <h3 className="font-bold text-xs uppercase tracking-widest text-gray-300">Huge Range</h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase">7000+ Products</p>
          </div>
          
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
            <ShieldCheck className="text-[#FF8C00] mx-auto mb-3" size={32} />
            <h3 className="font-bold text-xs uppercase tracking-widest text-gray-300">Pure Quality</h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase">Trusted Sourcing</p>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
            <Users className="text-[#FF8C00] mx-auto mb-3" size={32} />
            <h3 className="font-bold text-xs uppercase tracking-widest text-gray-300">Local Pride</h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase">Manjhanpur, UP</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-block px-10 py-4 bg-[#FF8C00] text-black font-black uppercase italic rounded-2xl shadow-[0_10px_40px_rgba(255,140,0,0.3)] hover:scale-105 transition-transform cursor-default">
             Shop More, Save More
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
);

export default About;

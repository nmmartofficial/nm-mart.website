import Header from "@/components/Header";
import Footer from "@/components/Footer";
// यहाँ 'lucide-react' का सही इस्तेमाल किया गया है ताकि एरर न आए
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";

const Contact = () => (
  <div className="min-h-screen flex flex-col bg-black text-white">
    <Header />
    
    <main className="flex-1 py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
            Contact <span className="text-[#FF8C00]">NM Mart</span>
          </h2>
          <div className="w-24 h-1 bg-[#FF8C00] mx-auto rounded-full"></div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Call & WhatsApp Box */}
          <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[50px] hover:border-[#FF8C00]/30 transition-all group text-center">
            <div className="w-16 h-16 bg-[#FF8C00] rounded-2xl flex items-center justify-center text-black mx-auto mb-6 shadow-[0_10px_30px_rgba(255,140,0,0.2)]">
              <Phone size={32} />
            </div>
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">WhatsApp & Call</h3>
            <p className="text-2xl font-black text-white italic">+91 7081154604</p>
            <p className="text-gray-500 text-xs mt-2 italic uppercase font-bold tracking-widest">Order Anytime</p>
          </div>

          {/* Email Support Box */}
          <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[50px] hover:border-[#FF8C00]/30 transition-all group text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-[#FF8C00] mx-auto mb-6 border border-white/10">
              <Mail size={32} />
            </div>
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Email Support</h3>
            <p className="text-xl font-bold text-white lowercase">support@nmmart.in</p>
            <p className="text-gray-500 text-xs mt-2 italic uppercase font-bold tracking-widest">Fast Response</p>
          </div>

        </div>

        {/* Address & Timings Footer Box */}
        <div className="bg-gradient-to-br from-[#0a0a0a] to-black border border-white/5 p-10 rounded-[50px] text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-full mb-6">
            <MapPin size={14} className="text-[#FF8C00]" />
            <span className="text-[10px] text-[#FF8C00] font-black uppercase tracking-widest italic">Store Location</span>
          </div>
          
          <p className="text-xl md:text-2xl font-bold text-white mb-4 italic">
            Manjhanpur, Kaushambi (B.P Public School के पास)
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-gray-400">
               <Clock size={16} className="text-[#FF8C00]" />
               <span className="text-sm font-bold italic uppercase tracking-widest">Daily 09:00 AM – 09:00 PM</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 border-l border-white/10 pl-6 hidden sm:flex">
               <MessageSquare size={16} className="text-[#FF8C00]" />
               <span className="text-sm font-bold italic uppercase tracking-widest underline decoration-[#FF8C00] underline-offset-4 cursor-default">Shop More, Save More</span>
            </div>
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
);

export default Contact;

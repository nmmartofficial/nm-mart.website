import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => (
  <div className="min-h-screen flex flex-col bg-black text-white">
    <Header />
    <main className="flex-1 py-20 px-6">
      <div className="max-w-4xl mx-auto border border-white/10 p-10 rounded-[50px] bg-[#0a0a0a]">
        <h2 className="text-4xl font-black text-[#FF8C00] mb-10 italic uppercase tracking-tighter text-center">
          Contact <span className="text-white font-display">NM Mart</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Number Box */}
          <div className="flex flex-col items-center p-8 bg-white/5 rounded-3xl border border-white/5">
            <Phone size={40} className="text-[#FF8C00] mb-4" />
            <h3 className="text-gray-500 uppercase font-black text-[10px] tracking-widest mb-2">WhatsApp & Call</h3>
            <p className="text-xl font-bold">+91 7081154604</p>
          </div>

          {/* Email Box */}
          <div className="flex flex-col items-center p-8 bg-white/5 rounded-3xl border border-white/5">
            <Mail size={40} className="text-[#FF8C00] mb-4" />
            <h3 className="text-gray-500 uppercase font-black text-[10px] tracking-widest mb-2">Email Support</h3>
            <p className="text-lg font-medium">support@nmmart.in</p>
          </div>
        </div>

        {/* Location & Timings */}
        <div className="mt-10 pt-10 border-t border-white/5 space-y-4 text-center">
           <p className="text-gray-400 text-sm italic">
             <MapPin size={16} className="inline mr-2 text-[#FF8C00]"/>
             Manjhanpur, Kaushambi, UP (B.P Public School के पास)
           </p>
           <p className="text-gray-400 text-sm italic">
             <Clock size={16} className="inline mr-2 text-[#FF8C00]"/>
             Open Daily: 09:00 AM – 09:00 PM
           </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;

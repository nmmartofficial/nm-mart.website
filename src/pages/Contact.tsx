import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock } from "lucide-center";

const Contact = () => (
  <div className="min-h-screen flex flex-col bg-black text-white">
    <Header />
    <main className="flex-1 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] shadow-2xl">
        <h2 className="text-4xl font-black text-[#FF8C00] mb-10 italic uppercase text-center tracking-tighter">
          Contact <span className="text-white">NM Mart</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mobile Number Box */}
          <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center">
            <Phone size={40} className="text-[#FF8C00] mb-4" />
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">WhatsApp & Call</span>
            <p className="text-xl font-bold text-white">+91 7081154604</p>
          </div>

          {/* Email Box */}
          <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center">
            <Mail size={40} className="text-[#FF8C00] mb-4" />
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Official Email</span>
            <p className="text-lg font-bold text-white">support@nmmart.in</p>
          </div>
        </div>

        {/* Address & Time */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center space-y-3">
          <p className="text-gray-400 text-sm italic uppercase font-bold">
            <MapPin size={16} className="inline mr-2 text-[#FF8C00]"/>
            Manjhanpur, Kaushambi (B.P Public School के पास)
          </p>
          <p className="text-gray-400 text-[12px] font-medium">
            <Clock size={14} className="inline mr-2 text-[#FF8C00]"/>
            Daily Store Timings: 09:00 AM – 09:00 PM
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;

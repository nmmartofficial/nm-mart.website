import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Mail, Clock, Phone } from "lucide-react";

const Contact = () => {
  const contactDetails = [
    { icon: MapPin, title: "Location", desc: "Manjhanpur, Kaushambi, UP - 212207" },
    { icon: Mail, title: "Email", desc: "support@nmmart.in" },
    { icon: Clock, title: "Timings", desc: "Daily 9 AM – 9 PM" },
    { icon: Phone, title: "WhatsApp", desc: "+91 7081154604" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black mb-10 italic uppercase tracking-tighter">
            Contact <span className="text-[#FF8C00]">Us</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {contactDetails.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex gap-4 items-center hover:border-[#FF8C00]/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF8C00] transition-colors">
                  <Icon className="w-6 h-6 text-[#FF8C00] group-hover:text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-[#FF8C00] text-sm uppercase tracking-widest">{title}</h3>
                  <p className="text-sm text-gray-400 font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Google Maps Placeholder - मंझनपुर के लिए */}
          <div className="mt-10 w-full h-64 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden">
             <p className="text-gray-600 text-xs uppercase font-bold tracking-[5px]">NM MART - Manjhanpur</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

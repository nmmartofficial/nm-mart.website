import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We will get back to you soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-black font-sans">
      <Header />
      
      <main className="flex-1 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-black">
              Get In <span className="text-primary">Touch</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[4px] text-[10px]">
              We are here to help you with your wholesale shopping needs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Information */}
            <div className="space-y-10">
              <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm space-y-8">
                <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-lg text-white">
                    <MapPin size={20} />
                  </div>
                  Our Store Location
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Address</p>
                      <p className="font-bold text-lg text-black leading-relaxed">
                        NM Mart,  Naya Nagar, Dhata Road,<br />
                        Manjhanpur, Kaushambi, UP - 212207
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Call / WhatsApp</p>
                      <p className="font-bold text-lg text-black">+91 708 115 4604</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email Support</p>
                      <p className="font-bold text-lg text-black">support@nmmart.in</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Business Hours</p>
                      <p className="font-bold text-lg text-black italic">Daily 09:00 AM – 09:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Link */}
              <div className="bg-primary p-10 rounded-[40px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h4 className="text-2xl font-black italic uppercase text-white">Instant Support?</h4>
                  <p className="font-bold text-white/80 text-sm uppercase tracking-widest">Chat with us on WhatsApp now</p>
                </div>
                <a 
                  href="https://wa.me/917081154604" 
                  target="_blank" 
                  className="bg-white text-primary px-8 py-4 rounded-2xl font-black uppercase italic text-sm hover:bg-black hover:text-white transition-all shadow-sm flex items-center gap-2"
                >
                  <MessageSquare size={18} /> Chat Now
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm space-y-8">
              <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-white">
                  <Send size={20} />
                </div>
                Send a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="ENTER YOUR NAME"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold uppercase tracking-wider text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="ENTER YOUR PHONE"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold tracking-wider text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Your Message</label>
                  <textarea 
                    placeholder="HOW CAN WE HELP YOU?"
                    required
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold uppercase tracking-wider text-sm resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-3 italic"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Send size={18} /> Send Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

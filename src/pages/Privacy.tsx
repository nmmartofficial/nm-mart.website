import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText, Globe, Scale, Mail } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-black font-sans">
      <Header />
      
      <main className="flex-1 py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full mb-4 shadow-sm">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] text-primary font-black uppercase tracking-widest italic">Secure & Transparent</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-black">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[4px] text-[10px]">
              Last Updated: April 2026
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-white border border-gray-100 p-10 md:p-16 rounded-[50px] shadow-sm space-y-16">
            
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-primary">
                <div className="p-3 bg-gray-50 rounded-2xl shadow-sm">
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-black">Introduction</h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-lg font-medium uppercase tracking-widest text-[12px]">
                Welcome to NM Mart. We value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you visit our store or use our digital services in Manjhanpur.
              </p>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-4 text-primary">
                <div className="p-3 bg-gray-50 rounded-2xl shadow-sm">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-black">Information Collection</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-8 rounded-[30px] border border-gray-100 space-y-4 shadow-sm">
                  <h4 className="font-black uppercase text-xs tracking-widest text-primary">Personal Data</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-bold">
                    We collect your name, mobile number, and delivery address to process your wholesale orders and ensure timely delivery.
                  </p>
                </div>
                <div className="bg-gray-50 p-8 rounded-[30px] border border-gray-100 space-y-4 shadow-sm">
                  <h4 className="font-black uppercase text-xs tracking-widest text-primary">Transaction Info</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-bold">
                    Details of your purchases, payment methods (COD/UPI), and loyalty point balances are securely stored in our system.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 text-primary">
                <div className="p-3 bg-gray-50 rounded-2xl shadow-sm">
                  <Lock size={24} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-black">Data Security</h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-lg font-medium uppercase tracking-widest text-[12px]">
                Your data is stored using industry-standard encryption provided by Supabase. We do not sell your personal information to third parties. Access to customer records is strictly limited to authorized personnel via our secure Admin Terminal.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 text-primary">
                <div className="p-3 bg-gray-50 rounded-2xl shadow-sm">
                  <Scale size={24} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-black">Your Rights</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Right to access your order history
                </li>
                <li className="flex items-center gap-4 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Right to correct your delivery details
                </li>
                <li className="flex items-center gap-4 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Right to request account deletion
                </li>
              </ul>
            </section>

            <div className="pt-16 border-t border-gray-100 text-center space-y-6">
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[3px]">Questions about your privacy?</p>
              <a 
                href="mailto:support@nmmart.in" 
                className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase italic text-xs hover:bg-black transition-all shadow-sm flex items-center gap-3 w-fit mx-auto"
              >
                <Mail size={16} /> Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;

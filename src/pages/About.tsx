import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      <Header />
      <main className="flex-1 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Main Card */}
          <div className="bg-[#111] border border-[#FF8C00]/20 p-10 rounded-[40px] shadow-2xl text-center">
            <h2 className="text-5xl font-black italic uppercase text-[#FF8C00] mb-6 tracking-tighter">
              About <span className="text-white font-display">NM Mart</span>
            </h2>
            
            <div className="w-20 h-1 bg-[#FF8C00] mx-auto mb-10 rounded-full"></div>

            <div className="space-y-8 text-gray-300 leading-relaxed max-w-2xl mx-auto">
              <p className="text-xl font-bold italic text-white underline decoration-[#FF8C00] underline-offset-8">
                "मंझनपुर की अपनी बचत वाली दुकान"
              </p>
              
              <p className="text-lg">
                <span className="text-[#FF8C00] font-bold">NM Mart</span> मंझनपुर का सबसे भरोसेमंद सुपरमार्केट है, जहाँ आपको <span className="text-white font-bold">7000+ से ज्यादा प्रोडक्ट्स</span> एक ही छत के नीचे मिलते हैं।
              </p>

              <p className="text-sm uppercase tracking-[2px] font-bold text-gray-500">
                Quality • Purity • Savings
              </p>

              <div className="pt-6">
                <div className="inline-block px-12 py-4 bg-[#FF8C00] text-black font-black uppercase italic rounded-2xl shadow-lg hover:bg-white transition-all duration-300">
                  Shop More, Save More
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
            <div className="p-6 bg-[#111] border border-white/5 rounded-3xl text-center">
               <p className="text-2xl font-black text-[#FF8C00]">7000+</p>
               <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Products</p>
            </div>
            <div className="p-6 bg-[#111] border border-white/5 rounded-3xl text-center">
               <p className="text-2xl font-black text-[#FF8C00]">100%</p>
               <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Purity</p>
            </div>
            <div className="p-6 bg-[#111] border border-white/5 rounded-3xl text-center col-span-2 md:col-span-1">
               <p className="text-2xl font-black text-[#FF8C00]">Manjhanpur</p>
               <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Our Home</p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

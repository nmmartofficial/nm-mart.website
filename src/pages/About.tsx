import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => (
  <div className="min-h-screen flex flex-col bg-black text-white">
    <Header />
    <main className="flex-1 py-20 px-6">
      <div className="max-w-3xl mx-auto border border-[#FF8C00]/20 p-10 rounded-[50px] bg-[#0a0a0a]">
        <h2 className="text-4xl font-black text-[#FF8C00] mb-8 italic uppercase text-center">About Our Store</h2>
        <div className="space-y-6 text-gray-300 leading-relaxed text-center">
          <p className="text-lg font-bold text-white italic underline decoration-[#FF8C00] underline-offset-8">
            "मंझनपुर की अपनी बचत वाली दुकान"
          </p>
          <p>
            NM Mart मंझनपुर का सबसे बड़ा और आधुनिक स्टोर है जहाँ आपको **7000+ से ज्यादा प्रोडक्ट्स** एक ही छत के नीचे मिलते हैं। 
          </p>
          <p>
            हम किराने के सामान (Grocery), FMCG और प्रीमियम ड्राई फ्रूट्स में सबसे अच्छी क्वालिटी और सबसे कम दाम देने का वादा करते हैं। 
          </p>
          <div className="mt-8 px-6 py-3 bg-[#FF8C00] text-black font-black uppercase italic rounded-2xl inline-block shadow-lg">
             Shop More, Save More
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;

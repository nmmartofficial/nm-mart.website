import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Phone } from "lucide-react";

const WelfareCard = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // API URL Yahan Dalein (SheetDB se jo milega)
  const SHEETDB_URL = "APNA_SHEETDB_API_URL_YAHAN_CHIPKAYEIN";

  const getExpiryDate = () => {
    const d = new Date();
    const futureDate = new Date(d.getFullYear(), d.getMonth() + 7, 0);
    return futureDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleApplyOrCheck = async () => {
    if (mobile.length !== 10) {
      alert("Kripya 10 anko ka mobile number dalein");
      return;
    }
    setLoading(true);

    try {
      // 1. Pehle check karein ki kya ye number pehle se hai?
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const data = await response.json();

      if (data.length > 0) {
        // Purana data mil gaya
        setUserData(data[0]);
      } else {
        // 2. Naya data save karein
        const expiry = getExpiryDate();
        const newEntry = { Name: name || "Customer", Mobile: mobile, Expiry: expiry };
        
        await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [newEntry] })
        });
        setUserData(newEntry);
        alert("NM Mart Welfare Card Activated!");
      }
    } catch (error) {
      alert("Connection Error! Baad mein koshish karein.");
    }
    setLoading(false);
  };

  return (
    <section id="welfare-card" className="py-16 gradient-navy relative overflow-hidden text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">NM Mart <span className="text-gold">Welfare Card</span></h2>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Virtual Card Preview */}
          <motion.div whileHover={{ scale: 1.05 }} className="w-80 h-48 rounded-2xl gradient-gold p-6 text-secondary-foreground shadow-2xl mx-auto flex flex-col justify-between">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-1"><ShoppingCart size={18}/> NM Mart</span>
              <span className="text-[10px]">PREMIUM MEMBER</span>
            </div>
            <div>
              <p className="text-xl font-bold tracking-widest">{name || "CUSTOMER NAME"}</p>
              <p className="opacity-80">{mobile || "91XXXXXXXX"}</p>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
              </div>
              <p className="text-[9px] font-bold">EXP: {userData ? userData.Expiry : "MM/YYYY"}</p>
            </div>
          </motion.div>

          {/* Form Section */}
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md text-left">
            {!userData ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs opacity-70 flex items-center gap-1"><User size={14}/> Apna Naam:</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/20 p-2 rounded mt-1" placeholder="Enter Full Name" />
                </div>
                <div>
                  <label className="text-xs opacity-70 flex items-center gap-1"><Phone size={14}/> Mobile Number:</label>
                  <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g,''))} maxLength={10} className="w-full bg-white/5 border border-white/20 p-2 rounded mt-1" placeholder="91XXXXXXXX" />
                </div>
                <button onClick={handleApplyOrCheck} disabled={loading} className="w-full bg-gold text-secondary-foreground font-bold py-3 rounded-xl">
                  {loading ? "Checking..." : "Card Activate Karein"}
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                <CheckCircle className="mx-auto text-green-400 mb-2" size={48} />
                <h3 className="text-xl font-bold">Swagat hai, {userData.Name}!</h3>
                <p className="text-sm opacity-80 mt-2">Aapka Card Active hai.</p>
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-gold/30">
                  <p className="text-xs text-gold">Validity (Mahine ke aakhir tak):</p>
                  <p className="font-bold text-lg">{userData.Expiry}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelfareCard;

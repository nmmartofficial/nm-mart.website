import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Phone, Calendar, Loader2 } from "lucide-react";

const WelfareCard = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Aapka SheetDB API Link
  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";

  const getExpiryDate = () => {
    const d = new Date();
    // 6 mahine baad waale mahine ki aakhiri tarikh
    const futureDate = new Date(d.getFullYear(), d.getMonth() + 7, 0);
    return futureDate.toLocaleDateString('hi-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleApplyOrCheck = async () => {
    if (mobile.length !== 10) {
      alert("Kripya 10 anko ka mobile number dalein");
      return;
    }
    setLoading(true);

    try {
      // 1. Check karein ki kya number pehle se Sheet mein hai
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const data = await response.json();

      if (data && data.length > 0) {
        // Purana data mil gaya
        setUserData(data[0]);
      } else {
        // 2. Naya data save karein (Agar pehle se nahi hai)
        const expiry = getExpiryDate();
        const newEntry = { 
          Name: name || "Valued Customer", 
          Mobile: mobile, 
          Expiry: expiry 
        };
        
        await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [newEntry] })
        });
        setUserData(newEntry);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Technical dikkat aa rahi hai. Kripya thodi der baad koshish karein.");
    }
    setLoading(false);
  };

  return (
    <section id="welfare-card" className="py-16 gradient-navy relative overflow-hidden text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
          NM Mart <span className="text-gold">Welfare Card</span>
        </h2>
        <p className="text-primary-foreground/60 mb-12">Smart bachat aur dheron rewards sirf aapke liye</p>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Virtual Card Design */}
          <motion.div 
            animate={{ rotateY: [0, 5, 0, -5, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-80 h-48 rounded-2xl gradient-gold p-6 text-secondary-foreground shadow-2xl mx-auto flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
            <div className="relative z-10 flex justify-between items-center font-bold">
              <span className="flex items-center gap-1"><ShoppingCart size={18}/> NM Mart</span>
              <span className="text-[10px] tracking-widest">WELFARE MEMBER</span>
            </div>
            <div className="relative z-10 text-left">
              <p className="text-xl font-bold uppercase tracking-tight truncate">
                {userData ? userData.Name : (name || "CUSTOMER NAME")}
              </p>
              <p className="opacity-80 font-mono tracking-tighter">
                {userData ? userData.Mobile : (mobile || "91XXXXXXXX")}
              </p>
            </div>
            <div className="relative z-10 flex justify-between items-end">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase opacity-70">Valid Thru</p>
                <p className="text-[10px] font-bold">{userData ? userData.Expiry : "MM/YYYY"}</p>
              </div>
            </div>
          </motion.div>

          {/* Input & Form Section */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl text-left shadow-xl">
            {!userData ? (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold opacity-70 flex items-center gap-2 mb-2 uppercase tracking-wider">
                    <User size={14} className="text-gold"/> Aapka Naam
                  </label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" 
                    placeholder="Your Name" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold opacity-70 flex items-center gap-2 mb-2 uppercase tracking-wider">
                    <Phone size={14} className="text-gold"/> Mobile Number
                  </label>
                  <input 
                    type="text" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g,''))} 
                    maxLength={10} 
                    className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" 
                    placeholder="Mobile Number" 
                  />
                </div>
                <button 
                  onClick={handleApplyOrCheck} 
                  disabled={loading} 
                  className="w-full bg-gold text-secondary-foreground font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg shadow-gold/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Card Activate Karein"}
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Shubhkaamnaein, {userData.Name}!</h3>
                <p className="text-sm opacity-60 mb-8 font-light">Aapka card safaltapurvak active ho gaya hai.</p>
                <div className="p-5 bg-gold/10 rounded-2xl border border-gold/30 mb-6">
                  <p className="text-[10px] text-gold uppercase font-bold tracking-widest mb-1 flex items-center justify-center gap-2">
                    <Calendar size={12}/> Membership Expiry
                  </p>
                  <p className="font-bold text-xl text-white">{userData.Expiry}</p>
                </div>
                <button 
                  onClick={() => setUserData(null)} 
                  className="text-xs opacity-40 hover:opacity-100 transition-opacity underline"
                >
                  Doosra number check karein
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelfareCard;

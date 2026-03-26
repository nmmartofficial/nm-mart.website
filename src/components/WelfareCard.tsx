import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, CreditCard, Wallet, Loader2, RefreshCw, ArrowUpRight, PlusCircle } from "lucide-react";

const WelfareCard = () => {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";

  // 7 महीने की एक्सपायरी डेट निकालने के लिए
  const getExpiryDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 7);
    return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAuth = async () => {
    if (mobile.length !== 10) {
      alert("कृपया 10 अंकों का नंबर डालें");
      return;
    }
    setLoading(true);

    try {
      // 1. पहले चेक करें क्या यूजर पहले से है?
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const data = await response.json();

      if (data && data.length > 0) {
        // यूजर मिल गया -> लॉगिन करें
        setUserData(data[0]);
        setIsNewUser(false);
      } else if (!isNewUser) {
        // यूजर नहीं मिला -> साइनअप फॉर्म दिखाएँ
        setIsNewUser(true);
        setLoading(false);
        return;
      } else {
        // 2. नया यूजर रजिस्टर करें (Signup)
        if (!name) {
          alert("कृपया अपना नाम लिखें");
          setLoading(false);
          return;
        }

        const newUser = {
          Name: name,
          Mobile: mobile,
          Expiry: getExpiryDate(),
          Usage: "0",
          Profit: "₹0",
          Target: "₹1500",
          MonthlyUsed: "0"
        };

        const postRes = await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [newUser] })
        });

        if (postRes.ok) {
          setUserData(newUser);
          alert("बधाई हो! आपका NM Mart कार्ड एक्टिव हो गया है।");
        }
      }
    } catch (error) {
      alert("सर्वर एरर! कृपया दोबारा प्रयास करें।");
    }
    setLoading(false);
  };

  return (
    <section id="welfare-card" className="py-20 gradient-navy text-white min-h-screen">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-12 italic tracking-tighter uppercase">NM MART <span className="text-gold">CLUB</span></h2>

        {!userData ? (
          /* LOGIN / SIGNUP FORM */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gold">
              {isNewUser ? <PlusCircle size={32}/> : <User size={32}/>}
            </div>
            
            <h3 className="text-xl font-bold mb-8 italic">
              {isNewUser ? "CREATE NEW CARD" : "MEMBER LOGIN"}
            </h3>

            <div className="space-y-6 text-left">
              <div>
                <label className="text-[10px] font-bold opacity-40 uppercase ml-2 tracking-widest">Mobile Number</label>
                <input 
                  type="text" placeholder="91XXXXXXXX" value={mobile} maxLength={10} 
                  onChange={(e)=>setMobile(e.target.value.replace(/\D/g,''))} 
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-gold outline-none text-xl font-bold tracking-widest mt-1" 
                />
              </div>

              <AnimatePresence>
                {isNewUser && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <label className="text-[10px] font-bold opacity-40 uppercase ml-2 tracking-widest">Full Name</label>
                    <input 
                      type="text" placeholder="अपना नाम लिखें" value={name} 
                      onChange={(e)=>setName(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-gold outline-none text-lg font-bold mt-1" 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleAuth} disabled={loading} className="w-full bg-gold text-black font-black py-5 rounded-2xl uppercase shadow-lg shadow-gold/20 hover:scale-[1.02] transition-all flex justify-center">
                {loading ? <Loader2 className="animate-spin"/> : (isNewUser ? "Activate My Card" : "Enter Dashboard")}
              </button>

              {isNewUser && (
                <p className="text-[10px] text-center opacity-40 mt-4 italic">Registering will add your details to NM Mart Welfare Database.</p>
              )}
            </div>
          </motion.div>
        ) : (
          /* SUCCESS DASHBOARD */
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
            {/* Virtual Card */}
            <div className="w-full max-w-sm h-56 rounded-[2.5rem] gradient-gold p-8 text-black shadow-2xl relative overflow-hidden mx-auto">
                <div className="relative z-10 flex justify-between font-black italic">
                   <span className="flex items-center gap-2"><ShoppingCart size={20}/> NM MART</span>
                   <span className="text-[8px] border border-black/30 px-2 py-1 rounded-full uppercase">Member</span>
                </div>
                <div className="mt-10 relative z-10 text-left">
                   <p className="text-[8px] uppercase font-black opacity-40 tracking-widest">Card Holder</p>
                   <p className="text-3xl font-black uppercase truncate leading-none mt-1">{userData.Name}</p>
                </div>
                <div className="mt-8 flex justify-between items-end relative z-10 border-t border-black/10 pt-4">
                   <p className="font-mono text-sm tracking-widest">{userData.Mobile}</p>
                   <p className="text-[10px] font-black uppercase tracking-tighter">Exp: {userData.Expiry}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-left">
                  <ArrowUpRight className="text-blue-400 mb-2" size={24}/>
                  <p className="text-[10px] opacity-40 font-bold uppercase mb-1">Total Usage</p>
                  <p className="text-4xl font-black">{userData.Usage || "0"}</p>
               </div>
               <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-left">
                  <Wallet className="text-green-400 mb-2" size={24}/>
                  <p className="text-[10px] opacity-40 font-bold uppercase mb-1">Total Profit</p>
                  <p className="text-4xl font-black text-gold">{userData.Profit || "₹0"}</p>
               </div>
               <button onClick={()=>setUserData(null)} className="col-span-2 text-[10px] opacity-20 hover:opacity-100 underline mt-4">Logout</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WelfareCard;

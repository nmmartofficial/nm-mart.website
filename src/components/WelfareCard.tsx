import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Wallet, Loader2, RefreshCw, AlertTriangle, Timer, PlusCircle } from "lucide-react";

const WelfareCard = () => {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";

  // Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if User Exists or Register New
  const handleAuth = async () => {
    if (mobile.length !== 10) { alert("10 अंकों का नंबर डालें"); return; }
    setLoading(true);

    try {
      // 1. Pehle check karein kya number exist karta hai?
      const checkRes = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const checkData = await checkRes.json();

      if (checkData && checkData.length > 0) {
        setUserData(checkData[0]); // Login Successful
      } else if (!showSignup) {
        setShowSignup(true); // Number nahi mila, Signup dikhao
      } else {
        // 2. Signup Process: Naya entry banayein
        if (!name) { alert("कृपया अपना पूरा नाम लिखें"); setLoading(false); return; }
        
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 7); // 7 mahine ki validity
        const formattedExpiry = expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        const newUser = {
          Name: name,
          Mobile: mobile,
          Expiry: formattedExpiry,
          Usage: "0",
          Profit: "₹0",
          Target: "₹1500",
          MonthlyUsed: "0"
        };

        await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [newUser] })
        });

        setUserData(newUser);
        alert("बधाई हो! आपका NM Mart Welfare Card एक्टिवेट हो गया है।");
      }
    } catch (error) { alert("Error connecting to server!"); }
    setLoading(false);
  };

  return (
    <section className="py-16 gradient-navy text-white min-h-screen">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-black mb-10 italic">NM MART <span className="text-gold">WELFARE</span></h2>

        {!userData ? (
          /* AUTH BOX (Login + Signup) */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gold">
              {showSignup ? <PlusCircle size={20}/> : <User size={20}/>}
              {showSignup ? "NEW CARD REGISTRATION" : "MEMBER LOGIN"}
            </h3>
            
            <div className="space-y-6">
              <input 
                type="text" placeholder="Mobile Number" value={mobile} maxLength={10} 
                onChange={(e)=>setMobile(e.target.value.replace(/\D/g,''))} 
                className="w-full bg-transparent border-b-2 border-white/20 py-3 outline-none focus:border-gold text-xl font-bold tracking-widest transition-all" 
              />
              
              <AnimatePresence>
                {showSignup && (
                  <motion.input 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    type="text" placeholder="Your Full Name" value={name} 
                    onChange={(e)=>setName(e.target.value)} 
                    className="w-full bg-transparent border-b-2 border-white/20 py-3 outline-none focus:border-gold text-lg" 
                  />
                )}
              </AnimatePresence>

              <button onClick={handleAuth} disabled={loading} className="w-full bg-gold text-black font-black py-4 rounded-xl uppercase tracking-widest hover:scale-105 transition-all flex justify-center items-center">
                {loading ? <Loader2 className="animate-spin"/> : (showSignup ? "Activate My Card" : "Enter Dashboard")}
              </button>
              
              {showSignup && (
                <button onClick={()=>setShowSignup(false)} className="text-[10px] opacity-40 hover:opacity-100 underline">Wait, I already have a card</button>
              )}
            </div>
          </motion.div>
        ) : (
          /* DASHBOARD SECTION (Wahi Purana Wala logic jo maine pichle message mein diya tha) */
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 text-left">
              {/* Virtual Card & Stats here */}
              <div className="bg-red-600/10 border-4 border-red-600 rounded-[3rem] p-8 relative overflow-hidden">
                  <h3 className="text-2xl font-black italic text-red-500 mb-4 flex items-center gap-2"><AlertTriangle/> SAVE MORE!</h3>
                  <p className="text-lg">नमस्ते {userData.Name}, आपके कार्ड में अभी ₹{parseInt(userData.Target || 1500) - parseInt(userData.Profit || 0)} की बचत बाकी है।</p>
                  <div className="mt-6 p-4 bg-red-600 rounded-xl text-center">
                      <p className="text-[10px] font-bold uppercase text-black/60 mb-1">Time Left This Month:</p>
                      <p className="text-3xl font-mono font-black text-black">{timeLeft}</p>
                  </div>
                  <button onClick={()=>setUserData(null)} className="mt-8 text-[10px] opacity-30 underline">Logout</button>
              </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WelfareCard;

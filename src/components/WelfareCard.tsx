import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Wallet, Loader2, RefreshCw, AlertTriangle, Timer, PlusCircle, CreditCard } from "lucide-react";

const WelfareCard = () => {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAuth = async () => {
    if (mobile.length !== 10) { alert("10 अंकों का नंबर डालें"); return; }
    setLoading(true);

    try {
      const checkRes = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const checkData = await checkRes.json();

      if (checkData && checkData.length > 0) {
        setUserData(checkData[0]); 
      } else if (!showSignup) {
        setShowSignup(true); 
      } else {
        if (!name) { alert("कृपया अपना नाम लिखें"); setLoading(false); return; }
        
        // Auto-Generate Card Data
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + 7);
        const formattedExp = expDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        const newUser = {
          Name: name,
          Mobile: mobile,
          Expiry: formattedExp,
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
          alert("बधाई हो! आपका NM Mart कार्ड बन गया है।");
        }
      }
    } catch (error) { alert("Server Error! Try again."); }
    setLoading(false);
  };

  const getRemainingProfit = () => {
    const target = parseInt(userData?.Target?.replace(/\D/g, "") || "1500");
    const profit = parseInt(userData?.Profit?.replace(/\D/g, "") || "0");
    return target - profit;
  };

  return (
    <section className="py-20 gradient-navy text-white min-h-screen">
      <div className="container mx-auto px-4">
        
        <AnimatePresence mode="wait">
          {!userData ? (
            /* SIGNUP / LOGIN FORM */
            <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="max-w-md mx-auto bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-xl text-center">
              <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <CreditCard size={40}/>
              </div>
              <h2 className="text-2xl font-black mb-2 italic tracking-tighter uppercase">NM MART CLUB</h2>
              <p className="text-xs opacity-50 mb-8 uppercase tracking-[0.2em]">Register & Track Savings</p>
              
              <div className="space-y-6 text-left">
                <div>
                  <label className="text-[10px] font-bold opacity-40 uppercase ml-2">Mobile Number</label>
                  <input type="text" placeholder="91XXXXXXXX" value={mobile} maxLength={10} onChange={(e)=>setMobile(e.target.value.replace(/\D/g,''))} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-gold outline-none text-xl font-bold tracking-widest mt-1" />
                </div>
                
                {showSignup && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="text-[10px] font-bold opacity-40 uppercase ml-2">Full Name</label>
                    <input type="text" placeholder="Enter Your Name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-gold outline-none text-lg font-bold mt-1" />
                  </motion.div>
                )}

                <button onClick={handleAuth} disabled={loading} className="w-full bg-gold text-black font-black py-5 rounded-2xl uppercase shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center">
                  {loading ? <Loader2 className="animate-spin"/> : (showSignup ? "Create My Card Now" : "Login to My Card")}
                </button>
                
                {showSignup && (
                  <p className="text-[10px] text-center opacity-40 mt-4 italic">By creating a card, you agree to NM Mart Welfare Terms.</p>
                )}
              </div>
            </motion.div>
          ) : (
            /* DIGITAL CARD & DASHBOARD */
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
               {/* Digital Card */}
               <div className="space-y-6 flex flex-col items-center">
                  <div className="w-full max-w-sm h-56 rounded-[2.5rem] gradient-gold p-8 text-black shadow-2xl relative overflow-hidden group">
                     <div className="relative z-10 flex justify-between font-black italic">
                        <span className="flex items-center gap-2"><ShoppingCart size={20}/> NM MART</span>
                        <span className="text-[8px] border border-black/30 px-2 py-1 rounded-full">ACTIVE MEMBER</span>
                     </div>
                     <div className="mt-10 relative z-10">
                        <p className="text-[10px] uppercase font-black opacity-40">Card Holder</p>
                        <p className="text-3xl font-black uppercase truncate leading-none mt-1">{userData.Name}</p>
                     </div>
                     <div className="mt-8 flex justify-between items-end relative z-10 border-t border-black/10 pt-4">
                        <p className="font-mono text-sm tracking-widest">{userData.Mobile}</p>
                        <p className="text-[10px] font-black uppercase">Exp: {userData.Expiry}</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-left">
                      <p className="text-[10px] opacity-40 font-bold mb-1">TOTAL PROFIT</p>
                      <p className="text-3xl font-black text-gold">₹{userData.Profit}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-left">
                      <p className="text-[10px] opacity-40 font-bold mb-1">STORE VISITS</p>
                      <p className="text-3xl font-black">{userData.Usage}</p>
                    </div>
                  </div>
               </div>

               {/* Urgency Alert */}
               <div className="bg-red-600/10 border-4 border-red-600 rounded-[3rem] p-10 text-left relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black italic text-red-500 flex items-center gap-2 mb-4"><AlertTriangle/> SAVINGS ALERT!</h3>
                    <p className="text-lg text-white/90 leading-tight">नमस्ते {userData.Name}, आपके कार्ड में अभी <span className="text-2xl font-black text-white underline decoration-gold">₹{getRemainingProfit()}</span> का फायदा बचा हुआ है।</p>
                    
                    <div className="mt-8 bg-red-600 p-6 rounded-2xl shadow-xl">
                        <p className="text-[10px] font-bold text-black/60 uppercase text-center mb-2 flex items-center justify-center gap-2"><Timer size={14}/> Month Deadline:</p>
                        <p className="text-4xl font-mono font-black text-black text-center bg-white py-3 rounded-xl">{timeLeft}</p>
                    </div>
                    
                    <div className="mt-10 flex justify-between items-center border-t border-red-600/30 pt-6">
                        <button onClick={()=>window.location.reload()} className="flex items-center gap-2 text-[10px] font-bold uppercase bg-white/10 px-4 py-2 rounded-full"><RefreshCw size={12}/> Update</button>
                        <button onClick={()=>setUserData(null)} className="text-[10px] opacity-30 underline">Logout</button>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default WelfareCard;

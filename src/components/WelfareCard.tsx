import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Phone, Wallet, Loader2, RefreshCw, AlertTriangle, Timer, TrendingUp } from "lucide-react";

const WelfareCard = () => {
  const [mobile, setMobile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";

  // Countdown Logic (Mahine ke ant tak)
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

  const handleLogin = async () => {
    if (mobile.length !== 10) { alert("10 अंकों का नंबर डालें"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const data = await response.json();
      if (data && data.length > 0) setUserData(data[0]);
      else alert("कार्ड रजिस्टर नहीं है। स्टोर पर संपर्क करें।");
    } catch (error) { alert("सर्वर एरर!"); }
    setLoading(false);
  };

  // Card Profit Calculations
  const totalSaved = () => parseInt(userData?.Profit?.replace(/\D/g, "") || "0");
  const cardCost = 599;
  const netGain = totalSaved() - cardCost;
  const remainingTarget = () => parseInt(userData?.Target?.replace(/\D/g, "1500")) - totalSaved();

  return (
    <section className="py-16 gradient-navy text-white min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-black mb-10 italic text-center">NM MART <span className="text-gold">SAVINGS HUB</span></h2>

        {!userData ? (
          <div className="max-w-md mx-auto bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="text-gold"/> MEMBER LOGIN</h3>
            <input type="text" placeholder="Mobile Number" value={mobile} maxLength={10} onChange={(e)=>setMobile(e.target.value.replace(/\D/g,''))} className="w-full bg-transparent border-b-2 border-white/20 py-3 mb-8 outline-none focus:border-gold text-xl font-bold tracking-widest" />
            <button onClick={handleLogin} disabled={loading} className="w-full bg-gold text-black font-black py-4 rounded-xl uppercase tracking-widest hover:scale-105 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto"/> : "Check My Card Profit"}
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            
            {/* Left: Card & Net Profit */}
            <div className="space-y-6">
              <div className="w-full h-56 rounded-[2.5rem] gradient-gold p-8 text-black shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 flex justify-between font-black italic">
                    <span>NM MART WELFARE</span>
                    <span className="text-[10px] bg-black/10 px-2 py-1 rounded">PREMIUM MEMBER</span>
                 </div>
                 <div className="mt-8 relative z-10">
                    <p className="text-[10px] uppercase font-bold opacity-60">Card Holder</p>
                    <p className="text-3xl font-black uppercase truncate leading-none">{userData.Name}</p>
                 </div>
                 <div className="mt-6 flex justify-between items-end relative z-10 border-t border-black/10 pt-4">
                    <p className="font-mono text-sm tracking-widest">{userData.Mobile}</p>
                    <div className="text-right leading-none">
                        <p className="text-[8px] uppercase font-bold">Total Benefit</p>
                        <p className="text-lg font-black italic">₹{userData.Profit}</p>
                    </div>
                 </div>
              </div>

              {/* Net Gain Calculator */}
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-left">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Card Value Status</p>
                    <TrendingUp className="text-green-400" size={18}/>
                </div>
                <div className="flex justify-between text-sm mb-1">
                    <span>Card Investment:</span>
                    <span className="font-bold">₹{cardCost}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                    <span>Total Profit Earned:</span>
                    <span className="text-gold font-bold">₹{totalSaved()}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs uppercase font-bold">Net Returns:</span>
                    <span className={`text-xl font-black ${netGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {netGain >= 0 ? `+₹${netGain}` : `-₹${Math.abs(netGain)}`}
                    </span>
                </div>
              </div>
            </div>

            {/* Right: Urgent Warning & Remaining Balance */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-red-600/10 border-4 border-red-600 rounded-[3rem] p-8 text-left relative overflow-hidden"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-red-500 mb-6">
                        <AlertTriangle size={28} className="animate-pulse"/>
                        <h3 className="text-2xl font-black italic uppercase leading-none">Hurry! Save More</h3>
                    </div>
                    <p className="text-lg mb-4">
                        नमस्ते <b>{userData.Name}</b>, आपके कार्ड में अभी भी <span className="text-2xl font-black text-white underline decoration-gold">₹{remainingTarget()}</span> का प्रॉफिट बैलेंस बचा है।
                    </p>
                    
                    <div className="bg-red-600 p-4 rounded-2xl mb-6 shadow-xl">
                        <p className="text-[10px] font-bold uppercase text-black/60 text-center flex items-center justify-center gap-2 mb-2">
                            <Timer size={14}/> Monthly Deadline:
                        </p>
                        <p className="text-3xl font-mono font-black text-black text-center bg-white py-2 rounded-lg">
                            {timeLeft}
                        </p>
                    </div>

                    <p className="text-xs opacity-70 italic mb-8">
                        *यह फायदा केवल NM Mart के रजिस्टर्ड कार्ड होल्डर्स के लिए है। इस महीने की लिमिट खत्म होने से पहले खरीदारी करें!
                    </p>

                    <div className="flex justify-between items-center">
                        <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all">
                            <RefreshCw size={12}/> Update Stats
                        </button>
                        <button onClick={()=>setUserData(null)} className="text-[10px] opacity-30 underline">Logout</button>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/20 blur-[60px] rounded-full"></div>
            </motion.div>

          </div>
        )}
      </div>
    </section>
  );
};

export default WelfareCard;

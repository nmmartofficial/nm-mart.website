import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Phone, Wallet, Loader2, RefreshCw, Calendar, Zap } from "lucide-react";

const WelfareCard = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";
  const MONTHLY_LIMIT = 250; // Aapki set ki gayi limit

  const fetchData = async (num: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${num}`);
      const data = await response.json();
      if (data && data.length > 0) setUserData(data[0]);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (mobile.length !== 10) { alert("10 anko ka number dalein"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        alert("Number register nahi hai. Store par sampark karein.");
      }
    } catch (error) { alert("Server error!"); }
    setLoading(false);
  };

  // Monthly limit progress nikalne ke liye
  const calculateMonthlyProgress = () => {
    if (!userData?.MonthlyUsed) return 0;
    const used = parseInt(userData.MonthlyUsed.replace(/\D/g, ""));
    return Math.min(Math.round((used / MONTHLY_LIMIT) * 100), 100);
  };

  return (
    <section id="welfare-card" className="py-16 gradient-navy text-white min-h-screen">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-2 italic tracking-tighter">NM MART <span className="text-gold">WELFARE</span></h2>
        <p className="opacity-40 mb-12 text-[10px] tracking-[0.3em] uppercase font-bold">Smart Savings Dashboard</p>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          
          {/* Virtual Card & Monthly Limit Section */}
          <div className="space-y-8 flex flex-col items-center">
            {/* Premium Card */}
            <div className="w-full max-w-sm h-52 rounded-[2.5rem] gradient-gold p-8 text-secondary-foreground shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 flex justify-between font-black">
                  <span className="flex items-center gap-2"><ShoppingCart size={20}/> NM MART</span>
                  <span className="text-[9px] border border-black/20 px-2 py-0.5 rounded-full uppercase">Member</span>
               </div>
               <div className="relative z-10 text-left mt-6">
                  <p className="text-[8px] uppercase opacity-50 font-bold tracking-widest">Card Holder</p>
                  <p className="text-2xl font-black uppercase truncate">{userData ? userData.Name : "•••••••• •••••"}</p>
               </div>
               <div className="relative z-10 flex justify-between items-end mt-4">
                  <p className="font-mono text-sm tracking-widest">{userData ? userData.Mobile : "XXXXX-XXXXX"}</p>
                  <p className="text-[10px] font-bold">EXP: {userData ? userData.Expiry : "--/--"}</p>
               </div>
            </div>

            {/* Monthly Limit Tracker */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gold"/>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Monthly Savings</span>
                    </div>
                    <span className="text-sm font-black">₹{userData?.MonthlyUsed || "0"} / <span className="text-gold">₹250</span></span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${calculateMonthlyProgress()}%` }} 
                        className="h-full bg-gradient-to-r from-gold to-yellow-500 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    />
                </div>
                <div className="flex justify-between mt-3">
                    <p className="text-[9px] opacity-40 italic font-medium">Limit: ₹250 Per Month</p>
                    <p className="text-[9px] text-gold font-black uppercase tracking-widest">{calculateMonthlyProgress()}% Used</p>
                </div>
            </div>
          </div>

          {/* User Dashboard / Stats */}
          <div className="w-full">
            {!userData ? (
              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 text-left shadow-2xl">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 italic"><User className="text-gold"/> DASHBOARD LOGIN</h3>
                <div className="space-y-6">
                  <input type="text" placeholder="Mobile Number" value={mobile} maxLength={10} onChange={(e)=>setMobile(e.target.value.replace(/\D/g,''))} className="w-full bg-transparent border-b-2 border-white/20 py-4 focus:border-gold outline-none text-xl font-bold tracking-widest" />
                  <button onClick={handleLogin} disabled={loading} className="w-full bg-gold text-secondary-foreground font-black py-5 rounded-2xl uppercase shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto"/> : "Check My Benefits"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Usage Card */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-left group">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all">
                    <Zap className="text-blue-400" size={24}/>
                  </div>
                  <p className="text-[10px] opacity-40 font-bold uppercase mb-1">Total Usage</p>
                  <p className="text-4xl font-black">{userData.Usage || "0"}</p>
                </div>

                {/* Net Profit Card */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-left group">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
                    <Wallet className="text-green-400" size={24}/>
                  </div>
                  <p className="text-[10px] opacity-40 font-bold uppercase mb-1">Total Profit</p>
                  <p className="text-4xl font-black text-gold">₹{userData.Profit || "0"}</p>
                </div>

                {/* Status Box */}
                <div className="col-span-2 bg-gradient-to-r from-green-500/10 to-transparent p-6 rounded-3xl border border-green-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400"><CheckCircle size={28}/></div>
                      <div>
                        <p className="font-bold text-sm">Status: <span className="text-green-400">Card Active</span></p>
                        <p className="text-[10px] opacity-40 font-bold">Total Benefit Target: ₹{userData.Target || "1500"}</p>
                      </div>
                   </div>
                   <button onClick={() => fetchData(userData.Mobile)} className="p-3 bg-white/5 rounded-full border border-white/10 hover:rotate-180 transition-all duration-700">
                     <RefreshCw size={18} className={loading ? "animate-spin text-gold" : "text-white"}/>
                   </button>
                </div>
                
                <button onClick={()=>setUserData(null)} className="col-span-2 text-[10px] opacity-20 hover:opacity-100 transition-all font-bold tracking-widest mt-2">LOGOUT SESSION</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WelfareCard;

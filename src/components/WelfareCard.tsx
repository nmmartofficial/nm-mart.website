import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Phone, Calendar, ArrowUpRight, Wallet, Loader2, RefreshCw } from "lucide-react";

const WelfareCard = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";

  const getExpiryDate = () => {
    const d = new Date();
    const futureDate = new Date(d.getFullYear(), d.getMonth() + 7, 0);
    return futureDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // डेटा को शीट से दोबारा खींचने (Fetch) का फंक्शन
  const fetchData = async (num: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${num}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      }
    } catch (error) {
      console.error("Update error");
    }
    setLoading(false);
  };

  const handleLoginOrRegister = async () => {
    if (mobile.length !== 10) {
      alert("कृपया 10 अंकों का नंबर डालें");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${mobile}`);
      const data = await response.json();

      if (data && data.length > 0) {
        setUserData(data[0]);
      } else {
        const expiry = getExpiryDate();
        const newEntry = { 
          Name: name || "NM Mart Customer", 
          Mobile: mobile, 
          Expiry: expiry, 
          Usage: "0", 
          Profit: "₹0" 
        };
        
        await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [newEntry] })
        });
        setUserData(newEntry);
      }
    } catch (error) {
      alert("सर्वर एरर! कृपया दोबारा कोशिश करें।");
    }
    setLoading(false);
  };

  return (
    <section id="welfare-card" className="py-16 gradient-navy text-white min-h-screen flex items-center">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="mb-10">
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight">
                NM Mart <span className="text-gold">Dashboard</span>
            </h2>
            <p className="opacity-50 mt-2">Real-time savings and membership tracking</p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          
          {/* Virtual Card Preview */}
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              whileHover={{ rotateY: 10, scale: 1.05 }}
              className="w-full max-w-sm h-52 rounded-[2rem] gradient-gold p-8 text-secondary-foreground shadow-[0_20px_50px_rgba(212,175,55,0.3)] flex flex-col justify-between relative overflow-hidden"
            >
               <div className="relative z-10 flex justify-between items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-black text-xl flex items-center gap-2 italic"><ShoppingCart size={22}/> NM MART</span>
                    <span className="text-[10px] font-bold opacity-60 tracking-[0.2em] ml-1">WELFARE PREFERRED</span>
                  </div>
                  <div className="h-10 w-14 bg-black/10 rounded-lg backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <div className="w-8 h-6 bg-gold/50 rounded sm shadow-inner"></div>
                  </div>
               </div>

               <div className="relative z-10 text-left mt-4">
                  <p className="text-sm font-medium opacity-70 tracking-wider">Member Name</p>
                  <p className="text-2xl font-black uppercase truncate leading-none mt-1">
                    {userData ? userData.Name : (name || "•••••••• •••••") }
                  </p>
               </div>

               <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-mono tracking-widest">{userData ? userData.Mobile : "XXXXX-XXXXX"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] uppercase font-bold opacity-60">Expires</p>
                    <p className="text-xs font-bold">{userData ? userData.Expiry : "-- / -- / --"}</p>
                  </div>
               </div>
            </motion.div>
            
            {userData && (
              <button 
                onClick={() => fetchData(userData.Mobile)}
                className="flex items-center gap-2 text-gold text-sm font-bold bg-white/5 px-4 py-2 rounded-full border border-gold/20 hover:bg-gold/10 transition-all"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
                Check for Updates
              </button>
            )}
          </div>

          {/* Login or Stats Display */}
          <div className="w-full">
            {!userData ? (
              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl text-left">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><User className="text-gold" size={20}/> Member Login</h3>
                <div className="space-y-6">
                  <div className="relative">
                    <input type="text" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-transparent border-b-2 border-white/10 py-3 focus:border-gold outline-none transition-all placeholder:text-white/20" />
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="Mobile Number" value={mobile} maxLength={10} onChange={(e)=>setMobile(e.target.value.replace(/\D/g,''))} className="w-full bg-transparent border-b-2 border-white/10 py-3 focus:border-gold outline-none transition-all placeholder:text-white/20" />
                  </div>
                  <button onClick={handleLoginOrRegister} disabled={loading} className="w-full bg-gold text-secondary-foreground font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:translate-y-[-2px] transition-all flex justify-center uppercase tracking-widest">
                    {loading ? <Loader2 className="animate-spin"/> : "Enter Dashboard"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ArrowUpRight size={40}/></div>
                  <p className="text-xs opacity-50 font-bold uppercase tracking-widest mb-2">Usage Count</p>
                  <p className="text-4xl font-black text-white">{userData.Usage || "0"}</p>
                  <p className="text-[10px] mt-2 text-blue-400 font-bold italic">Visits to Store</p>
                </motion.div>

                <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.1}} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={40}/></div>
                  <p className="text-xs opacity-50 font-bold uppercase tracking-widest mb-2">Total Profit</p>
                  <p className="text-4xl font-black text-gold">{userData.Profit || "₹0"}</p>
                  <p className="text-[10px] mt-2 text-green-400 font-bold italic">Savings by Card</p>
                </motion.div>

                <div className="col-span-2 bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400"><CheckCircle size={28}/></div>
                      <div>
                        <p className="font-bold text-sm">Status: <span className="text-green-400">Active</span></p>
                        <p className="text-[10px] opacity-50 font-mono italic">Valid until: {userData.Expiry}</p>
                      </div>
                   </div>
                   <button onClick={()=>setUserData(null)} className="text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-all border border-white/20 px-3 py-1 rounded-md">Logout</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WelfareCard;

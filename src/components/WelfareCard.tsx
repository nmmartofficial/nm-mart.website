import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Phone, Calendar, ArrowUpRight, Wallet, Loader2, RefreshCw, LogOut } from "lucide-react";

const WelfareCard = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Your SheetDB API Link
  const SHEETDB_URL = "https://sheetdb.io/api/v1/fng3l414zu66d";

  const getExpiryDate = () => {
    const d = new Date();
    // Logic: Last day of the month, 6 months from now
    const futureDate = new Date(d.getFullYear(), d.getMonth() + 7, 0);
    return futureDate.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const fetchData = async (num: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${SHEETDB_URL}/search?Mobile=${num}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setUserData(data[0]);
      }
    } catch (error) {
      console.error("Data sync failed");
    }
    setLoading(false);
  };

  const handleLoginOrRegister = async () => {
    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
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
          Name: name || "Valued Member", 
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
      alert("Server connection failed. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <section id="welfare-card" className="py-20 gradient-navy text-white min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-14">
            <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold font-display tracking-tight"
            >
                NM Mart <span className="text-gold italic">Welfare Portal</span>
            </motion.h2>
            <p className="opacity-40 mt-3 text-[10px] tracking-[0.4em] uppercase font-black">Elite Savings & Membership Dashboard</p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Professional Membership Card */}
          <div className="flex flex-col items-center gap-10">
            <motion.div 
              whileHover={{ rotateY: 10, scale: 1.05 }}
              className="w-full max-w-sm h-56 rounded-[2.5rem] gradient-gold p-8 text-secondary-foreground shadow-[0_40px_80px_rgba(212,175,55,0.2)] flex flex-col justify-between relative overflow-hidden group"
            >
               <div className="relative z-10 flex justify-between items-start">
                  <div className="flex flex-col items-start">
                    <span className="font-black text-2xl flex items-center gap-2 italic tracking-tighter"><ShoppingCart size={24}/> NM MART</span>
                    <span className="text-[9px] font-black opacity-50 tracking-[0.2em] ml-1">OFFICIAL PREFERRED MEMBER</span>
                  </div>
                  <div className="h-10 w-14 bg-black/5 rounded-xl border border-black/10 backdrop-blur-md"></div>
               </div>

               <div className="relative z-10 text-left">
                  <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Card Holder</p>
                  <p className="text-2xl font-black uppercase truncate tracking-tight leading-none">
                    {userData ? userData.Name : (name || "•••••••• •••••") }
                  </p>
               </div>

               <div className="relative z-10 flex justify-between items-end border-t border-black/5 pt-5">
                  <p className="text-sm font-mono tracking-tighter font-bold">{userData ? userData.Mobile : "XXXXX XXXXX"}</p>
                  <div className="text-right">
                    <p className="text-[7px] uppercase font-black opacity-40">Expiration Date</p>
                    <p className="text-[10px] font-black">{userData ? userData.Expiry : "MM / YYYY"}</p>
                  </div>
               </div>
            </motion.div>
            
            {userData && (
              <button 
                onClick={() => fetchData(userData.Mobile)}
                className="flex items-center gap-3 text-gold text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-10 py-4 rounded-full border border-gold/20 hover:bg-gold/10 hover:border-gold/50 transition-all shadow-xl"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
                Synchronize Account
              </button>
            )}
          </div>

          {/* Secure Access & Dashboard Section */}
          <div className="w-full">
            {!userData ? (
              <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl text-left">
                <h3 className="text-xs font-black mb-10 uppercase tracking-[0.3em] text-gold flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></div> Secure Portal Access
                </h3>
                <div className="space-y-10">
                  <div className="group relative">
                    <input type="text" placeholder="Member Name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-transparent border-b-2 border-white/10 py-4 focus:border-gold outline-none transition-all font-bold placeholder:text-white/10" />
                  </div>
                  <div className="group relative">
                    <input type="text" placeholder="Mobile Number" value={mobile} maxLength={10} onChange={(e)=>setMobile(e.target.value.replace(/\D/g,''))} className="w-full bg-transparent border-b-2 border-white/10 py-4 focus:border-gold outline-none transition-all font-bold placeholder:text-white/10" />
                  </div>
                  <button onClick={handleLoginOrRegister} disabled={loading} className="w-full bg-gold text-secondary-foreground font-black py-6 rounded-3xl shadow-2xl hover:brightness-110 transition-all uppercase text-[10px] tracking-[0.4em] flex justify-center items-center">
                    {loading ? <Loader2 className="animate-spin" /> : "Verify & Enter Dashboard"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8">
                {/* Usage Analytics */}
                <motion.div initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 text-left relative overflow-hidden group">
                  <ArrowUpRight className="absolute top-6 right-6 opacity-5 group-hover:opacity-20 transition-opacity" size={40}/>
                  <p className="text-[9px] opacity-40 font-black uppercase tracking-[0.3em] mb-3">Shopping Frequency</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black tracking-tighter">{userData.Usage || "0"}</p>
                    <span className="text-[10px] font-black opacity-30 uppercase">Trips</span>
                  </div>
                </motion.div>

                {/* Savings Analytics */}
                <motion.div initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 text-left relative overflow-hidden group">
                  <Wallet className="absolute top-6 right-6 opacity-5 group-hover:opacity-20 transition-opacity" size={40}/>
                  <p className="text-[9px] opacity-40 font-black uppercase tracking-[0.3em] mb-3">Total Member Savings</p>
                  <p className="text-6xl font-black text-gold tracking-tighter">{userData.Profit || "₹0"}</p>
                </motion.div>

                {/* Status Indicator */}
                <div className="col-span-2 bg-white/5 p-10 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-6 text-left">
                      <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-400 border border-green-500/20">
                        <CheckCircle size={32}/>
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-[0.2em] text-green-400">Membership Active</p>
                        <p className="text-[10px] opacity-40 font-bold mt-1">Verified Status until {userData.Expiry}</p>
                      </div>
                   </div>
                   <button 
                    onClick={()=>setUserData(null)} 
                    className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-all border border-white/10 px-6 py-3 rounded-2xl"
                   >
                     <LogOut size={14}/> Sign Out
                   </button>
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

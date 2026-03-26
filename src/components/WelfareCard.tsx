import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, CheckCircle, User, Phone, Wallet, Loader2, RefreshCw, Calendar, Zap, History } from "lucide-react";

const WelfareCard = () => {
  const [mobile, setMobile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const SHEETDB_URL = "https://sheetdb.io/api/v1/nkxmymwaz5b7i";
  // NOTE: Agar aapne history ke liye alag API banayi hai toh uska URL yahan aayega
  const HISTORY_API = `${SHEETDB_URL}?sheet=History`; 

  const fetchUserAndHistory = async (num: string) => {
    setLoading(true);
    try {
      // 1. User Profile Fetch karein
      const userRes = await fetch(`${SHEETDB_URL}/search?Mobile=${num}`);
      const userData = await userRes.json();
      
      // 2. User History Fetch karein (History wali sheet se)
      const histRes = await fetch(`${HISTORY_API}&Mobile=${num}`);
      const histData = await histRes.json();

      if (userData && userData.length > 0) {
        setUserData(userData[0]);
        setHistory(histData.reverse()); // Nayi history upar dikhane ke liye
      } else {
        alert("Number register nahi hai.");
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  return (
    <section className="py-12 gradient-navy text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {!userData ? (
          /* Login Section */
          <div className="max-w-md mx-auto bg-white/5 p-8 rounded-3xl border border-white/10 mt-20">
            <h2 className="text-2xl font-black mb-6 text-gold italic">NM MART LOGIN</h2>
            <input 
              type="text" placeholder="Enter Mobile Number" 
              value={mobile} onChange={(e)=>setMobile(e.target.value)}
              className="w-full bg-white/5 border-b-2 border-white/20 py-3 mb-6 outline-none focus:border-gold text-xl"
            />
            <button 
              onClick={() => fetchUserAndHistory(mobile)} 
              disabled={loading}
              className="w-full bg-gold text-black font-black py-4 rounded-xl flex justify-center uppercase"
            >
              {loading ? <Loader2 className="animate-spin"/> : "Open My Passbook"}
            </button>
          </div>
        ) : (
          /* Dashboard + History Section */
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <h2 className="text-3xl font-black italic text-gold leading-none">WELCOME, {userData.Name}</h2>
                <p className="opacity-40 text-[10px] mt-2 tracking-widest uppercase">Member Since 2026</p>
              </div>
              <button onClick={()=>setUserData(null)} className="text-[10px] opacity-30 underline">Logout</button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                <p className="text-[9px] opacity-40 font-bold uppercase">Total Profit</p>
                <p className="text-xl font-black text-gold">₹{userData.Profit}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                <p className="text-[9px] opacity-40 font-bold uppercase">Usage</p>
                <p className="text-xl font-black">{userData.Usage} Times</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                <p className="text-[9px] opacity-40 font-bold uppercase">Monthly Left</p>
                <p className="text-xl font-black text-blue-400">₹{250 - parseInt(userData.MonthlyUsed || 0)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left border-l-gold">
                <p className="text-[9px] opacity-40 font-bold uppercase">Target</p>
                <p className="text-xl font-black italic">₹{userData.Target}</p>
              </div>
            </div>

            {/* Passbook / History Table */}
            <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <History className="text-gold" size={20}/>
                <h3 className="font-bold tracking-tight uppercase text-sm">Shopping & Savings History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-[10px] uppercase opacity-40">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Details</th>
                      <th className="p-4 text-right">Saved Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.length > 0 ? history.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-xs">{row.Date}</td>
                        <td className="p-4 font-bold">{row.Item || "NM Mart Purchase"}</td>
                        <td className="p-4 text-right text-green-400 font-black">+{row.Saved}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="p-10 text-center opacity-30 italic">No transactions found yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <p className="text-[9px] opacity-30 italic">Note: Card validity ends on {userData.Expiry}. Data updates every 24 hours.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WelfareCard;

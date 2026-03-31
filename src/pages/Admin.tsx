import { useState } from "react";
import { Lock, Unlock, Eye, EyeOff, ArrowRight } from "lucide-react";

const Admin = () => {
  // --- सिक्योरिटी सेटिंग्स ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const adminPassword = "NMMART786000"; // अब्दुल भाई, अपना पासवर्ड यहाँ बदल सकते हैं

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert("गलत पासवर्ड! कोशिश न करें।");
      setPassword("");
    }
  };

  // --- अगर लॉगिन नहीं है, तो ये दिखेगा ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans text-white">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 shadow-2xl text-center">
          <div className="w-20 h-20 bg-[#FF8C00]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF8C00]/20">
            <Lock className="text-[#FF8C00]" size={32} />
          </div>
          
          <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
            NM <span className="text-[#FF8C00]">STAFF ONLY</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mb-8">Unauthorized access is prohibited</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full bg-black border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-[#FF8C00] transition-all text-center tracking-widest"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#FF8C00] text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#FF8C00]/20"
            >
              Access Dashboard <ArrowRight size={18} />
            </button>
          </form>
          
          <p className="mt-8 text-[9px] text-gray-700 font-black uppercase tracking-widest">NM Mart Manjhanpur • Securirty Layer v1.0</p>
        </div>
      </div>
    );
  }

  // --- अगर लॉगिन सही है, तो आपका पुराना एडमिन पैनल यहाँ से शुरू होगा ---
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
       {/* आपका पूरा पुराना Admin Panel वाला कोड यहाँ आएगा */}
       <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">NM <span className="text-[#FF8C00]">SMART CONTROL</span></h1>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-[9px] font-black uppercase bg-red-500/10 text-red-500 px-4 py-2 rounded-full border border-red-500/20"
          >
            Logout
          </button>
       </div>
       
       {/* बाकी सारा कोड (Scan, Price Update, Orders) यहाँ डाल दें */}
    </div>
  );
};

export default Admin;

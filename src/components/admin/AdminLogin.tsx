import { ShieldCheck, Lock } from "lucide-react";

interface AdminLoginProps {
  password: string;
  setPassword: (value: string) => void;
  handleLogin: () => void;
}

const AdminLogin = ({ password, setPassword, handleLogin }: AdminLoginProps) => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-100 p-10 rounded-[40px] shadow-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-sm">
            <ShieldCheck size={40} />
          </div>
          
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black mb-2">
            Admin <span className="text-primary">Terminal</span>
          </h2>
          <p className="text-gray-400 uppercase tracking-[4px] font-bold text-[10px] mb-10">
            Authorized Personnel Only
          </p>

          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Access PIN</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold tracking-[0.5em]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <button 
              onClick={handleLogin}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-sm active:scale-95"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </div>
      <p className="mt-8 text-[10px] text-gray-400 font-black uppercase tracking-[4px] italic">© 2026 NM Mart Retail OS v5.0.2</p>
    </div>
  );
};

export default AdminLogin;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LOGO_URL = "https://i.postimg.cc/9XJ2GS8L/logo.jpg";
const SLOGAN = "Shop More, Save More";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have an active session (Supabase handles the recovery token automatically)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, the recovery link might have expired or is invalid
        toast.error("Invalid or expired reset link. Please request a new one.");
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-[400px] bg-white p-10 rounded-2xl border border-[#ddd] shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-md">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-black">
            Success!
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] italic">
            Your password has been updated. Redirecting to login...
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="w-full bg-primary text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#111] flex flex-col items-center pt-12 pb-12 font-sans">
      {/* Logo Section */}
      <div 
        onClick={() => navigate("/")} 
        className="cursor-pointer mb-8 flex flex-col items-center"
      >
        <div className="flex items-center gap-2">
          <img src={LOGO_URL} alt="NM Mart" className="w-12 h-12 rounded-lg shadow-sm" />
          <h1 className="text-3xl font-black tracking-tighter italic uppercase text-black">
            NM <span className="text-primary">MART</span>
          </h1>
        </div>
        <p className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase mt-1 italic">
          {SLOGAN}
        </p>
      </div>

      <div className="w-full max-w-[380px] space-y-4 px-4">
        <div className="bg-white p-8 rounded-2xl border border-[#ddd] shadow-sm">
          <button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>

          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-black mb-2">
            Reset <span className="text-primary">Password</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic mb-8">
            Enter your new secure password
          </p>

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-3 italic"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-gray-400 font-black uppercase tracking-[4px] italic">© 2026 NM Mart Retail</p>
    </div>
  );
};

export default ResetPassword;

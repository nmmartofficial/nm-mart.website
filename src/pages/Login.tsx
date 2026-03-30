import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Loader2, ShoppingCart, CreditCard, Chrome } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  // --- 1. Google Login Function (नया जोड़ा गया) ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { setError("Enter valid 10-digit number"); return; }
    setLoading(true); setError("");
    const fullPhone = `+91${phone.replace(/^(\+91|91)/, "")}`;
    const { error: err } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (err) {
      setError("Phone OTP not available. Try email login.");
      setMode("email");
    } else {
      setStep("otp");
    }
    setLoading(false);
  };

  const handleOtpVerify = async () => {
    setLoading(true); setError("");
    const fullPhone = `+91${phone.replace(/^(\+91|91)/, "")}`;
    const { error: err } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: "sms" });
    if (err) { setError("Invalid OTP. Try again."); }
    else { navigate("/profile"); } // प्रोफाइल पर भेजें
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) { setError("Fill all fields"); return; }
    setLoading(true); setError("");
    if (isSignup) {
      const { error: err } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { emailRedirectTo: window.location.origin } 
      });
      if (err) setError(err.message);
      else toast.success("Check your email for verification link!");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else navigate("/profile");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-black border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-secondary rounded-lg text-foreground"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2">
            <div className="gradient-orange p-1.5 rounded-lg"><ShoppingCart size={16} className="text-white" /></div>
            <span className="font-black text-lg tracking-tight text-foreground">NM <span className="text-primary">MART</span></span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="gradient-orange w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Welcome to NM Mart</h1>
            <p className="text-muted-foreground text-sm mt-1">Login to track orders & earn loyalty rewards</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-xl">
            <div className="flex bg-secondary rounded-xl p-1">
              <button onClick={() => setMode("phone")} className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${mode === "phone" ? "gradient-orange text-white shadow-sm" : "text-muted-foreground"}`}>
                📱 Phone
              </button>
              <button onClick={() => setMode("email")} className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${mode === "email" ? "gradient-orange text-white shadow-sm" : "text-muted-foreground"}`}>
                ✉️ Email
              </button>
            </div>

            {mode === "phone" ? (
              step === "phone" ? (
                <>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="tel" placeholder="10-digit mobile number" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-secondary rounded-xl py-4 pl-12 pr-4 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <button onClick={handlePhoneSubmit} disabled={loading}
                    className="w-full gradient-orange text-white py-4 rounded-xl font-black text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground text-center italic">OTP sent to +91{phone}</p>
                  <input type="text" placeholder="6-digit OTP" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-secondary rounded-xl py-4 px-4 font-bold text-foreground text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button onClick={handleOtpVerify} disabled={loading}
                    className="w-full gradient-orange text-white py-4 rounded-xl font-black text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify OTP"}
                  </button>
                  <button onClick={() => setStep("phone")} className="w-full text-[10px] text-muted-foreground font-bold hover:underline">← Change number</button>
                </>
              )
            ) : (
              <>
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-secondary rounded-xl py-4 px-4 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-secondary rounded-xl py-4 px-4 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={handleEmailAuth} disabled={loading}
                  className="w-full gradient-orange text-white py-4 rounded-xl font-black text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : isSignup ? "Sign Up" : "Login"}
                </button>
                <button onClick={() => setIsSignup(!isSignup)} className="w-full text-[10px] text-muted-foreground font-bold hover:underline text-center uppercase tracking-tighter">
                  {isSignup ? "Already have an account? Login" : "New here? Create account"}
                </button>
              </>
            )}

            {/* --- Google Login Button (नया जोड़ा गया) --- */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold bg-card px-2 text-muted-foreground tracking-widest">OR</div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full bg-white/5 border border-border text-foreground py-4 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-3 hover:bg-secondary transition-all"
            >
              <Chrome size={18} className="text-[#FF8C00]" /> Sign in with Google
            </button>

            {error && <p className={`text-[10px] font-black text-center rounded-lg p-3 uppercase ${error.includes("Check your email") ? "text-green-500 bg-green-500/10" : "text-destructive bg-destructive/10"}`}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

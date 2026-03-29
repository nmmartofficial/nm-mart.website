import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email fallback (phone login needs Twilio setup in Supabase)
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

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
    else { navigate("/"); }
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) { setError("Fill all fields"); return; }
    setLoading(true); setError("");
    if (isSignup) {
      const { error: err } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (err) setError(err.message);
      else setError("Check your email for verification link!");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-navy text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-white/10 rounded-lg"><ArrowLeft size={20} /></button>
          <span className="font-black italic text-lg">NM MART</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-primary italic">Welcome to NM Mart</h1>
            <p className="text-muted-foreground text-sm mt-1">Login to track orders & earn rewards</p>
          </div>

          <div className="bg-card rounded-3xl shadow-card border border-border p-6 space-y-4">
            {/* Mode Toggle */}
            <div className="flex bg-muted rounded-xl p-1">
              <button onClick={() => setMode("phone")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === "phone" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                📱 Phone
              </button>
              <button onClick={() => setMode("email")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === "email" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                ✉️ Email
              </button>
            </div>

            {mode === "phone" ? (
              step === "phone" ? (
                <>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-muted rounded-xl py-4 pl-12 pr-4 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button onClick={handlePhoneSubmit} disabled={loading}
                    className="w-full gradient-navy text-primary-foreground py-4 rounded-xl font-black text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">OTP sent to +91{phone}</p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-muted rounded-xl py-4 px-4 font-bold text-foreground text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={handleOtpVerify} disabled={loading}
                    className="w-full gradient-navy text-primary-foreground py-4 rounded-xl font-black text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify OTP"}
                  </button>
                  <button onClick={() => setStep("phone")} className="w-full text-xs text-muted-foreground font-bold hover:underline">
                    ← Change number
                  </button>
                </>
              )
            ) : (
              <>
                <input
                  type="email" placeholder="Email address" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-muted rounded-xl py-4 px-4 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="password" placeholder="Password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-muted rounded-xl py-4 px-4 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={handleEmailAuth} disabled={loading}
                  className="w-full gradient-navy text-primary-foreground py-4 rounded-xl font-black text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : isSignup ? "Sign Up" : "Login"}
                </button>
                <button onClick={() => setIsSignup(!isSignup)} className="w-full text-xs text-muted-foreground font-bold hover:underline text-center">
                  {isSignup ? "Already have an account? Login" : "New here? Create account"}
                </button>
              </>
            )}

            {error && <p className="text-destructive text-xs font-bold text-center bg-destructive/10 rounded-lg p-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

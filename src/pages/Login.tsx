import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Loader2, Mail, ArrowLeft, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { toast.error("सही मोबाइल नंबर डालें"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: "+91" + phone });
      if (error) throw error;
      setStep("otp");
      toast.success("OTP भेज दिया गया है!");
    } catch (err: any) {
      toast.error(err.message || "OTP भेजने में समस्या");
    } finally { setLoading(false); }
  };

  const handleOtpVerify = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: "+91" + phone, token: otp, type: "sms" });
      if (error) throw error;
      toast.success("लॉगिन सफल!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "गलत OTP");
    } finally { setLoading(false); }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) { toast.error("ईमेल और पासवर्ड भरें"); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("अकाउंट बन गया! ईमेल वेरिफाई करें।");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("लॉगिन सफल!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "कुछ गलत हुआ");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <button onClick={() => navigate("/")} className="absolute top-6 left-6 flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
        <ArrowLeft size={16} /> वापस जाएं
      </button>

      <div className="w-full max-w-sm bg-card p-8 rounded-2xl border border-border shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-2 uppercase font-black text-2xl tracking-tighter">
          <img src="https://i.postimg.cc/9XJ2GS8L/logo.jpg" alt="NM Mart" className="w-10 h-10 rounded-xl" />
          NM <span className="text-primary">MART</span>
        </div>
        <p className="text-center text-muted-foreground text-xs mb-6">अपने अकाउंट में लॉगिन करें</p>

        {/* Mode Tabs */}
        <div className="flex rounded-xl bg-secondary mb-6 p-1">
          <button onClick={() => { setMode("phone"); setStep("input"); }} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${mode === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Phone size={12} className="inline mr-1" /> Phone
          </button>
          <button onClick={() => { setMode("email"); setStep("input"); }} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${mode === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Mail size={12} className="inline mr-1" /> Email
          </button>
        </div>

        <div className="space-y-4">
          {mode === "phone" ? (
            step === "input" ? (
              <>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" placeholder="मोबाइल नंबर" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-secondary border border-border p-4 pl-12 rounded-xl outline-none focus:border-primary text-foreground" />
                </div>
                <button onClick={handlePhoneSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "OTP भेजें"}
                </button>
              </>
            ) : (
              <>
                <input type="text" placeholder="OTP डालें" value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full bg-secondary border border-border p-4 rounded-xl text-center text-xl font-bold tracking-widest outline-none focus:border-primary text-foreground" />
                <button onClick={handleOtpVerify} disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "लॉगिन करें"}
                </button>
                <button onClick={() => setStep("input")} className="w-full text-xs text-muted-foreground hover:text-primary">← नंबर बदलें</button>
              </>
            )
          ) : (
            <>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" placeholder="Email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-secondary border border-border p-4 pl-12 rounded-xl outline-none focus:border-primary text-foreground" />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="password" placeholder="Password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border p-4 pl-12 rounded-xl outline-none focus:border-primary text-foreground" />
              </div>
              <button onClick={handleEmailAuth} disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : isSignUp ? "अकाउंट बनाएं" : "लॉगिन करें"}
              </button>
              <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-xs text-muted-foreground hover:text-primary">
                {isSignUp ? "पहले से अकाउंट है? लॉगिन करें" : "नया अकाउंट बनाएं"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

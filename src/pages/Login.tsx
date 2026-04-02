import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Loader2, Mail, ArrowLeft, Lock, User, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LOGO_URL = "https://i.postimg.cc/9XJ2GS8L/logo.jpg";
const SLOGAN = "Shop More, Save More";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { toast.error("Please enter a valid mobile number"); return; }
    if (isSignUp && !fullName) { toast.error("Please enter your full name"); return; }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: "+91" + phone });
      if (error) throw error;
      setStep("otp");
      toast.success("OTP has been sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleOtpVerify = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone: "+91" + phone, token: otp, type: "sms" });
      if (error) throw error;
      
      if (data.user && isSignUp) {
        // Save to profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id, 
            full_name: fullName, 
            mobile: phone,
            updated_at: new Date().toISOString()
          });
        if (profileError) console.error("Profile error:", profileError);
      }
      
      toast.success("Login successful!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  const handleAuth = async () => {
    if (mode === "phone" && step === "input") {
      await handlePhoneSubmit();
      return;
    } else if (mode === "phone" && step === "otp") {
      await handleOtpVerify();
      return;
    }

    // Password mode (Treating Mobile as identifier)
    if (!phone || !password) { toast.error("Please fill mobile and password"); return; }
    if (isSignUp && !fullName) { toast.error("Please enter your full name"); return; }
    
    setLoading(true);
    const formattedEmail = `${phone}@nmmart.in`;
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email: formattedEmail, 
          password,
          options: {
            data: {
              full_name: fullName,
              mobile: phone
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          // Save to profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id, 
              full_name: fullName, 
              mobile: phone,
              updated_at: new Date().toISOString()
            });
          if (profileError) console.error("Profile error:", profileError);
        }
        
        toast.success("Account created successfully!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: formattedEmail, 
          password 
        });
        if (error) throw error;
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!phone) { toast.error("Please enter your mobile number"); return; }
    
    setLoading(true);
    const formattedEmail = `${phone}@nmmart.in`;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formattedEmail, {
        redirectTo: 'https://nmmart.in/reset-password',
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      toast.success("Password reset request initiated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to request password reset");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#111] flex flex-col items-center pt-8 pb-12 font-sans">
      {/* Logo Section */}
      <div 
        onClick={() => navigate("/")} 
        className="cursor-pointer mb-6 flex flex-col items-center"
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

      <div className="w-full max-w-[350px] space-y-4 px-4 md:px-0">
        {/* Main Auth Card */}
        <div className="bg-white p-6 rounded-lg border border-[#ddd] shadow-sm">
          {forgotPasswordMode ? (
            <div className="space-y-4">
              <button 
                onClick={() => { setForgotPasswordMode(false); setResetEmailSent(false); }}
                className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
              
              <h2 className="text-[28px] font-normal mb-2">Password assistance</h2>
              
              {resetEmailSent ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-green-600 mt-0.5" />
                    <p className="text-xs text-green-800 leading-relaxed">
                      If an account exists for <b>{phone}</b>, you will receive instructions to reset your password shortly.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Note: Since we use mobile-based identifiers, please check your linked email for the reset link.
                  </p>
                  <button 
                    onClick={() => setForgotPasswordMode(false)}
                    className="w-full bg-primary text-white py-2 rounded shadow-sm hover:bg-black transition-all text-sm font-bold"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Enter the mobile number associated with your NM Mart account.
                  </p>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-bold block">Mobile number</label>
                    <div className="flex gap-2">
                      <span className="bg-[#f0f2f2] border border-[#adb1b8] px-3 py-2 rounded shadow-sm text-sm flex items-center">IN +91</span>
                      <input 
                        type="tel" 
                        placeholder="Mobile number" 
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full bg-primary text-white py-2 rounded shadow-sm hover:bg-black transition-all text-sm font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Continue"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-[28px] font-normal mb-4">
                {isSignUp ? "Create account" : "Sign in"}
              </h2>

              <div className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-sm font-bold block">Your name</label>
                    <input 
                      type="text" 
                      placeholder="First and last name" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    />
                  </div>
                )}

                {mode === "phone" ? (
                  step === "input" ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-sm font-bold block">Mobile number</label>
                        <div className="flex gap-2">
                          <span className="bg-[#f0f2f2] border border-[#adb1b8] px-3 py-2 rounded shadow-sm text-sm flex items-center">IN +91</span>
                          <input 
                            type="tel" 
                            placeholder="Mobile number" 
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                            className="flex-1 border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                          />
                        </div>
                      </div>
                      <button 
                        onClick={handlePhoneSubmit}
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded shadow-sm hover:bg-black transition-all text-sm font-bold flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Continue"}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-sm font-bold block">Enter OTP</label>
                        <input 
                          type="text" 
                          placeholder="6-digit OTP" 
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                          className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                        />
                      </div>
                      <button 
                        onClick={handleOtpVerify}
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded shadow-sm hover:bg-black transition-all text-sm font-bold flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Verify OTP"}
                      </button>
                      <button onClick={() => setStep("input")} className="text-xs text-[#0066c0] hover:text-[#c45500] hover:underline">Change number</button>
                    </>
                  )
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-bold block">Mobile number</label>
                      <div className="flex gap-2">
                        <span className="bg-[#f0f2f2] border border-[#adb1b8] px-3 py-2 rounded shadow-sm text-sm flex items-center">IN +91</span>
                        <input 
                          type="tel" 
                          placeholder="Mobile number" 
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="flex-1 border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold">Password</label>
                        <button 
                          onClick={() => setForgotPasswordMode(true)}
                          className="text-xs text-[#0066c0] hover:text-[#c45500] hover:underline"
                        >
                          Forgot your password?
                        </button>
                      </div>
                      <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      />
                    </div>
                    <button 
                      onClick={handleAuth}
                      disabled={loading}
                      className="w-full bg-primary text-white py-2 rounded shadow-sm hover:bg-black transition-all text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : (isSignUp ? "Create Account" : "Sign In")}
                    </button>
                  </>
                )}

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#eee]"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500">or</span></div>
                </div>

                <button 
                  onClick={() => { setMode(mode === "phone" ? "email" : "phone"); setStep("input"); }}
                  className="w-full bg-[#f0f2f2] border border-[#adb1b8] text-black py-2 rounded shadow-sm hover:bg-[#e7e9ec] transition-all text-sm font-bold"
                >
                  Use {mode === "phone" ? "Password Login" : "OTP Login"}
                </button>

                <p className="text-[12px] leading-relaxed text-[#111]">
                  By continuing, you agree to NM Mart's <span className="text-[#0066c0] hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-[#0066c0] hover:underline cursor-pointer">Privacy Notice</span>.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#ddd]"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-[#f3f3f3] px-2 text-gray-600">New to NM Mart?</span></div>
        </div>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full bg-white border border-[#adb1b8] text-black py-2 rounded shadow-sm hover:bg-[#f7fafa] transition-all text-sm font-bold"
        >
          {isSignUp ? "Already have an account? Sign in" : "Create your NM Mart account"}
        </button>
      </div>

      <footer className="mt-8 border-t border-[#eee] pt-4 w-full max-w-[600px] text-center space-y-4">
        <div className="flex justify-center gap-6 text-[11px] text-[#0066c0]">
          <span className="hover:underline cursor-pointer">Conditions of Use</span>
          <span className="hover:underline cursor-pointer">Privacy Notice</span>
          <span className="hover:underline cursor-pointer">Help</span>
        </div>
        <p className="text-[11px] text-gray-500">© 2026, NM Mart Retail or its affiliates</p>
      </footer>
    </div>
  );
};

export default Login;

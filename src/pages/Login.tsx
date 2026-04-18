import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, Lock, User, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

const SLOGAN = "Shop More, Save More";
const ADMIN_EMAIL = "nmmart07@gmail.com";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google login failed");
    }
  };

  const handleAuth = async () => {
    if (!email || !password) { toast.error("Please fill all fields"); return; }
    if (isSignUp && !fullName) { toast.error("Please enter your full name"); return; }
    
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          // Profile is created automatically via database trigger
          toast.success("Account created successfully! You can now start shopping.");
          
          // If auto-confirm is enabled in Supabase, we can sign them in immediately
          // If not, they might still need to sign in manually if the session wasn't established
          if (data.session) {
            navigate("/");
          } else {
            setIsSignUp(false); // Move to sign in mode
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
        
        if (data.user?.email?.toLowerCase() === ADMIN_EMAIL) {
          toast.success("Admin Login successful!");
          navigate("/admin");
        } else {
          toast.success("Login successful!");
          navigate("/");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.error("Please enter your email address"); return; }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      toast.success("Password reset request initiated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to request password reset");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#111] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 flex flex-col items-center py-12 px-4 relative">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 hidden md:block">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 bg-white border border-gray-100 px-5 py-2.5 rounded-2xl text-gray-400 hover:text-black hover:border-black transition-all shadow-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest italic">Back to Shop</span>
          </button>
        </div>

        {/* Mobile Back Button */}
        <div className="w-full max-w-[350px] mb-6 md:hidden">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[11px] font-black uppercase tracking-widest italic group"
          >
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <ArrowLeft size={14} />
            </div>
            Back to Home
          </button>
        </div>

        {/* Sign In Card */}
        <div className="w-full max-w-[350px] space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            {forgotPasswordMode ? (
              <div className="space-y-4">
                <button 
                  onClick={() => { setForgotPasswordMode(false); setResetEmailSent(false); }}
                  className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
                
                <h2 className="text-[28px] font-normal mb-2">Password assistance</h2>
                
                {resetEmailSent ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-green-600 mt-0.5" />
                      <p className="text-xs text-green-800 leading-relaxed">
                        If an account exists for <b>{email}</b>, you will receive instructions shortly.
                      </p>
                    </div>
                    <button 
                      onClick={() => setForgotPasswordMode(false)}
                      className="w-full bg-black text-white py-2.5 rounded shadow-sm hover:bg-gray-900 transition-all text-sm font-bold"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Enter the email address associated with your NM Mart account.
                    </p>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-bold block">Email</label>
                      <input 
                        type="email" 
                        placeholder="Email address" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                      />
                    </div>
                    
                    <button 
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="w-full bg-black text-white py-2.5 rounded shadow-sm hover:bg-gray-900 transition-all text-sm font-bold flex items-center justify-center gap-2"
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
                        className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-bold block">Email</label>
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                      autoComplete="username"
                    />
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
                      className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                      autoComplete="current-password"
                    />
                  </div>
                  <button 
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full bg-black text-white py-2.5 rounded shadow-sm hover:bg-gray-900 transition-all text-sm font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : (isSignUp ? "Create Account" : "Sign In")}
                  </button>

                  <div className="relative py-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <span className="relative bg-white px-2 text-xs text-gray-500 italic">or</span>
                  </div>

                  {/* Solid Black Google Login Button */}
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full bg-black text-white py-2.5 rounded shadow-sm hover:bg-gray-900 transition-all text-sm font-bold flex items-center justify-center gap-3 border border-black"
                  >
                    <div className="bg-white p-1 rounded-sm">
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                    </div>
                    Continue with Google
                  </button>

                  <p className="text-[10px] leading-relaxed text-gray-500 italic text-center">
                    By continuing, you agree to NM Mart's <span className="text-black hover:underline cursor-pointer font-bold">Conditions of Use</span> and <span className="text-black hover:underline cursor-pointer font-bold">Privacy Notice</span>.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="relative py-4 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-[#f8f9fa] px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">New to NM Mart?</span>
          </div>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full bg-white border border-black text-black py-2.5 rounded shadow-sm hover:bg-gray-50 transition-all text-sm font-bold"
          >
            {isSignUp ? "Already have an account? Sign in" : "Create your NM Mart account"}
          </button>
          
          <div className="text-center pt-4">
            <p className="text-[10px] font-black text-black uppercase tracking-[2px] italic">
              Powered by NM Mart
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;

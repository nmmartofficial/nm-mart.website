import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Loader2, ShoppingCart, CreditCard, Chrome } from "lucide-react";
import { auth, googleProvider } from "../lib/firebase"; 
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { toast.error("सही नंबर डालें"); return; }
    setLoading(true);
    setupRecaptcha();
    const appVerifier = (window as any).recaptchaVerifier;
    const formatPhone = "+91" + phone;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      (window as any).confirmationResult = confirmationResult;
      setStep("otp");
      toast.success("OTP भेज दिया गया है!");
    } catch (error) {
      toast.error("OTP भेजने में दिक्कत आई। Firebase में Phone चालू करें।");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/profile");
    } catch (error) {
      toast.error("Google लॉगिन फेल हुआ");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-black text-center mb-8 italic uppercase">NM <span className="text-[#FF8C00]">MART</span></h1>
        
        <div className="space-y-4">
          {step === "phone" ? (
            <>
              <input type="tel" placeholder="Mobile Number" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-[#FF8C00]" />
              <button onClick={handlePhoneSubmit} disabled={loading} className="w-full bg-[#FF8C00] text-black py-4 rounded-2xl font-black uppercase">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 rounded-2xl text-center text-xl tracking-widest" />
              <button onClick={() => navigate("/profile")} className="w-full bg-[#FF8C00] text-black py-4 rounded-2xl font-black uppercase">Verify & Login</button>
            </>
          )}

          <div className="text-center text-[10px] text-gray-500 font-bold uppercase my-4">OR</div>

          <button onClick={handleGoogleLogin} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase">
            <Chrome size={18} className="text-[#FF8C00]" /> Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

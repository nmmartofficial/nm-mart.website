import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Loader2, ShoppingCart, CreditCard, Chrome } from "lucide-react";
import { auth, googleProvider } from "../lib/firebase"; 
import { 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult 
} from "firebase/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // ReCaptcha सेटअप करने के लिए
  useEffect(() => {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        console.log("Recaptcha resolved");
      }
    });
  }, []);

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { 
      toast.error("कृपया सही 10-अंकों का नंबर डालें"); 
      return; 
    }
    setLoading(true);
    const appVerifier = (window as any).recaptchaVerifier;
    const formatPhone = "+91" + phone;

    try {
      const result = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      toast.success("OTP आपके मोबाइल पर भेज दिया गया है!");
    } catch (error: any) {
      console.error(error);
      toast.error("OTP भेजने में फेल: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || !confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast.success("लॉगिन सफल!");
      navigate("/profile");
    } catch (error) {
      toast.error("गलत OTP, फिर से कोशिश करें");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Google से लॉगिन सफल!");
      navigate("/profile");
    } catch (error) {
      toast.error("Google लॉगिन फेल हुआ");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      {/* ReCaptcha के लिए यह जरूरी है */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-black text-center mb-8 italic uppercase tracking-tighter">
          NM <span className="text-[#FF8C00]">MART</span>
        </h1>
        
        <div className="space-y-4">
          {step === "phone" ? (
            <>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="tel" 
                  placeholder="मोबाइल नंबर" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-black border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-[#FF8C00]" 
                />
              </div>
              <button 
                onClick={handlePhoneSubmit} 
                disabled={loading} 
                className="w-full bg-[#FF8C00] text-black py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "OTP भेजें"}
              </button>
            </>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="6-अंकों का OTP डालें" 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 rounded-2xl text-center text-xl font-bold tracking-[10px] outline-none focus:border-[#FF8C00]" 
              />
              <button 
                onClick={handleOtpVerify} 
                disabled={loading}
                className="w-full bg-[#FF8C00] text-black py-4 rounded-2xl font-black uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Login"}
              </button>
              <button onClick={() => setStep("phone")} className="w-full text-[10px] text-gray-500 font-bold uppercase hover:underline">
                नंबर बदलें
              </button>
            </>
          )}

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="px-3 text-[9px] text-gray-600 font-black uppercase tracking-[3px]">OR</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase hover:bg-white/10 transition-all"
          >
            <Chrome size={18} className="text-[#FF8C00]" /> Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

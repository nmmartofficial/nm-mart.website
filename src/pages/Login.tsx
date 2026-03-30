import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Loader2, Chrome, ArrowLeft } from "lucide-react";
import { auth, googleProvider } from "../lib/firebase"; 
import { 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  // ReCaptcha सेटअप
  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  }, []);

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      toast.error("सही मोबाइल नंबर डालें");
      return;
    }
    setLoading(true);
    try {
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, "+91" + phone, verifier);
      setConfirmation(result);
      setStep("otp");
      toast.success("OTP भेज दिया गया है!");
    } catch (err: any) {
      console.error(err);
      toast.error("OTP भेजने में फेल! Firebase में Phone ON करें।");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || !confirmation) return;
    setLoading(true);
    try {
      await confirmation.confirm(otp);
      toast.success("लॉगिन सफल!");
      navigate("/profile");
    } catch (err) {
      toast.error("गलत OTP, फिर से चेक करें");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("स्वागत है!");
      navigate("/profile");
    } catch (err) {
      toast.error("Google लॉगिन फेल हुआ");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div id="recaptcha-container"></div>
      
      <div className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-8 uppercase font-black italic text-2xl tracking-tighter">
          NM <span className="text-[#FF8C00]">MART</span>
        </div>

        <div className="space-y-4">
          {step === "phone" ? (
            <>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="tel" 
                  placeholder="मोबाइल नंबर" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-black border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-[#FF8C00]" 
                />
              </div>
              <button onClick={handlePhoneSubmit} disabled={loading} className="w-full bg-[#FF8C00] text-black py-4 rounded-2xl font-black uppercase">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "OTP भेजें"}
              </button>
            </>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="OTP डालें" 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 rounded-2xl text-center text-xl font-bold tracking-widest outline-none focus:border-[#FF8C00]" 
              />
              <button onClick={handleOtpVerify} disabled={loading} className="w-full bg-[#FF8C00] text-black py-4 rounded-2xl font-black uppercase">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "लॉगिन करें"}
              </button>
            </>
          )}

          <div className="flex items-center gap-2 py-2">
            <div className="h-[1px] bg-white/5 flex-1"></div>
            <span className="text-[10px] text-gray-600 font-bold uppercase">या</span>
            <div className="h-[1px] bg-white/5 flex-1"></div>
          </div>

          <button onClick={handleGoogleLogin} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase">
            <Chrome size={18} className="text-[#FF8C00]" /> Google से लॉगिन
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { validateResetPasswordForm } from "@/pages/Login";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (isMounted) {
          setSessionReady(Boolean(session));
          setIsCheckingSession(false);
        }

        if (!session && isMounted) {
          toast.error("This password reset link is invalid or has expired. Please request a new one.");
        }
      } catch (error: any) {
        if (isMounted) {
          setSessionReady(false);
          setIsCheckingSession(false);
          toast.error(error.message || "Unable to validate the reset link.");
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();

    const validationError = validateResetPasswordForm({
      password,
      confirmPassword,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Your password has been updated successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-md">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Password updated</h2>
              <p className="text-sm text-gray-600">Your new password is active. You can now sign in with it.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-primary-hover transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-primary" size={32} />
            <p className="mt-4 text-sm text-gray-600">Checking your secure reset link...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex justify-center text-red-500">
              <ShieldAlert size={40} />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Reset link expired</h2>
              <p className="text-sm text-gray-600">This recovery link is invalid or has already expired. Please request a new password reset email.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-primary-hover transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="w-full max-w-[380px] space-y-4">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <ArrowLeft size={14} /> Back to Login
            </button>

            <h2 className="text-2xl font-black tracking-tight text-black mb-2">Set a new password</h2>
            <p className="text-sm text-gray-600 mb-8">Choose a strong password to finish your recovery.</p>

            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-[2px] text-gray-500">New password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="new-password"
                    type="password"
                    placeholder="Enter your new password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    aria-label="New password"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-[2px] text-gray-500">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your new password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    aria-label="Confirm password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;

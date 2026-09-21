import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

export interface AuthFormInput {
  isSignUp: boolean;
  email: string;
  password: string;
  fullName?: string;
  confirmPassword?: string;
}

const getFriendlyAuthError = (error: any, fallback: string): string => {
  const message = (error?.message || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password") ||
    message.includes("wrong password") ||
    message.includes("invalid grant") ||
    code === "invalid_credentials"
  ) {
    return "Invalid email or password.";
  }

  if (message.includes("user already registered") || code === "user_already_exists") {
    return "An account with this email already exists. Please sign in or reset your password.";
  }

  if (message.includes("email not confirmed") || message.includes("confirm your email")) {
    return "Please check your inbox and confirm this account before signing in.";
  }

  if (message.includes("too many requests") || message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (message.includes("oauth") || message.includes("provider") || message.includes("google")) {
    return "Google sign-in could not be completed. Please try again.";
  }

  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return "Unable to connect. Please try again.";
  }

  return fallback;
};

export const validateAuthForm = ({
  isSignUp,
  email,
  password,
  fullName,
  confirmPassword,
}: AuthFormInput): string => {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedFullName = (fullName || "").trim();

  if (!trimmedEmail || !trimmedPassword) {
    return "Please enter your email and password.";
  }

  if (isSignUp) {
    if (!trimmedFullName) {
      return "Please enter your full name.";
    }

    if (trimmedPassword.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      return "Please confirm your password.";
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      return "Passwords do not match.";
    }
  }

  return "";
};

export const validateRecoveryEmail = (value: string): string => {
  const trimmedEmail = value.trim();

  if (!trimmedEmail) {
    return "Please enter your email address.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmedEmail)) {
    return "Please enter a valid email address.";
  }

  return "";
};

export interface ResetPasswordFormInput {
  password: string;
  confirmPassword: string;
}

export const validateResetPasswordForm = ({
  password,
  confirmPassword,
}: ResetPasswordFormInput): string => {
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    return "Please enter a new password.";
  }

  if (trimmedPassword.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!confirmPassword || !confirmPassword.trim()) {
    return "Please confirm your new password.";
  }

  if (trimmedPassword !== confirmPassword.trim()) {
    return "Passwords do not match.";
  }

  return "";
};

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedNextPath = searchParams.get("next") || "";
  const nextPath = requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//") ? requestedNextPath : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const redirectIfLoggedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted && session) {
        navigate(nextPath, { replace: true });
      }
    };

    redirectIfLoggedIn();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted && session) {
        navigate(nextPath, { replace: true });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, nextPath]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(getFriendlyAuthError(err, "Google sign-in could not be completed. Please try again."));
    }
  };

  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = fullName.trim();
    const validationError = validateAuthForm({
      isSignUp,
      email: trimmedEmail,
      password: trimmedPassword,
      fullName: trimmedName,
      confirmPassword,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: {
              full_name: trimmedName,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          toast.success("Account created successfully.");
          navigate(nextPath, { replace: true });
          return;
        }

        toast.success("Account created. Please check your email to confirm your account.");
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) throw error;

        if (data.session) {
          toast.success("Signed in successfully.");
          navigate(nextPath, { replace: true });
        }
      }
    } catch (err: any) {
      toast.error(getFriendlyAuthError(err, "Authentication failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    const validationError = validateRecoveryEmail(trimmedEmail);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setResetEmailSent(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success("If an account exists for this email, reset instructions will be sent shortly.");
    } catch (err: any) {
      toast.error(getFriendlyAuthError(err, "Failed to request password reset. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex flex-col items-center py-12 px-4 relative">
        <div className="absolute top-6 left-6 hidden md:block">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 bg-white border border-gray-100 px-5 py-2.5 rounded-2xl text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest italic">Back to Shop</span>
          </button>
        </div>

        <div className="w-full max-w-[350px] mb-6 md:hidden">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-[11px] font-black uppercase tracking-widest italic group"
          >
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <ArrowLeft size={14} />
            </div>
            Back to Home
          </button>
        </div>

        <div className="w-full max-w-[350px] space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            {forgotPasswordMode ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setForgotPasswordMode(false);
                    setResetEmailSent(false);
                  }}
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
                      className="w-full bg-primary text-white py-2.5 rounded shadow-sm hover:bg-primary-hover transition-all text-sm font-bold"
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
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        autoComplete="username"
                      />
                    </div>

                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="w-full bg-primary text-white py-2.5 rounded shadow-sm hover:bg-primary-hover transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                        onChange={(event) => setFullName(event.target.value)}
                        className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-bold block">Email</label>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold block">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                    />
                  </div>

                  {isSignUp && (
                    <div className="space-y-1">
                      <label className="text-sm font-bold block">Confirm password</label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full border border-[#a6a6a6] px-3 py-2 rounded shadow-inner text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        autoComplete="new-password"
                      />
                    </div>
                  )}

                  {!isSignUp && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordMode(true)}
                        className="text-xs text-[#0066c0] hover:text-[#c45500] hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full bg-primary text-white py-2.5 rounded shadow-sm hover:bg-primary-hover transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : isSignUp ? "Create Account" : "Sign In"}
                  </button>

                  <div className="relative py-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <span className="relative bg-white px-2 text-xs text-gray-500 italic">or</span>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-slate-900 text-white py-2.5 rounded shadow-sm hover:bg-primary transition-all text-sm font-bold flex items-center justify-center gap-3 border border-slate-900"
                  >
                    <div className="bg-white p-1 rounded-sm">
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                    </div>
                    Continue with Google
                  </button>

                  <p className="text-[10px] leading-relaxed text-gray-500 italic text-center">
                    By continuing, you agree to NM Mart's <span className="text-slate-900 hover:underline cursor-pointer font-bold">Conditions of Use</span> and <span className="text-slate-900 hover:underline cursor-pointer font-bold">Privacy Notice</span>.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="relative py-4 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-slate-50 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">New to NM Mart?</span>
          </div>

          <button
            onClick={() => {
              setIsSignUp((current) => !current);
              setConfirmPassword("");
              setPassword("");
            }}
            className="w-full bg-white border border-slate-200 text-slate-900 py-2.5 rounded shadow-sm hover:bg-slate-50 transition-all text-sm font-bold"
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

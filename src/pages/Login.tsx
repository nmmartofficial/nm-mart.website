import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
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

  if (
    message.includes("user already registered") ||
    code === "user_already_exists"
  ) {
    return "An account with this email already exists. Please sign in or reset your password.";
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("confirm your email")
  ) {
    return "Please check your inbox and confirm your account before signing in.";
  }

  if (
    message.includes("too many requests") ||
    message.includes("rate limit")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (
    message.includes("oauth") ||
    message.includes("provider") ||
    message.includes("google")
  ) {
    return "Google sign-in could not be completed. Please try again.";
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
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

  const nextPath =
    requestedNextPath.startsWith("/") &&
    !requestedNextPath.startsWith("//")
      ? requestedNextPath
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

 const [resetEmailSent, setResetEmailSent] = useState(false);
const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
const [resetOtp, setResetOtp] = useState("");
const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const redirectIfLoggedIn = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted && session) {
        navigate(nextPath, { replace: true });
      }
    };

    redirectIfLoggedIn();

const authListener = supabase.auth.onAuthStateChange(
  (_event, session) => {
    if (isMounted && session && !isRecoveryFlow) {
      navigate(nextPath, { replace: true });
    }
  }
);

const subscription = authListener.data.subscription;

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
          redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(
            nextPath
          )}`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      toast.error(
        getFriendlyAuthError(
          err,
          "Google sign-in could not be completed. Please try again."
        )
      );
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

        toast.success(
          "Account created. Please check your email to confirm your account."
        );

        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
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
      toast.error(
        getFriendlyAuthError(
          err,
          "Authentication failed. Please try again."
        )
      );
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
   const { error } =
  await supabase.auth.resetPasswordForEmail(
    trimmedEmail
  );

      if (error) throw error;

      setResetEmailSent(true);
setIsRecoveryFlow(true);

toast.success(
  "Password reset OTP has been sent to your email."
);
} catch (err: any) {
  setIsRecoveryFlow(false);

  toast.error(
    getFriendlyAuthError(
      err,
      "Failed to send password reset OTP. Please try again."
    )
  );
} finally {
  setLoading(false);
}
};

const handleVerifyResetOtp = async () => {
  const trimmedOtp = resetOtp.trim();
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    toast.error("Please enter your email address.");
    return;
  }

  if (!/^\d{6}$/.test(trimmedOtp)) {
    toast.error("Please enter the 6-digit OTP.");
    return;
  }

  setLoading(true);
  setIsRecoveryFlow(true);

  try {
    const { error } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token: trimmedOtp,
      type: "recovery",
    });

    if (error) throw error;

    toast.success("OTP verified successfully.");

    navigate("/reset-password", {
      replace: true,
    });
  } catch (err: any) {
    const message = (err?.message || "").toLowerCase();

    if (
      message.includes("expired") ||
      message.includes("otp_expired")
    ) {
      toast.error(
        "This OTP has expired. Please request a new OTP."
      );
    } else if (
      message.includes("invalid") ||
      message.includes("otp")
    ) {
      toast.error(
        "Invalid OTP. Please check the code and try again."
      );
    } else if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("timeout")
    ) {
      toast.error(
        "Unable to connect. Please try again."
      );
    } else {
      toast.error(
        "OTP verification failed. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
};

const switchAuthMode = () => {
    setIsSignUp((current) => !current);
    setConfirmPassword("");
    setPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setForgotPasswordMode(false);
    setResetEmailSent(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7FB] font-sans text-[#0B3B78]">

      {/* Login page header - website search/header intentionally removed */}
      <header className="w-full border-b border-[#E4ECF7] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex flex-col items-start leading-none"
            aria-label="NM Mart Home"
          >
            <div className="relative h-14 w-40 overflow-hidden md:h-16 md:w-48">
              <img
                src="/logo.jpeg"
                alt="NM Mart"
                className="absolute left-[-20px] top-[-82px] h-[220px] w-[220px] max-w-none object-cover md:left-[-24px] md:top-[-88px] md:h-[250px] md:w-[250px]"
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-full border border-[#BDD8FF] bg-white px-3 py-2 text-[11px] font-bold text-[#0B3B78] transition hover:bg-[#EAF3FF] md:px-4 md:text-xs"
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>

        </div>
      </header>

      <main className="flex-1 px-4 py-8 md:px-8 md:py-12">

        <div className="mx-auto w-full max-w-[500px]">

          <div className="overflow-hidden rounded-[24px] border border-[#DDE7F5] bg-white shadow-[0_18px_60px_rgba(21,94,239,0.10)]">

            {/* Blue title area */}
            <div className="bg-[#1D5FBF] px-5 py-6 text-center text-white md:px-8 md:py-7">

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                {isSignUp ? (
                  <UserRound size={24} />
                ) : (
                  <ShoppingCart size={24} />
                )}
              </div>

              <h1 className="!text-white text-[27px] font-[900] tracking-[-0.03em] md:text-[31px]">
                {forgotPasswordMode
                  ? "Reset Password"
                  : isSignUp
                    ? "Create Your Account"
                    : "Welcome Back!"}
              </h1>

              <p className="mt-1 text-[12px] font-medium text-white/85 md:text-sm">
                {forgotPasswordMode
                  ? "Reset your NM Mart account password"
                  : isSignUp
                    ? "Join NM Mart and shop more, save more"
                    : "Sign in to your NM Mart account"}
              </p>

            </div>

            <div className="p-5 md:p-7">

              {/* Sign In / Sign Up tabs */}
              {!forgotPasswordMode && (
                <div className="mb-6 rounded-xl bg-[#F1F4F8] p-1">
                  <div className="grid grid-cols-2 gap-1">

                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setPassword("");
                        setConfirmPassword("");
                      }}
                      className={`rounded-lg py-2.5 text-sm font-extrabold transition-all ${
                        !isSignUp
                          ? "bg-[#1D5FBF] text-white shadow-sm"
                          : "text-[#68778C]"
                      }`}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setPassword("");
                        setConfirmPassword("");
                      }}
                      className={`rounded-lg py-2.5 text-sm font-extrabold transition-all ${
                        isSignUp
                          ? "bg-[#1D5FBF] text-white shadow-sm"
                          : "text-[#68778C]"
                      }`}
                    >
                      Create Account
                    </button>

                  </div>
                </div>
              )}

              {/* Forgot password */}
              {forgotPasswordMode ? (
                <div className="space-y-5">

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordMode(false);
                      setResetEmailSent(false);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-[#718096] hover:text-[#0B3B78]"
                  >
                    <ArrowLeft size={15} />
                    Back to Sign In
                  </button>

                  {resetEmailSent ? (
                    <div className="space-y-4">

                      <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
                        <CheckCircle2
                          size={19}
                          className="mt-0.5 shrink-0 text-green-600"
                        />

                        <p className="text-xs leading-5 text-green-800">
                          If an account exists for{" "}
                          <b>{email}</b>, you will receive
                          reset instructions shortly.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode(false);
                          setResetEmailSent(false);
                        }}
                        className="w-full rounded-xl bg-[#1D5FBF] py-3 text-sm font-extrabold text-white transition hover:bg-[#0B3B78]"
                      >
                        Return to Sign In
                      </button>

                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-extrabold">
                          Email address
                        </label>

                        <div className="relative">
                          <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                          />

                          <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(event) =>
                              setEmail(event.target.value)
                            }
                            className="h-12 w-full rounded-xl border border-[#D6DFEC] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#1D5FBF] focus:ring-4 focus:ring-[#1D5FBF]/10"
                            autoComplete="username"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D5FBF] text-sm font-extrabold text-white transition hover:bg-[#0B3B78] disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          "Continue"
                        )}
                      </button>
                    </>
                  )}

                </div>
              ) : (
                <>
                  <div className="space-y-4">

                    {/* Name */}
                    {isSignUp && (
                      <div>
                        <label className="mb-2 block text-sm font-extrabold">
                          Your name
                        </label>

                        <div className="relative">
                          <UserRound
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                          />

                          <input
                            type="text"
                            placeholder="First and last name"
                            value={fullName}
                            onChange={(event) =>
                              setFullName(event.target.value)
                            }
                            className="h-12 w-full rounded-xl border border-[#D6DFEC] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#1D5FBF] focus:ring-4 focus:ring-[#1D5FBF]/10"
                            autoComplete="name"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="mb-2 block text-sm font-extrabold">
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                        />

                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(event) =>
                            setEmail(event.target.value)
                          }
                          className="h-12 w-full rounded-xl border border-[#D6DFEC] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#1D5FBF] focus:ring-4 focus:ring-[#1D5FBF]/10"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="mb-2 block text-sm font-extrabold">
                        Password
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                        />

                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(event) =>
                            setPassword(event.target.value)
                          }
                          className="h-12 w-full rounded-xl border border-[#D6DFEC] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#1D5FBF] focus:ring-4 focus:ring-[#1D5FBF]/10"
                          autoComplete={
                            isSignUp
                              ? "new-password"
                              : "current-password"
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((current) => !current)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1D5FBF]"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    {isSignUp && (
                      <div>
                        <label className="mb-2 block text-sm font-extrabold">
                          Confirm password
                        </label>

                        <div className="relative">
                          <LockKeyhole
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                          />

                          <input
                            type={
                              showConfirmPassword
                                ? "text"
                                : "password"
                            }
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(event) =>
                              setConfirmPassword(event.target.value)
                            }
                            className="h-12 w-full rounded-xl border border-[#D6DFEC] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#1D5FBF] focus:ring-4 focus:ring-[#1D5FBF]/10"
                            autoComplete="new-password"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(
                                (current) => !current
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1D5FBF]"
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Forgot password */}
                    {!isSignUp && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setForgotPasswordMode(true)
                          }
                          className="text-xs font-bold text-[#1D5FBF] hover:underline"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    )}

                    {/* Main auth button */}
                    <button
                      type="button"
                      onClick={handleAuth}
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D5FBF] text-sm font-extrabold text-white shadow-[0_7px_20px_rgba(29,95,191,0.18)] transition hover:bg-[#0B3B78] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : isSignUp ? (
                        <>
                          Create Account
                          <span className="text-lg">→</span>
                        </>
                      ) : (
                        <>
                          Sign In
                          <span className="text-lg">→</span>
                        </>
                      )}
                    </button>

                    {/* OR */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-[#E5EAF1]" />

                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#8995A6]">
                        OR
                      </span>

                      <div className="h-px flex-1 bg-[#E5EAF1]" />
                    </div>

                    {/* Google */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#D6DFEC] bg-white text-sm font-extrabold text-[#0B3B78] transition hover:border-[#1D5FBF] hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                        <img
                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                          alt="Google"
                          className="h-5 w-5"
                        />
                      </div>

                      Continue with Google
                    </button>

                    {/* Terms */}
                    <p className="px-2 text-center text-[9px] leading-5 text-[#7A879A]">
                      By continuing, you agree to NM Mart's{" "}
                      <span className="font-bold text-[#0B3B78]">
                        Conditions of Use
                      </span>{" "}
                      and{" "}
                      <span className="font-bold text-[#0B3B78]">
                        Privacy Notice
                      </span>
                      .
                    </p>

                  </div>
                </>
              )}

            </div>
          </div>

          <div className="pb-5 pt-5 text-center">
            <p className="text-[9px] font-black uppercase tracking-[3px] text-[#64748B]">
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

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldAlert,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { validateResetPasswordForm } from "@/pages/Login";
import Footer from "@/components/shop/Footer";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!isMounted) return;

        setSessionReady(Boolean(session));
        setIsCheckingSession(false);

        if (!session) {
          toast.error(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }
      } catch (error: any) {
        if (!isMounted) return;

        setSessionReady(false);
        setIsCheckingSession(false);

        const message = (error?.message || "").toLowerCase();

        if (
          message.includes("auth") ||
          message.includes("jwt") ||
          message.includes("expired") ||
          message.includes("invalid")
        ) {
          toast.error(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        } else {
          toast.error(
            "Unable to validate the reset link. Please request a new one."
          );
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

      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);

      toast.success("Your password has been updated successfully.");
    } catch (error: any) {
      const message = (error?.message || "").toLowerCase();

      if (
        message.includes("password") &&
        (message.includes("weak") ||
          message.includes("too short") ||
          message.includes("minimum"))
      ) {
        toast.error("Password must be at least 8 characters long.");
      } else if (
        message.includes("network") ||
        message.includes("fetch") ||
        message.includes("timeout")
      ) {
        toast.error("Unable to connect. Please try again.");
      } else {
        toast.error("Unable to update your password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] text-[#0B1F3A] flex flex-col font-sans">
        {/* Header */}
        <header className="w-full border-b border-[#E4ECF7] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex flex-col items-start leading-none"
              aria-label="NM Mart Home"
            >
              <div className="flex items-center">
                <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#155EEF] md:text-[42px]">
                  NM
                </span>

                <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#0B1F3A] md:text-[42px]">
                  Mart
                </span>

                <ShoppingCart
                  size={25}
                  strokeWidth={2.5}
                  className="ml-1 text-[#155EEF] md:h-8 md:w-8"
                />
              </div>

              <span className="mt-1 text-[7px] font-bold tracking-[0.18em] text-[#0B1F3A]/60 uppercase md:text-[9px]">
                SHOP MORE, SAVE MORE
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-full border border-[#DCE7FA] bg-[#F5F9FF] px-3 py-2 text-[11px] font-bold text-[#155EEF] transition hover:bg-[#EAF2FF] md:px-4 md:text-xs"
            >
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="mx-auto w-full max-w-[500px]">
            <div className="overflow-hidden rounded-[24px] border border-[#DDE7F5] bg-white shadow-[0_18px_60px_rgba(21,94,239,0.10)]">
              <div className="bg-[#155EEF] px-5 py-7 text-center text-white md:px-8 md:py-8">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                  <CheckCircle2 size={30} strokeWidth={2.5} />
                </div>

                <h1 className="text-[27px] font-[900] tracking-[-0.03em] md:text-[31px]">
                  Password Updated
                </h1>

                <p className="mt-1 text-[12px] font-medium text-white/85 md:text-sm">
                  Your NM Mart account is secure
                </p>
              </div>

              <div className="p-5 md:p-7">
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 size={23} />
                  </div>

                  <h2 className="text-lg font-black text-[#0B1F3A]">
                    Password updated successfully
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-green-800">
                    Your new password is active. You can now sign in to your NM
                    Mart account using your new password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] text-sm font-extrabold text-white shadow-[0_7px_20px_rgba(21,94,239,0.18)] transition hover:bg-[#0E4CC7]"
                >
                  <ArrowLeft size={17} />
                  Go to Sign In
                </button>
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
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] text-[#0B1F3A] flex flex-col font-sans">
        {/* Header */}
        <header className="w-full border-b border-[#E4ECF7] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex flex-col items-start leading-none"
              aria-label="NM Mart Home"
            >
              <div className="flex items-center">
                <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#155EEF] md:text-[42px]">
                  NM
                </span>

                <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#0B1F3A] md:text-[42px]">
                  Mart
                </span>

                <ShoppingCart
                  size={25}
                  strokeWidth={2.5}
                  className="ml-1 text-[#155EEF] md:h-8 md:w-8"
                />
              </div>

              <span className="mt-1 text-[7px] font-bold tracking-[0.18em] text-[#0B1F3A]/60 uppercase md:text-[9px]">
                SHOP MORE, SAVE MORE
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-[500px] overflow-hidden rounded-[24px] border border-[#DDE7F5] bg-white shadow-[0_18px_60px_rgba(21,94,239,0.10)]">
            <div className="bg-[#155EEF] px-5 py-7 text-center text-white">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <LockKeyhole size={24} />
              </div>

              <h1 className="text-[27px] font-[900] tracking-[-0.03em]">
                Reset Password
              </h1>

              <p className="mt-1 text-[12px] font-medium text-white/85">
                Checking your secure reset link
              </p>
            </div>

            <div className="p-7 text-center">
              <Loader2
                className="mx-auto animate-spin text-[#155EEF]"
                size={34}
              />

              <p className="mt-4 text-sm font-semibold text-[#64748B]">
                Checking your secure reset link...
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] text-[#0B1F3A] flex flex-col font-sans">
        {/* Header */}
        <header className="w-full border-b border-[#E4ECF7] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex flex-col items-start leading-none"
              aria-label="NM Mart Home"
            >
              <div className="flex items-center">
                <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#155EEF] md:text-[42px]">
                  NM
                </span>

                <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#0B1F3A] md:text-[42px]">
                  Mart
                </span>

                <ShoppingCart
                  size={25}
                  strokeWidth={2.5}
                  className="ml-1 text-[#155EEF] md:h-8 md:w-8"
                />
              </div>

              <span className="mt-1 text-[7px] font-bold tracking-[0.18em] text-[#0B1F3A]/60 uppercase md:text-[9px]">
                SHOP MORE, SAVE MORE
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-[500px] overflow-hidden rounded-[24px] border border-[#DDE7F5] bg-white shadow-[0_18px_60px_rgba(21,94,239,0.10)]">
            <div className="bg-[#155EEF] px-5 py-7 text-center text-white">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <ShieldAlert size={25} />
              </div>

              <h1 className="text-[27px] font-[900] tracking-[-0.03em]">
                Reset Link Expired
              </h1>

              <p className="mt-1 text-[12px] font-medium text-white/85">
                Your password reset link is no longer valid
              </p>
            </div>

            <div className="p-5 md:p-7">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                <p className="text-sm leading-6 text-red-800">
                  This recovery link is invalid or has already expired. Please
                  request a new password reset email.
                </p>
              </div>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] text-sm font-extrabold text-white shadow-[0_7px_20px_rgba(21,94,239,0.18)] transition hover:bg-[#0E4CC7]"
              >
                <ArrowLeft size={17} />
                Back to Sign In
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF] text-[#0B1F3A] flex flex-col font-sans">
      {/* Header */}
      <header className="w-full border-b border-[#E4ECF7] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex flex-col items-start leading-none"
            aria-label="NM Mart Home"
          >
            <div className="flex items-center">
              <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#155EEF] md:text-[42px]">
                NM
              </span>

              <span className="text-[34px] font-[900] tracking-[-0.07em] text-[#0B1F3A] md:text-[42px]">
                Mart
              </span>

              <ShoppingCart
                size={25}
                strokeWidth={2.5}
                className="ml-1 text-[#155EEF] md:h-8 md:w-8"
              />
            </div>

            <span className="mt-1 text-[7px] font-bold tracking-[0.18em] text-[#0B1F3A]/60 uppercase md:text-[9px]">
              SHOP MORE, SAVE MORE
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-full border border-[#DCE7FA] bg-[#F5F9FF] px-3 py-2 text-[11px] font-bold text-[#155EEF] transition hover:bg-[#EAF2FF] md:px-4 md:text-xs"
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
            <div className="bg-[#155EEF] px-5 py-7 text-center text-white md:px-8 md:py-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <LockKeyhole size={25} />
              </div>

              <h1 className="text-[27px] font-[900] tracking-[-0.03em] md:text-[31px]">
                Set a New Password
              </h1>

              <p className="mt-1 text-[12px] font-medium text-white/85 md:text-sm">
                Create a new secure password for your NM Mart account
              </p>
            </div>

            <div className="p-5 md:p-7">
              {/* Back to login */}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="mb-6 flex items-center gap-2 text-xs font-bold text-[#718096] transition hover:text-[#155EEF]"
              >
                <ArrowLeft size={15} />
                Back to Sign In
              </button>

              <form onSubmit={handleReset} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-extrabold"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8290A3]"
                    />

                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-[#CBD5E1] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#155EEF] focus:ring-4 focus:ring-[#155EEF]/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8290A3] transition hover:text-[#155EEF]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] font-medium text-[#718096]">
                    Use at least 8 characters for your password.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-extrabold"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8290A3]"
                    />

                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-[#CBD5E1] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#155EEF] focus:ring-4 focus:ring-[#155EEF]/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8290A3] transition hover:text-[#155EEF]"
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

                {/* Security note */}
                <div className="rounded-xl border border-[#DCE7FA] bg-[#F5F9FF] px-4 py-3">
                  <p className="text-[11px] leading-5 text-[#5E6F85]">
                    For your security, choose a password that you do not use on
                    other websites.
                  </p>
                </div>

                {/* Update Password */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] text-sm font-extrabold text-white shadow-[0_7px_20px_rgba(21,94,239,0.18)] transition hover:bg-[#0E4CC7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
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

export default ResetPassword;

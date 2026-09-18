import { ArrowRight, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";
import { STORE_DETAILS } from "@/lib/store-utils";

const SLOGAN = "SHOP MORE, SAVE MORE";
const SUPPORT_PHONE = STORE_DETAILS.mob;
const SUPPORT_EMAIL = "support@nmmart.in";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-800">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">

          {/* Left Column: Branding */}
          <div className="flex-1 md:max-w-[55%]">
            <Link to="/" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm md:h-[52px] md:w-[52px]">
                {theme.storeLogo ? (
                  <img src={theme.storeLogo} alt="NM Mart logo" className="h-10 w-10 object-contain md:h-11 md:w-11" />
                ) : (
                  <img src="/nm-mart-logo.png" alt="NM Mart logo" className="h-10 w-10 object-contain md:h-11 md:w-11" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black uppercase tracking-tight text-slate-900 md:text-2xl">
                  {theme.storeName || "NM MART"}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  {SLOGAN}
                </span>
              </div>
            </Link>
            <p className="mt-5 text-[14px] leading-relaxed text-slate-500 md:max-w-md">
              Bringing wholesale prices directly to the doorsteps of Manjhanpur.
            </p>
          </div>

          {/* Right Column: Support */}
          <div className="flex-shrink-0 md:w-[40%]">
            <h3 className="mb-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Customer Support
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`}
                  className="group flex items-center gap-3 text-[14px] font-semibold text-slate-700 transition hover:text-blue-600"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-blue-50">
                    <Phone size={16} className="text-slate-400 transition group-hover:text-blue-500" />
                  </div>
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="group flex items-center gap-3 text-[14px] font-semibold text-slate-700 transition hover:text-blue-600"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-blue-50">
                    <Mail size={16} className="text-slate-400 transition group-hover:text-blue-500" />
                  </div>
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="group flex items-center gap-3 text-[14px] font-semibold text-slate-700 transition hover:text-blue-600"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-blue-50">
                    <ArrowRight size={16} className="text-slate-400 transition group-hover:text-blue-500" />
                  </div>
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto flex h-[50px] max-w-6xl items-center justify-between px-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            © 2026 NM MART
          </p>
          <Link
            to="/privacy"
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-blue-600 hover:underline hover:underline-offset-4"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

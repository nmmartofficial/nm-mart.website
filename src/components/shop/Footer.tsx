import { ArrowRight, Clock3, Mail, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";
import { ANDROID_APP_URL, IOS_APP_URL, STORE_DETAILS, SUPPORT_HOURS, WA_NUMBER } from "@/lib/store-utils";

const SLOGAN = "SHOP MORE, SAVE MORE";
const SUPPORT_PHONE = STORE_DETAILS.mob;
const SUPPORT_EMAIL = "support@nmmart.in";
const WHATSAPP_URL = `https://wa.me/${WA_NUMBER}`;

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12">
        <div className="grid gap-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">

          {/* Left Column: Branding */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
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
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-slate-500">
              Bringing wholesale prices directly to the doorsteps of Manjhanpur.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Links</h3>
            <ul className="space-y-3 text-sm font-semibold text-slate-700">
              <li><Link to="/about" className="transition hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="transition hover:text-primary">Contact Us</Link></li>
              <li><Link to="/faq" className="transition hover:text-primary">FAQs</Link></li>
              <li><Link to="/terms" className="transition hover:text-primary">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy" className="transition hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Customer Support</h3>
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
              <li className="flex items-center gap-3 text-[14px] font-semibold text-slate-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50"><Clock3 size={16} className="text-slate-400" /></div>
                <span>{SUPPORT_HOURS}</span>
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

          <div>
            <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Follow Us</h3>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-sm font-semibold text-slate-700 transition hover:text-[#25D366]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f9ef] text-[#149447] transition group-hover:bg-[#25D366] group-hover:text-white"><MessageCircle size={17} /></span>
              WhatsApp
            </a>
            <p className="mt-4 text-xs leading-5 text-slate-500">Only configured NM Mart social channels are shown.</p>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Download Our App</h3>
            <div className="space-y-2">
              <AppStoreLink href={ANDROID_APP_URL} label="Google Play Store" />
              <AppStoreLink href={IOS_APP_URL} label="Apple App Store" />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-100 bg-slate-50/50 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto flex min-h-[50px] max-w-7xl flex-col items-center justify-center gap-2 px-4 py-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
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

function AppStoreLink({ href, label }: { href: string; label: string }) {
  if (!href) {
    return <span className="flex min-h-10 cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-400" aria-disabled="true">{label} <span className="ml-2 text-[9px] uppercase tracking-[0.12em]">Coming soon</span></span>;
  }

  return <a href={href} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-primary hover:text-primary">{label}</a>;
}

export default Footer;

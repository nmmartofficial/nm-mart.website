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
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          <div className="min-w-0">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                {theme.storeLogo ? (
                  <img src={theme.storeLogo} alt="NM Mart logo" className="h-10 w-10 object-contain" />
                ) : (
                  <img src="/nm-mart-logo.png" alt="NM Mart logo" className="h-10 w-10 object-contain" />
                )}
              </div>

              <div>
                <div className="text-2xl font-black uppercase tracking-[-0.08em] text-slate-900">
                  {theme.storeName?.toUpperCase() || "NM MART"}
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                  {SLOGAN}
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
              Bringing wholesale prices directly to the doorsteps of Manjhanpur.
            </p>
          </div>

          <div className="min-w-0">
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
              Customer Support
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>
                <a href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 transition hover:text-red-600">
                  <Phone className="h-3.5 w-3.5" />
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 transition hover:text-red-600">
                  <Mail className="h-3.5 w-3.5" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <Link to="/contact" className="inline-flex items-center gap-2 transition hover:text-red-600">
                  <ArrowRight className="h-3.5 w-3.5" />
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-600 sm:flex-row sm:text-left">
          <p>© 2026 NM MART</p>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="transition hover:text-red-600">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

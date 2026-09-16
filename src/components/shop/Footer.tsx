import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";

const SLOGAN = "SHOP MORE SAVE MORE";
const STORE_ADDRESS = "Naya Nagar, First Dhata Road, Manjhanpur, Kaushambi, UP, PIN-212207";
const SUPPORT_PHONE = "+91-7081154604";
const SUPPORT_EMAIL = "support@nmmart.in";

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/tracker", label: "Track Order" },
    { to: "/profile", label: "My Account" }
  ];

  const shopLinks = [
    { to: "/", label: "Shop Home" }
  ];

  const accountLinks = [
    { to: "/profile", label: "My Account" },
    { to: "/tracker", label: "My Orders" },
    { to: "/checkout", label: "Checkout" }
  ];

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
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

          <div>
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="inline-flex items-center gap-2 transition hover:text-red-600">
                    <ArrowRight className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
              Shop
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="inline-flex items-center gap-2 transition hover:text-red-600">
                    <ArrowRight className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
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

          <div>
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
              Account & Orders
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="inline-flex items-center gap-2 transition hover:text-red-600">
                    <ArrowRight className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-start gap-2 text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span className="text-sm leading-6">{STORE_ADDRESS}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-600 sm:flex-row sm:text-left">
          <p>© {currentYear} NM MART</p>
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

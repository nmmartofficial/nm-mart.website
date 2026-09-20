import { ArrowLeft, Bell, ChevronRight, FileText, Globe, HelpCircle, Info, MapPin, MoonStar, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

const preferences = [
  {
    icon: Bell,
    title: "Notifications",
    subtitle: "Manage app notifications",
    action: "button",
  },
  {
    icon: Globe,
    title: "Language",
    subtitle: "English / हिंदी",
    action: "button",
  },
  {
    icon: MapPin,
    title: "Location & Delivery",
    subtitle: "Manage delivery preferences",
    action: "button",
  },
] as const;

const display = [
  {
    icon: MoonStar,
    title: "Appearance",
    subtitle: "Light / System",
    action: "button",
  },
] as const;

const support = [
  { icon: Sparkles, title: "FAQs", subtitle: "", to: "/faq" },
  { icon: HelpCircle, title: "Help & Support", subtitle: "", to: "/contact" },
  { icon: Info, title: "About NM MART", subtitle: "", to: "/about" },
] as const;

const legal = [
  { icon: ShieldCheck, title: "Privacy Policy", to: "/privacy" },
  { icon: FileText, title: "Terms & Conditions", to: "/terms" },
] as const;

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-md px-4 py-5 md:px-6 md:py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="flex items-center border-b border-slate-200 px-4 py-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
              <span className="text-base font-extrabold text-slate-800">Settings</span>
            </button>
          </div>

          <div className="space-y-6 px-4 py-5">
            <section>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">App Preferences</p>
              <div className="mt-3 space-y-3">
                {preferences.map(({ icon: Icon, title, subtitle }) => (
                  <button
                    key={title}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-black tracking-[-0.04em] text-slate-900">{title}</p>
                        <p className="truncate text-[12px] text-slate-500">{subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Display</p>
              <div className="mt-3 space-y-3">
                {display.map(({ icon: Icon, title, subtitle }) => (
                  <button
                    key={title}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-black tracking-[-0.04em] text-slate-900">{title}</p>
                        <p className="truncate text-[12px] text-slate-500">{subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Support</p>
              <div className="mt-3 space-y-3">
                {support.map(({ icon: Icon, title, to }) => (
                  <Link
                    key={title}
                    to={to}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={18} />
                      </div>
                      <span className="truncate text-base font-black tracking-[-0.04em] text-slate-900">{title}</span>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Legal</p>
              <div className="mt-3 space-y-3">
                {legal.map(({ icon: Icon, title, to }) => (
                  <Link
                    key={title}
                    to={to}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={18} />
                      </div>
                      <span className="truncate text-base font-black tracking-[-0.04em] text-slate-900">{title}</span>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            </section>

            <div className="border-t border-slate-200 pt-4 text-center text-[12px] font-semibold text-slate-600">
              App Version <span className="font-black text-slate-800">• v1.0.0</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Search,
  TicketPercent,
  Truck,
  UserRound,
} from "lucide-react";
import { STORE_DETAILS, SUPPORT_HOURS, WA_NUMBER } from "@/lib/store-utils";

const helpItems = [
  {
    icon: Package,
    title: "My Order",
    description: "Track, cancel or manage order",
  },
  {
    icon: Truck,
    title: "Delivery",
    description: "Delivery time & service area",
  },
  {
    icon: CreditCard,
    title: "Payment",
    description: "Payment & wallet help",
  },
  {
    icon: TicketPercent,
    title: "Coupons & Offers",
    description: "Offers, coupons & rewards",
  },
  {
    icon: UserRound,
    title: "Account",
    description: "Profile & account help",
  },
];

const contactItems = [
  {
    icon: MessageCircle,
    label: "WhatsApp Support",
    href: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi NM Mart, I need support with my order or account.")}`,
  },
  {
    icon: Phone,
    label: "Call Us",
    href: `tel:${STORE_DETAILS.mob.replace(/[^\d+]/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email Support",
    href: "mailto:support@nmmart.in",
  },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-md px-4 py-5 md:px-6 md:py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="flex items-center border-b border-slate-200 px-4 py-4">
            <button
              type="button"
              aria-label="Go back"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"
            >
              <ArrowLeft size={18} />
              <span className="text-base font-extrabold text-slate-800">Help & Support</span>
            </button>
          </div>

          <div className="px-4 pb-4 pt-5">
            <div className="text-center">
              <h1 className="text-[30px] font-black leading-none tracking-[-0.08em] text-slate-900">How can we help you?</h1>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner shadow-slate-200/30">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-slate-400" />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search your question..."
                    className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Quick Help</p>

              <div className="mt-4 space-y-3">
                {helpItems.map(({ icon: Icon, title, description }) => (
                  <button
                    key={title}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-base font-black tracking-[-0.04em] text-slate-900">{title}</p>
                        <p className="text-[12px] text-slate-500">{description}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Contact Support</p>

              <div className="mt-4 space-y-3">
                {contactItems.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-slate-800 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={18} />
                      </div>
                      <span className="text-base font-black tracking-[-0.04em] text-slate-900">{label}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Support Hours</p>
              <p className="mt-2 text-sm font-medium text-slate-700">{SUPPORT_HOURS}</p>
            </div>

            <div className="mt-5 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">NM MART</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                SHOP MORE, SAVE MORE
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

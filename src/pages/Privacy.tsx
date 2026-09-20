import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Eye, FileText, Lock, Mail, Scale, ShieldCheck } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="nm-page-shell py-6 md:py-10">
        <header className="mb-6 text-center md:mb-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <ShieldCheck size={14} /> Secure &amp; Transparent
          </div>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[-0.06em] text-slate-900 md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.15em] text-slate-500">Last updated: April 2026</p>
        </header>

        <article className="nm-card p-5 md:p-8 lg:p-10">
          <div className="space-y-8">
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-primary"><FileText size={18} /></div>
                <h2 className="nm-heading text-xl md:text-2xl">Introduction</h2>
              </div>
              <p className="text-sm leading-7 text-slate-600 md:text-[15px]">
                Welcome to NM Mart. We value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you visit our store or use our digital services in Manjhanpur.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-primary"><Eye size={18} /></div>
                <h2 className="nm-heading text-xl md:text-2xl">Information Collection</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Personal Data</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    We collect your name, mobile number, and delivery address to process your wholesale orders and ensure timely delivery.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Transaction Info</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Details of your purchases, payment methods, and loyalty point balances are securely stored in our system.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-primary"><Lock size={18} /></div>
                <h2 className="nm-heading text-xl md:text-2xl">Data Security</h2>
              </div>
              <p className="text-sm leading-7 text-slate-600 md:text-[15px]">
                Your data is stored using industry-standard security controls. We do not sell personal information to third parties and access is limited to authorized personnel via secure internal systems.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-primary"><Scale size={18} /></div>
                <h2 className="nm-heading text-xl md:text-2xl">Your Rights</h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Right to access your order history
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Right to correct your delivery details
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Right to request account support and account-related updates
                </li>
              </ul>
            </section>

            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center md:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Questions about your privacy?</p>
              <a
                href="mailto:support@nmmart.in"
                className="nm-btn-primary mx-auto mt-4"
              >
                <Mail size={16} className="mr-2" /> Contact Support
              </a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;

import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Clock3, Loader2, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { STORE_DETAILS, SUPPORT_HOURS, WA_NUMBER } from "@/lib/store-utils";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      toast.success("Message sent successfully! We will get back to you soon.");
      setLoading(false);
      e.currentTarget.reset();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10 lg:py-12">
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] md:p-8 lg:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Contact Us</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h1 className="text-3xl font-black uppercase tracking-[-0.06em] text-slate-900 md:text-5xl">
              We’re here to help
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-right">
              Reach out for wholesale assistance, daily shopping support, or help with your order or delivery needs.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
          <div className="space-y-4">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-primary">
                  <MapPin size={18} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-[-0.04em] text-slate-900">Store Location</h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-primary">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Address</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{STORE_DETAILS.name}, {STORE_DETAILS.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-primary">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Call Us</p>
                    <a href={`tel:${STORE_DETAILS.mob.replace(/[^\d+]/g, "")}`} className="mt-1 inline-flex text-sm font-bold text-slate-800 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                      {STORE_DETAILS.mob}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-primary">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Email</p>
                    <a href="mailto:support@nmmart.in" className="mt-1 inline-flex text-sm font-bold text-slate-800 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                      support@nmmart.in
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-primary">
                    <Clock3 size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Business Hours</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{SUPPORT_HOURS}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] bg-primary p-5 text-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">WhatsApp</p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">Chat with us</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                  <MessageSquare size={20} />
                </div>
              </div>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-black uppercase tracking-[0.12em] text-primary transition-all duration-200 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <MessageSquare size={16} />
                Chat on WhatsApp
              </a>
            </section>
          </div>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-primary">
                <Send size={18} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-[-0.04em] text-slate-900">Send Us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Your Message</label>
                <textarea
                  rows={5}
                  placeholder="How can we help you?"
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white transition-all duration-200 hover:bg-slate-900 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                {loading ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

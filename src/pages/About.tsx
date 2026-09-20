import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: TrendingUp,
    title: "Wholesale Revolution",
    description:
      "We eliminate middlemen to give our customers genuine wholesale rates on a wide range of essentials and everyday products.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description:
      "Every product is selected with care so customers can shop with confidence and trust in the quality we offer.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Based in Manjhanpur, NM Mart is built around trust, transparency, and serving the local community with pride.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10 lg:py-12">
        <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.4)] md:p-8 lg:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">About Us</p>
          <div className="mt-3 flex flex-col gap-4 md:gap-5">
            <h1 className="text-3xl font-black uppercase tracking-[-0.08em] text-slate-900 md:text-5xl">
              <span className="text-[var(--nm-primary-dark)]">NM</span> <span className="text-[#f6c453]">Mart</span>
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-[15px]">
              Bringing wholesale prices directly to the doorsteps of Manjhanpur, NM Mart is built around smart shopping, honest pricing, and a service-first approach for everyday families.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_30px_-20px_rgba(15,23,42,0.25)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-primary">
                <Icon size={22} />
              </div>
              <h2 className="mt-4 text-lg font-black uppercase tracking-[-0.04em] text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] md:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Our Story</p>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em] text-slate-900 md:text-3xl">
              A smarter way to shop locally
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 md:text-[15px]">
              <p>
                NM Mart started with a simple goal: to make everyday essentials more accessible, affordable, and reliable for families in and around Manjhanpur.
              </p>
              <p>
                By combining wholesale pricing with a smooth digital shopping experience, we aim to give customers a more convenient and trustworthy way to buy what they need without the stress of inflated pricing or inconsistent quality.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">What We Offer</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                Wide product selection across daily needs and household essentials.
              </li>
              <li className="flex gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                Better pricing through direct bulk access and efficient sourcing.
              </li>
              <li className="flex gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                Local service that stays focused on trust, speed, and customer support.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] md:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Our Vision</p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em] text-slate-900 md:text-3xl">
            To make trusted, value-led shopping the standard
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 md:text-[15px]">
            NM Mart aims to bring together technology, local understanding, and reliable product standards so that customers can shop smarter and live better, without sacrificing trust or convenience.
          </p>
        </section>

        <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] md:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Our Commitment</p>
          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-[15px]">
            We remain committed to keeping prices fair, support responsive, and the shopping experience consistent for every customer who chooses NM Mart.
          </p>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition-all duration-200 hover:bg-slate-900 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Start Shopping
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-800 transition-all duration-200 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Contact Us
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

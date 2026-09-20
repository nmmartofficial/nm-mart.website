import { ArrowLeft, ChevronDown, CircleHelp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

const faqs = [
  {
    question: "How do I place an order?",
    answer: "Browse the catalog, add products to your cart, and continue through checkout using the available order flow.",
  },
  {
    question: "Do you offer delivery in my area?",
    answer: "Delivery service depends on the address, pin code, product availability, and current operational coverage in the selected area.",
  },
  {
    question: "Can I contact support for order help?",
    answer: "Yes. You can reach out through the Contact Us page or by calling the support number listed in the website footer.",
  },
  {
    question: "Are product prices and stock updated live?",
    answer: "The website reflects live catalog and availability information as provided through the store’s current product data feed.",
  },
];

export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="nm-page-shell pb-12 pt-6 md:pt-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="nm-card overflow-hidden p-5 md:p-8">
          <div className="flex items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CircleHelp size={22} />
            </div>
          </div>
          <h1 className="mt-5 text-center text-2xl font-black uppercase tracking-[-0.05em] text-slate-900 md:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            Helpful answers about shopping, support, delivery, and order-related queries.
          </p>

          <div className="mt-7 space-y-3">
            {faqs.map(({ question, answer }) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="text-sm font-black uppercase tracking-[0.05em] text-slate-800">{question}</span>
                  <ChevronDown size={16} className="shrink-0 text-slate-500" />
                </button>
                <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

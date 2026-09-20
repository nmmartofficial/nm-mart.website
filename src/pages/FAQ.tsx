import { ArrowLeft, CircleHelp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shop/Header";

export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-36 pt-6 md:px-6 md:pb-12">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <CircleHelp className="mx-auto text-primary" size={34} />
          <h1 className="mt-4 text-2xl font-black uppercase tracking-[-0.04em]">Frequently Asked Questions</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-500">FAQ content will be published here once the store questions are available.</p>
        </div>
      </main>
    </div>
  );
}

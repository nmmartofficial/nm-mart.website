import { ArrowLeft, Copy, TicketPercent, Gift, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { useState } from "react";

const coupons = [
  {
    id: "SAVE100",
    title: "₹100 OFF",
    subtitle: "On orders above ₹999",
    code: "SAVE100",
    validUntil: "30 Sep 2026",
  },
  {
    id: "NM10",
    title: "10% OFF",
    subtitle: "On selected products",
    code: "NM10",
    validUntil: "30 Sep 2026",
  },
] as const;

export default function CouponsPage() {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<(typeof coupons)[number] | null>(null);

  const applyCoupon = (code: string) => {
    setCouponCode(code);
  };

  const copyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // no-op for non-clipboard environments
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft size={14} />
          Coupons & Rewards
        </button>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Have a Coupon?</p>
              <div className="mt-4 flex items-center gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 border-0 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="border-l border-slate-200 bg-primary px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                >
                  Apply
                </button>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Available Coupons</p>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => setSelectedCoupon(coupon)}
                    className="w-full rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <TicketPercent size={18} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900">{coupon.title}</p>
                          <p className="text-sm text-slate-500">{coupon.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <span>Code:</span>
                        <span className="font-black uppercase tracking-[0.14em] text-slate-900">{coupon.code}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void copyCoupon(coupon.code);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700"
                        >
                          <Copy size={12} />
                          Copy
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] font-medium text-slate-500">Valid until {coupon.validUntil}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">My Rewards</p>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                      <Star size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Reward Points</p>
                      <p className="text-2xl font-black tracking-[-0.05em] text-slate-900">250 Points</p>
                    </div>
                  </div>
                </div>

                <button type="button" className="mt-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                  View Reward History ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedCoupon && (
          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Coupon Details</p>

              <div className="space-y-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <Gift size={18} />
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-[-0.05em] text-slate-900">₹100 OFF</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-slate-700">
                  <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-500">Minimum Order</span>
                    <span className="font-bold text-slate-900">₹999</span>
                  </div>

                  <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-500">Discount</span>
                    <span className="font-bold text-slate-900">₹100</span>
                  </div>

                  <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-500">Coupon Code</span>
                    <span className="flex items-center gap-2 font-black uppercase tracking-[0.12em] text-slate-900">
                      {selectedCoupon.code}
                      <button type="button" onClick={() => void copyCoupon(selectedCoupon.code)} className="text-primary">
                        <Copy size={14} />
                      </button>
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-500">Valid Until</span>
                    <span className="font-bold text-slate-900">30 September 2026</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">Terms & Conditions</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    <li>Valid on eligible products</li>
                    <li>One use per customer</li>
                    <li>Cannot be combined with certain offers</li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => applyCoupon(selectedCoupon.code)}
                className="w-full rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
              >
                Apply Coupon
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

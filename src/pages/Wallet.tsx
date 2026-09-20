import { ArrowLeft, Plus, TicketPercent, Wallet as WalletIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { getWallet, getWalletTransactions, type WalletRecord, type WalletTransaction } from "@/lib/supabase/wallet";
import { supabase } from "@/lib/supabase/client";

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const [walletData, transactionData] = await Promise.all([getWallet(user.id), getWalletTransactions(user.id)]);
        if (mounted) {
          setWallet(walletData);
          setTransactions(transactionData);
        }
      } catch (error) {
        console.error("Unable to load wallet from Supabase.", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void loadWallet();
    return () => { mounted = false; };
  }, []);

  const walletBalance = Number(wallet?.balance ?? 0);
  const hasBalance = walletBalance > 0;

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
          Wallet & Credits
        </button>

        {hasBalance ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/8 to-primary/3 px-4 py-6 text-center sm:px-6">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Wallet Balance</p>
              <div className="mt-4 text-4xl font-black tracking-[-0.08em] text-slate-900">₹ {walletBalance.toFixed(2)}</div>
              <p className="mt-3 text-sm font-medium text-slate-600">Available Balance</p>

              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
              >
                <Plus size={15} />
                Add Money
              </button>
            </div>

            <div className="mt-7">
              <div className="mb-4 flex items-center gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Quick Actions</p>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-3">
                <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5">
                  <span className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <WalletIcon size={16} />
                    </span>
                    Add Money
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/coupons")}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <TicketPercent size={16} />
                    </span>
                    Apply Coupon / Credit
                  </span>
                  <span className="text-slate-400">›</span>
                </button>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Wallet Activity</p>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8 text-slate-400"><Loader2 className="animate-spin" size={20} /></div>
                ) : transactions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No wallet activity yet.</p>
                ) : transactions.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-black ${item.entry_type === "debit" ? "text-slate-700" : "text-emerald-600"}`}>
                        {item.entry_type === "debit" ? "-" : "+"} ₹{Number(item.amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800">{item.reason || item.entry_type}</p>
                      <p className="text-xs text-slate-500">{item.reference_id || "Wallet transaction"}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" className="mt-5 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-primary hover:text-primary">
                View All Transactions
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-6 text-center sm:px-6">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Wallet Balance</p>
              <div className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-900">₹ 0.00</div>
              <p className="mt-3 text-sm font-medium text-slate-500">No available credits</p>

              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
              >
                <Plus size={15} />
                Add Money
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

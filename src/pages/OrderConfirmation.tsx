import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

type ConfirmedOrder = {
  id?: unknown;
  created_at?: unknown;
  status?: unknown;
  total?: unknown;
  payment_method?: unknown;
  items?: unknown;
};

const textValue = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return text || null;
};

const numericValue = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(date);
};

const formatPaymentMethod = (value: string) => {
  const labels: Record<string, string> = {
    cod: "Cash on delivery",
    upi: "UPI",
    card_at_home: "Card at delivery",
  };
  return labels[value.toLowerCase()] || value;
};

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      const cleanedOrderId = orderId?.trim();
      if (!cleanedOrderId) {
        setNotFound(true);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("orders")
        .select("id, created_at, status, total, payment_method, items")
        .eq("id", cleanedOrderId)
        .eq("customer_id", session.user.id)
        .maybeSingle();

      if (queryError) throw queryError;
      if (!data) {
        setNotFound(true);
        return;
      }

      setOrder(data as ConfirmedOrder);
    } catch (err: any) {
      logSupabaseDebug("orderConfirmation:fetch:error", undefined, err);
      setError(getSupabaseErrorMessage(err, "Unable to verify this order right now."));
    } finally {
      setLoading(false);
    }
  }, [navigate, orderId]);

  useEffect(() => {
    void fetchOrder();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { replace: true });
    });
    return () => listener.subscription.unsubscribe();
  }, [fetchOrder, navigate]);

  const statePanel = (title: string, message: string, action: React.ReactNode) => (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[30px] border border-orange-100 bg-white px-6 py-12 text-center shadow-sm" role="alert">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={28} aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {action}
    </section>
  );

  const id = textValue(order?.id);
  const total = numericValue(order?.total);
  const status = textValue(order?.status);
  const paymentMethod = textValue(order?.payment_method);
  const date = formatDate(order?.created_at);
  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <div className="min-h-screen bg-[#fffaf5] text-black">
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 px-4 py-8 md:px-6 md:py-12">
        {loading && (
          <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 rounded-[30px] border border-orange-100 bg-white shadow-sm" role="status" aria-live="polite">
            <Loader2 className="animate-spin text-primary" size={34} aria-hidden="true" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Verifying your order</p>
          </div>
        )}

        {!loading && error && statePanel(
          "Confirmation unavailable",
          error,
          <button type="button" onClick={() => void fetchOrder()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Try Again <ArrowRight size={14} />
          </button>,
        )}

        {!loading && !error && notFound && statePanel(
          "Order not found",
          "This confirmation is unavailable or the order does not belong to the signed-in account.",
          <Link to="/orders" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            View My Orders <ArrowRight size={14} />
          </Link>,
        )}

        {!loading && !error && !notFound && order && (
          <article className="w-full overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-xl">
            <header className="border-b border-orange-100 bg-orange-50/50 px-6 py-10 text-center md:px-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 size={34} aria-hidden="true" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Order created successfully</p>
              <h1 className="mt-2 text-4xl font-black uppercase italic tracking-tighter text-slate-900 md:text-5xl">Thank you for your order</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Your order has been recorded. This page shows the details returned from the order record.</p>
            </header>

            <div className="grid gap-6 border-b border-slate-100 p-6 md:grid-cols-3 md:p-10">
              {id && <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</p><p className="mt-2 break-all text-sm font-bold tracking-[0.08em] text-slate-800">{id}</p></div>}
              {date && <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Created</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarDays size={14} aria-hidden="true" /> {date}</p></div>}
              {status && <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Current status</p><p className="mt-2 text-sm font-black uppercase text-primary">{status}</p></div>}
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
              <section className="rounded-2xl bg-slate-50 p-5">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><ShoppingBag size={14} aria-hidden="true" /> Order summary</h2>
                <p className="mt-4 text-xs text-slate-500">{items.length} stored item{items.length === 1 ? "" : "s"}</p>
                {total !== null && <p className="mt-2 text-3xl font-black text-primary">₹{total.toLocaleString("en-IN")}</p>}
              </section>
              {paymentMethod && <section className="rounded-2xl bg-slate-50 p-5"><h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><CreditCard size={14} aria-hidden="true" /> Payment method</h2><p className="mt-4 text-sm font-bold uppercase text-slate-700">{formatPaymentMethod(paymentMethod)}</p><p className="mt-2 text-xs leading-5 text-slate-500">The selected payment method was recorded with the order. No online payment confirmation is shown here.</p></section>}
            </div>

            <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-6 sm:flex-row sm:flex-wrap sm:justify-center md:p-8">
              {id && <Link to={`/orders/${encodeURIComponent(id)}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><Package size={14} /> View Order Details</Link>}
              {id && <Link to={`/tracker?id=${encodeURIComponent(id)}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><Truck size={14} /> Track Order</Link>}
              <Link to="/orders" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">My Orders <ArrowRight size={14} /></Link>
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Continue Shopping <ArrowRight size={14} /></Link>
            </footer>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

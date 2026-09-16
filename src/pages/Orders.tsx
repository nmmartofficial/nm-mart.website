import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shop/Footer";

type OrderItem = {
  name?: unknown;
  qty?: unknown;
  saleRate?: unknown;
  price?: unknown;
};

type CustomerOrder = {
  id?: unknown;
  created_at?: unknown;
  status?: unknown;
  total?: unknown;
  payment_method?: unknown;
  shipping_address?: unknown;
  landmark?: unknown;
  pincode?: unknown;
  items?: unknown;
};

const formatDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const displayText = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return text || null;
};

const formatPaymentMethod = (value: string) => {
  const labels: Record<string, string> = {
    cod: "Cash on delivery",
    upi: "UPI",
    card_at_home: "Card at delivery",
  };
  return labels[value.toLowerCase()] || value;
};

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("deliver") || normalized.includes("complete")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalized.includes("cancel") || normalized.includes("fail")) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (normalized.includes("ship") || normalized.includes("dispatch")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getItems = (value: unknown): OrderItem[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is OrderItem => Boolean(item && typeof item === "object"));
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      const { data, error: queryError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;
      setOrders((data || []) as CustomerOrder[]);
    } catch (err: any) {
      logSupabaseDebug("customerOrders:fetch:error", undefined, err);
      setError(getSupabaseErrorMessage(err, "Unable to load your orders right now."));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void fetchOrders();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { replace: true });
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchOrders, navigate]);

  return (
    <div className="min-h-screen bg-[#fffaf5] text-black">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6 md:py-12">
        <header className="mb-8 flex flex-col gap-5 border-b border-orange-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-primary">Account</p>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter md:text-5xl">My Orders</h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
              Review your orders and the delivery information recorded with each purchase.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </header>

        {loading && (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[28px] border border-orange-100 bg-white shadow-sm">
            <Loader2 className="animate-spin text-primary" size={34} aria-hidden="true" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Loading your orders</p>
          </div>
        )}

        {!loading && error && (
          <section className="rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-sm" role="alert">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={24} aria-hidden="true" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Orders unavailable</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => void fetchOrders()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </section>
        )}

        {!loading && !error && orders.length === 0 && (
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-orange-100 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-primary">
              <ShoppingBag size={28} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">No orders yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Your completed purchases will appear here after you place an order.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Browse the Shop <ArrowRight size={14} />
            </Link>
          </section>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order, index) => {
              const orderId = displayText(order.id);
              const status = displayText(order.status);
              const date = formatDate(order.created_at);
              const total = typeof order.total === "number" || typeof order.total === "string" ? Number(order.total) : null;
              const paymentMethod = displayText(order.payment_method);
              const address = displayText(order.shipping_address);
              const landmark = displayText(order.landmark);
              const pincode = displayText(order.pincode);
              const items = getItems(order.items);
              const visibleItems = items.slice(0, 3);
              const extraItems = Math.max(0, items.length - visibleItems.length);

              return (
                <article key={orderId || `order-${index}`} className="overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-sm">
                  <div className="flex flex-col gap-5 border-b border-slate-100 p-5 md:flex-row md:items-start md:justify-between md:p-7">
                    <div className="min-w-0">
                      {orderId && (
                        <p className="break-all text-sm font-black tracking-[0.08em] text-slate-900">Order {orderId}</p>
                      )}
                      {date && (
                        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <CalendarDays size={14} aria-hidden="true" /> {date}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {status && (
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${statusClass(status)}`}>
                          {status.toLowerCase().includes("deliver") ? <CheckCircle2 size={13} aria-hidden="true" /> : <Truck size={13} aria-hidden="true" />}
                          {status}
                        </span>
                      )}
                      {total !== null && Number.isFinite(total) && (
                        <span className="text-xl font-black text-primary">₹{total.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-7">
                    <div className="min-w-0 space-y-5">
                      {visibleItems.length > 0 && (
                        <div>
                          <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <Package size={14} aria-hidden="true" /> Items
                          </p>
                          <div className="space-y-2">
                            {visibleItems.map((item, itemIndex) => {
                              const name = displayText(item.name);
                              const qty = displayText(item.qty);
                              if (!name && !qty) return null;
                              return (
                                <div key={`${name || "item"}-${itemIndex}`} className="flex items-center justify-between gap-4 text-sm">
                                  <span className="min-w-0 truncate font-semibold text-slate-700">{name || "Item"}</span>
                                  {qty && <span className="shrink-0 text-xs font-black text-primary">x{qty}</span>}
                                </div>
                              );
                            })}
                          </div>
                          {extraItems > 0 && <p className="mt-2 text-xs font-semibold text-slate-400">+{extraItems} more item{extraItems === 1 ? "" : "s"}</p>}
                        </div>
                      )}

                      {(address || landmark || pincode) && (
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 shrink-0 text-primary" size={16} aria-hidden="true" />
                          <div className="min-w-0 text-sm leading-6 text-slate-600">
                            {address && <p>{address}</p>}
                            {(landmark || pincode) && <p className="text-xs text-slate-400">{[landmark, pincode].filter(Boolean).join(" · ")}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    {paymentMethod && (
                      <div className="flex items-center gap-3 self-start rounded-2xl bg-slate-50 px-4 py-3 md:min-w-[170px] md:justify-center">
                        <CreditCard size={16} className="text-slate-400" aria-hidden="true" />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Payment</p>
                          <p className="mt-1 text-xs font-bold uppercase text-slate-700">{formatPaymentMethod(paymentMethod)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {orderId && (
                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 md:px-7">
                      <div className="flex flex-wrap items-center gap-5">
                        <Link
                          to={`/orders/${encodeURIComponent(orderId)}`}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          View details <ArrowRight size={14} />
                        </Link>
                        <Link
                          to={`/tracker?id=${encodeURIComponent(orderId)}`}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          Track order <Truck size={14} />
                        </Link>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;

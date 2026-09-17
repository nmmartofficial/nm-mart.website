import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Printer,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "../lib/supabase/schema";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shop/Footer";

type OrderItem = {
  name?: unknown;
  qty?: unknown;
  saleRate?: unknown;
  price?: unknown;
  imageUrl?: unknown;
};

type CustomerOrder = {
  id?: unknown;
  created_at?: unknown;
  status?: unknown;
  total?: unknown;
  payment_method?: unknown;
  customer_name?: unknown;
  customer_phone?: unknown;
  shipping_address?: unknown;
  landmark?: unknown;
  pincode?: unknown;
  items?: unknown;
};

const textValue = (value: unknown) => {
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

const numericValue = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const getItems = (value: unknown): OrderItem[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is OrderItem => Boolean(item && typeof item === "object"));
};

const getStatusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("deliver") || normalized.includes("complete")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized.includes("cancel") || normalized.includes("fail")) return "border-red-200 bg-red-50 text-red-700";
  if (normalized.includes("ship") || normalized.includes("dispatch")) return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
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
        .from(TABLES.orders)
        .select("*")
        .eq("id", cleanedOrderId)
        .eq("customer_id", session.user.id)
        .maybeSingle();

      if (queryError) throw queryError;
      if (!data) {
        setNotFound(true);
        return;
      }

      setOrder(data as CustomerOrder);
    } catch (err: any) {
      logSupabaseDebug("customerOrderDetails:fetch:error", undefined, err);
      setError(getSupabaseErrorMessage(err, "Unable to load this order right now."));
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

  const renderState = (title: string, message: string, action?: React.ReactNode) => (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-orange-100 bg-white px-6 py-12 text-center shadow-sm" role="alert">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={28} aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {action}
    </section>
  );

  return (
    <div className="min-h-screen bg-[#fffaf5] text-black">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {loading && (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[28px] border border-orange-100 bg-white shadow-sm" role="status" aria-live="polite">
            <Loader2 className="animate-spin text-primary" size={34} aria-hidden="true" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Loading order details</p>
          </div>
        )}

        {!loading && error && renderState(
          "Order unavailable",
          error,
          <button
            type="button"
            onClick={() => void fetchOrder()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Try Again <ArrowRight size={14} />
          </button>,
        )}

        {!loading && !error && notFound && renderState(
          "Order not found",
          "This order is unavailable or does not belong to the signed-in account.",
          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft size={14} /> Back to My Orders
          </Link>,
        )}

        {!loading && !error && !notFound && order && (() => {
          const id = textValue(order.id);
          const status = textValue(order.status);
          const date = formatDate(order.created_at);
          const total = numericValue(order.total);
          const paymentMethod = textValue(order.payment_method);
          const customerName = textValue(order.customer_name);
          const customerPhone = textValue(order.customer_phone);
          const address = textValue(order.shipping_address);
          const landmark = textValue(order.landmark);
          const pincode = textValue(order.pincode);
          const items = getItems(order.items);
          const itemRows = items.map((item, index) => {
            const quantity = numericValue(item.qty);
            const unitPrice = numericValue(item.saleRate ?? item.price);
            const lineSubtotal = quantity !== null && unitPrice !== null ? quantity * unitPrice : null;
            return { item, index, quantity, unitPrice, lineSubtotal };
          });
          const itemsSubtotal = itemRows.every(row => row.lineSubtotal !== null)
            ? itemRows.reduce((sum, row) => sum + (row.lineSubtotal || 0), 0)
            : null;

          return (
            <div className="print-area space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ArrowLeft size={15} /> Back to My Orders
                </Link>
                <div className="flex flex-wrap gap-3">
                  {id && (
                    <Link
                      to={`/tracker?id=${encodeURIComponent(id)}`}
                      className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <Truck size={14} /> Track Order
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>

              <article className="overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
                <header className="flex flex-col gap-6 border-b border-orange-100 bg-orange-50/50 p-6 md:flex-row md:items-start md:justify-between md:p-10">
                  <div className="flex items-start gap-4">
                    <img src="/nm-mart-logo.png" alt="NM Mart" className="h-14 w-14 rounded-2xl border border-orange-100 bg-white object-contain p-2" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">NM Mart</p>
                      <h1 className="mt-1 text-3xl font-black uppercase italic tracking-tighter text-slate-900 md:text-4xl">Order Details</h1>
                      {id && <p className="mt-2 break-all text-sm font-bold tracking-[0.08em] text-slate-500">Reference: {id}</p>}
                    </div>
                  </div>
                  <div className="space-y-3 md:text-right">
                    {date && (
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500 md:justify-end">
                        <CalendarDays size={14} aria-hidden="true" /> {date}
                      </p>
                    )}
                    {status && (
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${getStatusClass(status)}`} aria-label={`Order status: ${status}`}>
                        <CheckCircle2 size={13} aria-hidden="true" /> {status}
                      </span>
                    )}
                  </div>
                </header>

                <div className="grid gap-6 border-b border-slate-100 p-6 md:grid-cols-2 md:p-10">
                  {(customerName || customerPhone) && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><Package size={14} aria-hidden="true" /> Customer</h2>
                      {customerName && <p className="text-sm font-bold text-slate-800">{customerName}</p>}
                      {customerPhone && <p className="mt-1 text-sm text-slate-500">{customerPhone}</p>}
                    </section>
                  )}
                  {(address || landmark || pincode) && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><MapPin size={14} aria-hidden="true" /> Delivery</h2>
                      {address && <p className="text-sm leading-6 text-slate-700">{address}</p>}
                      {(landmark || pincode) && <p className="mt-1 text-xs text-slate-500">{[landmark, pincode].filter(Boolean).join(" · ")}</p>}
                    </section>
                  )}
                </div>

                <section className="p-6 md:p-10" aria-labelledby="ordered-items-heading">
                  <h2 id="ordered-items-heading" className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><Package size={14} aria-hidden="true" /> Ordered Items</h2>
                  {itemRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left">
                        <thead className="border-b border-slate-200 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          <tr>
                            <th className="pb-3 pr-4">Product</th>
                            <th className="pb-3 px-4 text-right">Qty</th>
                            <th className="pb-3 px-4 text-right">Price</th>
                            <th className="pb-3 pl-4 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {itemRows.map(({ item, index, quantity, unitPrice, lineSubtotal }) => {
                            const name = textValue(item.name);
                            return (
                              <tr key={`${name || "order-item"}-${index}`}>
                                <td className="py-4 pr-4 text-sm font-semibold text-slate-700">{name && <span>{name}</span>}</td>
                                <td className="py-4 px-4 text-right text-sm text-slate-600">{quantity !== null ? quantity : ""}</td>
                                <td className="py-4 px-4 text-right text-sm text-slate-600">{unitPrice !== null ? `₹${unitPrice.toLocaleString("en-IN")}` : ""}</td>
                                <td className="py-4 pl-4 text-right text-sm font-bold text-slate-800">{lineSubtotal !== null ? `₹${lineSubtotal.toLocaleString("en-IN")}` : ""}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No item details are available for this order.</p>
                  )}
                </section>

                <footer className="border-t border-slate-100 bg-slate-50/70 p-6 md:p-10">
                  <div className="ml-auto max-w-sm space-y-4">
                    {paymentMethod && (
                      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-2"><CreditCard size={15} aria-hidden="true" /> Payment method</span>
                        <span className="font-bold uppercase text-slate-800">{formatPaymentMethod(paymentMethod)}</span>
                      </div>
                    )}
                    {itemsSubtotal !== null && (
                      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                        <span>Items subtotal</span>
                        <span className="font-bold text-slate-800">₹{itemsSubtotal.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {total !== null && (
                      <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order total</span>
                        <span className="text-2xl font-black text-primary">₹{total.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                </footer>
              </article>
            </div>
          );
        })()}
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetails;

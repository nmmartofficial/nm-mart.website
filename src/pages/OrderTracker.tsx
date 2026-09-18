import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Loader2, AlertCircle, CalendarDays, CreditCard, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "../lib/supabase/schema";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { getOrderAddress, getOrderPaymentMethod, getOrderStatus, getOrderTotal } from "@/lib/orderDisplay";

const SLOGAN = "Shop More, Save More";

const formatDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(date);
};

const formatPaymentMethod = (value: unknown) => {
  const labels: Record<string, string> = {
    cod: "Cash on delivery",
    upi: "UPI",
    card_at_home: "Card at delivery",
  };
  const method = typeof value === "string" ? value.trim() : "";
  return method ? labels[method.toLowerCase()] || method : null;
};

const statusPresentation = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "delivered") {
    return { label: status, icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700", description: "This order is marked delivered." };
  }
  if (normalized === "out for delivery") {
    return { label: status, icon: Truck, className: "border-blue-200 bg-blue-50 text-blue-700", description: "This order is marked out for delivery." };
  }
  if (normalized === "cancelled") {
    return { label: status, icon: XCircle, className: "border-red-200 bg-red-50 text-red-700", description: "This order is marked cancelled." };
  }
  if (normalized === "pending") {
    return { label: status, icon: Clock, className: "border-amber-200 bg-amber-50 text-amber-700", description: "This order is pending processing." };
  }
  return { label: status, icon: Package, className: "border-slate-200 bg-slate-50 text-slate-700", description: "The latest status recorded for this order." };
};

const OrderTracker = () => {
  const location = useLocation();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      setOrderId(id);
      void trackOrder(id);
    }
  }, [location.search]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedId = orderId.trim();
    if (!cleanedId) {
      setError("Please enter an order ID to track your order.");
      toast.error("Please enter a valid Order ID");
      return;
    }
    void trackOrder(cleanedId);
  };

  const trackOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let orderQuery = supabase
        .from(TABLES.orders)
        .select("*")
        .eq("id", id);

      if (session) {
        orderQuery = orderQuery.eq("customer_id", session.user.id);
      }

      const { data, error: fetchError } = await orderQuery.maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("No order found for this ID. Please verify the order number and try again.");
        toast.error("Order not found. Please check your ID.");
        return;
      }

      setOrder(data);
      toast.success("Order details synced!");
    } catch (err: any) {
      console.error("Tracking error:", err);
      setError("We could not load this order right now. Please try again in a moment.");
      toast.error("Could not find order. Please verify the ID.");
    } finally {
      setLoading(false);
    }
  };

  const statusText = getOrderStatus(order || {}) || "";
  const status = statusText ? statusPresentation(statusText) : null;
  const orderDate = formatDate(order?.created_at);
  const paymentMethod = formatPaymentMethod(getOrderPaymentMethod(order || {}));
  const orderAddress = getOrderAddress(order || {});
  const orderTotal = getOrderTotal(order || {});

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black md:text-5xl">
              Track Your <span className="text-primary">Order</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 italic">
              {SLOGAN}
            </p>
          </div>

          <form onSubmit={handleTrack} className="group mx-auto max-w-md">
            <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 blur-xl transition-opacity group-focus-within:opacity-100" aria-hidden="true" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-all focus-within:border-primary/50">
              <label htmlFor="order-id" className="sr-only">Order ID</label>
              <Package className="ml-3 text-gray-400" size={20} aria-hidden="true" />
              <input
                id="order-id"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID"
                className="flex-1 border-none bg-transparent py-3 text-black outline-none placeholder:text-[10px] placeholder:font-bold placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-gray-300"
                aria-label="Order ID"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary p-3 text-white shadow-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Track order"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </div>
          </form>

          {error && !order && (
            <div className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={22} />
              </div>
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          {order && status && (
            <article className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-xl">
              <header className="flex flex-col gap-5 border-b border-gray-100 bg-orange-50/40 p-6 md:flex-row md:items-start md:justify-between md:p-10">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Order status</p>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl border p-3 ${status.className}`}><status.icon size={24} aria-hidden="true" /></div>
                    <div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black">{status.label}</h2>
                      <p className="mt-1 text-sm text-gray-500">{status.description}</p>
                    </div>
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Order ID</p>
                  <p className="break-all text-sm font-bold tracking-[0.12em] text-gray-700">{order.id}</p>
                  {orderDate && <p className="mt-2 flex items-center gap-2 text-xs text-gray-500 md:justify-end"><CalendarDays size={14} aria-hidden="true" /> {orderDate}</p>}
                </div>
              </header>

              <div className="grid gap-6 border-b border-gray-100 p-6 md:grid-cols-2 md:p-10">
                {(orderAddress || order.landmark || order.pincode) && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400"><MapPin size={15} aria-hidden="true" /> Delivery details</h3>
                    {orderAddress && <p className="text-sm font-semibold leading-6 text-gray-700">{orderAddress}</p>}
                    {(order.landmark || order.pincode) && <p className="mt-1 text-xs text-gray-500">{[order.landmark && `Landmark: ${order.landmark}`, order.pincode && `Pincode: ${order.pincode}`].filter(Boolean).join(" · ")}</p>}
                  </section>
                )}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400"><CreditCard size={15} aria-hidden="true" /> Order payment</h3>
                  {paymentMethod && <p className="text-sm font-semibold uppercase text-gray-700">{paymentMethod}</p>}
                  {orderTotal !== null && <p className="mt-2 text-2xl font-black text-primary">₹{orderTotal}</p>}
                </section>
              </div>

              <section className="p-6 md:p-10" aria-labelledby="tracking-items-heading">
                <h3 id="tracking-items-heading" className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400"><Package size={15} aria-hidden="true" /> Order items</h3>
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item: any, index: number) => {
                      const hasPrice = item?.saleRate !== undefined && item?.qty !== undefined;
                      return (
                        <div key={`${item?.name || "item"}-${index}`} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 text-sm">
                          <span className="min-w-0 font-semibold text-gray-600">{item?.name || ""}{item?.qty !== undefined && <span className="ml-2 text-primary">x{item.qty}</span>}</span>
                          {hasPrice && <span className="shrink-0 font-bold text-gray-800">₹{Number(item.saleRate) * Number(item.qty)}</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-gray-500">No item details available.</p>}
              </section>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracker;

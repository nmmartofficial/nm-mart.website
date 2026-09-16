import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

const SLOGAN = "Shop More, Save More";

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
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();

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

  const getStatusIcon = (status: string) => {
    const normalized = (status || "Pending").toLowerCase();
    if (normalized.includes("delivered") || normalized.includes("complete") || normalized.includes("done")) {
      return <CheckCircle2 className="text-green-500" />;
    }
    if (normalized.includes("shipping") || normalized.includes("delivery") || normalized.includes("dispatch")) {
      return <Truck className="text-orange-500" />;
    }
    if (normalized.includes("packed") || normalized.includes("processing")) {
      return <Package className="text-blue-500" />;
    }
    return <Clock className="text-yellow-500" />;
  };

  const getStatusProgress = (status: string) => {
    const normalized = (status || "Pending").toLowerCase();
    if (normalized.includes("delivered") || normalized.includes("complete") || normalized.includes("done")) return 100;
    if (normalized.includes("shipping") || normalized.includes("delivery") || normalized.includes("dispatch")) return 75;
    if (normalized.includes("packed") || normalized.includes("processing")) return 50;
    return 25;
  };

  const statusText = order?.status ? String(order.status).trim() : "Pending";

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-2xl space-y-8">
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

          {order && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[40px] border border-gray-100 bg-white p-8 shadow-xl md:p-10">
              <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-gray-50 pb-8 md:flex-row md:items-center">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Order Status</p>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gray-50 p-2">{getStatusIcon(statusText)}</div>
                    <span className="text-2xl font-black uppercase italic tracking-tighter text-black">{statusText}</span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Order ID</p>
                  <span className="text-sm font-bold tracking-[0.18em] text-gray-600">{order.id}</span>
                </div>
              </div>

              <div className="mb-12 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${getStatusProgress(statusText)}%` }}
                  aria-label={`Order progress ${getStatusProgress(statusText)}%`}
                />
              </div>

              <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-6">
                  {order.shipping_address && (
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-gray-50 p-2.5 text-primary shadow-sm">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Delivery Address</p>
                        <p className="text-sm font-bold uppercase leading-relaxed text-gray-700">{order.shipping_address}</p>
                        {order.landmark && (
                          <p className="mt-1 text-[10px] font-bold uppercase italic text-gray-400">Landmark: {order.landmark}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.customer_name || order.customer_phone ? (
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-gray-50 p-2.5 text-primary shadow-sm">
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Customer Details</p>
                        {order.customer_name && <p className="text-sm font-bold uppercase text-gray-700">{order.customer_name}</p>}
                        {order.customer_phone && <p className="mt-1 text-xs font-bold tracking-[0.18em] text-gray-400">{order.customer_phone}</p>}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Order Summary</p>

                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="space-y-3">
                      {order.items.map((item: any, index: number) => (
                        <div key={`${item?.name || 'item'}-${index}`} className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.12em]">
                          <span className="text-gray-500">
                            {item?.name || "Item"}
                            {item?.qty !== undefined && <span className="ml-2 text-primary">x{item.qty}</span>}
                          </span>
                          {item?.saleRate !== undefined && item?.qty !== undefined && (
                            <span className="text-black">₹{Number(item.saleRate) * Number(item.qty)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-bold uppercase text-gray-500">No item details available</p>
                  )}

                  <div className="my-4 h-px bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Total Amount</span>
                    <span className="text-2xl font-black italic text-primary">₹{order.total ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracker;

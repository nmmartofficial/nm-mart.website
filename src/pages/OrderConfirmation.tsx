import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  CreditCard,
  ExternalLink,
  ImagePlus,
  Loader2,
  MessageCircle,
  Package,
  QrCode,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "../lib/supabase/schema";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { getOrderPaymentMethod, getOrderStatus, getOrderTotal } from "@/lib/orderDisplay";
import { UPI_ID, WA_NUMBER } from "@/lib/store-utils";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

type ConfirmedOrder = {
  id?: unknown;
  created_at?: unknown;
  status?: unknown;
  order_status?: unknown;
  order_no?: unknown;
  order_number?: unknown;
  total?: unknown;
  total_amount?: unknown;
  subtotal?: unknown;
  delivery_charge?: unknown;
  discount?: unknown;
  payment_method?: unknown;
  payment_mode?: unknown;
  payment_status?: unknown;
  items?: unknown;
};

type StoredOrderItem = Record<string, unknown>;

const textValue = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return text || null;
};

const numericValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getStoredOrderItems = (value: unknown): StoredOrderItem[] =>
  Array.isArray(value)
    ? value.filter((item): item is StoredOrderItem => Boolean(item && typeof item === "object"))
    : [];

const getItemQuantity = (item: StoredOrderItem) => numericValue(item.quantity ?? item.qty);

const getItemUnitPrice = (item: StoredOrderItem) => numericValue(item.unit_price ?? item.saleRate ?? item.price);

const getItemLineTotal = (item: StoredOrderItem) => {
  const storedLineTotal = numericValue(item.line_total ?? item.total);
  if (storedLineTotal !== null) return storedLineTotal;
  const quantity = getItemQuantity(item);
  const unitPrice = getItemUnitPrice(item);
  return quantity !== null && unitPrice !== null ? quantity * unitPrice : null;
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState("");
  const [proofError, setProofError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  useEffect(() => {
    return () => {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    };
  }, [proofPreviewUrl]);

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
        .select("id, order_no, order_number, created_at, status, order_status, total, total_amount, subtotal, delivery_charge, discount, payment_method, payment_mode, payment_status, items")
        .eq("id", cleanedOrderId)
        .eq("customer_id", session.user.id)
        .maybeSingle();

      if (queryError) throw queryError;
      if (!data) {
        setNotFound(true);
        return;
      }

      setOrder(data as ConfirmedOrder);
    } catch (err: unknown) {
      logSupabaseDebug("orderConfirmation:fetch:error", undefined, err);
      setError(getSupabaseErrorMessage(err as Parameters<typeof getSupabaseErrorMessage>[0], "Unable to verify this order right now."));
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
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[30px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm" role="alert">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={28} aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {action}
    </section>
  );

  const id = textValue(order?.id);
  const orderNumber = textValue(order?.order_no) || textValue(order?.order_number) || id;
  const total = getOrderTotal(order || {});
  const subtotal = numericValue(order?.subtotal);
  const deliveryCharge = numericValue(order?.delivery_charge);
  const discount = numericValue(order?.discount);
  const status = getOrderStatus(order || {});
  const paymentMethod = getOrderPaymentMethod(order || {});
  const paymentStatus = textValue(order?.payment_status)?.toLowerCase() || "";
  const paymentVerified = ["paid", "success", "verified", "complete", "completed"].includes(paymentStatus);
  const paymentStatusLabel = paymentVerified ? "PAYMENT VERIFIED" : "PAYMENT VERIFICATION PENDING";
  const date = formatDate(order?.created_at);
  const items = getStoredOrderItems(order?.items);
  const lineItems = items.map((item) => {
    const quantity = getItemQuantity(item);
    const unitPrice = getItemUnitPrice(item);
    const lineTotal = getItemLineTotal(item);
    return {
      item,
      name: textValue(item.name ?? item.product_name) || "Product",
      quantity,
      unitPrice,
      lineTotal,
    };
  });
  const derivedSubtotal = lineItems.every((item) => item.lineTotal !== null)
    ? lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
    : null;
  const displayedSubtotal = subtotal ?? derivedSubtotal;
  const isUpiOrder = paymentMethod?.toLowerCase() === "upi";
  const paymentIntent = useMemo(() => {
    if (!UPI_ID || !orderNumber || total === null) return "";
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: "NM Mart",
      am: total.toFixed(2),
      cu: "INR",
      tn: `Order ${orderNumber}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [orderNumber, total]);
  const qrImageUrl = paymentIntent
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentIntent)}`
    : "";

  const handleProofFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowedType = ["image/jpeg", "image/png"].includes(file.type.toLowerCase());
    const allowedExtension = /\.(jpe?g|png)$/i.test(file.name);
    if (!allowedType && !allowedExtension) {
      setProofError("Please upload a JPG, JPEG or PNG payment screenshot.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProofError("Please choose a payment screenshot smaller than 5 MB.");
      return;
    }

    setProofError("");
    setCopyMessage("");
    setWhatsappOpened(false);
    setProofFile(file);
    setProofPreviewUrl(URL.createObjectURL(file));
  };

  const removeProofFile = () => {
    setProofFile(null);
    setProofPreviewUrl("");
    setProofError("");
    setWhatsappOpened(false);
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopyMessage("UPI ID copied.");
    } catch {
      setCopyMessage("Copy is unavailable in this browser. Select and copy the UPI ID above.");
    }
  };

  const openPaymentProofWhatsApp = () => {
    if (!proofFile || !orderNumber || total === null) return;
    const message = [
      "Hello NM Mart,",
      "",
      "I have completed the payment for my order.",
      `Order No: #${orderNumber}`,
      `Amount: ₹${total.toLocaleString("en-IN")}`,
      "I am attaching my payment screenshot. Please verify my payment.",
    ].join("\n");
    const whatsappUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setWhatsappOpened(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 md:px-6 md:py-10">
        {loading && (
          <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-4 rounded-[30px] border border-slate-200 bg-white shadow-sm" role="status" aria-live="polite">
            <Loader2 className="animate-spin text-primary" size={34} aria-hidden="true" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Verifying your order</p>
          </div>
        )}

        {!loading && error && statePanel(
          "Confirmation unavailable",
          error,
          <button type="button" onClick={() => void fetchOrder()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Try Again <ArrowRight size={14} />
          </button>,
        )}

        {!loading && !error && notFound && statePanel(
          "Order not found",
          "This confirmation is unavailable or the order does not belong to the signed-in account.",
          <Link to="/orders" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            View My Orders <ArrowRight size={14} />
          </Link>,
        )}

        {!loading && !error && !notFound && order && (
          <article className="w-full space-y-5">
            <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700"><CheckCircle2 size={15} aria-hidden="true" /> Order placed</p>
                  <h1 className="mt-2 text-2xl font-black uppercase text-slate-900 md:text-3xl">Payment &amp; Order</h1>
                  <p className="mt-2 text-sm text-slate-500">Order No: <strong className="text-slate-900">#{orderNumber || "—"}</strong></p>
                  {date && <p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={13} aria-hidden="true" /> {date}</p>}
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">{isUpiOrder ? "Payment status" : "Order status"}</p>
                  <p className="mt-1 text-xs font-black uppercase text-amber-900">{isUpiOrder ? paymentStatusLabel : status || "Order received"}</p>
                </div>
              </div>
            </header>

            <div className={`grid min-w-0 gap-5 ${isUpiOrder ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]" : "grid-cols-1"}`}>
              <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700"><ShoppingBag size={16} aria-hidden="true" /> Your order</h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {lineItems.length > 0 ? lineItems.map(({ item, name, quantity, unitPrice, lineTotal }, index) => (
                    <div key={`${String(item.product_id ?? name)}-${index}`} className="flex min-w-0 items-start justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-slate-900">{name}</p>
                        <p className="mt-1 text-xs text-slate-500">Qty: {quantity ?? "—"}{unitPrice !== null ? ` × ₹${unitPrice.toLocaleString("en-IN")}` : ""}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-slate-900">{lineTotal !== null ? `₹${lineTotal.toLocaleString("en-IN")}` : "—"}</p>
                    </div>
                  )) : <p className="py-5 text-sm text-slate-500">No stored line-item details are available for this order.</p>}
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Bill details</h3>
                  {displayedSubtotal !== null && <div className="mt-3 flex justify-between gap-3 text-sm text-slate-600"><span>Subtotal</span><span>₹{displayedSubtotal.toLocaleString("en-IN")}</span></div>}
                  {discount !== null && discount > 0 && <div className="mt-2 flex justify-between gap-3 text-sm text-emerald-700"><span>Discount</span><span>- ₹{discount.toLocaleString("en-IN")}</span></div>}
                  {deliveryCharge !== null && <div className="mt-2 flex justify-between gap-3 text-sm text-slate-600"><span>Delivery</span><span>₹{deliveryCharge.toLocaleString("en-IN")}</span></div>}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-sm font-black uppercase text-slate-900">Total</span>
                    <span className="text-2xl font-black text-primary">{total !== null ? `₹${total.toLocaleString("en-IN")}` : "—"}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
                  {paymentMethod && <span>Payment: <strong className="text-slate-700">{formatPaymentMethod(paymentMethod)}</strong></span>}
                  {status && <span>Order: <strong className="text-slate-700">{status}</strong></span>}
                </div>
              </section>

              {isUpiOrder ? (
                <aside className="min-w-0 space-y-5">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700"><QrCode size={16} aria-hidden="true" /> Pay with UPI</h2>
                    <p className="mt-3 text-sm text-slate-600">NM Mart UPI ID</p>
                    <div className="mt-2 flex min-w-0 items-center gap-2">
                      <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900">{UPI_ID}</code>
                      <button type="button" onClick={() => void copyUpiId()} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-primary hover:text-primary" aria-label="Copy NM Mart UPI ID">
                        {copyMessage === "UPI ID copied." ? <ClipboardCheck size={15} /> : <Copy size={15} />} Copy
                      </button>
                    </div>
                    {copyMessage && <p role="status" className="mt-2 text-xs text-slate-500">{copyMessage}</p>}

                    {qrImageUrl && total !== null ? (
                      <div className="mt-5 flex flex-col items-center rounded-xl bg-slate-50 p-4">
                        <img src={qrImageUrl} alt={`UPI payment QR for order ${orderNumber}, amount ${total} rupees`} className="h-52 w-52 max-w-full rounded-lg bg-white object-contain p-2" />
                        <p className="mt-2 text-sm font-bold text-slate-900">Pay ₹{total.toLocaleString("en-IN")}</p>
                        <p className="mt-1 text-[10px] text-slate-500">Order #{orderNumber}</p>
                      </div>
                    ) : <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">UPI QR is unavailable because this order total is missing.</p>}

                    {paymentIntent && <a href={paymentIntent} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-black uppercase text-white hover:bg-primary-hover md:hidden"><ExternalLink size={15} /> Pay via UPI app</a>}
                    <p className="mt-3 text-xs leading-5 text-slate-500">This opens your UPI app or payment instruction only. Payment is not verified automatically.</p>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Payment proof</h2>
                    <p className="mt-2 text-xs leading-5 text-slate-500">After paying, select a JPG, JPEG, or PNG screenshot. The website has no private payment-proof storage bucket configured, so the preview stays in this browser tab; attach the file manually in WhatsApp.</p>

                    <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-xs font-black uppercase text-primary hover:bg-primary/10">
                      <ImagePlus size={16} /> {proofFile ? "Change screenshot" : "Select payment screenshot"}
                      <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleProofFile} className="sr-only" />
                    </label>
                    <p className="mt-2 text-[10px] text-slate-400">JPG, JPEG, PNG · maximum 5 MB</p>
                    {proofError && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{proofError}</p>}

                    {proofFile && proofPreviewUrl && (
                      <div className="mt-4 rounded-xl border border-slate-200 p-3">
                        <img src={proofPreviewUrl} alt="Selected payment screenshot preview" className="max-h-64 w-full rounded-lg object-contain" />
                        <p className="mt-2 break-all text-xs font-medium text-slate-600">{proofFile.name}</p>
                        <button type="button" onClick={removeProofFile} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"><Trash2 size={14} /> Remove screenshot</button>
                        <p className="mt-2 text-[10px] leading-4 text-amber-800">Not uploaded or stored by NM Mart. Attach it yourself in WhatsApp.</p>
                      </div>
                    )}

                    {proofFile && (
                      <button type="button" onClick={openPaymentProofWhatsApp} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-4 py-3 text-xs font-black uppercase text-white hover:bg-[#0f766e]">
                        <MessageCircle size={16} /> Send payment proof on WhatsApp
                      </button>
                    )}
                    {whatsappOpened && <p role="status" className="mt-3 text-xs leading-5 text-emerald-700">WhatsApp opened with the order details. Attach the screenshot there and send it to NM Mart. Payment remains pending verification.</p>}
                  </section>
                </aside>
              ) : (
                <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Payment method</h2>
                  <p className="mt-3 text-sm font-semibold text-slate-700">{paymentMethod ? formatPaymentMethod(paymentMethod) : "Not recorded"}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Payment confirmation and order state are provided by the existing order record.</p>
                </aside>
              )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap">
              {id && <Link to={`/orders/${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:border-primary hover:text-primary"><Package size={15} /> View order details</Link>}
              {id && <Link to={`/tracker?id=${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:border-primary hover:text-primary"><Truck size={15} /> Track order</Link>}
              <Link to="/orders" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-white hover:bg-primary-hover">My orders <ArrowRight size={15} /></Link>
            </footer>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  Loader2,
  ShoppingBag,
  ChevronRight,
  Landmark,
  Map as MapIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  getActiveSession,
  getSupabaseErrorMessage,
  logSupabaseDebug,
} from "@/lib/supabase";
import { TABLES } from "../lib/supabase/schema";
import { useCart } from "@/hooks/useCart";
import { type CartItem } from "@/lib/store-utils";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import {
  buildServerOrderPayload,
  validateCheckoutForm,
} from "@/lib/orderPayload";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { addresses } = useSavedAddresses();

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.saleRate ?? item.price ?? 0) * item.qty,
    0
  );

  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    landmark: "",
    pincode: "212207",
    paymentMethod: "cod" as "cod" | "upi" | "card_at_home",
  });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSessionActive(Boolean(session));

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from(TABLES.profiles)
          .select(
            "full_name, phone_number, mobile, phone, address, landmark, city, state, pincode"
          )
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          logSupabaseDebug(
            "checkoutProfilePrefill:error",
            { userId: session.user.id },
            profileError
          );
        }

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            fullName: profile.full_name || "",
            phone:
              profile.phone_number ||
              profile.mobile ||
              profile.phone ||
              session.user.phone?.replace("+91", "") ||
              "",
            street: profile.address || "",
            landmark: profile.landmark || "",
            pincode: profile.pincode || prev.pincode,
          }));
        }
      }
    };

    fetchUserAndProfile();

    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart.length, navigate]);

  useEffect(() => {
    const defaultAddress =
      addresses.find((address) => address.is_default) || addresses[0];

    if (!defaultAddress || selectedAddressId) return;

    setSelectedAddressId(String(defaultAddress.id));

    setFormData((current) => ({
      ...current,
      street: defaultAddress.address,
      landmark: defaultAddress.landmark || "",
      pincode: defaultAddress.pincode || current.pincode,
    }));
  }, [addresses, selectedAddressId]);

  const handleSavedAddressChange = (value: string) => {
    setSelectedAddressId(value);

    const address = addresses.find(
      (item) => String(item.id) === value
    );

    if (!address) return;

    setFormData((current) => ({
      ...current,
      street: address.address,
      landmark: address.landmark || "",
      pincode: address.pincode || current.pincode,
    }));
  };

  useEffect(() => {
    const {
      data: listener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionActive(Boolean(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/cart");
      return;
    }

    const validation = validateCheckoutForm({
      fullName: formData.fullName,
      street: formData.street,
      phone: formData.phone,
      pincode: formData.pincode,
      paymentMethod: formData.paymentMethod,
      serviceablePincodes: ["212207", "212201", "212216"],
    });

    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    setLoading(true);

    try {
      const session = await getActiveSession();

      if (!session) {
        setSessionActive(false);
        toast.error("Please login before placing your order.");
        navigate("/login?next=%2Fcheckout");
        return;
      }

      const productIds = [
        ...new Set(
          cart
            .map((item) => Number(item.product_id))
            .filter(
              (id) => Number.isFinite(id) && id > 0
            )
        ),
      ];

      if (productIds.length === 0) {
        throw new Error(
          "No valid cart items were found for checkout."
        );
      }

      const {
        data: stockRows,
        error: stockError,
      } = await supabase
        .from(TABLES.products)
        .select("id, name, stock, is_active, is_deleted")
        .in("id", productIds);

      if (stockError) throw stockError;

      const stockMap = new Map<
        number,
        {
          name: string;
          stock: number;
          isActive: boolean;
          isDeleted: boolean;
        }
      >();

      for (const row of stockRows ?? []) {
        const productId = Number(row.id);

        if (!Number.isFinite(productId)) continue;

        stockMap.set(productId, {
          name: String(row.name ?? "Product"),
          stock: Number(row.stock ?? 0),
          isActive: row.is_active !== false,
          isDeleted: row.is_deleted === true,
        });
      }

      for (const item of cart) {
        const productId = Number(item.product_id);
        const stockInfo = stockMap.get(productId);

        if (!stockInfo) {
          throw new Error(
            `"${item.name}" is no longer available in stock.`
          );
        }

        if (stockInfo.isDeleted || !stockInfo.isActive) {
          throw new Error(
            `"${item.name}" is unavailable and cannot be ordered.`
          );
        }

        if (
          Number(stockInfo.stock ?? 0) <
          Number(item.qty ?? 0)
        ) {
          throw new Error(
            `Only ${stockInfo.stock} of "${item.name}" remain in stock.`
          );
        }
      }

      const fullAddress = `${formData.street}, ${
        formData.landmark
          ? formData.landmark + ", "
          : ""
      }${formData.pincode}`;

      const payload = buildServerOrderPayload(cart, {
        customer_id: session.user.id,
        customer_name: formData.fullName.trim(),
        customer_phone: formData.phone.trim(),
        shipping_address: fullAddress.trim(),
        landmark: formData.landmark.trim(),
        pincode: formData.pincode.trim(),
        payment_method: "cod",
        idempotency_key: `${session.user.id}:${Date.now()}:${crypto.randomUUID()}`,
      });

      const {
        data,
        error,
      } = await supabase.rpc(
        "place_website_order_atomic",
        payload
      );

      if (error) throw error;

      const returnedOrder = Array.isArray(data)
        ? data[0]
        : data;

      const createdOrderId =
        returnedOrder?.id ??
        returnedOrder?.order_id ??
        returnedOrder?.orderId;

      if (!createdOrderId) {
        throw new Error(
          "The secure checkout returned no order ID."
        );
      }

      clearCart();

      toast.success("Order placed successfully!");

      navigate(
        `/order-confirmation/${encodeURIComponent(
          String(createdOrderId)
        )}`,
        { replace: true }
      );
    } catch (err: unknown) {
      logSupabaseDebug(
        "checkoutOrder:error",
        {
          itemCount: cart.length,
          total: cartTotal,
        },
        err
      );

      toast.error(
        getSupabaseErrorMessage(
          err,
          "Secure checkout failed. Please review your details and try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-[10px] mb-4 group transition-colors"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back to Cart
              </button>

              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                Secure <span className="text-primary">Checkout</span>
              </h1>

              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">
                Finalize your order for Manjhanpur delivery
              </p>
            </div>

            <div className="bg-white border border-gray-100 px-8 py-4 rounded-[30px] shadow-sm flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] leading-none mb-1">
                  Total Amount
                </p>

                <p className="text-3xl font-black text-primary italic leading-none">
                  ₹{cartTotal}
                </p>
              </div>

              <div className="w-[1px] h-10 bg-gray-100" />

              <div className="p-2 bg-primary/5 rounded-xl text-primary">
                <ShoppingBag size={24} />
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid lg:grid-cols-3 gap-10"
          >
            {/* Left: Address Form */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[40px] shadow-sm space-y-10">

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <MapPin size={24} />
                  </div>

                  <h3 className="text-2xl font-black italic uppercase text-black">
                    Delivery Details
                  </h3>
                </div>

                {addresses.length > 0 && (
                  <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <label
                      htmlFor="saved-address"
                      className="text-[10px] font-black uppercase tracking-[0.18em] text-primary"
                    >
                      Choose a saved address
                    </label>

                    <select
                      id="saved-address"
                      value={selectedAddressId}
                      onChange={(event) =>
                        handleSavedAddressChange(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                    >
                      {addresses.map((address) => (
                        <option
                          key={address.id}
                          value={address.id}
                        >
                          {address.label} - {address.address},{" "}
                          {address.pincode}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => navigate("/addresses")}
                      className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary hover:underline"
                    >
                      Manage saved addresses
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="ENTER YOUR NAME"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">
                      Mobile Number *
                    </label>

                    <div className="relative group">
                      <Phone
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-DIGIT MOBILE"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">
                      Street / Area *
                    </label>

                    <div className="relative group">
                      <MapIcon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />

                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="STREET NAME / COLONY"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">
                      Landmark (Optional)
                    </label>

                    <div className="relative group">
                      <Landmark
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />

                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="E.G. NEAR B.P. SCHOOL"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">
                      Pincode *
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="PINCODE"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                    />
                  </div>

                </div>
              </div>

              {/* Payment Methods */}
              <fieldset className="bg-white border border-gray-100 p-8 md:p-10 rounded-[40px] shadow-sm space-y-8">

                <legend className="flex items-center gap-4 text-2xl font-black italic uppercase text-black">
                  <span className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <CreditCard size={24} />
                  </span>

                  <span>Payment Method</span>
                </legend>

                <div className="grid gap-6 md:max-w-sm">
                  {[
                    {
                      id: "cod",
                      label: "Cash On Delivery",
                      icon: Banknote,
                      sub: "Pay when your order arrives",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`relative cursor-pointer p-6 rounded-[30px] border-2 transition-all flex flex-col items-center text-center gap-4 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                        formData.paymentMethod === method.id
                          ? "border-primary bg-primary/5 shadow-inner"
                          : "border-gray-50 bg-gray-50/50 hover:border-primary/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={
                          formData.paymentMethod === method.id
                        }
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod:
                              method.id as
                                | "cod"
                                | "upi"
                                | "card_at_home",
                          }))
                        }
                        className="sr-only"
                      />

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          formData.paymentMethod === method.id
                            ? "bg-primary text-white"
                            : "bg-white text-gray-300"
                        }`}
                      >
                        <method.icon size={24} />
                      </div>

                      <div>
                        <p
                          className={`text-xs font-black uppercase tracking-wider ${
                            formData.paymentMethod === method.id
                              ? "text-primary"
                              : "text-gray-500"
                          }`}
                        >
                          {method.label}
                        </p>

                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic">
                          {method.sub}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <p className="text-[10px] font-semibold leading-5 text-gray-400">
                  Cash on delivery is currently the only supported payment method.
                </p>
              </fieldset>
            </div>

            {/* Right: Summary & Action */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden sticky top-28">

                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="text-xl font-black italic uppercase text-black">
                    Order Summary
                  </h3>
                </div>

                <div className="p-8 space-y-6">

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {cart.map(
                      (item: CartItem, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center gap-4"
                        >
                          <div className="flex-1">
                            <p className="text-[11px] font-black uppercase text-black italic line-clamp-1">
                              {item.name}
                            </p>

                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                              Qty: {item.qty} × ₹{item.saleRate}
                            </p>
                          </div>

                          <p className="text-sm font-black text-black italic">
                            ₹{item.saleRate * item.qty}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="h-[1px] bg-gray-100 my-6" />

                  {!sessionActive && (
                    <div className="text-[10px] font-black uppercase tracking-wider text-red-500">
                      Please login before placing the order. Your checkout details will remain available.
                    </div>
                  )}

                  <div className="space-y-4">

                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <span className="text-sm font-black uppercase tracking-[2px] text-black">
                        Total
                      </span>

                      <span className="text-3xl font-black text-primary italic">
                        ₹{cartTotal}
                      </span>
                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[2px] hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 italic mt-8 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          size={20}
                        />
                        Processing order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-6">
                    <span className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
                      Your selected payment method will be recorded with this order.
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

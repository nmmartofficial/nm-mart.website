import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import { useCart } from "@/hooks/useCart";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Math.max(0, Number(value) || 0));

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cart,
    cartCount,
    cartTotal,
    updateQty,
    removeItem,
  } = useCart();

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = Number(
      item.saleRate ?? item.price ?? 0,
    );

    return sum + unitPrice * item.qty;
  }, 0);

  const totalSavings = cart.reduce((sum, item) => {
    const mrp = Number(item.mrp ?? 0);
    const salePrice = Number(
      item.saleRate ?? item.price ?? 0,
    );

    return (
      sum +
      Math.max(0, mrp - salePrice) * item.qty
    );
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 md:px-8 md:pt-8">
        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 rounded-full px-1 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 transition hover:text-primary"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              Back
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <ShoppingBag size={23} strokeWidth={2.4} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  NM Mart
                </p>

                <h1 className="text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-4xl md:text-5xl">
                  Your{" "}
                  <span className="text-primary">
                    Cart
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingBag size={18} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Cart Items
                </p>

                <p className="text-sm font-black text-slate-900">
                  {cartCount}{" "}
                  {cartCount === 1
                    ? "Item"
                    : "Items"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary/10 text-primary">
              <ShoppingBag size={36} />
            </div>

            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
              NM Mart Shopping
            </p>

            <h2 className="text-2xl font-black tracking-[-0.045em] text-slate-950 sm:text-3xl">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Explore our store and add your favourite
              products to begin your order.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
              >
                Continue Shopping
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-primary/30 hover:bg-slate-50"
              >
                Go Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-8">
            {/* CART ITEMS */}
            <section>
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg font-black tracking-[-0.025em] text-slate-950">
                    Shopping Bag
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Review your selected products
                  </p>
                </div>

                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
                  {cartCount} Items
                </span>
              </div>

              <div className="space-y-3">
                {cart.map((item, index) => {
                  const unitPrice = Number(
                    item.saleRate ??
                      item.price ??
                      0,
                  );

                  const mrp = Number(
                    item.mrp ?? 0,
                  );

                  const lineTotal =
                    unitPrice * item.qty;

                  const saving =
                    Math.max(
                      0,
                      mrp - unitPrice,
                    ) * item.qty;

                  const productKey =
                    Number(item.product_id) > 0
                      ? `product-${item.product_id}`
                      : Number(item.id) > 0
                        ? `id-${item.id}`
                        : `barcode-${item.barcode || index}`;

                  return (
                    <article
                      key={productKey}
                      className="group overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-3.5 shadow-[0_5px_22px_rgba(15,23,42,0.045)] transition hover:border-primary/20 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-4"
                    >
                      <div className="flex gap-4">
                        {/* IMAGE */}
                        <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-2xl bg-slate-50 sm:h-[125px] sm:w-[125px]">
                          <ProductImageDisplay
                            imageUrl={
                              item.imageUrl
                            }
                            name={item.name}
                            className="h-full w-full object-contain p-2"
                          />

                          {item.discount > 0 && (
                            <span className="absolute left-2 top-2 rounded-lg bg-red-500 px-1.5 py-1 text-[8px] font-black text-white shadow-sm">
                              {Math.round(
                                item.discount,
                              )}
                              % OFF
                            </span>
                          )}
                        </div>

                        {/* PRODUCT CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {/* TAGS */}
                              <div className="mb-2 flex flex-wrap gap-1.5">
                                {item.brand && (
                                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
                                    {item.brand}
                                  </span>
                                )}

                                {item.unit && (
                                  <span className="rounded-md border border-slate-200 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                                    {item.unit}
                                  </span>
                                )}
                              </div>

                              <h2 className="line-clamp-2 text-[15px] font-black leading-[1.25] tracking-[-0.025em] text-slate-950 sm:text-lg">
                                {item.name}
                              </h2>

                              {item.category && (
                                <p className="mt-1 line-clamp-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                  {item.category}
                                </p>
                              )}
                            </div>

                            {/* REMOVE */}
                            <button
                              type="button"
                              aria-label={`Remove ${item.name} from cart`}
                              onClick={() =>
                                removeItem(
                                  index,
                                )
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>

                          {/* PRICE */}
                          <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
                            <span className="text-lg font-black tracking-[-0.02em] text-primary sm:text-xl">
                              ₹
                              {formatPrice(
                                unitPrice,
                              )}
                            </span>

                            {mrp >
                              unitPrice && (
                              <span className="text-xs font-semibold text-slate-400 line-through">
                                ₹
                                {formatPrice(
                                  mrp,
                                )}
                              </span>
                            )}

                            {saving > 0 && (
                              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-600">
                                Save ₹
                                {formatPrice(
                                  saving,
                                )}
                              </span>
                            )}
                          </div>

                          {/* QUANTITY + LINE TOTAL */}
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                              <button
                                type="button"
                                aria-label={`Decrease quantity for ${item.name}`}
                                onClick={() =>
                                  updateQty(
                                    index,
                                    -1,
                                  )
                                }
                                disabled={
                                  item.qty <=
                                  1
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                              >
                                <Minus
                                  size={14}
                                  strokeWidth={
                                    2.5
                                  }
                                />
                              </button>

                              <span className="min-w-[34px] text-center text-sm font-black text-slate-900">
                                {item.qty}
                              </span>

                              <button
                                type="button"
                                aria-label={`Increase quantity for ${item.name}`}
                                onClick={() =>
                                  updateQty(
                                    index,
                                    1,
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:text-primary"
                              >
                                <Plus
                                  size={14}
                                  strokeWidth={
                                    2.5
                                  }
                                />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                                Total
                              </p>

                              <p className="text-base font-black text-slate-950 sm:text-lg">
                                ₹
                                {formatPrice(
                                  lineTotal,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* TRUST STRIP */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-900">
                      Secure
                    </p>
                    <p className="text-[8px] text-slate-400">
                      Safe checkout
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-900">
                      Delivery
                    </p>
                    <p className="text-[8px] text-slate-400">
                      Home delivery
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:flex">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-900">
                      NM Mart
                    </p>
                    <p className="text-[8px] text-slate-400">
                      Shop more, save more
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ORDER SUMMARY */}
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]">
                {/* SUMMARY HEADER */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-primary/[0.06] to-transparent p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                      <CreditCard size={19} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        NM Mart
                      </p>

                      <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">
                        Order Summary
                      </h2>
                    </div>
                  </div>
                </div>

                {/* PRICE DETAILS */}
                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500">
                        Items
                      </span>
                      <span className="font-bold text-slate-900">
                        {cartCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500">
                        Subtotal
                      </span>
                      <span className="font-bold text-slate-900">
                        ₹
                        {formatPrice(
                          subtotal,
                        )}
                      </span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-emerald-600">
                          You save
                        </span>

                        <span className="font-black text-emerald-600">
                          -₹
                          {formatPrice(
                            totalSavings,
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="my-5 border-t border-dashed border-slate-200" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Payable Total
                      </p>

                      <p className="mt-1 text-2xl font-black tracking-[-0.045em] text-slate-950">
                        ₹
                        {formatPrice(
                          cartTotal,
                        )}
                      </p>
                    </div>

                    <span className="rounded-lg bg-primary/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-primary">
                      Final
                    </span>
                  </div>

                  {/* CHECKOUT */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={
                      cart.length === 0
                    }
                    className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover hover:shadow-primary/30 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    Proceed to Checkout
                    <ArrowRight
                      size={16}
                      strokeWidth={2.5}
                    />
                  </button>

                  {/* CONTINUE SHOPPING */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/shop")
                    }
                    className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 transition hover:border-primary/30 hover:bg-slate-50 hover:text-primary"
                  >
                    Continue Shopping
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    <ShieldCheck size={13} />
                    Secure NM Mart Checkout
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
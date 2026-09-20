import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductImageDisplay from "@/components/shop/ProductImageDisplay";
import { useCart } from "@/hooks/useCart";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateQty, removeItem } = useCart();

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = Number(item.saleRate ?? item.price ?? 0);
    return sum + unitPrice * item.qty;
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-primary"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h1 className="text-3xl font-black uppercase tracking-[-0.08em] text-slate-900 md:text-5xl">
              Your <span className="text-primary">Cart</span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm shadow-slate-200/60">
            <ShoppingBag size={18} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              {cartCount} Item{cartCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-100 text-slate-300">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-[-0.05em] text-black md:text-3xl">
              Your cart is empty
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
              Explore the live store and add products to begin your order.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover"
              >
                Continue Shopping
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                Go Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_360px]">
            <section className="space-y-4">
              {cart.map((item, index) => {
                const unitPrice = Number(item.saleRate ?? item.price ?? 0);
                const lineTotal = unitPrice * item.qty;

                return (
                  <article
                    key={`${item.id || item.barcode || item.name}-${index}`}
                    className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:p-5"
                  >
                    <div className="h-28 w-full overflow-hidden rounded-[22px] bg-slate-50 md:h-32 md:w-32">
                      <ProductImageDisplay imageUrl={item.imageUrl} name={item.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                          {item.category ? <span className="rounded-full bg-primary/5 px-2 py-1 text-primary">{item.category}</span> : null}
                          {item.brand ? <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">{item.brand}</span> : null}
                          {item.unit ? <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">{item.unit}</span> : null}
                        </div>

                        <h2 className="text-lg font-black uppercase tracking-[-0.05em] text-black md:text-xl">
                          {item.name}
                        </h2>

                        <div className="mt-2 flex items-center gap-3 text-sm font-bold text-slate-500">
                          <span className="text-primary">₹{unitPrice}</span>
                          {item.mrp > unitPrice ? <span className="line-through text-slate-300">₹{item.mrp}</span> : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.name}`}
                            onClick={() => updateQty(index, -1)}
                            disabled={item.qty <= 1}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-black text-slate-900">{item.qty}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.name}`}
                            onClick={() => updateQty(index, 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-primary hover:text-primary"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Line total</p>
                          <p className="mt-1 text-xl font-black text-primary">₹{lineTotal}</p>
                        </div>

                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeItem(index)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="h-fit rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Summary</p>
                  <h2 className="text-xl font-black uppercase tracking-[-0.05em] text-black">Order Summary</h2>
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-200 pb-5">
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>Items</span>
                  <span>{cartCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xl font-black text-black">
                <span>Total</span>
                <span className="text-primary">₹{cartTotal}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Proceed to Checkout
              </button>

              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="mt-3 flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;

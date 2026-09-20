import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Package, Truck, Search, Phone, Hash, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "../lib/supabase/schema";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { WA_NUMBER } from "@/lib/store-utils";

const TrackOrder = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || !orderId) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setOrderStatus(null);
    try {
      // Search for order by phone and partial ID
      const { data, error } = await supabase
        .from(TABLES.orders)
        .select('*')
        .eq('customer_phone', mobileNumber)
        .ilike('id', `%${orderId}`)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setOrderStatus(data);
        toast.success("Order found!");
      } else {
        toast.error("No matching order found. Please check your details.");
      }
    } catch (err: any) {
      logSupabaseDebug("trackOrder:error", { mobileNumber, orderId }, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to track order"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <div className="bg-primary/5 py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[-0.06em] text-slate-900 mb-2">
              Track Your <span className="text-primary">Order</span>
            </h1>
            <p className="text-slate-600 font-bold uppercase tracking-[2px] text-[10px]">
              Real-time updates on your delivery status
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <Truck size={48} className="text-primary" />
          </div>
        </div>
      </div>

      <main className="flex-1 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.25)] relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/15">
                  <Package size={20} className="text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-[-0.05em] text-slate-900">
                  Secure Order Tracking
                </h2>
              </div>

              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Enter Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Last 5 Digits of Order ID
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. 12345"
                      maxLength={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-[0.12em] py-5 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.18)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                  Track Order
                </button>
              </form>

              {orderStatus && (
                <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</p>
                      <h4 className="text-xl font-black uppercase text-primary">{orderStatus.status}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID</p>
                      <p className="text-xs font-bold text-slate-900">#{orderStatus.id}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order Date</p>
                    <p className="text-xs font-bold text-slate-900">{new Date(orderStatus.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <p className="mt-8 text-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">
                Need help? <span className="text-primary cursor-pointer hover:underline" onClick={() => window.open(`https://wa.me/${WA_NUMBER}?text=Hi, I need help tracking my order.`, "_blank")}>Contact Support</span>
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
               <div className="bg-slate-100 p-2 rounded-full mb-2">
                  <Truck size={16} className="text-slate-600" />
               </div>
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Fast Delivery</span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
               <div className="bg-slate-100 p-2 rounded-full mb-2">
                  <Package size={16} className="text-slate-600" />
               </div>
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Secure Packing</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;

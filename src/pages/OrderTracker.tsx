import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Package, ArrowLeft, Truck, CheckCircle2, Clock, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

const SLOGAN = "Shop More, Save More";

const OrderTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      setOrderId(id);
      trackOrder(id);
    }
  }, [location]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error("Please enter a valid Order ID");
      return;
    }
    trackOrder(orderId.trim());
  };

  const trackOrder = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setOrder(data);
        toast.success("Order details synced!");
      } else {
        toast.error("Order not found. Please check your ID.");
      }
    } catch (err: any) {
      console.error("Tracking error:", err);
      toast.error("Could not find order. Please verify the ID.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="text-yellow-500" />;
      case "packed": return <Package className="text-blue-500" />;
      case "out for delivery": return <Truck className="text-orange-500" />;
      case "delivered": return <CheckCircle2 className="text-green-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Tracker Input Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black">
              Track Your <span className="text-primary">Order</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">
              {SLOGAN}
            </p>
          </div>

          <form onSubmit={handleTrack} className="relative group max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-2 focus-within:border-primary/50 transition-all shadow-sm">
              <Package className="ml-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Order ID (e.g. NMM-123456)" 
                className="flex-1 bg-transparent border-none outline-none py-3 text-black font-bold placeholder:text-gray-300 placeholder:uppercase placeholder:text-[10px] tracking-widest"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-primary text-white p-3 rounded-xl hover:bg-black transition-colors shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </div>
          </form>

          {/* Result Section */}
          {order && (
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-gray-50">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[4px] mb-1">Order Status</p>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      {getStatusIcon(order.status)}
                    </div>
                    <span className="text-2xl font-black uppercase italic tracking-tighter text-black">{order.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[4px] mb-1">Order ID</p>
                  <span className="text-sm font-bold text-gray-600 font-mono tracking-widest">{order.id}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-100 rounded-full mb-12 overflow-hidden">
                <div 
                  className="absolute h-full bg-primary transition-all duration-1000 ease-out shadow-sm"
                  style={{ 
                    width: order.status.toLowerCase() === 'delivered' ? '100%' : 
                           order.status.toLowerCase() === 'out for delivery' ? '75%' : 
                           order.status.toLowerCase() === 'packed' ? '50%' : '25%' 
                  }}
                ></div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-50 rounded-xl text-primary shadow-sm">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] mb-1">Delivery Address</p>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed uppercase">{order.shipping_address}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic">Landmark: {order.landmark || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-50 rounded-xl text-primary shadow-sm">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] mb-1">Customer Details</p>
                      <p className="text-sm font-bold text-gray-700 uppercase">{order.customer_name}</p>
                      <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest">{order.customer_phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] mb-4">Order Summary</p>
                  <div className="space-y-3">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-wide">
                        <span className="text-gray-500">{item.name} <span className="text-primary ml-1">x{item.qty}</span></span>
                        <span className="text-black">₹{item.saleRate * item.qty}</span>
                      </div>
                    ))}
                    <div className="h-[1px] bg-gray-200 my-4"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-[2px] text-gray-400">Total Amount</span>
                      <span className="text-2xl font-black text-primary italic">₹{order.total}</span>
                    </div>
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

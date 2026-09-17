import { Package, RefreshCcw, Loader2, Phone, MapPin, Truck, CheckCircle2, Trash2, XCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getActiveSession, getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { toast } from "sonner";
import { TABLES } from "@/lib/supabase/schema";

const OrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessionActive(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessionActive(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.orders)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const session = await getActiveSession();
      if (!session) {
        setSessionActive(false);
        toast.error("Please login again.");
        return;
      }
      const { error } = await supabase
        .from(TABLES.orders)
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} marked as ${newStatus}`);
    } catch (err: any) {
      logSupabaseDebug("orderStatusUpdate:error", { orderId, newStatus }, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to update order status"));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Package size={24} />
          </div>
          Live Orders
        </h3>
        <button 
          onClick={fetchOrders}
          className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-all shadow-sm"
        >
          <RefreshCcw size={20} className={ordersLoading ? "animate-spin" : ""} />
        </button>
      </div>
      {!sessionActive && (
        <div className="text-[10px] font-black uppercase tracking-wider text-red-500">
          Please Login - status updates disabled.
        </div>
      )}

      {ordersLoading ? (
        <div className="py-20 text-center space-y-4 bg-white border border-gray-100 rounded-[40px] shadow-sm">
          <Loader2 className="animate-spin text-primary mx-auto" size={40} />
          <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">Fetching new orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white border border-gray-100 rounded-[40px] shadow-sm">
          <Package className="text-gray-200 mx-auto" size={60} />
          <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase italic">#{order.id}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase italic ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-500' : 
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-gray-300 text-[10px] font-bold uppercase italic">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-black italic uppercase text-black">{order.customer_name}</h4>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic flex items-center gap-1">
                      <Phone size={10} /> {order.customer_phone}
                    </p>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic flex items-center gap-1">
                      <MapPin size={10} /> {order.shipping_address}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Order Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl text-[10px] font-bold text-gray-500 italic">
                          {item.name} x {item.qty}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-1">Order Total</p>
                    <p className="text-3xl font-black text-primary italic leading-none">₹{order.total}</p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                      disabled={!sessionActive}
                      className="bg-gray-50 hover:bg-orange-50 hover:text-orange-500 text-gray-400 p-3 rounded-2xl transition-all"
                      title="Mark Out for Delivery"
                    >
                      <Truck size={20} />
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      disabled={!sessionActive}
                      className="bg-gray-50 hover:bg-green-50 hover:text-green-500 text-gray-400 p-3 rounded-2xl transition-all"
                      title="Mark Delivered"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                      disabled={!sessionActive}
                      className="bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 p-3 rounded-2xl transition-all"
                      title="Cancel Order"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;

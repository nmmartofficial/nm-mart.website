import { motion, AnimatePresence } from "framer-motion";
import { X, Package, RotateCcw } from "lucide-react";
import { OrderRecord, getOrderHistory } from "@/lib/store-utils";
import { useState, useEffect } from "react";

interface OrdersModalProps {
  showOrders: boolean;
  setShowOrders: (v: boolean) => void;
  reorder: (order: OrderRecord) => void;
}

const OrdersModal = ({ showOrders, setShowOrders, reorder }: OrdersModalProps) => {
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([]);

  useEffect(() => {
    if (showOrders) {
      setOrderHistory(getOrderHistory());
    }
  }, [showOrders]);

  return (
    <AnimatePresence>
      {showOrders && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowOrders(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 overflow-hidden border border-border flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2"><Package size={20} className="text-primary" /> My Orders</h2>
              <button onClick={() => setShowOrders(false)} className="p-2 hover:bg-secondary rounded-lg"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {orderHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-bold">No orders yet</p>
                </div>
              ) : orderHistory.map((order, idx) => (
                <div key={idx} className="bg-secondary rounded-xl p-4 border border-border/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Order ID: {order.id}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{order.date}</p>
                    </div>
                    <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic">{order.status}</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {order.items.slice(0, 2).map((item, i) => (
                      <p key={i} className="text-[10px] font-bold text-foreground truncate">• {item.name} x{item.qty}</p>
                    ))}
                    {order.items.length > 2 && <p className="text-[10px] font-bold text-primary">+{order.items.length - 2} more items</p>}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <p className="text-sm font-black text-foreground">₹{order.total}</p>
                    <button onClick={() => reorder(order)}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-primary hover:text-white transition-all">
                      <RotateCcw size={12} /> Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrdersModal;

import { useState, useEffect } from "react";
import { 
  Truck, CheckCircle2, Clock, MapPin, Loader2, Package, 
  Search, X, Printer, Phone, Map, LayoutGrid, BarChart3, 
  LogOut, ShieldCheck, Database, RefreshCcw, Lock
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getActiveSession, getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { TABLES } from "../lib/supabase/schema";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isActiveAdminUser } from "@/lib/adminAccess";

const SLOGAN = "Shop More, Save More";

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.orders)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      logSupabaseDebug("deliveryFetchOrders:error", undefined, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to load orders"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error("Enter your admin email and password.");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      toast.error("Invalid admin credentials.");
      return;
    }
    const activeAdmin = await isActiveAdminUser(supabase, data.user.id);
    if (!activeAdmin) {
      await supabase.auth.signOut();
      toast.error("This account is not authorized for delivery administration.");
      return;
    }
    setIsAuthenticated(true);
    toast.success("Welcome back, Admin!");
  };

  const handleLogout = () => {
    void supabase.auth.signOut();
    setIsAuthenticated(false);
    toast.info("Logged out from Admin Dashboard");
  };

  const markAsDelivered = async (orderId: string) => {
    try {
      const session = await getActiveSession();
      if (!session) {
        toast.error("Please login again.");
        return;
      }
      const { error } = await supabase
        .from(TABLES.orders)
        .update({ status: "Delivered" })
        .eq("id", orderId);

      if (error) throw error;
      toast.success(`Order ${orderId} marked as Delivered!`);
      fetchOrders();
    } catch (err: any) {
      logSupabaseDebug("deliveryMarkDelivered:error", { orderId }, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to update status"));
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(query.toLowerCase()) || 
    (o.customer_name && o.customer_name.toLowerCase().includes(query.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-gray-100 p-10 rounded-[40px] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-sm">
              <ShieldCheck size={40} />
            </div>
            
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black mb-2">
              Delivery <span className="text-primary">Admin</span>
            </h2>
            <p className="text-gray-400 uppercase tracking-[4px] font-bold text-[10px] mb-10">
              Authorized Personnel Only
            </p>

            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Admin Email</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Admin Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="Enter password"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold tracking-[0.5em]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              <button 
                onClick={handleLogin}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-primary-hover transition-all shadow-sm active:scale-95"
              >
                Access Terminal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">
              NM <span className="text-primary">DELIVERY</span>
            </h1>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[2px] mt-1 italic">{SLOGAN}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchOrders}
            className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-primary hover:bg-white transition-all shadow-sm"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-500' },
            { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-yellow-500' },
            { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Revenue', value: `₹${orders.reduce((acc, curr) => acc + (curr.total || 0), 0)}`, icon: BarChart3, color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 bg-gray-50 rounded-xl ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-black italic tracking-tighter">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer Name..."
              className="w-full bg-gray-50 border-none outline-none py-3 pl-12 pr-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 uppercase tracking-wider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">Syncing with NM Database...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Package className="mx-auto text-gray-100 mb-4" size={60} />
              <p className="text-gray-400 font-black uppercase tracking-[2px]">No orders found matching your search</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-1">Order ID</span>
                    <h3 className="text-sm font-bold text-black font-mono tracking-widest">{order.id}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic ${
                    order.status === 'Delivered' ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-primary mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-0.5">Address</p>
                      <p className="text-xs font-bold text-gray-700 uppercase leading-relaxed">{order.shipping_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-primary" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-0.5">Customer</p>
                      <p className="text-xs font-bold text-gray-700 uppercase">{order.customer_name} • {order.customer_phone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="text-xl font-black text-black italic">₹{order.total}</div>
                  {order.status !== 'Delivered' && (
                    <button 
                      onClick={() => markAsDelivered(order.id)}
                      className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[1px] hover:bg-primary-hover transition-all flex items-center gap-2 italic shadow-sm active:scale-95"
                    >
                      <CheckCircle2 size={14} /> Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DeliveryDashboard;

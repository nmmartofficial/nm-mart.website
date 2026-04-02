import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Package, MapPin, LogOut, Star, Loader2, Save, Phone as PhoneIcon, Clock, ChevronRight, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrderRecord } from "@/lib/store-utils";

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    points: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Fetch orders error:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          name: data.name || "",
          phone: data.phone || session.user.phone || "",
          address: data.address || "",
          landmark: data.landmark || "",
          points: data.points || 0
        });
      } else {
        setProfile(prev => ({ ...prev, phone: session.user.phone?.replace("+91", "") || "" }));
      }
    } catch (err: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.phone || !profile.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("customers")
        .upsert({
          id: user.id,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          landmark: profile.landmark,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.info("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black">
                My <span className="text-primary">Account</span>
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                Manage your profile and track orders
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white border border-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column - Profile Details */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-sm">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-black leading-none">{profile.name || "NM Member"}</h3>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-lg">
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest italic">{profile.points} Points</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      placeholder="ENTER NAME"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Phone Number</label>
                    <div className="relative group">
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input 
                        type="tel" 
                        value={profile.phone}
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                        placeholder="PHONE NUMBER"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-5 outline-none focus:border-primary transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Delivery Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 text-gray-300" size={16} />
                      <textarea 
                        value={profile.address}
                        onChange={e => setProfile({...profile, address: e.target.value})}
                        placeholder="FULL ADDRESS IN MANJHANPUR"
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-5 outline-none focus:border-primary transition-all font-bold uppercase text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      value={profile.landmark}
                      onChange={e => setProfile({...profile, landmark: e.target.value})}
                      placeholder="NEAR BY PLACE"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                    />
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-3 italic"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        <Save size={18} /> Update Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order History */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-primary">
                      <Package size={20} />
                    </div>
                    <h3 className="text-xl font-black italic uppercase text-black">Order History</h3>
                  </div>
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] italic">
                    {orders.length} Recent Orders
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <Package className="mx-auto text-gray-100" size={60} />
                      <p className="text-gray-400 font-black uppercase tracking-[2px] text-xs italic">No orders found yet</p>
                      <button 
                        onClick={() => navigate("/")}
                        className="text-primary font-black uppercase tracking-widest text-[10px] border-b-2 border-primary hover:opacity-80"
                      >
                        Start Shopping →
                      </button>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-8 hover:bg-gray-50/50 transition-all group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-black font-mono tracking-widest">{order.id}</span>
                              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic ${
                                order.status === 'Delivered' ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'
                              }`}>
                                {order.status}
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                              {new Date(order.created_at || "").toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-8 w-full md:w-auto justify-between">
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-1 leading-none">Total</p>
                              <p className="text-2xl font-black text-primary italic leading-none">₹{order.total}</p>
                            </div>
                            <button 
                              onClick={() => navigate(`/tracker?id=${order.id}`)}
                              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm group-hover:scale-110"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Loyalty Program Promo */}
              <div className="bg-primary p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 text-center md:text-left">
                  <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white shadow-sm shrink-0">
                    <Star size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black italic uppercase text-white">NM Rewards</h4>
                    <p className="font-bold text-white/80 text-xs uppercase tracking-[3px] italic mt-1">Shop more to earn bigger discounts!</p>
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 px-8 py-4 rounded-2xl backdrop-blur-sm">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Available Points</span>
                  <span className="text-3xl font-black text-white italic leading-none">{profile.points}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;

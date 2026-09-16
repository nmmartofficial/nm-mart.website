import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shop/Footer";
import { User, Package, MapPin, LogOut, Star, Loader2, Save, Smartphone, ChevronRight, Map, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { toast } from "sonner";
import { OrderRecord, WA_NUMBER } from "@/lib/store-utils";

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    avatar_url: "",
    points: 0,
    welfare_status: "inactive",
    welfare_card_number: ""
  });

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessionActive(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessionActive(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login again.");
        return;
      }
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      logSupabaseDebug("fetchOrders:error", undefined, err);
      toast.error(getSupabaseErrorMessage(err, "Failed to load orders"));
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
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          name: data.full_name || "",
          phone: data.phone_number || data.mobile || session.user.phone || "",
          address: data.address || "",
          landmark: data.landmark || "",
          avatar_url: data.avatar_url || "",
          points: data.loyalty_points || 0,
          welfare_status: data.welfare_status || "inactive",
          welfare_card_number: data.welfare_card_number || ""
        });
      } else {
        setProfile(prev => ({ ...prev, phone: session.user.phone?.replace("+91", "") || "" }));
      }
    } catch (err: any) {
      logSupabaseDebug("fetchProfile:error", undefined, err);
      toast.error(getSupabaseErrorMessage(err, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    const localUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(localUrl);

    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/profile.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Failed to get public URL");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Profile photo updated");
    } catch (err: any) {
      logSupabaseDebug("avatarUpload:error", { userId: user?.id }, err);
      toast.error(getSupabaseErrorMessage(err, "Failed to upload profile photo"));
      setAvatarPreviewUrl(null);
    } finally {
      setAvatarUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.phone || !profile.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!user?.id) {
      toast.error("Please login again.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: user.id,
        full_name: profile.name,
        phone_number: profile.phone,
        mobile: profile.phone,
        address: profile.address,
        landmark: profile.landmark,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString()
      };
      logSupabaseDebug("profileSave:payload", payload);

      let { data, error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select("id")
        .single();

      // Fallback for schemas where row key is user_id
      if (error && /user_id|id/i.test(error.message || "")) {
        const fallbackPayload = {
          user_id: user.id,
          full_name: profile.name,
          phone_number: profile.phone,
          mobile: profile.phone,
          address: profile.address,
          landmark: profile.landmark,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        };
        logSupabaseDebug("profileSave:fallbackPayload", fallbackPayload);
        const fallback = await supabase
          .from("profiles")
          .upsert(fallbackPayload as any, { onConflict: "user_id" })
          .select("user_id")
          .single();
        data = fallback.data as any;
        error = fallback.error;
      }

      if (error) throw error;
      logSupabaseDebug("profileSave:success", data);
      toast.success("Profile Updated!");
    } catch (err: any) {
      logSupabaseDebug("profileSave:error", { userId: user?.id }, err);
      toast.error(getSupabaseErrorMessage(err, "Save failed"));
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
    <div className="min-h-screen bg-[#FFFAF5] text-black flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {!sessionActive && (
            <div className="text-[10px] font-black uppercase tracking-wider text-red-500">
              Please Login - save actions are disabled.
            </div>
          )}
          
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Details */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-10 rounded-3xl shadow-2xl space-y-10">
                {/* Premium Profile Header */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative mx-auto w-28 h-28 rounded-full bg-gray-100 shadow-lg overflow-hidden flex items-center justify-center text-orange-500 focus:outline-none"
                    title="Change profile photo"
                    disabled={avatarUploading}
                  >
                    {(avatarPreviewUrl || profile.avatar_url) ? (
                      <img src={avatarPreviewUrl || profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} />
                    )}
                    <span className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center border border-orange-100">
                      {avatarUploading ? (
                        <Loader2 className="animate-spin text-orange-500" size={18} />
                      ) : (
                        <Camera className="text-orange-500" size={18} />
                      )}
                    </span>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarPick}
                      disabled={avatarUploading}
                    />
                  </button>

                  {profile.name ? (
                    <h3 className="mt-5 text-2xl font-black italic uppercase tracking-tight text-black leading-none">
                      {profile.name}
                    </h3>
                  ) : null}

                  <div className="mt-4 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-400 shadow-[0_18px_40px_rgba(255,140,0,0.35)] flex flex-col items-center justify-center animate-pulse">
                      <Star size={18} className="text-yellow-100 fill-current drop-shadow" />
                      <div className="mt-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/95">Points</div>
                      <div className="text-2xl font-black text-white leading-none drop-shadow">{profile.points}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-orange-500" />
                      <div className="relative flex-1">
                        <input
                          id="profile_full_name"
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile({ ...profile, name: e.target.value })}
                          placeholder=" "
                          className="peer w-full bg-transparent border-0 border-b-2 border-[#EEEEEE] py-4 pr-2 outline-none font-bold uppercase text-sm focus:border-[#FF8800] focus:shadow-[0_16px_26px_-22px_rgba(255,136,0,0.95)] transition-all"
                        />
                        <label
                          htmlFor="profile_full_name"
                          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold text-[#333] transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-orange-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[11px]"
                        >
                          Full Name
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} className="text-orange-500" />
                      <div className="relative flex-1">
                        <input
                          id="profile_phone"
                          type="tel"
                          value={profile.phone}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })}
                          placeholder=" "
                          className="peer w-full bg-transparent border-0 border-b-2 border-[#EEEEEE] py-4 pr-2 outline-none font-bold text-sm focus:border-[#FF8800] focus:shadow-[0_16px_26px_-22px_rgba(255,136,0,0.95)] transition-all"
                        />
                        <label
                          htmlFor="profile_phone"
                          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold text-[#333] transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-orange-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[11px]"
                        >
                          Phone Number
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="text-orange-500 mt-4" />
                      <div className="relative flex-1">
                        <textarea
                          id="profile_address"
                          value={profile.address}
                          onChange={e => setProfile({ ...profile, address: e.target.value })}
                          placeholder=" "
                          rows={3}
                          className="peer w-full bg-transparent border-0 border-b-2 border-[#EEEEEE] py-4 pr-2 outline-none font-bold uppercase text-sm resize-none focus:border-[#FF8800] focus:shadow-[0_18px_30px_-24px_rgba(255,136,0,0.95)] transition-all"
                        />
                        <label
                          htmlFor="profile_address"
                          className="absolute left-0 top-6 -translate-y-1/2 text-sm font-bold text-[#333] transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-orange-600 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[11px]"
                        >
                          Delivery Address
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Map size={18} className="text-orange-500" />
                      <div className="relative flex-1">
                        <input
                          id="profile_landmark"
                          type="text"
                          value={profile.landmark}
                          onChange={e => setProfile({ ...profile, landmark: e.target.value })}
                          placeholder=" "
                          className="peer w-full bg-transparent border-0 border-b-2 border-[#EEEEEE] py-4 pr-2 outline-none font-bold uppercase text-sm focus:border-[#FF8800] focus:shadow-[0_16px_26px_-22px_rgba(255,136,0,0.95)] transition-all"
                        />
                        <label
                          htmlFor="profile_landmark"
                          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold text-[#333] transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-orange-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[11px]"
                        >
                          Landmark (Optional)
                        </label>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={saving || !sessionActive}
                    className="w-full py-5 rounded-full font-black uppercase tracking-[3px] shadow-lg flex items-center justify-center italic transition-all bg-gradient-to-r from-[#FF7F00] to-[#FFD700] hover:shadow-xl active:animate-bounce active:shadow-2xl"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        UPDATE PROFILE <Save size={18} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order History and Account Actions */}
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
                    {orders.length} {orders.length === 1 ? "Recent Order" : "Recent Orders"}
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

              <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl text-primary">
                    <User size={18} />
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-black">Account Actions</h3>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => navigate("/tracker")}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    Track Order
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    Shop Now
                  </button>
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

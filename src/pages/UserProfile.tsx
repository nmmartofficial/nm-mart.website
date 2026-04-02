import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Package, MapPin, LogOut, Star, Loader2, Save, Phone as PhoneIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    points: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

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
        // Pre-fill phone from auth if available
        setProfile(prev => ({ ...prev, phone: session.user.phone?.replace("+91", "") || "" }));
      }
    } catch (err: any) {
      toast.error("Profile लोड करने में समस्या");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.phone || !profile.address) {
      toast.error("कृपया सभी जरूरी जानकारी भरें");
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
      toast.success("Profile अपडेट हो गई!");
    } catch (err: any) {
      toast.error("Save करने में समस्या: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    toast.success("लॉगआउट सफल");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        {/* Profile Header */}
        <div className="bg-card rounded-[2rem] p-8 border border-border mb-8 flex flex-col md:flex-row items-center gap-6 shadow-premium">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-brand-glow">
            <User size={48} className="text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
              {profile.name || "NM Customer"}
            </h2>
            <p className="text-muted-foreground font-bold text-sm uppercase">
              {user?.email || `+91 ${profile.phone}`}
            </p>
          </div>
          <div className="bg-secondary p-4 rounded-2xl border border-border text-center">
            <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">NM Loyalty Points</p>
            <div className="flex items-center gap-2 text-primary font-black text-2xl">
              <Star fill="currentColor" size={20} /> {profile.points}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Edit Profile Form */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-premium">
              <h3 className="text-foreground font-black uppercase text-sm mb-8 flex items-center gap-3">
                <div className="w-6 h-[1px] bg-primary/30"></div>
                Delivery Details
              </h3>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      placeholder="आपका नाम"
                      className="w-full bg-secondary border border-border p-4 pl-12 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Phone Number</label>
                  <div className="relative">
                    <PhoneIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="tel" 
                      value={profile.phone}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      placeholder="मोबाइल नंबर"
                      className="w-full bg-secondary border border-border p-4 pl-12 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Full Address (Manjhanpur)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-4 text-muted-foreground" />
                    <textarea 
                      value={profile.address}
                      onChange={e => setProfile({...profile, address: e.target.value})}
                      placeholder="मकान नंबर, मोहल्ला, मंझनपुर..."
                      rows={3}
                      className="w-full bg-secondary border border-border p-4 pl-12 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Near Landmark</label>
                  <input 
                    type="text" 
                    value={profile.landmark}
                    onChange={e => setProfile({...profile, landmark: e.target.value})}
                    placeholder="BP School, Hospital, Chauraha etc."
                    className="w-full bg-secondary border border-border p-4 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-4 py-4 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-[2px] shadow-brand-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Address</>}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-premium h-fit">
              <h3 className="text-foreground font-black uppercase text-sm mb-6 flex items-center gap-3">
                <Package size={18} className="text-primary" /> Why Save Details?
              </h3>
              <ul className="space-y-4 text-xs text-muted-foreground font-bold uppercase leading-relaxed">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                  <span>One-tap Checkout for all orders</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                  <span>Accurate Delivery in Manjhanpur</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"></div>
                  <span>Earn Loyalty points on every sale</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-destructive/5 text-destructive rounded-[2rem] font-black uppercase text-[10px] tracking-[3px] border border-destructive/10 hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={16} /> Logout Account
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;


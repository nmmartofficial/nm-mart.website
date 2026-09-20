import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Package, MapPin, LogOut, Star, Loader2, Save, Smartphone, ChevronRight, Map, Camera, Heart, Settings, Headset, ArrowLeft, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "../lib/supabase/schema";
import { getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { toast } from "sonner";

export interface ProfileAddressInput {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
}

export const validateCustomerProfile = ({
  name,
  phone,
  address,
}: ProfileAddressInput): string => {
  const trimmedName = name.trim();
  const trimmedAddress = address.trim();
  const digits = phone.replace(/\D/g, "");

  if (!trimmedName) {
    return "Please enter your full name.";
  }

  if (!trimmedAddress) {
    return "Please enter your delivery address.";
  }

  if (!digits) {
    return "Please enter a valid phone number.";
  }

  if (digits.length !== 10) {
    return "Phone number must be 10 digits.";
  }

  return "";
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [user, setUser] = useState<any>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    role: "",
    avatar_url: "",
    points: 0,
    welfare_status: "inactive",
    welfare_card_number: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessionActive(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessionActive(Boolean(session)));
    return () => listener.subscription.unsubscribe();
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
        .from(TABLES.profiles)
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
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          role: data.role || "",
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
        .from(TABLES.profiles)
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
    const validationError = validateCustomerProfile({
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      landmark: profile.landmark,
    });

    if (validationError) {
      setSaveMessage({ type: "error", text: validationError });
      toast.error(validationError);
      return;
    }

    if (!user?.id) {
      const message = "Please login again.";
      setSaveMessage({ type: "error", text: message });
      toast.error(message);
      return;
    }

    setSaving(true);
    try {
      const normalizedPhone = profile.phone.replace(/\D/g, "");
      const payload = {
        id: user.id,
        full_name: profile.name.trim(),
        phone_number: normalizedPhone,
        mobile: normalizedPhone,
        phone: normalizedPhone,
        address: profile.address.trim(),
        landmark: profile.landmark.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        pincode: profile.pincode.trim(),
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString()
      };
      logSupabaseDebug("profileSave:payload", payload);

      let { data, error } = await supabase
        .from(TABLES.profiles)
        .upsert(payload, { onConflict: "id" })
        .select("id")
        .single();

      // Fallback for schemas where row key is user_id
      if (error && /user_id|id/i.test(error.message || "")) {
        const fallbackPayload = {
          user_id: user.id,
          full_name: profile.name.trim(),
          phone_number: normalizedPhone,
          mobile: normalizedPhone,
          address: profile.address.trim(),
          landmark: profile.landmark.trim(),
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        };
        logSupabaseDebug("profileSave:fallbackPayload", fallbackPayload);
        const fallback = await supabase
          .from(TABLES.profiles)
          .upsert(fallbackPayload as any, { onConflict: "user_id" })
          .select("user_id")
          .single();
        data = fallback.data as any;
        error = fallback.error;
      }

      if (error) throw error;
      logSupabaseDebug("profileSave:success", data);
      const successMessage = "Profile details saved successfully.";
      setSaveMessage({ type: "success", text: successMessage });
      toast.success(successMessage);
      setEditing(false);
    } catch (err: any) {
      const message = getSupabaseErrorMessage(err, "Save failed");
      setSaveMessage({ type: "error", text: message });
      logSupabaseDebug("profileSave:error", { userId: user?.id }, err);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.info("Logged out successfully");
  };

  const initials = (profile.name || user?.email || "NM").trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();
  const contact = profile.phone || user?.email || "Contact details unavailable";

  const showUnavailable = (label: string) => toast.info(`${label} is coming soon.`);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-4 md:px-6 md:pb-12">
        <header className="flex h-12 items-center justify-between border-b border-slate-200">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back">
            <ArrowLeft size={18} /> My Profile
          </button>
          <button type="button" onClick={() => showUnavailable("Settings")} className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-primary" aria-label="Profile settings">
            <Settings size={18} />
          </button>
        </header>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-orange-50 text-primary shadow-sm focus:outline-none"
                    title="Change profile photo"
                    disabled={avatarUploading}
                  >
                    {(avatarPreviewUrl || profile.avatar_url) ? (
                      <img src={avatarPreviewUrl || profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-black">{initials}</span>
                    )}
                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white">
                      {avatarUploading ? (
                        <Loader2 className="animate-spin text-orange-500" size={11} />
                      ) : (
                        <Camera className="text-orange-500" size={11} />
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

                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-lg font-black uppercase tracking-[-0.03em] text-slate-900">{profile.name || "NM Mart customer"}</h1>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">{contact}</p>
                  </div>
                  <button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-primary hover:bg-primary/5">
                    <Pencil size={13} /> Edit
                  </button>
          </div>
        </section>

        <button type="button" onClick={() => showUnavailable("Rewards / Points")} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-primary/5 px-4 py-3 text-left shadow-sm hover:bg-primary/10">
          <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary"><Star size={17} fill="currentColor" /></span><span><span className="block text-[10px] font-black uppercase tracking-[0.16em] text-primary">Rewards Points</span><span className="mt-0.5 block text-sm font-black text-slate-800">{profile.points > 0 ? `${profile.points} Points` : "No points yet"}</span></span></span>
          <ChevronRight size={17} className="text-primary" />
        </button>

        {saveMessage && <div className={`mt-4 rounded-xl border px-3 py-2 text-xs font-bold ${saveMessage.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{saveMessage.text}</div>}

        {editing && <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-[0.12em]">Personal Information</h2><button type="button" onClick={() => setEditing(false)} className="text-xs font-bold text-slate-500">Cancel</button></div>
          <div className="space-y-3">
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-orange-500" />
                      <div className="relative flex-1">
                        <input
                          id="profile_full_name"
                          type="text"
                          value={profile.name}
                          onChange={e => {
                            setSaveMessage(null);
                            setProfile({ ...profile, name: e.target.value });
                          }}
                          placeholder=" "
                          className="peer w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-primary"
                        />
                        <label
                          htmlFor="profile_full_name"
                          className="sr-only"
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
                          onChange={e => {
                            setSaveMessage(null);
                            setProfile({ ...profile, phone: e.target.value });
                          }}
                          placeholder=" "
                          className="peer w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-primary"
                        />
                        <label
                          htmlFor="profile_phone"
                          className="sr-only"
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
                          onChange={e => {
                            setSaveMessage(null);
                            setProfile({ ...profile, address: e.target.value });
                          }}
                          placeholder=" "
                          rows={3}
                          className="peer w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-primary"
                        />
                        <label
                          htmlFor="profile_address"
                          className="sr-only"
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
                          onChange={e => {
                            setSaveMessage(null);
                            setProfile({ ...profile, landmark: e.target.value });
                          }}
                          placeholder=" "
                          className="peer w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-primary"
                        />
                        <label
                          htmlFor="profile_landmark"
                          className="sr-only"
                        >
                          Landmark (Optional)
                        </label>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={saving || !sessionActive}
                    className="w-full rounded-xl bg-primary py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-orange-700 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        UPDATE PROFILE <Save size={15} className="ml-2 inline" />
                      </>
                    )}
                  </button>
          </div>
        </section>}

        <div className="mt-5 space-y-5">
          <ProfileMenuSection title="Account" items={[{ label: "Personal Information", icon: User, action: () => setEditing(true) }, { label: "Delivery Addresses", icon: MapPin, action: () => navigate("/addresses") }]} />
          <ProfileMenuSection title="Orders & Shopping" items={[{ label: "My Orders", icon: Package, action: () => navigate("/orders") }, { label: "Wishlist", icon: Heart, action: () => navigate("/wishlist") }]} />
          <ProfileMenuSection title="Rewards" items={[{ label: "Rewards / Points", icon: Star, action: () => showUnavailable("Rewards / Points") }]} />
          <ProfileMenuSection title="Settings" items={[{ label: "Settings", icon: Settings, action: () => showUnavailable("Settings") }]} />
          <ProfileMenuSection title="Support" items={[{ label: "Help & Support", icon: Headset, action: () => navigate("/contact") }]} />
          <section className="border-t border-slate-200 pt-4"><button type="button" onClick={handleLogout} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-red-100 bg-white px-4 text-left text-red-600 shadow-sm hover:bg-red-50"><span className="flex items-center gap-3 text-sm font-bold"><LogOut size={17} /> Logout</span><ChevronRight size={16} className="text-red-300" /></button></section>
        </div>
      </main>
    </div>
  );
};

function ProfileMenuSection({ title, items }: { title: string; items: Array<{ label: string; icon: typeof User; action: () => void }> }) {
  return <section><h2 className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h2><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{items.map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-slate-100 px-4 text-left last:border-0 hover:bg-slate-50"><span className="flex items-center gap-3 text-sm font-bold text-slate-800"><Icon size={17} className="text-primary" />{label}</span><ChevronRight size={16} className="text-slate-400" /></button>)}</div></section>;
}

export default UserProfile;

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Package, MapPin, LogOut, Star, Loader2, Save, Smartphone, ChevronRight, Map, Camera, Heart, Settings, Headset, ArrowLeft, Pencil, ShieldCheck, BellRing, Database, ShieldAlert, Trash2 } from "lucide-react";
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
  const [showPrivacySecurity, setShowPrivacySecurity] = useState(false);
  const [showLoginVerification, setShowLoginVerification] = useState(false);
  const [showAccountSecurity, setShowAccountSecurity] = useState(false);
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
  const [showDataPrivacy, setShowDataPrivacy] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showFinalDeleteWarning, setShowFinalDeleteWarning] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

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
    setShowLogoutConfirm(false);
    navigate("/");
    toast.info("Logged out successfully");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      toast.error("Please type DELETE to continue.");
      return;
    }

    setShowDeleteAccountConfirm(false);
    setDeleteConfirmationText("");
    setShowFinalDeleteWarning(true);
  };

  const confirmPermanentDelete = async () => {
    try {
      toast.warning("Account deletion is not available yet.");
      setShowFinalDeleteWarning(false);
    } catch (err) {
      toast.error("Unable to delete account right now.");
    }
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

  if (showDataPrivacy) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-md px-4 pb-28 pt-4 md:px-6 md:pb-12">
          <header className="flex h-12 items-center justify-between border-b border-slate-200">
            <button type="button" onClick={() => setShowDataPrivacy(false)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back to privacy and security">
              <ArrowLeft size={18} /> Data & Privacy
            </button>
          </header>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Your Data</h3>

                <div className="space-y-3">
                  <button type="button" onClick={() => showUnavailable("Personal Information")} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span>
                      <span className="block text-sm font-black text-slate-900">Personal Information</span>
                      <span className="mt-0.5 block text-xs text-slate-500">View your account information</span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button type="button" onClick={() => showUnavailable("Privacy Policy")} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span>
                      <span className="block text-sm font-black text-slate-900">Privacy Policy</span>
                      <span className="mt-0.5 block text-xs text-slate-500">How NM MART handles your data</span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button type="button" onClick={() => showUnavailable("Terms & Conditions")} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span className="block text-sm font-black text-slate-900">Terms & Conditions</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button type="button" onClick={() => showUnavailable("Download My Data")} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span>
                      <span className="block text-sm font-black text-slate-900">Download My Data</span>
                      <span className="mt-0.5 block text-xs text-slate-500">Request a copy of your data</span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button type="button" onClick={() => showUnavailable("Delete Account")} className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100">
                    <span>
                      <span className="block text-sm font-black text-red-600">Delete Account</span>
                      <span className="mt-0.5 block text-xs text-red-500">Permanently delete your account</span>
                    </span>
                    <ChevronRight size={18} className="text-red-400" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showNotificationPreferences) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-md px-4 pb-28 pt-4 md:px-6 md:pb-12">
          <header className="flex h-12 items-center justify-between border-b border-slate-200">
            <button type="button" onClick={() => setShowNotificationPreferences(false)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back to privacy and security">
              <ArrowLeft size={18} /> Notification Preferences
            </button>
          </header>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Order Updates</h3>
                <div className="space-y-3">
                  {[
                    ["Order Confirmation", "ON"],
                    ["Order Status Updates", "ON"],
                    ["Delivery Updates", "ON"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-bold text-slate-800">{label}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Offers & Updates</h3>
                <div className="space-y-3">
                  {[
                    ["Offers & Discounts", "ON"],
                    ["Coupons & Rewards", "ON"],
                    ["New Arrivals", "ON"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-bold text-slate-800">{label}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">WhatsApp</h3>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-800">WhatsApp Updates</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-800">ON</span>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showAccountSecurity) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-md px-4 pb-28 pt-4 md:px-6 md:pb-12">
          <header className="flex h-12 items-center justify-between border-b border-slate-200">
            <button type="button" onClick={() => setShowAccountSecurity(false)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back to privacy and security">
              <ArrowLeft size={18} /> Account Security
            </button>
          </header>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Security</h3>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck size={18} /></span>
                      <div>
                        <div className="text-sm font-black text-slate-900">Login Protection</div>
                        <div className="mt-1 text-sm text-slate-500">Your account is protected<br />with secure authentication.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-slate-900">Recent Login</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-green-600">Active Now</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-700">This Device</div>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-green-600">
                      <span className="h-2 w-2 rounded-full bg-green-500" /> Verified
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-slate-900">Security Alerts</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-800">ON</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-500">Get notified about<br />important account activity</div>
                  </div>
                </div>
              </section>

              <section>
                <button type="button" onClick={() => showUnavailable("Sign Out From Other Devices")} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                  <span className="text-sm font-black text-slate-900">Sign Out From Other Devices</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showLoginVerification) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-md px-4 pb-28 pt-4 md:px-6 md:pb-12">
          <header className="flex h-12 items-center justify-between border-b border-slate-200">
            <button type="button" onClick={() => setShowLoginVerification(false)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back to privacy and security">
              <ArrowLeft size={18} /> Login & Verification
            </button>
          </header>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Login Security</h3>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-700">Mobile Number</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-green-600">Verified</span>
                    </div>
                    <div className="mt-2 text-base font-bold text-slate-900">+91 XXXXX XXXXX</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-700">Email Address</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-green-600">Verified</span>
                    </div>
                    <div className="mt-2 text-base font-bold text-slate-900">example@email.com</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-700">OTP Verification</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-800">ON</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-500">Order/login verification</div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <button type="button" onClick={() => showUnavailable("Change Mobile Number")} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                  <span>
                    <span className="block text-sm font-black text-slate-900">Change Mobile Number</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Update your registered number</span>
                  </span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>

                <button type="button" onClick={() => showUnavailable("Change Email Address")} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                  <span>
                    <span className="block text-sm font-black text-slate-900">Change Email Address</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Update your email address</span>
                  </span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showPrivacySecurity) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-md px-4 pb-28 pt-4 md:px-6 md:pb-12">
          <header className="flex h-12 items-center justify-between border-b border-slate-200">
            <button type="button" onClick={() => setShowPrivacySecurity(false)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back to profile overview">
              <ArrowLeft size={18} /> Privacy & Security
            </button>
          </header>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Security</h3>
                <div className="space-y-3">
                  <button type="button" onClick={() => setShowLoginVerification(true)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck size={18} /></span>
                      <span>
                        <span className="block text-sm font-black text-slate-900">Login & Verification</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Manage your login verification</span>
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button type="button" onClick={() => setShowAccountSecurity(true)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldAlert size={18} /></span>
                      <span>
                        <span className="block text-sm font-black text-slate-900">Account Security</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Protect your NM MART account</span>
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Privacy</h3>
                <div className="space-y-3">
                  <button type="button" onClick={() => setShowNotificationPreferences(true)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BellRing size={18} /></span>
                      <span>
                        <span className="block text-sm font-black text-slate-900">Notification Preferences</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Manage your notifications</span>
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button type="button" onClick={() => setShowDataPrivacy(true)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Database size={18} /></span>
                      <span>
                        <span className="block text-sm font-black text-slate-900">Data & Privacy</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Manage your personal data</span>
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account</h3>
                <div className="space-y-3">
                  <button type="button" onClick={() => setShowLogoutConfirm(true)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><LogOut size={18} /></span>
                      <span className="block text-sm font-black text-slate-900">Logout</span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <button type="button" onClick={() => setShowDeleteAccountConfirm(true)} className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600"><Trash2 size={18} /></span>
                      <span className="block text-sm font-black text-red-600">Delete Account</span>
                    </span>
                    <ChevronRight size={18} className="text-red-400" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-[20px] font-black uppercase tracking-[-0.06em] text-slate-900">Logout?</h2>
            <p className="mt-4 text-base leading-6 text-slate-600">
              Are you sure you want to<br />
              logout from this device?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[var(--nm-primary-dark)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <header className="flex items-center justify-between">
              <button type="button" onClick={() => setShowDeleteAccountConfirm(false)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back">
                <ArrowLeft size={18} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Delete Account</span>
            </header>

            <div className="mt-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 size={22} />
              </div>
              <h2 className="mt-4 text-[20px] font-black uppercase tracking-[-0.06em] text-slate-900">Delete your NM MART account?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This will permanently remove your<br />
                account and associated personal data.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Before continuing, please make sure<br />
                you don't have any active orders.
              </p>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-700">Type DELETE to continue</label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value.toUpperCase())}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-bold text-slate-900 outline-none focus:border-primary"
                placeholder="DELETE"
              />
            </div>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmationText !== "DELETE"}
              className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {showFinalDeleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={22} />
            </div>
            <h2 className="mt-5 text-center text-[20px] font-black uppercase tracking-[-0.06em] text-slate-900">Are you absolutely sure?</h2>
            <p className="mt-3 text-center text-base leading-6 text-slate-600">
              This action cannot be undone.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowFinalDeleteWarning(false)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPermanentDelete}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-md px-4 pb-28 pt-4 md:px-6 md:pb-12">
        {!editing ? (
          <>
            <header className="flex h-12 items-center justify-between border-b border-slate-200">
              <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back">
                <ArrowLeft size={18} /> My Profile
              </button>
            </header>

            <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-orange-50 text-2xl font-black text-primary shadow-sm">
                  {(avatarPreviewUrl || profile.avatar_url) ? (
                    <img src={avatarPreviewUrl || profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials || "NM"}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <h1 className="text-[28px] font-black uppercase tracking-[-0.06em] text-slate-900">{profile.name || "Profile"}</h1>
                  <p className="text-base font-medium text-slate-600">{profile.phone || "+91 98765 43210"}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-[var(--nm-primary-dark)]"
                >
                  Edit Profile
                </button>
              </div>
            </section>
          </>
        ) : (
          <>
            <header className="flex h-12 items-center justify-between border-b border-slate-200">
              <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 hover:text-primary" aria-label="Go back to profile overview">
                <ArrowLeft size={18} /> My Profile
              </button>
            </header>

            <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-orange-50 text-2xl font-black text-primary shadow-sm">
                  {(avatarPreviewUrl || profile.avatar_url) ? (
                    <img src={avatarPreviewUrl || profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials || "NM"}</span>
                  )}
                </div>

                <h2 className="text-[22px] font-black uppercase tracking-[-0.05em] text-slate-900">{profile.name || "Rahul Kumar"}</h2>
                <p className="mt-1 text-sm font-medium text-slate-600">{profile.phone || "+91 98765 43210"}</p>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
                >
                  Edit Profile
                </button>
              </div>
            </section>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Personal Information</h3>
                <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <button type="button" onClick={() => setEditing(true)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <span className="text-sm text-slate-600">Full Name</span>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      {profile.name || "Rahul Kumar"}
                      <ChevronRight size={16} className="text-slate-400" />
                    </span>
                  </button>
                  <div className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <span className="text-sm text-slate-600">Mobile Number</span>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      {profile.phone || "+91 98765 43210"}
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-green-600">Verified</span>
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <span className="text-sm text-slate-600">Email Address</span>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      {user?.email || "rahul@example.com"}
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-green-600">Verified</span>
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Information</h3>
                <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-slate-600">Customer ID</span><span className="text-sm font-bold text-slate-900">NM-CUST-XXXXXX</span></div>
                  <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-slate-600">Member Since</span><span className="text-sm font-bold text-slate-900">September 2026</span></div>
                  <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-slate-600">Account Status</span><span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Active</span></div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Communication</h3>
                <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-slate-700">Order Updates</span><span className="text-xs font-black uppercase tracking-[0.16em] text-slate-800">ON</span></div>
                  <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-slate-700">Offers & Promotions</span><span className="text-xs font-black uppercase tracking-[0.16em] text-slate-800">ON</span></div>
                  <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-slate-700">WhatsApp Updates</span><span className="text-xs font-black uppercase tracking-[0.16em] text-slate-800">ON</span></div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <button type="button" onClick={() => setShowPrivacySecurity(true)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                    <span className="flex items-center gap-3 text-sm font-bold text-slate-800"><span className="text-primary">🔒</span> Privacy & Security</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>
                <button type="button" onClick={handleLogout} className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-red-600">
                  Delete Account
                </button>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

function ProfileMenuSection({ title, items }: { title: string; items: Array<{ label: string; icon: typeof User; action: () => void }> }) {
  return <section><h2 className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h2><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{items.map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-slate-100 px-4 text-left last:border-0 hover:bg-slate-50"><span className="flex items-center gap-3 text-sm font-bold text-slate-800"><Icon size={17} className="text-primary" />{label}</span><ChevronRight size={16} className="text-slate-400" /></button>)}</div></section>;
}

export default UserProfile;

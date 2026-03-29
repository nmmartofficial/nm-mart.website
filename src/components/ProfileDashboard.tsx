import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, CircleHelp as HelpCircle, X, ChevronRight, Mail, Phone, Calendar, MapPin, Bell, Shield, LogOut, Package, Gift, CreditCard, Star, MessageCircle, CreditCard as Edit2, Save, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORT_EMAIL, HELPLINE, MEMBERSHIP_FEE, MEMBERSHIP_VALUE } from "@/lib/store-utils";

interface ProfileData {
  full_name: string;
  mobile: string;
  email: string;
  date_of_birth: string;
  member_id: string;
  member_since: string;
  profile_image_url?: string;
}

interface MembershipData {
  membership_fee: number;
  membership_value: number;
  remaining_value: number;
  is_active: boolean;
  expires_at: string;
  loyalty_points: number;
}

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
}

interface Address {
  id: string;
  address_type: string;
  full_address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface ProfileDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDashboard = ({ isOpen, onClose }: ProfileDashboardProps) => {
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "support">("profile");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: true,
    whatsapp_notifications: true,
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const [profileRes, membershipRes, settingsRes, addressesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("loyalty_memberships").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as ProfileData);
        setEditedProfile(profileRes.data as ProfileData);
      } else {
        const newProfile = {
          user_id: user.id,
          full_name: user.email?.split("@")[0] || "User",
          mobile: user.phone || "",
          email: user.email || "",
          date_of_birth: null,
        };
        const { data } = await supabase.from("profiles").insert(newProfile).select().single();
        if (data) {
          setProfile(data as ProfileData);
          setEditedProfile(data as ProfileData);
        }
      }

      if (membershipRes.data) {
        setMembership(membershipRes.data as MembershipData);
      }

      if (settingsRes.data) {
        setSettings(settingsRes.data as UserSettings);
      } else {
        const newSettings = {
          user_id: user.id,
          notifications_enabled: true,
          email_notifications: true,
          sms_notifications: true,
          whatsapp_notifications: true,
        };
        await supabase.from("user_settings").insert(newSettings);
        setSettings(newSettings);
      }

      if (addressesRes.data) {
        setAddresses(addressesRes.data as Address[]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!userId || !profile) return;
    try {
      await supabase.from("profiles").update(editedProfile).eq("user_id", userId);
      setProfile({ ...profile, ...editedProfile });
      setEditMode(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const updateSettings = async (key: keyof UserSettings, value: boolean) => {
    if (!userId) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await supabase.from("user_settings").update({ [key]: value }).eq("user_id", userId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    window.location.href = "/";
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card z-50 flex flex-col shadow-2xl"
      >
        <div className="gradient-navy text-primary-foreground p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">My Dashboard</h2>
              <p className="text-xs opacity-80">Manage your account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border bg-muted/30">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={16} /> My Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "settings"
                ? "text-primary border-b-2 border-primary bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings size={16} /> Settings
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "support"
                ? "text-primary border-b-2 border-primary bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HelpCircle size={16} /> Support
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {activeTab === "profile" && profile && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-2xl font-black">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-black">{profile.full_name}</h3>
                          <p className="text-xs opacity-80">Member since {new Date(profile.member_since).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Gift className="text-[hsl(var(--secondary))]" size={28} />
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-bold opacity-80">Digital Member ID</span>
                        <CreditCard size={16} className="opacity-80" />
                      </div>
                      <p className="text-3xl font-black tracking-wider">{profile.member_id}</p>
                    </div>
                  </div>

                  {membership && (
                    <div className="bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--secondary))]/80 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm uppercase tracking-wider font-bold opacity-90">Loyalty Membership</h4>
                          <p className="text-2xl font-black mt-1">Premium Active</p>
                        </div>
                        <Star size={32} fill="white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                          <p className="text-xs opacity-80">Shopping Value</p>
                          <p className="text-xl font-black">₹{membership.remaining_value}</p>
                        </div>
                        <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                          <p className="text-xs opacity-80">Loyalty Points</p>
                          <p className="text-xl font-black">{membership.loyalty_points}</p>
                        </div>
                      </div>
                      <p className="text-xs mt-4 opacity-80">Expires: {new Date(membership.expires_at).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <User size={18} /> Personal Information
                      </h4>
                      {!editMode ? (
                        <button
                          onClick={() => setEditMode(true)}
                          className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-bold"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      ) : (
                        <button
                          onClick={saveProfile}
                          className="text-[hsl(var(--success))] hover:text-[hsl(var(--success))]/80 flex items-center gap-1 text-sm font-bold"
                        >
                          <Save size={14} /> Save
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User size={16} className="text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                          {editMode ? (
                            <input
                              type="text"
                              value={editedProfile.full_name || ""}
                              onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                              className="w-full bg-muted rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="font-bold text-foreground">{profile.full_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone size={16} className="text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Mobile Number</p>
                          {editMode ? (
                            <input
                              type="tel"
                              value={editedProfile.mobile || ""}
                              onChange={(e) => setEditedProfile({ ...editedProfile, mobile: e.target.value })}
                              className="w-full bg-muted rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="font-bold text-foreground">{profile.mobile}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail size={16} className="text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                          <p className="font-bold text-foreground">{profile.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                          {editMode ? (
                            <input
                              type="date"
                              value={editedProfile.date_of_birth || ""}
                              onChange={(e) => setEditedProfile({ ...editedProfile, date_of_birth: e.target.value })}
                              className="w-full bg-muted rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="font-bold text-foreground">
                              {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "Not set"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                      <MapPin size={18} /> Delivery Addresses
                    </h4>
                    {addresses.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No addresses saved yet</p>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="bg-muted rounded-xl p-4">
                            {addr.is_default && (
                              <span className="text-[10px] font-bold text-primary uppercase mb-2 inline-block">Default</span>
                            )}
                            <p className="text-sm font-bold text-foreground">{addr.full_address}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                      <Bell size={18} /> Notification Preferences
                    </h4>
                    <div className="space-y-4">
                      {[
                        { key: "notifications_enabled" as const, label: "All Notifications", icon: Bell },
                        { key: "email_notifications" as const, label: "Email Notifications", icon: Mail },
                        { key: "sms_notifications" as const, label: "SMS Notifications", icon: MessageCircle },
                        { key: "whatsapp_notifications" as const, label: "WhatsApp Notifications", icon: MessageCircle },
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <Icon size={16} className="text-muted-foreground" />
                            <span className="text-sm font-bold text-foreground">{label}</span>
                          </div>
                          <button
                            onClick={() => updateSettings(key, !settings[key])}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings[key] ? "bg-[hsl(var(--success))]" : "bg-muted"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                settings[key] ? "translate-x-7" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
                      <Shield size={18} /> Account Security
                    </h4>
                    <div className="space-y-3">
                      <button className="w-full bg-muted hover:bg-muted/80 text-foreground py-3 rounded-xl text-sm font-bold transition-colors text-left px-4 flex items-center justify-between">
                        <span>Change Password</span>
                        <ChevronRight size={16} />
                      </button>
                      <button className="w-full bg-muted hover:bg-muted/80 text-foreground py-3 rounded-xl text-sm font-bold transition-colors text-left px-4 flex items-center justify-between">
                        <span>Two-Factor Authentication</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-destructive text-destructive-foreground py-4 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </motion.div>
              )}

              {activeTab === "support" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                    <h3 className="text-lg font-black mb-2">Need Help?</h3>
                    <p className="text-sm opacity-90">We are here to assist you 24/7</p>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                    <h4 className="font-bold text-foreground mb-4">Contact Information</h4>

                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail size={20} className="text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Email Support</p>
                        <p className="font-bold text-foreground">{SUPPORT_EMAIL}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </a>

                    <a
                      href={`tel:${HELPLINE}`}
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Helpline Number</p>
                        <p className="font-bold text-foreground">{HELPLINE}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </a>

                    <a
                      href={`https://wa.me/${HELPLINE.replace(/\+/g, "")}?text=Hi NM Mart, I need help with my account.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--success))] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">WhatsApp Support</p>
                        <p className="font-bold text-foreground">Chat with us</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </a>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h4 className="font-bold text-foreground mb-4">Quick Help Topics</h4>
                    <div className="space-y-2">
                      {[
                        "Order Status & Tracking",
                        "Payment & Refunds",
                        "Membership Benefits",
                        "Delivery Information",
                        "Product Issues",
                        "Account Management",
                      ].map((topic, i) => (
                        <button
                          key={i}
                          className="w-full text-left py-3 px-4 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-colors flex items-center justify-between"
                        >
                          <span>{topic}</span>
                          <ChevronRight size={14} className="text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ProfileDashboard;

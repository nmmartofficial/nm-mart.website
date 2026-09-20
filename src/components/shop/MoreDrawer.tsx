import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CircleHelp,
  Gift,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  User,
  Wallet,
  X,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const sections = [
  {
    title: "Account",
    items: [
      { label: "My Profile", icon: User, to: "/profile" },
      { label: "Delivery Addresses", icon: MapPin, to: "/addresses" },
      { label: "Wallet & Credits", icon: Wallet, to: "/wallet" },
    ],
  },
  {
    title: "Orders",
    items: [{ label: "My Orders", icon: Wallet, to: "/orders" }],
  },
  {
    title: "Help",
    items: [
      { label: "Help & Support", icon: Phone, to: "/contact" },
      { label: "FAQs", icon: CircleHelp, to: "/faq" },
    ],
  },
  {
    title: "Settings",
    items: [{ label: "Settings", icon: Settings, to: "/settings" }],
  },
] as const;

interface MoreDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MoreDrawer({ open, onClose }: MoreDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const showUnavailable = (label: string) => {
    toast.info(`${label} is coming soon.`);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Unable to logout");
      return;
    }
    onClose();
    navigate("/login", { replace: true });
  };

  if (!open) return null;

  return (
    <>
      <button type="button" onClick={onClose} className="fixed inset-0 z-[60] bg-slate-950/30 backdrop-blur-[2px]" aria-label="Close More menu" />
      <aside
        id="more-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-drawer-title"
        className="fixed right-3 top-3 bottom-3 z-[70] flex w-[min(86vw,320px)] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-[#fdfaf5] shadow-[0_20px_60px_rgba(15,23,42,0.24)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">NM MART</p>
            <h2 id="more-drawer-title" className="mt-0.5 text-xl font-black uppercase tracking-[-0.06em] text-slate-900">More</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100" aria-label="Close More menu">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-3 py-3 [scrollbar-width:thin]">
          <div className="space-y-3">
            {sections.map((section) => (
              <section key={section.title}>
                <h3 className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{section.title}</h3>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#fffdfb]">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = Boolean(item.to && location.pathname === item.to);
                    const content = (
                      <>
                        <span className="flex min-w-0 items-center gap-3">
                          <Icon size={17} className={`shrink-0 ${isActive ? "text-slate-900" : "text-primary"}`} />
                          <span className={`truncate text-[13px] font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>{item.label}</span>
                        </span>
                        <ChevronRight size={15} className="shrink-0 text-slate-400" />
                      </>
                    );

                    return item.to ? (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 px-3.5 last:border-0 transition-all duration-200 ${
                          isActive ? "bg-slate-100" : "hover:bg-slate-50 active:bg-slate-100"
                        }`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => showUnavailable(item.label)}
                        className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-slate-100 px-3.5 text-left last:border-0 transition-all duration-200 hover:bg-slate-50 active:bg-slate-100"
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            <section className="pb-1">
              <h3 className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Action</h3>
              {user ? (
                <button type="button" onClick={handleLogout} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-red-100 bg-white px-3.5 text-left text-red-600 hover:bg-red-50 active:bg-red-100">
                  <span className="flex items-center gap-3 text-[13px] font-bold"><LogOut size={17} /> Logout</span>
                  <ChevronRight size={15} className="text-red-300" />
                </button>
              ) : (
                <Link to="/login" onClick={onClose} className="flex min-h-12 items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3.5 text-primary hover:bg-primary/10 active:bg-primary/15">
                  <span className="flex items-center gap-3 text-[13px] font-bold"><LogIn size={17} /> Login</span>
                  <ChevronRight size={15} className="text-blue-300" />
                </Link>
              )}
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Package,
  Layout as LayoutIcon,
  LogOut,
  ChevronRight,
  Database,
  Bell,
  Heart,
  Gift,
  Palette,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

import InventoryTab from "@/components/admin/InventoryTab";
import OrdersTab from "@/components/admin/OrdersTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import BannerManager from "@/components/admin/BannerManager";
import CategoryManager from "@/components/admin/CategoryManager";
import LayoutManager from "@/components/admin/LayoutManager";
import HighlightsManager from "@/components/admin/HighlightsManager";
import WelfareTab from "@/components/admin/WelfareTab";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inventory");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    toast.info("Logged out from Admin Panel");
  };

  const menuItems = [
    { id: "dashboard", label: "Analytics", icon: BarChart3, color: "text-cyan-500", bg: "bg-cyan-50", action: () => navigate("/admin/dashboard") },
    { id: "customize", label: "Live Customizer", icon: Palette, color: "text-rose-500", bg: "bg-rose-50", action: () => navigate("/admin/customize") },
    { id: "inventory", label: "Inventory", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "orders", label: "Orders", icon: ShoppingBag, color: "text-green-500", bg: "bg-green-50" },
    { id: "categories", label: "Categories", icon: LayoutIcon, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "banners", label: "Banners", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
    { id: "highlights", label: "Highlights", icon: Gift, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "layout", label: "Homepage Layout", icon: Database, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "welfare", label: "Loyalty & Welfare", icon: Users, color: "text-pink-500", bg: "bg-pink-50" },
    { id: "settings", label: "Store Settings", icon: Settings, color: "text-gray-500", bg: "bg-gray-50" },
  ];

  return (
    <div className="relative z-[200] flex min-h-dvh min-h-screen flex-col bg-[#F8FAFC] lg:flex-row">
      {/* Mobile / tablet: sticky top bar + horizontal tabs (does not consume full viewport height) */}
      <header className="sticky top-0 z-[210] flex flex-shrink-0 flex-col border-b border-slate-200 bg-white shadow-sm lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <LayoutDashboard size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black uppercase italic leading-none text-slate-900">Admin</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Control Center</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-wider text-slate-900 shadow-sm"
            >
              Store
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <nav
          className="flex gap-2 overflow-x-auto px-3 pb-3 pt-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Admin sections"
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => item.action ? item.action() : setActiveTab(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-tight transition-all ${
                activeTab === item.id
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon size={14} className={activeTab === item.id ? "text-white" : item.color} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside className="z-[205] hidden h-screen w-72 flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:sticky lg:top-0">
        <div className="border-b border-slate-100 p-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase italic leading-none">Admin</h1>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Control Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => item.action ? item.action() : setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-2xl p-3.5 transition-all ${
                activeTab === item.id
                  ? "translate-x-1 bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 transition-colors ${activeTab === item.id ? "bg-white/20" : item.bg}`}>
                  <item.icon size={18} className={activeTab === item.id ? "text-white" : item.color} />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={16} className="opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
          >
            <div className="rounded-xl bg-red-100 p-2">
              <LogOut size={18} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content: scrollable; on mobile sits below compact nav so nothing is covered */}
      <main className="relative z-[100] flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-4 pb-8 lg:z-auto lg:p-10">
        <header className="mb-8 flex flex-col justify-between gap-4 md:mb-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black uppercase italic leading-tight text-slate-900 md:text-3xl">
              {menuItems.find((i) => i.id === activeTab)?.label}
            </h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400 md:text-sm">
              NM Mart Manjhanpur Operations
            </p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-400 shadow-sm transition-all hover:text-primary"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
              <div className="mx-2 hidden h-10 w-px bg-slate-200 lg:block" />
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm transition-all hover:border-primary"
            >
              View Store
            </button>
          </div>
        </header>

        <div className="w-full min-w-0">
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "banners" && <BannerManager />}
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "layout" && <LayoutManager />}
          {activeTab === "highlights" && <HighlightsManager />}
          {activeTab === "welfare" && <WelfareTab />}
        </div>
      </main>
    </div>
  );
};

export default Admin;

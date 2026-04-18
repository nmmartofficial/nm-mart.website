import { useState, useEffect } from "react";
import { 
  LayoutDashboard, ShoppingBag, Users, BarChart3, Settings, 
  Package, Layout as LayoutIcon, LogOut, ChevronRight,
  Database, Bell, MessageSquare, Heart, Gift
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = localStorage.getItem("nm_admin_session");
      if (session !== "true") {
        navigate("/login");
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("nm_admin_session");
    navigate("/login");
    toast.info("Logged out from Admin Panel");
  };

  const menuItems = [
    { id: "inventory", label: "Inventory", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "orders", label: "Orders", icon: ShoppingBag, color: "text-green-500", bg: "bg-green-50" },
    { id: "categories", label: "Categories", icon: LayoutIcon, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "banners", label: "Banners", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
    { id: "highlights", label: "Highlights", icon: Gift, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "layout", label: "Homepage Layout", icon: Database, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "welfare", label: "Loyalty & Welfare", icon: Users, color: "text-pink-500", bg: "bg-pink-50" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-cyan-500", bg: "bg-cyan-50" },
    { id: "settings", label: "Store Settings", icon: Settings, color: "text-gray-500", bg: "bg-gray-50" },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="font-black italic uppercase text-lg leading-none">Admin</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Control Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? "bg-white/20" : item.bg}`}>
                  <item.icon size={18} className={activeTab === item.id ? "text-white" : item.color} />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={16} className="opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <div className="p-2 bg-red-100 rounded-xl">
              <LogOut size={18} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black italic uppercase text-slate-900 leading-tight">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
              NM Mart Manjhanpur Operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
              <Bell size={20} />
            </button>
            <div className="h-10 w-px bg-slate-200 mx-2 hidden md:block" />
            <button 
              onClick={() => navigate("/")}
              className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-primary transition-all shadow-sm flex items-center gap-2"
            >
              View Store
            </button>
          </div>
        </header>

        <div className="w-full">
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

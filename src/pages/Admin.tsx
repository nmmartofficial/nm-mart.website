import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, ShoppingBag, Users, TrendingUp, 
  Package, CheckCircle, Clock, ChevronRight, Settings 
} from "lucide-react";

// --- डमी डेटा (इसे बाद में Google Sheet से कनेक्ट करेंगे) ---
const weeklySales = [
  { day: 'Mon', total: 4200 },
  { name: 'Tue', total: 3800 },
  { name: 'Wed', total: 5600 },
  { name: 'Thu', total: 4900 },
  { name: 'Fri', total: 7200 },
  { name: 'Sat', total: 9100 },
  { name: 'Sun', total: 8500 },
];

const hotItems = [
  { name: 'Dry Fruits', value: 45 },
  { name: 'Cooking Oil', value: 25 },
  { name: 'Rice & Pulses', value: 20 },
  { name: 'Snacks', value: 10 },
];

const COLORS = ['#FF8C00', '#FFA500', '#FFD700', '#CC7000'];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            NM <span className="text-[#FF8C00]">ADMIN</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px] mt-1">Store Control Center</p>
        </div>
        <div className="flex gap-2 bg-[#111] p-1 rounded-2xl border border-white/5">
          <button className="px-6 py-2 bg-[#FF8C00] text-black rounded-xl font-black text-[10px] uppercase">Dashboard</button>
          <button className="px-6 py-2 text-gray-500 font-black text-[10px] uppercase hover:text-white">Settings</button>
        </div>
      </div>

      {/* 2. Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Revenue", value: "₹18,450", icon: TrendingUp, color: "text-green-500" },
          { label: "Pending Orders", value: "12", icon: Clock, color: "text-yellow-500" },
          { label: "Total Customers", value: "1,240", icon: Users, color: "text-blue-500" },
          { label: "Stock Alerts", value: "05 Items", icon: Package, color: "text-red-500" },
        ].map((item, i) => (
          <div key={i} className="bg-[#1a1a1a] p-6 rounded-[30px] border border-white/5 hover:border-[#FF8C00]/20 transition-all group">
            <item.icon size={20} className={`${item.color} mb-3`} />
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{item.label}</p>
            <h2 className="text-2xl font-black mt-1 group-hover:scale-105 transition-transform">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* 3. Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-[#1a1a1a] p-6 rounded-[40px] border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[2px] text-gray-400">Weekly Sales Analytics</h3>
            <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400 font-bold uppercase tracking-widest">LIVE</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="day" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '15px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,140,0,0.05)' }}
                />
                <Bar dataKey="total" fill="#FF8C00" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Pie (Takes 1 column) */}
        <div className="bg-[#1a1a1a] p-6 rounded-[40px] border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase tracking-[2px] text-gray-400 mb-4">Hot Categories</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={hotItems} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                  {hotItems.map((entry, index) => (
                    <Cell

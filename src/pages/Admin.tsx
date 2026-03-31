import { useState } from "react";
import { 
  LayoutDashboard, ShoppingBag, Users, TrendingUp, 
  Package, Clock, ChevronRight, ArrowUpRight 
} from "lucide-react";

const Admin = () => {
  // डमी डेटा - चार्ट के लिए (बिना लाइब्रेरी वाला जुगाड़)
  const salesHistory = [
    { day: 'M', height: '40%' },
    { day: 'T', height: '30%' },
    { day: 'W', height: '60%' },
    { day: 'T', height: '45%' },
    { day: 'F', height: '80%' },
    { day: 'S', height: '95%' },
    { day: 'S', height: '85%' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            NM <span className="text-[#FF8C00]">ADMIN</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px]">Dukan Control Panel</p>
        </div>
        <div className="flex gap-2 bg-[#111] p-1 rounded-2xl border border-white/5">
          <button className="px-6 py-2 bg-[#FF8C00] text-black rounded-xl font-black text-[10px] uppercase">Dashboard</button>
          <button className="px-6 py-2 text-gray-500 font-black text-[10px] uppercase">Settings</button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Sale", value: "₹18,450", color: "text-orange-500" },
          { label: "New Orders", value: "12", color: "text-white" },
          { label: "Total Members", value: "1,240", color: "text-white" },
          { label: "Low Stock", value: "05", color: "text-red-500" },
        ].map((item, i) => (
          <div key={i} className="bg-[#111] p-5 rounded-[25px] border border-white/5">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">{item.label}</p>
            <h2 className={`text-xl font-black ${item.color}`}>{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Custom Sales Chart (No Library Needed) */}
        <div className="lg:col-span-2 bg-[#111] p-6 rounded-[35px] border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-8">Weekly Sales Analytics</h3>
          <div className="flex items-end justify-between h-48 gap-2 px-2">
            {salesHistory.map((item, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div 
                  style={{ height: item.height }} 
                  className="w-full max-w-[30px] bg-[#FF8C00]/20 group-hover:bg-[#FF8C00] rounded-t-lg transition-all duration-500 relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[9px] font-bold bg-white text-black px-2 py-1 rounded">
                    {item.height}
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 font-bold mt-4">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Top Products List */}
        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-6">Top Selling</h3>
          <div className="space-y-4">
            {['Dry Fruits', 'Refined Oil', 'Basmati Rice'].map((prod, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-black rounded-2xl border border-white/5">
                <span className="text-xs font-bold">{prod}</span>
                <ArrowUpRight size={14} className="text-[#FF8C00]" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Order Management Table */}
        <div className="lg:col-span-3 bg-[#111] rounded-[35px] border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Recent Customer Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black text-gray-600 text-[9px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Bill</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {[1, 2, 3].map((order) => (
                  <tr key={order} className="border-t border-white/5">
                    <td className="px-6 py-5 font-black italic text-[#FF8C00]">#NMM-{100 + order}</td>
                    <td className="px-6 py-5">Customer {order}</td>
                    <td className="px-6 py-5">
                      <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">Pending</span>
                    </td>
                    <td className="px-6 py-5 text-right font-black">₹{850 * order}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;

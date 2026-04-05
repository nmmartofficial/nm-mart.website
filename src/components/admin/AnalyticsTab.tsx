import { BarChart3, IndianRupee, Package, User } from "lucide-react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import React from "react";

const AnalyticsTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <BarChart3 size={24} />
        </div>
        Business Analytics
      </h3>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Today\'s Revenue', value: '₹0', trend: '0%', icon: IndianRupee },
          { label: 'Total Orders', value: '0', trend: '0%', icon: Package },
          { label: 'Active Customers', value: '0', trend: '0%', icon: User },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">
                <stat.icon size={24} />
              </div>
              <span className="text-gray-400 text-[10px] font-black italic">{stat.trend}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{stat.label}</p>
              <h5 className="text-3xl font-black text-black italic">{stat.value}</h5>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm h-[400px]">
        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[4px] mb-8 italic">Revenue Overview</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[
            { day: 'Mon', revenue: 0 },
            { day: 'Tue', revenue: 0 },
            { day: 'Wed', revenue: 0 },
            { day: 'Thu', revenue: 0 },
            { day: 'Fri', revenue: 0 },
            { day: 'Sat', revenue: 0 },
            { day: 'Sun', revenue: 0 },
          ]}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsTab;

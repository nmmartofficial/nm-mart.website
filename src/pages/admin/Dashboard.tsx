import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, ShoppingBag, TrendingUp, Eye, 
  ArrowUpRight, ArrowDownRight, Package, Clock,
  BarChart3, PieChart, Activity
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "../../lib/supabase/schema";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalVisitors: 1250, // Mock for now
    activeUsers: 45,
    pendingOrders: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: orderCount } = await supabase.from(TABLES.orders).select('*', { count: 'exact', head: true });
      const { data: salesData } = await supabase.from(TABLES.orders).select('total_amount');
      
      const sales = (salesData || []).reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalOrders: orderCount || 0,
        totalSales: sales
      }));
    };
    fetchStats();
  }, []);

  const data = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const categoryData = [
    { name: 'Grocery', value: 400 },
    { name: 'Beverages', value: 300 },
    { name: 'Snacks', value: 300 },
    { name: 'Personal Care', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">NM Mart Analytics</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Store performance & visitor insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Sales</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <TrendingUp size={16} className="text-emerald-500 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">₹{stats.totalSales.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight size={12} /> +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Orders</CardTitle>
            <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <ShoppingBag size={16} className="text-blue-500 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats.totalOrders}</div>
            <p className="text-[10px] text-blue-500 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight size={12} /> +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Store Visitors</CardTitle>
            <div className="p-2 bg-purple-50 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Users size={16} className="text-purple-500 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats.totalVisitors}</div>
            <p className="text-[10px] text-purple-500 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight size={12} /> +18.7% increase
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Now</CardTitle>
            <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Activity size={16} className="text-rose-500 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats.activeUsers}</div>
            <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1 animate-pulse">
              Live on site
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">Sales Overview</CardTitle>
            <CardDescription>Daily sales performance for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} fontStyle="bold" />
                <YAxis fontSize={10} fontStyle="bold" />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">Popular Categories</CardTitle>
            <CardDescription>Order distribution by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

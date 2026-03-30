import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Search, Calculator, TrendingUp, Users, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { getOrderHistory } from "@/lib/store-utils";

const ADMIN_PIN = "1234";

const Admin = () => {
  const navigate = useNavigate();
  const { allProducts, loading } = useProducts();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [profitQuery, setProfitQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Invalid PIN. Try again.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  // Profit calculator: search products and show MRP vs Sale Rate
  const profitResults = useMemo(() => {
    if (!profitQuery) return [];
    const q = profitQuery.toLowerCase();
    return allProducts
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 20)
      .map(p => ({
        ...p,
        profit: p.mrp - p.saleRate,
        margin: p.mrp > 0 ? Math.round(((p.mrp - p.saleRate) / p.mrp) * 100) : 0,
      }));
  }, [profitQuery, allProducts]);

  const orders = getOrderHistory();
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-primary tracking-tight">🔐 Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-1">NM Mart Owner Dashboard</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <input
              type="password"
              placeholder="Enter Admin PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-secondary rounded-xl py-4 px-4 font-bold text-foreground text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {pinError && <p className="text-destructive text-xs font-bold text-center">{pinError}</p>}
            <button onClick={handleLogin}
              className="w-full gradient-orange text-white py-4 rounded-xl font-black text-sm uppercase">
              Login
            </button>
            <button onClick={() => navigate("/")} className="w-full text-xs text-muted-foreground font-bold hover:underline text-center">
              ← Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-secondary rounded-lg"><ArrowLeft size={20} /></button>
            <span className="font-black text-primary text-lg">🛡️ Admin Dashboard</span>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 gradient-orange text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh Data
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <TrendingUp size={20} />, label: "Total Products", value: loading ? "..." : allProducts.length.toLocaleString() },
            { icon: <Users size={20} />, label: "Orders (Local)", value: orders.length },
            { icon: <Calculator size={20} />, label: "Revenue (Local)", value: `₹${totalRevenue.toLocaleString()}` },
            { icon: <TrendingUp size={20} />, label: "Avg Order", value: orders.length > 0 ? `₹${Math.round(totalRevenue / orders.length)}` : "—" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary mb-2">{s.icon}<span className="text-[10px] font-bold uppercase text-muted-foreground">{s.label}</span></div>
              <p className="text-2xl font-black text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Profit Calculator */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-black text-lg text-foreground flex items-center gap-2 mb-4">
            <Calculator size={20} className="text-primary" /> Profit Calculator
          </h2>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search product to see profit margin..."
              value={profitQuery}
              onChange={e => setProfitQuery(e.target.value)}
              className="w-full bg-secondary rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
          {profitResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-muted-foreground border-b border-border">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">MRP</th>
                    <th className="pb-2 pr-4">Sale Rate</th>
                    <th className="pb-2 pr-4">Profit</th>
                    <th className="pb-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {profitResults.map((p, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-xs font-medium text-foreground">{p.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">₹{p.mrp}</td>
                      <td className="py-2 pr-4 font-bold text-primary">₹{p.saleRate}</td>
                      <td className="py-2 pr-4 font-bold text-[hsl(var(--success))]">₹{p.profit}</td>
                      <td className="py-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.margin >= 30 ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]" : "bg-primary/20 text-primary"}`}>
                          {p.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-black text-lg text-foreground flex items-center gap-2 mb-4">
            <Users size={20} className="text-primary" /> Recent Orders (Local)
          </h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {orders.slice(0, 20).map((o, i) => (
                <div key={i} className="bg-secondary rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-foreground">{o.id}</p>
                    <p className="text-[10px] text-muted-foreground">{o.date} · {o.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground">₹{o.total}</p>
                    <span className="text-[9px] font-bold uppercase gradient-orange text-white px-2 py-0.5 rounded">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

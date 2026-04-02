import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Lock, ScanBarcode, LogOut, Database, Search, X, 
  TrendingUp, AlertCircle, Package, User, CreditCard, 
  ChevronRight, Star, MapPin, ShieldCheck, BarChart3, 
  FileDown, Printer, Truck, Clock, Loader2, RefreshCcw
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LOGO_URL = "https://i.postimg.cc/9XJ2GS8L/logo.jpg";
const SLOGAN = "Shop More, Save More";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("nm_admin_session") === "true";
  });
  const [activeTab, setActiveTab] = useState<'inventory' | 'welfare' | 'orders' | 'analytics'>('inventory');
  const [password, setPassword] = useState("");
  
  // Inventory States
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [mrp, setMrp] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  // Welfare States
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [welfareLoading, setWelfareLoading] = useState(false);

  // Orders States
  const [orders, setOrders] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("nm_admin_orders") || "[]"); } catch { return []; }
  });
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_PASS = "NMMART2026";
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqz2SMeKUmcyM8A6zXhSuRY6wloFk23SXTaYugHji4a_fl3iCeSeXh1_iAbcdT1IVotQ/exec";

  // Auto-focus barcode input
  useEffect(() => {
    if (isAuthenticated && activeTab === 'inventory' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isAuthenticated, activeTab]);

  // Sample analytics data
  const dailySalesData = [
    { day: 'Mon', revenue: 12500 },
    { day: 'Tue', revenue: 18200 },
    { day: 'Wed', revenue: 15800 },
    { day: 'Thu', revenue: 22100 },
    { day: 'Fri', revenue: 19500 },
    { day: 'Sat', revenue: 28700 },
    { day: 'Sun', revenue: 24300 },
  ];

  const topProducts = [
    { name: 'Tata Salt 1kg', sales: 145, color: '#222e3b' },
    { name: 'Parle-G Biscuit', sales: 132, color: '#334155' },
    { name: 'Amul Butter 500g', sales: 98, color: '#1e293b' },
    { name: 'Surf Excel 1kg', sales: 87, color: '#0f172a' },
    { name: 'Maggi Noodles', sales: 76, color: '#334155' },
  ];

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
      localStorage.setItem("nm_admin_session", "true");
      toast.success("Welcome back, Admin!");
    } else {
      toast.error("Invalid Admin PIN");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("nm_admin_session");
    toast.info("Logged out from NM Mart Dashboard");
  };

  const fetchProductDetails = (code: string) => {
    if (!code) return;
    setFetchingProduct(true);
    const callbackName = 'nmmart_callback_' + Math.round(100000 * Math.random());
    (window as any)[callbackName] = (data: any) => {
      if (data && data.name && data.name !== "Product Not Found") {
        setProductName(data.name);
        setMrp(data.mrp || "");
        setSalePrice(data.salePrice || "");
        setDiscount(data.discount || "");
        if (navigator.vibrate) navigator.vibrate(100);
        toast.success(`Found: ${data.name}`);
      } else {
        toast.error("Product not found in database");
      }
      setFetchingProduct(false);
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?action=getProduct&barcode=${code}&callback=${callbackName}`;
    document.body.appendChild(script);
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !productName || !salePrice) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    
    const callbackName = 'nmmart_callback_' + Math.round(100000 * Math.random());
    (window as any)[callbackName] = (data: any) => {
      if (data.status === "success") {
        toast.success("Inventory updated successfully!");
        setBarcode(""); setProductName(""); setMrp(""); setSalePrice(""); setDiscount("");
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
      } else {
        toast.error("Failed to update inventory");
      }
      setLoading(false);
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    const params = new URLSearchParams({
      action: 'updateInventory',
      barcode, productName, mrp, salePrice, discount,
      callback: callbackName
    });
    script.src = `${SCRIPT_URL}?${params.toString()}`;
    document.body.appendChild(script);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-gray-100 p-10 rounded-[40px] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-sm">
              <ShieldCheck size={40} />
            </div>
            
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black mb-2">
              Admin <span className="text-primary">Terminal</span>
            </h2>
            <p className="text-gray-400 uppercase tracking-[4px] font-bold text-[10px] mb-10">
              Authorized Personnel Only
            </p>

            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Access PIN</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold tracking-[0.5em]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              <button 
                onClick={handleLogin}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-sm active:scale-95"
              >
                Enter Dashboard
              </button>
            </div>
          </div>
        </div>
        <p className="mt-8 text-[10px] text-gray-400 font-black uppercase tracking-[4px] italic">© 2026 NM Mart Retail OS v5.0.2</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">
              NM <span className="text-primary">ADMIN</span>
            </h1>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[2px] mt-1 italic">{SLOGAN}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          {[
            { id: 'inventory', label: 'Inventory', icon: ScanBarcode },
            { id: 'welfare', label: 'Welfare', icon: Star },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? "bg-white text-primary shadow-sm" 
                : "text-gray-400 hover:text-black"
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto gap-2 p-4 bg-white border-b border-gray-100 scrollbar-hide">
        {[
          { id: 'inventory', label: 'Inventory', icon: ScanBarcode },
          { id: 'welfare', label: 'Welfare', icon: Star },
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${
              activeTab === tab.id 
              ? "bg-primary text-white" 
              : "bg-white text-gray-400 border border-gray-100"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'inventory' && (
          <div className="grid lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Section */}
            <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <ScanBarcode size={24} />
                  </div>
                  Update Inventory
                </h3>
                <button 
                  onClick={() => setIsScanning(!isScanning)}
                  className={`p-3 rounded-2xl transition-all shadow-sm ${isScanning ? "bg-red-500 text-white" : "bg-primary text-white hover:bg-black"}`}
                >
                  <ScanBarcode size={20} />
                </button>
              </div>

              <form onSubmit={handleInventorySubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Barcode / Product Code</label>
                  <div className="relative group">
                    <input 
                      ref={barcodeInputRef}
                      type="text" 
                      placeholder="SCAN OR TYPE CODE"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold tracking-widest text-sm"
                      value={barcode}
                      onChange={(e) => {
                        setBarcode(e.target.value);
                        if (e.target.value.length >= 8) fetchProductDetails(e.target.value);
                      }}
                    />
                    {fetchingProduct && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={20} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="ENTER PRODUCT NAME"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">MRP (₹)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Sale Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm text-primary"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-3 italic"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Database size={18} /> Update Store Database
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Activity / Status Section */}
            <div className="space-y-8">
              <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[4px] mb-8 italic">System Status</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <TrendingUp size={24} className="text-green-500 mb-4" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Database Sync</p>
                    <h5 className="text-xl font-black text-black italic">Connected</h5>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <AlertCircle size={24} className="text-primary mb-4" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Low Stock Alert</p>
                    <h5 className="text-xl font-black text-black italic">12 Items</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would follow same theme... */}
        {activeTab !== 'inventory' && (
          <div className="py-20 text-center space-y-4 bg-white border border-gray-100 rounded-[40px] shadow-sm">
            <Loader2 className="animate-spin text-primary mx-auto" size={40} />
            <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">Loading {activeTab} module...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

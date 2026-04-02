import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Lock, ScanBarcode, LogOut, Database, Search, X, 
  TrendingUp, AlertCircle, Package, User, CreditCard, 
  ChevronRight, Star, MapPin, ShieldCheck, BarChart3, 
  FileDown, Printer, Truck, Clock, Loader2, RefreshCcw,
  CheckCircle2, IndianRupee, Trash2, FileUp
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/store-utils";
import * as XLSX from "xlsx";

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
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  // Welfare States
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [welfareLoading, setWelfareLoading] = useState(false);

  // Orders States
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_PASS = "NMMART2026";

  // Auto-focus barcode input
  useEffect(() => {
    if (isAuthenticated && activeTab === 'inventory' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isAuthenticated, activeTab]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error("The file is empty");
          setIsImporting(false);
          return;
        }

        // Map Excel columns to database fields
        const productsToInsert = jsonData.map((row: any) => ({
          barcode: String(row.Barcode || row.barcode || row.ID || ""),
          name: row.Name || row.name || row.Product || "",
          mrp: Number(row.MRP || row.mrp || row.Price || 0),
          saleRate: Number(row.SaleRate || row.saleRate || row.SalePrice || row.Price || 0),
          category: row.Category || row.category || "General",
          subCategory: row.SubCategory || row.subCategory || "",
          imageUrl: row.Image || row.imageUrl || row.image || "",
          stock: row.Stock || row.stock || "in-stock",
          discount: Number(row.Discount || row.discount || 0),
          updated_at: new Date().toISOString()
        })).filter(p => p.barcode && p.name);

        if (productsToInsert.length === 0) {
          toast.error("No valid products found in file (Need Barcode and Name)");
          setIsImporting(false);
          return;
        }

        const { error } = await supabase
          .from('inventory')
          .upsert(productsToInsert, { onConflict: 'barcode' });

        if (error) throw error;

        toast.success(`Successfully imported ${productsToInsert.length} products!`);
      } catch (err: any) {
        console.error("Import error:", err);
        toast.error("Failed to import products: " + err.message);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Order ${status}`);
      fetchOrders();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

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

  const fetchProductDetails = async (code: string) => {
    if (!code) return;
    setFetchingProduct(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('barcode', code)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProductName(data.name);
        setMrp(data.mrp || "");
        setSalePrice(data.saleRate || "");
        setDiscount(data.discount || "");
        setCategory(data.category || "");
        setSubCategory(data.subCategory || "");
        setImageUrl(data.imageUrl || "");
        if (navigator.vibrate) navigator.vibrate(100);
        toast.success(`Found: ${data.name}`);
      } else {
        // Clear fields if not found, except barcode
        setProductName(""); setMrp(""); setSalePrice(""); setDiscount("");
        setCategory(""); setSubCategory(""); setImageUrl("");
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !productName || !salePrice) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('inventory')
        .upsert({
          barcode,
          name: productName,
          mrp: Number(mrp),
          saleRate: Number(salePrice),
          discount: Number(discount),
          category,
          subCategory,
          imageUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'barcode' });

      if (error) throw error;

      toast.success("Inventory updated successfully!");
      setBarcode(""); setProductName(""); setMrp(""); setSalePrice(""); setDiscount("");
      setCategory(""); setSubCategory(""); setImageUrl("");
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    } catch (err: any) {
      console.error("Error updating inventory:", err);
      toast.error("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSearch = async () => {
    if (!customerSearch) return;
    setWelfareLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`mobile.eq.${customerSearch},full_name.ilike.%${customerSearch}%`)
        .maybeSingle();

      if (error) throw error;
      setCustomerData(data);
      if (!data) toast.error("Customer not found");
    } catch (err: any) {
      toast.error("Error searching customer");
    } finally {
      setWelfareLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!customerData || !pointsToAdd) return;
    setWelfareLoading(true);
    try {
      const newPoints = (customerData.loyalty_points || 0) + Number(pointsToAdd);
      const { error } = await supabase
        .from('profiles')
        .update({ loyalty_points: newPoints })
        .eq('id', customerData.id);

      if (error) throw error;
      setCustomerData({ ...customerData, loyalty_points: newPoints });
      setPointsToAdd("");
      toast.success(`Added ${pointsToAdd} points!`);
    } catch (err: any) {
      toast.error("Failed to update points");
    } finally {
      setWelfareLoading(false);
    }
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
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    {isImporting ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                    <span className="hidden sm:inline">Import Excel</span>
                  </button>
                  <button 
                    onClick={() => setIsScanning(!isScanning)}
                    className={`p-3 rounded-2xl transition-all shadow-sm ${isScanning ? "bg-red-500 text-white" : "bg-primary text-white hover:bg-black"}`}
                  >
                    <ScanBarcode size={20} />
                  </button>
                </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Category</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Snacks"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Sub-Category</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Biscuits"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Image URL</label>
                  <input 
                    type="text" 
                    placeholder="PASTE IMAGE LINK"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
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

        {activeTab === 'welfare' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
              <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Star size={24} />
                </div>
                NM Welfare Points
              </h3>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    type="text" 
                    placeholder="SEARCH BY PHONE OR NAME"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomerSearch()}
                  />
                </div>
                <button 
                  onClick={handleCustomerSearch}
                  disabled={welfareLoading}
                  className="bg-black text-white px-8 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary transition-all shadow-sm"
                >
                  {welfareLoading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
                </button>
              </div>

              {customerData && (
                <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-8 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-black italic uppercase text-black">{customerData.full_name}</h4>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic">{customerData.mobile}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-1">Current Points</p>
                      <p className="text-4xl font-black text-primary italic leading-none">{customerData.loyalty_points || 0}</p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-gray-200 my-6"></div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Add Points</label>
                      <input 
                        type="number" 
                        placeholder="ENTER POINTS TO ADD"
                        className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={handleAddPoints}
                      disabled={welfareLoading || !pointsToAdd}
                      className="bg-primary text-white h-[58px] px-10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-sm"
                    >
                      Update Points
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Package size={24} />
                </div>
                Live Orders
              </h3>
              <button 
                onClick={fetchOrders}
                className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-all shadow-sm"
              >
                <RefreshCcw size={20} className={ordersLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {ordersLoading ? (
              <div className="py-20 text-center space-y-4 bg-white border border-gray-100 rounded-[40px] shadow-sm">
                <Loader2 className="animate-spin text-primary mx-auto" size={40} />
                <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">Fetching new orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white border border-gray-100 rounded-[40px] shadow-sm">
                <Package className="text-gray-200 mx-auto" size={60} />
                <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs italic">No orders found</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase italic">#{order.id}</span>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase italic ${
                            order.status === 'Delivered' ? 'bg-green-50 text-green-500' : 
                            order.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-gray-300 text-[10px] font-bold uppercase italic">
                            {new Date(order.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="text-xl font-black italic uppercase text-black">{order.customer_name}</h4>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic flex items-center gap-1">
                            <Phone size={10} /> {order.customer_phone}
                          </p>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic flex items-center gap-1">
                            <MapPin size={10} /> {order.shipping_address}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Order Items:</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                              <div key={i} className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl text-[10px] font-bold text-gray-500 italic">
                                {item.name} x {item.qty}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-1">Order Total</p>
                          <p className="text-3xl font-black text-primary italic leading-none">₹{order.total}</p>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                            className="bg-gray-50 hover:bg-orange-50 hover:text-orange-500 text-gray-400 p-3 rounded-2xl transition-all"
                            title="Mark Out for Delivery"
                          >
                            <Truck size={20} />
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="bg-gray-50 hover:bg-green-50 hover:text-green-500 text-gray-400 p-3 rounded-2xl transition-all"
                            title="Mark Delivered"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                            className="bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 p-3 rounded-2xl transition-all"
                            title="Cancel Order"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <BarChart3 size={24} />
              </div>
              Business Analytics
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: 'Today\'s Revenue', value: '₹42,500', trend: '+12%', icon: IndianRupee },
                { label: 'Total Orders', value: '156', trend: '+8%', icon: Package },
                { label: 'Active Customers', value: '1,240', trend: '+5%', icon: User },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">
                      <stat.icon size={24} />
                    </div>
                    <span className="text-green-500 text-[10px] font-black italic">{stat.trend}</span>
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
                  { day: 'Mon', revenue: 12500 },
                  { day: 'Tue', revenue: 18200 },
                  { day: 'Wed', revenue: 15800 },
                  { day: 'Thu', revenue: 22100 },
                  { day: 'Fri', revenue: 19500 },
                  { day: 'Sat', revenue: 28700 },
                  { day: 'Sun', revenue: 24300 },
                ]}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}
                  />
                  <Bar dataKey="revenue" fill="#facc15" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;


import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Lock, ScanBarcode, LogOut, Database, Search, X, 
  TrendingUp, AlertCircle, Package, User, CreditCard, 
  ChevronRight, Star, MapPin, ShieldCheck, BarChart3, 
  FileDown, Printer, Truck
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
    { name: 'Tata Salt 1kg', sales: 145, color: '#FF8C00' },
    { name: 'Parle-G Biscuit', sales: 132, color: '#FFB347' },
    { name: 'Amul Butter 500g', sales: 98, color: '#FF6B00' },
    { name: 'Surf Excel 1kg', sales: 87, color: '#E67E00' },
    { name: 'Maggi Noodles', sales: 76, color: '#CC7000' },
  ];

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
      localStorage.setItem("nm_admin_session", "true");
      toast.success("Welcome, Abdul Bhai!");
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
        toast.error("Product Not Found in Database");
      }
      setFetchingProduct(false);
      cleanupJSONP(callbackName);
    };
    injectJSONP(callbackName, `${SCRIPT_URL}?action=getProduct&barcode=${code.trim()}&callback=${callbackName}`);
  };

  const fetchCustomerDetails = () => {
    if (!customerSearch) return;
    setWelfareLoading(true);
    const callbackName = 'nmmart_cust_' + Math.round(100000 * Math.random());
    (window as any)[callbackName] = (data: any) => {
      if (data && data.name) {
        setCustomerData(data);
        toast.success(`Welcome Back, ${data.name}!`);
      } else {
        toast.error("Customer Not Found!");
        setCustomerData(null);
      }
      setWelfareLoading(false);
      cleanupJSONP(callbackName);
    };
    injectJSONP(callbackName, `${SCRIPT_URL}?action=getCustomer&id=${customerSearch.trim()}&callback=${callbackName}`);
  };

  const injectJSONP = (id: string, src: string) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    document.body.appendChild(script);
  };

  const cleanupJSONP = (id: string) => {
    delete (window as any)[id];
    const scriptTag = document.getElementById(id);
    if (scriptTag) document.body.removeChild(scriptTag);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) { console.error(err); }
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
          (decodedText) => {
            setBarcode(decodedText);
            fetchProductDetails(decodedText); 
            stopScanner();
          },
          () => {}
        );
      } catch (err) {
        toast.error("Camera Error: Please allow camera access.");
        setIsScanning(false);
      }
    }, 300);
  };

  const handleInventoryUpdate = async () => {
    if (!barcode || !productName) return toast.error("Product details incomplete!");
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        body: JSON.stringify({ action: "upsertProduct", barcode, name: productName, mrp, salePrice, discount }),
      });
      toast.success("Inventory Sync Successful!");
      setBarcode(""); setProductName(""); setMrp(""); setSalePrice(""); setDiscount("");
    } catch (err) { toast.error("Cloud Sync Failed!"); }
    setLoading(false);
  };

  const handlePointsUpdate = async () => {
    if (!customerData || !pointsToAdd) return;
    setWelfareLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "updatePoints", id: customerSearch, points: pointsToAdd }),
      });
      toast.success("Points Added to Wallet!");
      setPointsToAdd("");
      fetchCustomerDetails();
    } catch (err) { toast.error("Failed to update points"); }
    setWelfareLoading(false);
  };

  const updateOrderStatus = (idx: number) => {
    const updated = [...orders];
    updated[idx].status = "Delivered";
    setOrders(updated);
    localStorage.setItem("nm_admin_orders", JSON.stringify(updated));
    toast.success("Order marked as Delivered!");
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Mobile", "Items", "Total", "Status", "Date"];
    const rows = orders.map((o: any) => [
      o.id, o.customer || "Walk-in", o.mobile || "-", 
      (o.items || []).map((i: any) => `${i.name}x${i.qty}`).join("; "),
      o.total, o.status, o.date
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map((c: any) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `NM_Mart_Orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("CSV Downloaded!");
  };

  const printReceipt = (order: any) => {
    const receiptWindow = window.open("", "_blank", "width=300,height=600");
    if (!receiptWindow) return;
    receiptWindow.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: monospace; width: 280px; margin: 0 auto; padding: 10px; font-size: 12px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
        @media print { body { width: 58mm; } }
      </style></head><body>
      <div class="center bold" style="font-size:16px">NM MART</div>
      <div class="center" style="font-size:10px">Manjhanpur, Kaushambi, UP</div>
      <div class="center" style="font-size:10px">Ph: 7081154604</div>
      <div class="line"></div>
      <div><b>Order:</b> ${order.id}</div>
      <div><b>Date:</b> ${order.date}</div>
      <div><b>Customer:</b> ${order.customer || "Walk-in"}</div>
      <div class="line"></div>
      <table>
        <tr><td class="bold">Item</td><td class="bold right">Qty</td><td class="bold right">Amt</td></tr>
        ${(order.items || []).map((i: any) => `<tr><td>${i.name}</td><td class="right">${i.qty}</td><td class="right">₹${i.saleRate * i.qty}</td></tr>`).join("")}
      </table>
      <div class="line"></div>
      <div class="bold right" style="font-size:14px">Total: ₹${order.total}</div>
      <div class="line"></div>
      <div class="center" style="font-size:10px;margin-top:10px">Thank you for shopping at NM Mart!</div>
      <div class="center" style="font-size:9px">Shop More, Save More ❤️</div>
      <script>window.print();</script>
      </body></html>
    `);
    receiptWindow.document.close();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#0A0A0A] p-10 rounded-[40px] border border-white/5 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8C00] to-transparent opacity-50"></div>
          <div className="bg-[#FF8C00]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#FF8C00]/20">
            <Lock className="text-[#FF8C00]" size={32} />
          </div>
          <h2 className="text-3xl font-black italic mb-2 text-white tracking-tighter uppercase">NM <span className="text-[#FF8C00]">CONTROL</span></h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px] mb-10">Authorized Access Only</p>
          <div className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="ENTER ADMIN PIN"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00] transition-all text-white font-black tracking-[10px] placeholder:tracking-normal placeholder:font-bold" />
            <button onClick={handleLogin}
              className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#FF8C00]/20 hover:brightness-110">
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'inventory', icon: Database, label: 'Inventory' },
    { id: 'welfare', icon: CreditCard, label: 'Welfare' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans pb-24 selection:bg-[#FF8C00]/30">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <a href="/" className="w-12 h-12 bg-[#FF8C00] rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-[#FF8C00]/20">
            <h1 className="text-2xl font-black text-black italic">NM</h1>
          </a>
          <div>
            <a href="/" className="no-underline"><h1 className="text-2xl font-black italic tracking-tighter uppercase leading-tight text-white">NM <span className="text-[#FF8C00]">MART</span></h1></a>
            <div className="flex items-center gap-2 text-[9px] text-gray-500 font-black uppercase tracking-[2px]">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Terminal Active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-[#111] p-2 pl-4 rounded-2xl border border-white/5 shadow-xl">
          <div className="text-right">
            <p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-tighter">Admin - Abdul</p>
            <p className="text-[8px] text-gray-500 font-bold uppercase">NMM-2026-001 | Manjhanpur</p>
          </div>
          <div className="w-10 h-10 bg-black rounded-xl border border-white/10 flex items-center justify-center text-[#FF8C00]"><User size={20} /></div>
          <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all"><LogOut size={18}/></button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Tab Switcher - 4 tabs */}
        <div className="flex p-1.5 bg-[#111] rounded-[22px] border border-white/5 w-full max-w-2xl mb-10 shadow-inner overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-3 ${activeTab === tab.id ? 'bg-[#FF8C00] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ─── INVENTORY TAB ─── */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ScanBarcode size={120} /></div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#FF8C00] flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-[#FF8C00]/30"></div> Stock Management
                  </h3>
                  {fetchingProduct && (
                    <div className="flex items-center gap-2 text-[10px] text-[#FF8C00] font-black animate-pulse">
                      <div className="w-2 h-2 bg-[#FF8C00] rounded-full animate-bounce"></div> Fetching...
                    </div>
                  )}
                </div>

                <div className="space-y-6 relative">
                  <div className="relative">
                    {!isScanning ? (
                      <button onClick={startScanner} className="w-full h-48 border-2 border-dashed border-white/10 rounded-[35px] flex flex-col items-center justify-center gap-4 bg-black/40 hover:bg-[#FF8C00]/5 transition-all group/scan overflow-hidden">
                        <div className="bg-white/5 p-4 rounded-2xl group-hover/scan:scale-110 transition-transform"><ScanBarcode className="text-gray-500 group-hover/scan:text-[#FF8C00]" size={40} /></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[3px]">Tap to Launch Scanner</span>
                      </button>
                    ) : (
                      <div className="relative overflow-hidden rounded-[35px] border-2 border-[#FF8C00]/40 shadow-2xl shadow-[#FF8C00]/10">
                        <div id="reader" className="w-full bg-black min-h-[300px]"></div>
                        <button onClick={stopScanner} className="absolute top-6 right-6 bg-red-500 p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all"><X size={20}/></button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1 group/input">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${fetchingProduct ? 'text-[#FF8C00] animate-spin' : 'text-gray-600 group-focus-within/input:text-[#FF8C00]'}`} size={18}/>
                        <input ref={barcodeInputRef} type="text" value={barcode}
                          onChange={(e) => { const val = e.target.value; setBarcode(val); if (val.length === 13) fetchProductDetails(val); }}
                          maxLength={15} placeholder="Scan or Type Barcode..."
                          className="w-full bg-black border border-white/5 p-6 pl-14 rounded-2xl text-[#FF8C00] font-black outline-none focus:ring-4 ring-[#FF8C00]/5 transition-all placeholder:text-gray-700 disabled:opacity-50" disabled={fetchingProduct} />
                      </div>
                      <button onClick={() => fetchProductDetails(barcode)} disabled={fetchingProduct || !barcode}
                        className="px-8 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-[#FF8C00] transition-colors disabled:opacity-50">Search</button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase px-4 tracking-widest">Product Name</label>
                      <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Fetch or enter name..."
                        className="w-full bg-black border border-white/5 p-6 rounded-2xl outline-none focus:border-[#FF8C00]/40 text-white font-bold transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 font-black uppercase px-4 tracking-widest">MRP</label>
                        <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)}
                          className="w-full bg-black border border-white/5 p-6 rounded-2xl outline-none focus:border-white/20 text-white font-bold transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#FF8C00] font-black uppercase px-4 tracking-widest">Sale Rate</label>
                        <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)}
                          className="w-full bg-black border border-[#FF8C00]/20 p-6 rounded-2xl text-[#FF8C00] font-black outline-none focus:ring-4 ring-[#FF8C00]/5 transition-all" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase px-4 tracking-widest">Discount %</label>
                      <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g. 50"
                        className="w-full bg-black border border-white/5 p-6 rounded-2xl outline-none focus:border-[#FF8C00]/40 text-white font-bold transition-all" />
                    </div>

                    <button onClick={handleInventoryUpdate} disabled={loading}
                      className="w-full bg-[#FF8C00] text-black font-black py-6 rounded-2xl uppercase text-xs tracking-[4px] active:scale-[0.98] transition-all mt-4 shadow-xl shadow-[#FF8C00]/10 flex items-center justify-center gap-3 hover:brightness-110">
                      {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <>Update Cloud Sync <ChevronRight size={18}/></>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] p-8 rounded-[35px] border border-white/5">
                  <div className="bg-green-500/10 p-3 rounded-2xl w-fit mb-4"><TrendingUp className="text-green-500" size={20}/></div>
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Today's Revenue</p>
                  <h2 className="text-3xl font-black italic tracking-tighter text-white">₹ --</h2>
                </div>
                <div className="bg-[#111] p-8 rounded-[35px] border border-white/5">
                  <div className="bg-red-500/10 p-3 rounded-2xl w-fit mb-4"><AlertCircle className="text-red-500" size={20}/></div>
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Low Stock Alert</p>
                  <h2 className="text-3xl font-black italic tracking-tighter text-white">0</h2>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#FF8C00] to-[#E67E00] p-8 rounded-[40px] text-black shadow-xl shadow-[#FF8C00]/10">
                <div className="flex items-center gap-3 mb-4"><MapPin size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Store Location</span></div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Manjhanpur Branch</h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Terminal #001-ADMIN</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── WELFARE TAB ─── */}
        {activeTab === 'welfare' && (
          <div className="max-w-3xl">
            <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 shadow-2xl space-y-8">
              <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#FF8C00] flex items-center gap-3">
                <div className="w-6 h-[1px] bg-[#FF8C00]/30"></div> Customer Welfare
              </h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18}/>
                  <input type="text" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Phone or Member ID..."
                    className="w-full bg-black border border-white/5 p-6 pl-14 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-[#FF8C00]/5 transition-all" />
                </div>
                <button onClick={fetchCustomerDetails} disabled={welfareLoading}
                  className="px-8 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-[#FF8C00] transition-colors disabled:opacity-50">Search</button>
              </div>

              {customerData ? (
                <div className="bg-black/50 border border-white/5 rounded-[30px] p-8 space-y-8 animate-in fade-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black italic tracking-tighter">{customerData.name}</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Member ID: {customerSearch}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 ${
                      customerData.level === 'Gold' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      customerData.level === 'Platinum' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      <Star size={12} fill="currentColor" /> {customerData.level}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Available Points</p>
                      <h4 className="text-2xl font-black text-[#FF8C00] italic">{customerData.points} PTS</h4>
                    </div>
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Total Savings</p>
                      <h4 className="text-2xl font-black text-green-500 italic">₹{customerData.savings || '0'}</h4>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <label className="text-[9px] text-gray-500 font-black uppercase px-2 tracking-widest mb-4 block">Quick Add Points</label>
                    <div className="flex gap-3">
                      <input type="number" value={pointsToAdd} onChange={(e) => setPointsToAdd(e.target.value)} placeholder="+ Points"
                        className="flex-1 bg-black border border-white/5 p-5 rounded-xl text-white font-bold outline-none focus:border-[#FF8C00]/40" />
                      <button onClick={handlePointsUpdate} disabled={welfareLoading || !pointsToAdd}
                        className="px-8 bg-[#FF8C00] text-black font-black rounded-xl uppercase text-[10px] tracking-widest hover:brightness-110 disabled:opacity-50">Update</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] border-2 border-dashed border-white/5 rounded-[30px] flex flex-col items-center justify-center text-center p-8">
                  <User className="text-gray-600 mb-6" size={32} />
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-[3px] mb-2">Customer Search</h4>
                  <p className="text-[10px] text-gray-600 italic">Enter a Phone Number or Membership ID</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── ORDERS TAB ─── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#FF8C00]">Order Management</h3>
              <div className="flex gap-3">
                <button onClick={exportToCSV} className="flex items-center gap-2 bg-[#111] border border-white/10 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#FF8C00]/50 transition-all">
                  <FileDown size={14} /> Export CSV
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-[#111] rounded-[40px] border border-white/5 p-16 text-center">
                <Package className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 font-black uppercase text-xs tracking-widest">No Orders Yet</p>
                <p className="text-[10px] text-gray-600 mt-2">Orders placed via WhatsApp will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any, idx: number) => (
                  <div key={idx} className="bg-[#111] rounded-[30px] border border-white/5 p-6 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[#FF8C00] font-black text-sm">{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-white font-bold text-sm">{order.customer || "Walk-in Customer"}</p>
                      <p className="text-gray-500 text-[10px]">📱 {order.mobile || "-"} • {order.date}</p>
                      <p className="text-[#FF8C00] font-black text-lg">₹{order.total}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status !== 'Delivered' && (
                        <button onClick={() => updateOrderStatus(idx)}
                          className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-black transition-all">
                          <Truck size={14} /> Mark Delivered
                        </button>
                      )}
                      <button onClick={() => printReceipt(order)}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase hover:border-[#FF8C00]/50 transition-all">
                        <Printer size={14} /> Print Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ANALYTICS TAB ─── */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Sales Revenue Chart */}
              <div className="bg-[#111] p-8 rounded-[40px] border border-white/5">
                <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#FF8C00] mb-6 flex items-center gap-3">
                  <div className="w-6 h-[1px] bg-[#FF8C00]/30"></div> Daily Sales Revenue
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dailySalesData}>
                    <XAxis dataKey="day" stroke="#555" fontSize={11} />
                    <YAxis stroke="#555" fontSize={11} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, color: '#fff', fontSize: 12 }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#FF8C00" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top 5 Selling Products */}
              <div className="bg-[#111] p-8 rounded-[40px] border border-white/5">
                <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#FF8C00] mb-6 flex items-center gap-3">
                  <div className="w-6 h-[1px] bg-[#FF8C00]/30"></div> Top 5 Products
                </h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie data={topProducts} dataKey="sales" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                        {topProducts.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span className="text-[10px] text-gray-400 font-bold flex-1 truncate">{p.name}</span>
                        <span className="text-[10px] text-white font-black">{p.sales}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-center">
              <button onClick={exportToCSV}
                className="flex items-center gap-3 bg-[#FF8C00] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#FF8C00]/20">
                <FileDown size={18} /> Export All Data to Excel (CSV)
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 p-4 flex items-center justify-center z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full animate-ping"></div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cloud Connected</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">v3.0.26</div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">© 2026 NM MART GROUP</div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

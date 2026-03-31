import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Lock, ScanBarcode, LogOut, Database, Search, X, 
  TrendingUp, AlertCircle, Package, User, CreditCard, 
  ChevronRight, Star, MapPin, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("nm_admin_session") === "true";
  });
  const [activeTab, setActiveTab] = useState<'inventory' | 'welfare'>('inventory');
  const [password, setPassword] = useState("");
  
  // Inventory States
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [mrp, setMrp] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  // Welfare States
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [welfareLoading, setWelfareLoading] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const ADMIN_PASS = "NMMART2026";
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqz2SMeKUmcyM8A6zXhSuRY6wloFk23SXTaYugHji4a_fl3iCeSeXh1_iAbcdT1IVotQ/exec";

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

  // --- 1. SMART FETCH (Inventory & Welfare) ---
  const fetchProductDetails = (code: string) => {
    if (!code) return;
    setFetchingProduct(true);
    const callbackName = 'nmmart_callback_' + Math.round(100000 * Math.random());
    (window as any)[callbackName] = (data: any) => {
      if (data && data.name && data.name !== "Product Not Found") {
        setProductName(data.name);
        setMrp(data.mrp || "");
        setSalePrice(data.salePrice || "");
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

  // --- 2. SCANNER CONTROLS ---
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

  // --- 3. SAVE / UPDATE ---
  const handleInventoryUpdate = async () => {
    if (!barcode || !productName) return toast.error("Product details incomplete!");
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        body: JSON.stringify({ 
          action: "upsertProduct", 
          barcode, 
          name: productName, 
          mrp, 
          salePrice 
        }),
      });
      toast.success("Inventory Sync Successful!");
      setBarcode(""); setProductName(""); setMrp(""); setSalePrice("");
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
        body: JSON.stringify({
          action: "updatePoints",
          id: customerSearch,
          points: pointsToAdd
        }),
      });
      toast.success("Points Added to Wallet!");
      setPointsToAdd("");
      fetchCustomerDetails(); // Refresh data
    } catch (err) { toast.error("Failed to update points"); }
    setWelfareLoading(false);
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
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="ENTER ADMIN PIN"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00] transition-all text-white font-black tracking-[10px] placeholder:tracking-normal placeholder:font-bold" 
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#FF8C00]/20 hover:brightness-110"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans pb-24 selection:bg-[#FF8C00]/30">
      
      {/* Header & Profile */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF8C00] rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-[#FF8C00]/20">
            <h1 className="text-2xl font-black text-black italic">NM</h1>
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">NM <span className="text-[#FF8C00]">MART</span></h1>
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
          <div className="w-10 h-10 bg-black rounded-xl border border-white/10 flex items-center justify-center text-[#FF8C00]">
            <User size={20} />
          </div>
          <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-[#111] rounded-[22px] border border-white/5 w-full max-w-md mb-10 shadow-inner relative overflow-hidden">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#FF8C00] rounded-2xl transition-all duration-300 ease-out shadow-lg shadow-[#FF8C00]/20 ${activeTab === 'welfare' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
          />
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'inventory' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
          >
            <Database size={14} /> Inventory
          </button>
          <button 
            onClick={() => setActiveTab('welfare')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'welfare' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
          >
            <CreditCard size={14} /> Welfare
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Action Area */}
          <div className="lg:col-span-7 space-y-6">
            {activeTab === 'inventory' ? (
              <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ScanBarcode size={120} />
                </div>
                
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#FF8C00] flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-[#FF8C00]/30"></div>
                    Stock Management
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
                        <div className="bg-white/5 p-4 rounded-2xl group-hover/scan:scale-110 transition-transform">
                          <ScanBarcode className="text-gray-500 group-hover/scan:text-[#FF8C00]" size={40} />
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[3px]">Tap to Launch Scanner</span>
                      </button>
                    ) : (
                      <div className="relative overflow-hidden rounded-[35px] border-2 border-[#FF8C00]/40 shadow-2xl shadow-[#FF8C00]/10">
                        <div id="reader" className="w-full bg-black min-h-[300px]"></div>
                        <button onClick={stopScanner} className="absolute top-6 right-6 bg-red-500 p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all">
                          <X size={20}/>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1 group/input">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${fetchingProduct ? 'text-[#FF8C00] animate-spin' : 'text-gray-600 group-focus-within/input:text-[#FF8C00]'}`} size={18}/>
                        <input 
                          type="text" 
                          value={barcode} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setBarcode(val);
                            if (val.length === 13) {
                              fetchProductDetails(val);
                            }
                          }} 
                          maxLength={15}
                          placeholder="Scan or Type Barcode..."
                          className="w-full bg-black border border-white/5 p-6 pl-14 rounded-2xl text-[#FF8C00] font-black outline-none focus:ring-4 ring-[#FF8C00]/5 transition-all placeholder:text-gray-700 disabled:opacity-50" 
                          disabled={fetchingProduct}
                        />
                      </div>
                      <button 
                        onClick={() => fetchProductDetails(barcode)}
                        disabled={fetchingProduct || !barcode}
                        className="px-8 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-[#FF8C00] transition-colors disabled:opacity-50"
                      >
                        Search
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase px-4 tracking-widest">Product Name</label>
                      <input 
                        type="text" 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value)} 
                        placeholder="Fetch or enter name..."
                        className="w-full bg-black border border-white/5 p-6 rounded-2xl outline-none focus:border-[#FF8C00]/40 text-white font-bold transition-all" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 font-black uppercase px-4 tracking-widest">MRP (Col E)</label>
                        <input 
                          type="number" 
                          value={mrp} 
                          onChange={(e) => setMrp(e.target.value)} 
                          className="w-full bg-black border border-white/5 p-6 rounded-2xl outline-none focus:border-white/20 text-white font-bold transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#FF8C00] font-black uppercase px-4 tracking-widest">Sale Rate (Col F)</label>
                        <input 
                          type="number" 
                          value={salePrice} 
                          onChange={(e) => setSalePrice(e.target.value)} 
                          className="w-full bg-black border border-[#FF8C00]/20 p-6 rounded-2xl text-[#FF8C00] font-black outline-none focus:ring-4 ring-[#FF8C00]/5 transition-all" 
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleInventoryUpdate} 
                      disabled={loading} 
                      className="w-full bg-[#FF8C00] text-black font-black py-6 rounded-2xl uppercase text-xs tracking-[4px] active:scale-[0.98] transition-all mt-4 shadow-xl shadow-[#FF8C00]/10 flex items-center justify-center gap-3 hover:brightness-110"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      ) : (
                        <>Update Cloud Sync <ChevronRight size={18}/></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 shadow-2xl space-y-8">
                <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#FF8C00] mb-2 flex items-center gap-3">
                  <div className="w-6 h-[1px] bg-[#FF8C00]/30"></div>
                  Customer Welfare
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18}/>
                      <input 
                        type="text" 
                        value={customerSearch} 
                        onChange={(e) => setCustomerSearch(e.target.value)} 
                        placeholder="Phone or Member ID..."
                        className="w-full bg-black border border-white/5 p-6 pl-14 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-[#FF8C00]/5 transition-all" 
                      />
                    </div>
                    <button 
                      onClick={fetchCustomerDetails}
                      disabled={welfareLoading}
                      className="px-8 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-[#FF8C00] transition-colors disabled:opacity-50"
                    >
                      Search
                    </button>
                  </div>

                  {customerData ? (
                    <div className="bg-black/50 border border-white/5 rounded-[30px] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-black italic tracking-tighter">{customerData.name}</h2>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Member ID: {customerSearch}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
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
                        <label className="text-[9px] text-gray-500 font-black uppercase px-2 tracking-widest mb-4 block">Quick Add Points (After Sale)</label>
                        <div className="flex gap-3">
                          <input 
                            type="number" 
                            value={pointsToAdd}
                            onChange={(e) => setPointsToAdd(e.target.value)}
                            placeholder="+ Points"
                            className="flex-1 bg-black border border-white/5 p-5 rounded-xl text-white font-bold outline-none focus:border-[#FF8C00]/40"
                          />
                          <button 
                            onClick={handlePointsUpdate}
                            disabled={welfareLoading || !pointsToAdd}
                            className="px-8 bg-[#FF8C00] text-black font-black rounded-xl uppercase text-[10px] tracking-widest hover:brightness-110 disabled:opacity-50"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] border-2 border-dashed border-white/5 rounded-[30px] flex flex-col items-center justify-center text-center p-8">
                      <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                        <User className="text-gray-600" size={32} />
                      </div>
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-[3px] mb-2">Customer Search</h4>
                      <p className="text-[10px] text-gray-600 max-w-[200px] leading-relaxed italic">
                        Enter a Phone Number or Membership ID to access customer profile and update welfare points.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-5 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#111] p-8 rounded-[35px] border border-white/5 group hover:border-[#FF8C00]/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-500/10 p-3 rounded-2xl">
                    <TrendingUp className="text-green-500" size={20}/>
                  </div>
                  <div className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md">LIVE</div>
                </div>
                <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Today's Revenue</p>
                <h2 className="text-3xl font-black italic tracking-tighter text-white">₹ --</h2>
              </div>
              
              <div className="bg-[#111] p-8 rounded-[35px] border border-white/5 group hover:border-red-500/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-red-500/10 p-3 rounded-2xl">
                    <AlertCircle className="text-red-500" size={20}/>
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Low Stock Alert</p>
                <h2 className="text-3xl font-black italic tracking-tighter text-white">0</h2>
              </div>
            </div>

            <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 relative overflow-hidden group min-h-[400px]">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,140,0,0.05),transparent)]"></div>
              <div className="relative flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Package className="text-gray-600 group-hover:text-[#FF8C00] transition-colors" size={45}/>
                </div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[4px] mb-4">NM Mart Database</h3>
                <p className="text-[10px] text-gray-600 italic max-w-[220px] leading-relaxed">
                  {activeTab === 'inventory' 
                    ? "Scanning a barcode automatically retrieves the latest price and inventory data from the master Google Sheet."
                    : "Welfare points are synchronized instantly with the customer loyalty database for real-time rewards."}
                </p>
                
                <div className="mt-12 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
                        <ShieldCheck size={12} className="text-[#FF8C00]"/>
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Cloud Secured</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FF8C00] to-[#E67E00] p-8 rounded-[40px] text-black shadow-xl shadow-[#FF8C00]/10">
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Store Location</span>
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Manjhanpur Branch</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Terminal #001-ADMIN</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 p-4 flex items-center justify-center z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full animate-ping"></div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cloud Connected</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">v2.0.26-ALPHA</div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">© 2026 NM MART GROUP</div>
        </div>
      </div>
    </div>
  );
};

export default Admin;


import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  LayoutDashboard, ShoppingBag, Users, TrendingUp, 
  Package, Clock, ChevronRight, ArrowUpRight, 
  Lock, ScanBarcode, LogOut, Camera, Database, Search, Save
} from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [mrp, setMrp] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Ref का टाइप सही किया ताकि Error न आए
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const ADMIN_PASS = "NMMART2026";
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHscMaUt3qDJs-k-lqjUXF18kA-7g7Jv7EkSQwIdNHTOKAOS363kYp9PX4eUVxNScw1w/exec";

  // --- 1. SMART FETCH (Barcode search hote hi details bharna) ---
  const handleBarcodeChange = async (val: string) => {
    setBarcode(val);
    if (val.length > 3) {
      try {
        const res = await fetch(`${SCRIPT_URL}?action=getProduct&barcode=${val}`);
        const data = await res.json();
        if (data && data.name) {
          setProductName(data.name);
          setMrp(data.mrp || "");
          setSalePrice(data.salePrice || "");
          if (navigator.vibrate) navigator.vibrate(50);
        }
      } catch (e) {
        console.log("New product entry required");
      }
    }
  };

  // --- 2. SCANNER LOGIC (iPhone & Auto-Stop) ---
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Stop Error:", err);
      }
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    // थोडा इंतज़ार ताकि 'reader' div लोड हो जाए
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 20, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            handleBarcodeChange(decodedText);
            stopScanner();
          },
          () => {}
        );
      } catch (err) {
        console.error("Scanner Start Error:", err);
        setIsScanning(false);
      }
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) stopScanner();
    };
  }, []);

  // --- 3. EXCEL UPDATE ---
  const handleUpdate = async () => {
    if (!barcode || !productName) return alert("Pehle Scan karein ya details bharein!");
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
      alert("NM Mart: Excel Updated!");
      setBarcode(""); setProductName(""); setMrp(""); setSalePrice("");
    } catch (err) { 
      alert("Server Error!"); 
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 text-center">
          <Lock className="text-[#FF8C00] mx-auto mb-6" size={32} />
          <h1 className="text-2xl font-black italic mb-8 text-[#FF8C00]">NM SECURE</h1>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Passcode"
            className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00] mb-4 text-white" 
          />
          <button 
            onClick={() => password === ADMIN_PASS ? setIsAuthenticated(true) : alert("Wrong Passcode!")} 
            className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase"
          >
            Login Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans pb-24">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">NM <span className="text-[#FF8C00]">CONTROL</span></h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px]">Dukan Operating System</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="px-6 py-2 bg-white/5 text-red-500 rounded-xl font-black text-[10px] border border-white/5 uppercase">Logout</button>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Sale", value: "₹18,450", color: "text-orange-500" },
          { label: "New Orders", value: "12", color: "text-white" },
          { label: "Members", value: "1,240", color: "text-white" },
          { label: "Low Stock", value: "05", color: "text-red-500" },
        ].map((item, i) => (
          <div key={i} className="bg-[#111] p-5 rounded-[25px] border border-white/5">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">{item.label}</p>
            <h2 className={`text-xl font-black ${item.color}`}>{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. SMART INVENTORY SECTION */}
        <div className="lg:col-span-1 bg-[#111] p-6 rounded-[35px] border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-6 flex items-center gap-2">
            <Database size={14} className="text-[#FF8C00]"/> Smart Inventory Entry
          </h3>

          <div className="space-y-5">
            {/* Scanner Area */}
            <div className="relative">
              {!isScanning ? (
                <button onClick={startScanner} className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#FF8C00]/5 transition-all group">
                  <ScanBarcode className="text-gray-600 group-hover:text-[#FF8C00]" size={32} />
                  <span className="text-[9px] font-bold text-gray-500 uppercase">Tap to Scan Barcode</span>
                </button>
              ) : (
                <div className="relative">
                  <div id="reader" className="w-full rounded-2xl bg-black min-h-[220px] overflow-hidden border border-[#FF8C00]/30"></div>
                  <button onClick={stopScanner} className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase">Cancel</button>
                </div>
              )}
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"/>
                <input 
                  type="text" 
                  value={barcode} 
                  onChange={(e) => handleBarcodeChange(e.target.value)} 
                  placeholder="Barcode Search/Type"
                  className="w-full bg-black border border-white/5 p-4 pl-10 rounded-xl text-[#FF8C00] font-black outline-none focus:border-[#FF8C00]/30" 
                />
              </div>

              <input 
                type="text" 
                value={productName} 
                onChange={(e) => setProductName(e.target.value)} 
                placeholder="Product Name"
                className="w-full bg-black border border-white/5 p-4 rounded-xl outline-none focus:border-[#FF8C00]/30" 
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-600 px-2 font-bold uppercase">MRP</span>
                  <input 
                    type="number" 
                    value={mrp} 
                    onChange={(e) => setMrp(e.target.value)} 
                    placeholder="₹"
                    className="w-full bg-black border border-white/5 p-4 rounded-xl outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-[#FF8C00] px-2 font-bold uppercase">Sale Rate</span>
                  <input 
                    type="number" 
                    value={salePrice} 
                    onChange={(e) => setSalePrice(e.target.value)} 
                    placeholder="₹"
                    className="w-full bg-black border border-[#FF8C00]/20 p-4 rounded-xl outline-none text-[#FF8C00] font-black" 
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdate} 
                disabled={loading} 
                className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-lg shadow-[#FF8C00]/10 active:scale-95 transition-all"
              >
                {loading ? "SYNCING..." : <><Save size={16}/> Sync to Excel</>}
              </button>
            </div>
          </div>
        </div>

        {/* 4. ANALYTICS & ACTIVITY */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[#111] p-6 rounded-[35px] border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-6 flex justify-between items-center">
                Live Sales Analytics <ArrowUpRight size={16} className="text-[#FF8C00]"/>
              </h3>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {[40, 30, 60, 45, 80, 95, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#FF8C00]/10 hover:bg-[#FF8C00] transition-all rounded-t-lg" style={{ height: `${h}%` }}></div>
                ))}
              </div>
           </div>

           <div className="bg-[#111] rounded-[35px] border border-white/5 overflow-hidden">
             <div className="p-5 border-b border-white/5 bg-white/5">
               <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">System Logs</h3>
             </div>
             <div className="p-8 text-center text-gray-600 text-xs italic">
               Manjhanpur Store Inventory Connected...
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
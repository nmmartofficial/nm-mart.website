import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Lock, ScanBarcode, LogOut, Database, Search, Save, X, 
  TrendingUp, AlertCircle, Package 
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
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const ADMIN_PASS = "NMMART2026";
  // आपकी सबसे नई Google Script URL (7 Columns वाली)
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzy6LX3hY6mTyp2zp0_E6xwmWHh6cPXkpU6HPrtvFLzhAR3jDe47WP1qXMls7mu0o593Q/exec";

  // --- 1. SMART FETCH (एक्सेल से डेटा उठाना) ---
  const fetchProductDetails = async (code: string) => {
    if (!code || code.length < 3) return;
    try {
      // action=getProduct अब Column B में बारकोड ढूंढेगा और A से नाम उठाएगा
      const res = await fetch(`${SCRIPT_URL}?action=getProduct&barcode=${code}`);
      const data = await res.json();
      
      if (data && data.name) {
        setProductName(data.name);
        setMrp(data.mrp || "");
        setSalePrice(data.salePrice || "");
        if (navigator.vibrate) navigator.vibrate(100);
      }
    } catch (e) {
      console.log("New entry detected");
    }
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
        alert("Camera Error: Safari Settings में Camera Allow करें।");
        setIsScanning(false);
      }
    }, 300);
  };

  // --- 3. SAVE / UPDATE ---
  const handleUpdate = async () => {
    if (!barcode || !productName) return alert("नाम और बारकोड ज़रूरी है!");
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
      alert("Network Error!"); 
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 text-center">
          <Lock className="text-[#FF8C00] mx-auto mb-6" size={32} />
          <h2 className="text-2xl font-black italic mb-8 text-[#FF8C00]">NM CONTROL</h2>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PIN"
            className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00] mb-4" />
          <button onClick={() => password === ADMIN_PASS ? setIsAuthenticated(true) : alert("Wrong!")} 
            className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase">Access</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 mt-4">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#FF8C00]">NM MART</h1>
        <button onClick={() => setIsAuthenticated(false)} className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20"><LogOut size={18}/></button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 shadow-xl space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 flex items-center gap-2">
            <Database size={14} className="text-[#FF8C00]"/> 7-Column Inventory Mode
          </h3>

          <div className="relative">
            {!isScanning ? (
              <button onClick={startScanner} className="w-full h-40 border-2 border-dashed border-white/10 rounded-[30px] flex flex-col items-center justify-center gap-3 bg-black/40 hover:bg-[#FF8C00]/5 transition-all group">
                <ScanBarcode className="text-gray-600 group-hover:text-[#FF8C00]" size={45} />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scan Barcode</span>
              </button>
            ) : (
              <div className="relative overflow-hidden rounded-[30px] border-2 border-[#FF8C00]/40">
                <div id="reader" className="w-full bg-black min-h-[250px]"></div>
                <button onClick={stopScanner} className="absolute top-4 right-4 bg-red-500 p-2 rounded-full"><X size={16}/></button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
              <input type="text" value={barcode} 
                onChange={(e) => { setBarcode(e.target.value); fetchProductDetails(e.target.value); }} 
                placeholder="Barcode (Column B)"
                className="w-full bg-black border border-white/5 p-5 pl-12 rounded-2xl text-[#FF8C00] font-black outline-none" />
            </div>

            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Item Name (Column A)"
              className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:border-[#FF8C00]/40" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] text-gray-500 font-black uppercase px-2">MRP (Col E)</label>
                <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="₹"
                  className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] text-[#FF8C00] font-black uppercase px-2">Sale (Col F)</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="₹"
                  className="w-full bg-black border border-[#FF8C00]/20 p-5 rounded-2xl text-[#FF8C00] font-black outline-none" />
              </div>
            </div>

            <button onClick={handleUpdate} disabled={loading} className="w-full bg-[#FF8C00] text-black font-black py-6 rounded-[25px] uppercase text-xs tracking-widest active:scale-95 transition-all">
              {loading ? "SAVING..." : "Update Inventory"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111] p-8 rounded-[35px] border border-white/5 flex flex-col items-center justify-center text-center h-full">
            <Package className="text-white/5 mb-4 animate-pulse" size={100}/>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Manjhanpur Store</h3>
            <p className="text-[10px] text-gray-600 mt-2 italic">Scanning B and fetching A, E, F...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

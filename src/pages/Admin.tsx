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
  
  // आपकी 100% वर्किंग वाली Google Script URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3GCP9pWl1D_qGfjeyu3cUpozhJBCHDth1F7NPVXWC69cQl5C_tDf_nh3ZNEL83HIfMg/exec";

  // --- 1. SMART FETCH (एक्सेल से डेटा खींचना - Column B से Barcode और A से Name) ---
  const fetchProductDetails = async (code: string) => {
    if (!code || code.length < 3) return;
    
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getProduct&barcode=${code}`, {
        method: "GET",
        mode: "cors",
        redirect: "follow", // Google Script के लिए यह बहुत ज़रूरी है
      });
      
      const data = await res.json();
      
      if (data && data.name) {
        setProductName(data.name);
        setMrp(data.mrp || "");
        setSalePrice(data.salePrice || "");
        if (navigator.vibrate) navigator.vibrate(100);
      } else {
        // अगर डेटा नहीं मिला तो पुराने फील्ड्स साफ़ न करें, शायद नई एंट्री हो
        console.log("Product not found in Excel yet.");
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  };

  // --- 2. SCANNER CONTROLS (iPhone & Android Fix) ---
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
          { 
            fps: 15, 
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0 
          },
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

  // --- 3. SAVE / UPDATE TO EXCEL ---
  const handleUpdate = async () => {
    if (!barcode || !productName) return alert("नाम और बारकोड ज़रूरी है!");
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Google Script POST के लिए ज़रूरी
        body: JSON.stringify({ 
          action: "upsertProduct", 
          barcode, 
          name: productName, 
          mrp, 
          salePrice 
        }),
      });
      alert("NM Mart: Excel Updated Successfully!");
      // सेव होने के बाद डिब्बे खाली करें
      setBarcode(""); setProductName(""); setMrp(""); setSalePrice("");
    } catch (err) { 
      alert("Network Error!"); 
    }
    setLoading(false);
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 text-center shadow-2xl">
          <Lock className="text-[#FF8C00] mx-auto mb-6" size={32} />
          <h2 className="text-2xl font-black italic mb-8 text-[#FF8C00] tracking-tighter uppercase">NM CONTROL LOGIN</h2>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Admin PIN"
            className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00] mb-4 text-white" 
          />
          <button 
            onClick={() => password === ADMIN_PASS ? setIsAuthenticated(true) : alert("Wrong PIN!")} 
            className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all"
          >
            Unlock Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans pb-24">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 mt-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">NM <span className="text-[#FF8C00]">MART</span></h1>
          <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-[2px]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Excel Connection
          </div>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:scale-90 transition-all">
          <LogOut size={18}/>
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: SCANNER & ENTRY FORM */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-6 flex items-center gap-2">
              <Database size={14} className="text-[#FF8C00]"/> 7-Column Inventory Mode (B=Barcode, A=Name)
            </h3>

            <div className="space-y-6">
              {/* Scanner Box */}
              <div className="relative">
                {!isScanning ? (
                  <button onClick={startScanner} className="w-full h-44 border-2 border-dashed border-white/10 rounded-[30px] flex flex-col items-center justify-center gap-3 bg-black/40 hover:bg-[#FF8C00]/5 transition-all group">
                    <ScanBarcode className="text-gray-600 group-hover:text-[#FF8C00]" size={45} />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Tap to Scan<br/>(iPhone & Android)</span>
                  </button>
                ) : (
                  <div className="relative overflow-hidden rounded-[30px] border-2 border-[#FF8C00]/40">
                    <div id="reader" className="w-full bg-black min-h-[250px]"></div>
                    <button onClick={stopScanner} className="absolute top-4 right-4 bg-red-500 p-2 rounded-full shadow-lg">
                      <X size={16}/>
                    </button>
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
                  <input 
                    type="text" 
                    value={barcode} 
                    onChange={(e) => {
                      setBarcode(e.target.value);
                      fetchProductDetails(e.target.value); // टाइप करते ही डेटा ढूँढे
                    }} 
                    placeholder="Scan or Type Barcode (Col B)"
                    className="w-full bg-black border border-white/5 p-5 pl-12 rounded-2xl text-[#FF8C00] font-black outline-none focus:ring-2 ring-[#FF8C00]/10" 
                  />
                </div>

                <input 
                  type="text" 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)} 
                  placeholder="Item Name (Col A)"
                  className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:border-[#FF8C00]/40 text-white" 
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 font-bold uppercase px-2 tracking-widest">MRP (Col E)</label>
                    <input 
                      type="number" 
                      value={mrp} 
                      onChange={(e) => setMrp(e.target.value)} 
                      placeholder="₹"
                      className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none text-white font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-[#FF8C00] font-bold uppercase px-2 tracking-widest">Sale Rate (Col F)</label>
                    <input 
                      type="number" 
                      value={salePrice} 
                      onChange={(e) => setSalePrice(e.target.value)} 
                      placeholder="₹"
                      className="w-full bg-black border border-[#FF8C00]/20 p-5 rounded-2xl text-[#FF8C00] font-black outline-none shadow-inner" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleUpdate} 
                  disabled={loading} 
                  className="w-full bg-[#FF8C00] text-black font-black py-6 rounded-[25px] shadow-xl shadow-[#FF8C00]/10 uppercase text-xs tracking-widest active:scale-95 transition-all mt-2"
                >
                  {loading ? "SAVING TO EXCEL..." : "Update Inventory"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: DASHBOARD LOGS */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] p-6 rounded-[30px] border border-white/5 group hover:border-[#FF8C00]/30 transition-all">
              <TrendingUp className="text-green-500 mb-2" size={20}/>
              <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Revenue</p>
              <h2 className="text-2xl font-black italic tracking-tighter">₹ LIVE</h2>
            </div>
            <div className="bg-[#111] p-6 rounded-[30px] border border-white/5 group hover:border-red-500/30 transition-all">
              <AlertCircle className="text-red-500 mb-2" size={20}/>
              <p className="text-[9px] text-gray-500 font-black uppercase mb-1 tracking-widest">Low Stock</p>
              <h2 className="text-2xl font-black italic tracking-tighter">--</h2>
            </div>
          </div>

          <div className="bg-[#111] p-8 rounded-[35px] border border-white/5 min-h-[350px] flex flex-col items-center justify-center text-center">
            <Package className="text-white/5 mb-4 animate-bounce" size={80}/>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">NM Mart Database</h3>
            <p className="text-[10px] text-gray-600 mt-2 italic max-w-[200px]">
              Type Barcode `8901719119248` to test. Name and Rates will be fetched from Excel automatically.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;

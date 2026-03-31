import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Lock, ScanBarcode, Save, Camera, LogOut, TrendingUp, ShoppingBag, Users, Package } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_PASS = "NMMART2026"; // आपका पासवर्ड
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHscMaUt3qDJs-k-lqjUXF18kA-7g7Jv7EkSQwIdNHTOKAOS363kYp9PX4eUVxNScw1w/exec";

  // --- 1. Barcode Scanner Logic ---
  useEffect(() => {
    if (isAuthenticated) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 150 } 
      }, false);

      scanner.render((result) => {
        setBarcode(result);
        scanner.clear(); // स्कैन होने के बाद कैमरा बंद
        alert("Barcode Scanned: " + result);
      }, (err) => { /* ignore error */ });

      return () => scanner.clear();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === ADMIN_PASS) setIsAuthenticated(true);
    else alert("गलत पासवर्ड!");
  };

  const handleUpdate = async () => {
    if (!barcode) return alert("बारकोड गायब है!");
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "updateFullProduct", barcode, newPrice: price, newImage: imageUrl }),
      });
      alert("NM Mart: Excel Updated!");
      setBarcode(""); setPrice(""); setImageUrl("");
    } catch (err) { alert("Error!"); }
    setLoading(false);
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#FF8C00]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF8C00]/20">
            <Lock className="text-[#FF8C00]" size={24} />
          </div>
          <h1 className="text-2xl font-black italic mb-8 uppercase">NM <span className="text-[#FF8C00]">SECURE</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin Password"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00]" />
            <button type="submit" className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase">Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-20">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-black italic">NM <span className="text-[#FF8C00]">CONTROL</span></h1>
        <button onClick={() => setIsAuthenticated(false)} className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20"><LogOut size={18}/></button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-[#111] p-4 rounded-3xl border border-white/5">
          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Today's Sale</p>
          <h3 className="text-lg font-black text-[#FF8C00]">₹18,450</h3>
        </div>
        <div className="bg-[#111] p-4 rounded-3xl border border-white/5">
          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">New Orders</p>
          <h3 className="text-lg font-black text-white">12</h3>
        </div>
      </div>

      {/* MOBILE SCANNER AREA */}
      <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 mb-6">
        <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[2px]">Step 1: Scan Barcode</h3>
        <div id="reader" className="overflow-hidden rounded-2xl border border-white/10 bg-black mb-4"></div>
        <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scanned ID appears here"
          className="w-full bg-black border border-white/5 p-4 rounded-xl text-xs text-[#FF8C00] font-bold outline-none" />
      </div>

      {/* DATA UPDATE AREA */}
      <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 mb-6 space-y-4">
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[2px]">Step 2: Update Info</h3>
        <div>
          <label className="text-[9px] font-black uppercase text-gray-600 ml-2">Sale Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter New Rate"
            className="w-full bg-black border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#FF8C00]" />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-gray-600 ml-2">Image Link (URL)</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste Photo Link"
            className="w-full bg-black border border-white/5 p-4 rounded-xl text-[10px] outline-none" />
        </div>
      </div>

      {/* FINAL SAVE BUTTON */}
      <button onClick={handleUpdate} disabled={loading}
        className="w-full bg-[#FF8C00] text-black font-black py-6 rounded-[30px] shadow-lg shadow-[#FF8C00]/20 active:scale-95 transition-all">
        {loading ? "SYNCING TO EXCEL..." : "SAVE TO NM MART SHEET"}
      </button>
    </div>
  );
};

export default Admin;

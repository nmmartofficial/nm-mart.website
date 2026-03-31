import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
// यहाँ सब कुछ सही से लिखा है ताकि एरर न आए
import { Lock, ScanBarcode, Save, LogOut, Camera } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_PASS = "NMMART2026"; 
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHscMaUt3qDJs-k-lqjUXF18kA-7g7Jv7EkSQwIdNHTOKAOS363kYp9PX4eUVxNScw1w/exec";

  useEffect(() => {
    if (isAuthenticated) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 150 } 
      }, false);

      scanner.render((result) => {
        setBarcode(result);
      }, (err) => { });

      return () => scanner.clear();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === ADMIN_PASS) setIsAuthenticated(true);
    else alert("गलत पासवर्ड!");
  };

  const handleUpdate = async () => {
    if (!barcode) return alert("पहले बारकोड स्कैन करें!");
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ 
          action: "updateFullProduct", 
          barcode, 
          newPrice: price, 
          newImage: imageUrl 
        }),
      });
      alert("NM Mart: Excel Updated!");
      setBarcode(""); setPrice(""); setImageUrl("");
    } catch (err) {
      alert("Error Updating Data!");
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 text-center shadow-2xl">
          <Lock className="text-[#FF8C00] mx-auto mb-6" size={32} />
          <h1 className="text-2xl font-black italic mb-8 uppercase tracking-tighter">NM <span className="text-[#FF8C00]">SECURE</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin Password"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00] transition-all" />
            <button type="submit" className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase tracking-widest hover:scale-95 transition-all">Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-black italic">NM <span className="text-[#FF8C00]">CONTROL</span></h1>
        <button onClick={() => setIsAuthenticated(false)} className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20"><LogOut size={18}/></button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 text-center">
          <div id="reader" className="overflow-hidden rounded-2xl border border-white/10 bg-black mb-4"></div>
          <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Barcode ID"
            className="w-full bg-black border border-white/5 p-4 rounded-xl text-xs text-[#FF8C00] font-bold outline-none" />
        </div>
        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 space-y-4">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="New Sale Price ₹"
            className="w-full bg-black border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#FF8C00]" />
          <div className="flex gap-2">
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image Link"
              className="flex-1 bg-black border border-white/5 p-4 rounded-xl text-[10px] outline-none" />
            <button className="p-4 bg-white/5 rounded-xl hover:bg-white/10"><Camera size={16}/></button>
          </div>
          <button onClick={handleUpdate} disabled={loading} className="w-full bg-[#FF8C00] text-black font-bold py-6 rounded-[30px] shadow-lg shadow-[#FF8C00]/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
            {loading ? "SYNCING..." : "UPDATE NM MART INVENTORY"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
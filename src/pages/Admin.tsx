import { useState, useEffect } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
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
        fps: 30, 
        qrbox: { width: 320, height: 220 }, // बॉक्स साइज़ बैलेंस किया
        aspectRatio: 1.0,
        // --- तिरछे बारकोड के लिए खास सेटिंग्स ---
        disableFlip: false, 
        videoConstraints: {
          facingMode: "environment",
          focusMode: "continuous", // लगातार फोकस करेगा
        },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      }, false);

      scanner.render((result) => {
        // अगर बारकोड पहले से वही है तो दोबारा अलर्ट न दे
        setBarcode((prev) => {
          if (prev !== result) {
            if (navigator.vibrate) navigator.vibrate(150);
            return result;
          }
          return prev;
        });
      }, (err) => { });

      return () => {
        scanner.clear().catch(e => console.error(e));
      };
    }
  }, [isAuthenticated]);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) setImageUrl(file.name);
    };
    input.click();
  };

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
        body: JSON.stringify({ action: "updateFullProduct", barcode, newPrice: price, newImage: imageUrl }),
      });
      alert("NM Mart: Update Done!");
      setBarcode(""); setPrice(""); setImageUrl("");
    } catch (err) { alert("Failed!"); }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 text-center shadow-2xl">
          <Lock className="text-[#FF8C00] mx-auto mb-6" size={32} />
          <h1 className="text-2xl font-black italic mb-8 uppercase tracking-tighter text-[#FF8C00]">NM SECURE</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00]" />
            <button type="submit" className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black italic">NM <span className="text-[#FF8C00]">CONTROL</span></h1>
        <button onClick={() => setIsAuthenticated(false)} className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20"><LogOut size={18}/></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5">
          <div id="reader" className="overflow-hidden rounded-2xl border-2 border-[#FF8C00]/30 bg-black mb-4"></div>
          <p className="text-center text-[10px] text-[#FF8C00] mb-2 uppercase font-bold tracking-widest">Angle-Free Scanning ON</p>
          <div className="bg-black border border-white/5 p-4 rounded-xl text-center">
            <span className="text-[10px] block text-gray-500 mb-1">SCANNED BARCODE</span>
            <span className="text-xl font-black text-[#FF8C00]">{barcode || "000000000000"}</span>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 space-y-4 flex flex-col justify-center">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Sale Price ₹"
            className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:border-[#FF8C00] text-lg" />
          <div className="flex gap-2">
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Photo Path"
              className="flex-1 bg-black border border-white/5 p-5 rounded-2xl text-[10px]" />
            <button onClick={handleImageUpload} className="p-5 bg-white/5 rounded-2xl border border-white/10"><Camera size={20}/></button>
          </div>
          <button onClick={handleUpdate} disabled={loading} className="w-full bg-[#FF8C00] text-black font-black py-6 rounded-[30px] shadow-xl shadow-[#FF8C00]/10 active:scale-95 transition-all text-sm uppercase">
            {loading ? "SYNCING..." : "UPDATE INVENTORY"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
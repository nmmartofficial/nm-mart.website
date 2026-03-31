import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
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

  // --- 1. बारकोड ऑटोमैटिक पकड़ने के लिए सेटिंग ---
  useEffect(() => {
    if (isAuthenticated) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 30, // और भी तेज़ रफ़्तार
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.77,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true // अंधेरे के लिए टॉर्च बटन
      }, false);

      scanner.render((result) => {
        setBarcode(result);
        // मोबाइल वाइब्रेट करेगा अगर सपोर्टेड होगा
        if (navigator.vibrate) navigator.vibrate(100); 
      }, (err) => { });

      return () => {
        scanner.clear().catch(e => console.log(e));
      };
    }
  }, [isAuthenticated]);

  // --- 2. फोटो अपलोड करने का फंक्शन ---
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        alert("NM Mart: फोटो चुन ली गई है! (अभी URL पेस्ट करना होगा, अपलोड फीचर अगली अपडेट में आएगा)");
        // यहाँ आप इमेज का नाम या पाथ दिखा सकते हैं
        setImageUrl(file.name);
      }
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
      alert("NM Mart: इन्वेंटरी अपडेट सफल!");
      setBarcode(""); setPrice(""); setImageUrl("");
    } catch (err) {
      alert("Error!");
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
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00]" />
            <button type="submit" className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-2xl uppercase">Unlock</button>
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
        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5">
          <div id="reader" className="overflow-hidden rounded-2xl border border-white/10 bg-black mb-4 min-h-[250px]"></div>
          <input type="text" value={barcode} readOnly placeholder="Automatic Barcode Catch"
            className="w-full bg-black border border-white/5 p-4 rounded-xl text-xs text-[#FF8C00] font-bold outline-none text-center" />
        </div>

        <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 space-y-4">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="New Sale Price ₹"
            className="w-full bg-black border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#FF8C00]" />
          <div className="flex gap-2">
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste Photo Link"
              className="flex-1 bg-black border border-white/5 p-4 rounded-xl text-[10px] outline-none" />
            {/* यहाँ क्लिक करने पर अब मोबाइल की गैलरी खुलेगी */}
            <button onClick={handleImageUpload} className="p-4 bg-white/5 rounded-xl hover:bg-[#FF8C00] hover:text-black transition-all">
              <Camera size={16}/>
            </button>
          </div>
          <button onClick={handleUpdate} disabled={loading} className="w-full bg-[#FF8C00] text-black font-bold py-6 rounded-[30px] shadow-lg shadow-[#FF8C00]/20 active:scale-95 transition-all">
            {loading ? "SYNCING..." : "UPDATE NM MART INVENTORY"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
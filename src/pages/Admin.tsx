import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Lock, ScanBarcode, Save, LogOut, Camera, Keyboard, Zap, PlusCircle } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [productName, setProductName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const ADMIN_PASS = "NMMART2026"; 
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHscMaUt3qDJs-k-lqjUXF18kA-7g7Jv7EkSQwIdNHTOKAOS363kYp9PX4eUVxNScw1w/exec";

  // 1. Scanner Logic (Auto + Manual)
  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 30, qrbox: { width: 280, height: 180 } },
        (text) => { setBarcode(text); if (navigator.vibrate) navigator.vibrate(100); },
        () => {}
      );
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      startScanner();
      return () => { scannerRef.current?.stop().catch(e => console.log(e)); };
    }
  }, [isAuthenticated]);

  // 2. Photo to URL Logic
  const handlePhotoEntry = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // असली URL के लिए आपको Firebase/Cloudinary चाहिए होगा, अभी यह नाम भेजेगा
        const fakeUrl = `https://nmmart.in/assets/products/${file.name.replace(/\s/g, '_')}`;
        setImageUrl(fakeUrl);
        alert("Photo Link Created!");
      }
    };
    input.click();
  };

  // 3. Final Excel Entry (Price Update or New Product)
  const handleDataSubmit = async (type: 'update' | 'new') => {
    if (!barcode) return alert("Barcode is missing!");
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: type === 'new' ? "addNewProduct" : "updatePrice",
          barcode,
          name: productName,
          price,
          image: imageUrl
        }),
      });
      alert(`NM Mart: ${type === 'new' ? "New Entry" : "Price Updated"} in Excel!`);
      // Reset fields
      setBarcode(""); setPrice(""); setProductName(""); setImageUrl("");
    } catch (err) { alert("Excel Sync Error!"); }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#111] p-10 rounded-[40px] border border-white/5 text-center">
          <Lock className="text-[#FF8C00] mx-auto mb-6" size={32} />
          <h1 className="text-2xl font-black italic mb-8 uppercase text-[#FF8C00]">NM SECURE</h1>
          <form onSubmit={(e) => { e.preventDefault(); if(password === ADMIN_PASS) setIsAuthenticated(true); else alert("Wrong!"); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center outline-none focus:border-[#FF8C00]" />
            <button type="submit" className="w-full bg-[#FF8C00] text-black font-black py-5 mt-4 rounded-2xl">UNLOCK SYSTEM</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black italic">NM <span className="text-[#FF8C00]">MANAGER</span></h1>
        <button onClick={() => setIsAuthenticated(false)} className="p-3 text-red-500"><LogOut size={20}/></button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* SECTION 1: SCANNER (AUTO + MANUAL) */}
        <div className="bg-[#111] p-4 rounded-[30px] border border-white/5">
          <div id="reader" className="overflow-hidden rounded-2xl bg-black min-h-[200px]"></div>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 bg-black p-4 rounded-xl border border-[#FF8C00]/20 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Barcode ID (Auto/Type)</p>
              <input 
                type="text" 
                value={barcode} 
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-transparent text-center text-lg font-black text-[#FF8C00] outline-none"
                placeholder="00000000"
              />
            </div>
            <button onClick={() => scannerRef.current?.scanFile(new File([], ""), true)} className="bg-white/5 px-6 rounded-xl border border-white/10">
              <ScanBarcode size={24} className="text-[#FF8C00]"/>
            </button>
          </div>
        </div>

        {/* SECTION 2: PRODUCT ENTRY & EXCEL SYNC */}
        <div className="bg-[#111] p-6 rounded-[30px] border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-[#FF8C00] mb-2">
            <PlusCircle size={18}/>
            <h2 className="text-xs font-bold uppercase tracking-widest">Inventory Entry</h2>
          </div>
          
          <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name (e.g. Parle-G 500g)"
            className="w-full bg-black border border-white/5 p-4 rounded-xl outline-none focus:border-[#FF8C00]" />
          
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price ₹"
              className="bg-black border border-white/5 p-4 rounded-xl outline-none focus:border-[#FF8C00]" />
            <button onClick={handlePhotoEntry} className="bg-black border border-white/5 p-4 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-[#FF8C00]">
              <Camera size={18}/> <span className="text-xs">Add Photo</span>
            </button>
          </div>

          {imageUrl && <p className="text-[8px] text-green-500 truncate bg-green-500/5 p-2 rounded">Photo Link: {imageUrl}</p>}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button onClick={() => handleDataSubmit('update')} disabled={loading} className="bg-white/5 border border-white/10 text-white font-bold py-5 rounded-2xl text-xs uppercase">
              Update Price
            </button>
            <button onClick={() => handleDataSubmit('new')} disabled={loading} className="bg-[#FF8C00] text-black font-black py-5 rounded-2xl text-xs uppercase shadow-lg shadow-[#FF8C00]/20">
              {loading ? "SENDING..." : "New Entry (Excel)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
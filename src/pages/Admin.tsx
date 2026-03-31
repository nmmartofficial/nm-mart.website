import { useState } from "react";
import { Camera, ScanBarcode, Upload, Image as ImageIcon, Save, X } from "lucide-react";

const Admin = () => {
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHscMaUt3qDJs-k-lqjUXF18kA-7g7Jv7EkSQwIdNHTOKAOS363kYp9PX4eUVxNScw1w/exec";

  // --- 1. बारकोड स्कैन करने का फंक्शन (Browser Camera) ---
  const startScanner = () => {
    alert("अब्दुल भाई, बारकोड स्कैनर एक्टिवेट हो रहा है... (इसके लिए हम 'html5-qrcode' लाइब्रेरी का इस्तेमाल कर सकते हैं)");
    // यहाँ आप Barcode Reader इंटीग्रेट करेंगे
  };

  // --- 2. एक्सेल और फोटो अपडेट करने का मास्टर फंक्शन ---
  const handleFullUpdate = async () => {
    if (!barcode) return alert("पहले बारकोड डालें या स्कैन करें!");
    setLoading(true);

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "updateFullProduct", // हम Apps Script में भी इसे अपडेट करेंगे
          barcode: barcode,
          newPrice: price,
          newImage: imageUrl
        }),
      });
      alert(`NM Mart: ${barcode} का डेटा अपडेट हो गया!`);
      // फॉर्म रीसेट करें
      setBarcode(""); setPrice(""); setImageUrl("");
    } catch (err) {
      alert("अपडेट में एरर आया!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">NM <span className="text-[#FF8C00]">SMART CONTROL</span></h1>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px]">Scan • Upload • Manage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT SIDE: SCAN & INPUT --- */}
        <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Identification</h3>
            <button 
              onClick={startScanner}
              className="p-3 bg-[#FF8C00]/10 text-[#FF8C00] rounded-full hover:bg-[#FF8C00] hover:text-black transition-all"
            >
              <ScanBarcode size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="group">
              <label className="text-[9px] font-black uppercase text-gray-600 ml-2">Barcode Number</label>
              <input 
                type="text" 
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="890123456789"
                className="w-full bg-black border border-white/5 p-4 rounded-2xl text-sm focus:border-[#FF8C00] outline-none transition-all"
              />
            </div>

            <div className="group">
              <label className="text-[9px] font-black uppercase text-gray-600 ml-2">New Sale Rate (₹)</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black border border-white/5 p-4 rounded-2xl text-sm focus:border-[#FF8C00] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: PHOTO & URL --- */}
        <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 space-y-6">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Visuals</h3>
          
          {/* Photo Preview Area */}
          <div className="aspect-video bg-black rounded-[30px] border border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
            {imageUrl ? (
              <>
                <img src={imageUrl} className="w-full h-full object-contain p-4" alt="Preview" />
                <button onClick={() => setImageUrl("")} className="absolute top-4 right-4 bg-red-500 p-2 rounded-full"><X size={14}/></button>
              </>
            ) : (
              <div className="text-center">
                <ImageIcon size={40} className="text-gray-800 mx-auto mb-2" />
                <p className="text-[9px] text-gray-600 font-bold uppercase">No Image Selected</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all">
              <Camera size={16} /> Take Photo
            </button>
            <button className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all">
              <Upload size={16} /> Upload File
            </button>
          </div>

          <div className="group">
            <label className="text-[9px] font-black uppercase text-gray-600 ml-2">Or Paste Image URL</label>
            <input 
              type="text" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://image-link.com/photo.jpg"
              className="w-full bg-black border border-white/5 p-4 rounded-2xl text-[10px] focus:border-[#FF8C00] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- MASTER SAVE BUTTON --- */}
      <button 
        onClick={handleFullUpdate}
        disabled={loading}
        className="w-full mt-8 bg-[#FF8C00] text-black font-black uppercase py-6 rounded-[30px] shadow-[0_20px_50px_rgba(255,140,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        {loading ? "SYNCING DATA..." : <><Save size={20} /> Update NM Mart Inventory</>}
      </button>
    </div>
  );
};

export default Admin;

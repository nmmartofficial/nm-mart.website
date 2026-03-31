import { useState } from "react";

const Admin = () => {
  const [newPrice, setNewPrice] = useState("");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);

  // आपकी जादुई चाबी (URL)
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHscMaUt3qDJs-k-lqjUXF18kA-7g7Jv7EkSQwIdNHTOKAOS363kYp9PX4eUVxNScw1w/exec";

  // एक्सेल (Google Sheet) में रेट अपडेट करने वाला फंक्शन
  const handleUpdate = async (id, price) => {
    if (!price) return alert("अब्दुल भाई, पहले नया रेट तो डालिए!");
    
    setLoading(true);
    try {
      // 'no-cors' मोड का इस्तेमाल करेंगे क्योंकि Google Apps Script यही मांगता है
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePrice",
          productId: id,
          newPrice: price
        }),
      });
      
      alert(`NM Mart: ID ${id} का नया रेट ₹${price} अपडेट हो गया!`);
      setNewPrice(""); // बॉक्स खाली कर दें
    } catch (error) {
      alert("Error: रेट अपडेट नहीं हो पाया!");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* --- ऊपर का हेडर वैसे ही रहने दें --- */}

      {/* --- नया Inventory Control Section --- */}
      <div className="bg-[#111] p-6 rounded-[35px] border border-white/5 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-500 mb-6">Inventory Control</h3>
        
        <div className="space-y-4">
          {/* यहाँ हम एक इनपुट बॉक्स और बटन दे रहे हैं */}
          <div className="flex flex-col md:flex-row gap-4 p-5 bg-black rounded-3xl border border-white/5">
            <input 
              type="text" 
              placeholder="Product ID (Barcode)" 
              className="bg-[#1a1a1a] border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-[#FF8C00] transition-all flex-1"
              onChange={(e) => setTargetId(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="New Price (₹)" 
              className="bg-[#1a1a1a] border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-[#FF8C00] transition-all flex-1"
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <button 
              onClick={() => handleUpdate(targetId, newPrice)}
              disabled={loading}
              className={`bg-[#FF8C00] text-black font-black text-[10px] uppercase px-8 py-3 rounded-xl transition-all ${loading ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
            >
              {loading ? "Updating..." : "Update Excel"}
            </button>
          </div>
        </div>
      </div>

      {/* --- बाकी का डैशबोर्ड और टेबल इसके नीचे चलने दें --- */}
    </div>
  );
};

export default Admin;

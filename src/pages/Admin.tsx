import { useState } from "react";
import { ShoppingBag, Users, TrendingUp, Package, Clock, ArrowUpRight, Search } from "lucide-react";

const Admin = () => {
  const [targetId, setTargetId] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // आपकी जादुई चाबी
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHscMaUt3qDJs-k-lqjUXF18kA-7g7Jv7EkSQwIdNHTOKAOS363kYp9PX4eUVxNScw1w/exec";

  // एक्सेल अपडेट करने का फंक्शन
  const handleUpdate = async () => {
    if (!targetId || !newPrice) return alert("अब्दुल भाई, ID और नया रेट दोनों डालिए!");
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "updatePrice",
          productId: targetId,
          newPrice: newPrice
        }),
      });
      alert(`NM Mart: ID ${targetId} का रेट ₹${newPrice} हो गया!`);
      setNewPrice("");
    } catch (error) {
      alert("Error: अपडेट नहीं हो पाया!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            NM <span className="text-[#FF8C00]">CONTROL</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px]">Dukan Dashboard v5.0</p>
        </div>
      </div>

      {/* 2. TOP STATS (आज की सेल और डेटा) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Sale", value: "₹18,450", icon: TrendingUp, color: "text-orange-500" },
          { label: "Orders Today", value: "12", icon: ShoppingBag, color: "text-white" },
          { label: "Active Members", value: "1,240", icon: Users, color: "text-white" },
          { label: "Stock Alerts", value: "05", icon: Package, color: "text-red-500" },
        ].map((item, i) => (
          <div key={i} className="bg-[#111] p-5 rounded-[25px] border border-white/5">
            <item.icon size={16} className={`${item.color} mb-2`} />
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{item.label}</p>
            <h2 className="text-xl font-black mt-1">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* 3. INVENTORY CONTROL (एक्सेल रिमोट) */}
      <div className="bg-[#111] p-6 rounded-[35px] border border-[#FF8C00]/20 mb-8 shadow-[0_0_20px_rgba(255,140,0,0.05)]">
        <div className="flex items-center gap-2 mb-6 text-[#FF8C00]">
          <Search size={16} />
          <h3 className="text-[10px] font-black uppercase tracking-[2px]">Manage Excel Inventory</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Product ID / Barcode" 
            className="bg-black border border-white/10 p-3 rounded-2xl text-xs flex-1 outline-none focus:border-[#FF8C00] transition-all"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="New Price (₹)" 
            className="bg-black border border-white/10 p-3 rounded-2xl text-xs flex-1 outline-none focus:border-[#FF8C00] transition-all"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className={`bg-[#FF8C00] text-black font-black text-[10px] uppercase px-8 py-3 rounded-2xl transition-all ${loading ? 'opacity-50' : 'hover:bg-white active:scale-95'}`}
          >
            {loading ? "Saving..." : "Update Price"}
          </button>
        </div>
      </div>

      {/* 4. CUSTOMER ORDER MANAGEMENT (किसने क्या खरीदा) */}
      <div className="bg-[#111] rounded-[35px] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-black/30">
          <h3 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Live Customer Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-gray-600 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Items Bought</th>
                <th className="px-6 py-4 text-right">Total Bill</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {/* डमी डेटा: यहाँ बाद में असली ऑर्डर्स आएँगे */}
              {[1, 2, 3].map((order) => (
                <tr key={order} className="border-t border-white/5 hover:bg-white/5 transition-all group">
                  <td className="px-6 py-5 font-black italic text-[#FF8C00]">#NMM-10{order}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold">Abdul Bhai</span>
                      <span className="text-[9px] text-gray-500">+91 7081154604</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-400">
                    Basmati Rice x2, Dry Fruits x1...
                  </td>
                  <td className="px-6 py-5 text-right font-black">₹1,450.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Admin;

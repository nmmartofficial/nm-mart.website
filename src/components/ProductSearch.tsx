// ... (बाकी इंपोर्ट्स वही रहेंगे)

const ProductSearch = () => {
  // ... (बाकी स्टेट्स वही रहेंगी)

  const filtered = allProducts.filter(item => {
    const mrp = Number(item["Mrp"]);
    const sale = Number(item["Sale Rate"]);
    const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;

    // सख्त नियम: अगर "All" चुना है, तो केवल 50% या उससे ज्यादा डिस्काउंट वाले ही दिखाओ
    if (selectedCategory === "All" && query === "") {
      return discount >= 50; 
    }

    // सर्च और कैटेगरी के लिए पुराना लॉजिक
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item["Main Category"] === selectedCategory;

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24 font-sans text-gray-900">
      {/* Header & Search */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-blue-900 italic tracking-tighter">NM MART</h1>
            <div className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase italic animate-bounce shadow-lg shadow-red-200">
               MEGA 50% OFF ZONE 🔥
            </div>
          </div>
          {/* ... (सर्च इनपुट यहाँ आएगा) */}
        </div>
      </div>

      {/* Category Bar */}
      {!loading && (
        <div className="bg-white py-3 shadow-sm overflow-x-auto whitespace-nowrap px-4 border-b border-gray-100">
          <div className="max-w-6xl mx-auto flex gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                selectedCategory === "All" ? "bg-red-600 text-white shadow-xl shadow-red-100 scale-105" : "bg-gray-100 text-gray-400"
              }`}
            >
              🔥 50% OFF DEALS
            </button>
            {/* बाकी कैटेगरी बटन्स यहाँ आएंगे */}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto p-4">
        {selectedCategory === "All" && query === "" && (
          <div className="text-center py-6">
            <h2 className="text-xl font-black text-red-600 italic uppercase">Half Price Store</h2>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Everything here is at least 50% cheaper!</p>
          </div>
        )}

        {/* ... (कार्ड रेंडरिंग वाला हिस्सा - पिछले कोड की तरह) */}
      </div>

      {/* Cart & Summary Logic */}
    </div>
  );
};

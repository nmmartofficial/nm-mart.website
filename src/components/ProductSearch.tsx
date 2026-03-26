// ... (बाकी पुराने इंपोर्ट्स वही रहेंगे)

const ProductSearch = () => {
  // ... (बाकी स्टेट्स वही रहेंगी)

  const filtered = allProducts.filter(item => {
    const mrp = Number(item["Mrp"]);
    const sale = Number(item["Sale Rate"]);
    const discount = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;

    // अगर "All" चुना है, तो सिर्फ 10% से ज्यादा डिस्काउंट वाले दिखाओ
    if (selectedCategory === "All" && query === "") {
      return discount >= 10; 
    }

    // अगर सर्च कर रहे हैं, तो नाम मैच होना चाहिए
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    
    // अगर कैटेगरी चुनी है, तो उस कैटेगरी का सारा सामान दिखाओ
    const matchesCategory = selectedCategory === "All" || item["Main Category"] === selectedCategory;

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24 font-sans text-gray-900">
      {/* Header & Search (Purana wala) */}
      
      {/* Category Bar */}
      {!loading && (
        <div className="bg-white py-3 shadow-sm overflow-x-auto whitespace-nowrap px-4 sticky top-[100px] z-30">
          <div className="max-w-6xl mx-auto flex gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                selectedCategory === "All" ? "bg-orange-500 text-white shadow-lg" : "bg-gray-100 text-gray-400"
              }`}
            >
              🔥 Top Deals
            </button>
            {categories.filter(c => c !== "All").map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                  selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto p-4">
        {selectedCategory === "All" && query === "" && (
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Today's Best Offers</h2>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              // ... (बाकी कार्ड का डिजाइन वही रहेगा जो पिछले कोड में था)
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
              Koi item nahi mila. Try searching!
            </div>
          )}
        </div>
      </div>
      
      {/* Cart Logic (Purana wala) */}
    </div>
  );
};

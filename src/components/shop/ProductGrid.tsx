import { useState } from "react";
import { Search, LayoutGrid, ChevronRight } from "lucide-react";

const ProductGrid = ({ products, isLoading }: any) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      <p className="font-black text-blue-900 uppercase text-xs">NM Mart Stock Loading...</p>
    </div>
  );

  // Categories nikalne ke liye
  const categories = [...new Set(products.map((item: any) => item["Main Category"]).filter(Boolean))];

  // Search aur Category filter logic
  const filtered = products.filter((item: any) => {
    const matchesCat = selectedCategory ? item["Main Category"] === selectedCategory : true;
    const matchesSearch = item["Item Name"]?.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* --- SEARCH BOX (Wapas Aagaya) --- */}
      <div className="relative mb-10 max-w-2xl mx-auto -mt-8 shadow-2xl rounded-2xl overflow-hidden">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full bg-white border-none p-5 pl-14 font-bold text-lg focus:ring-2 focus:ring-blue-900"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-5 top-5 text-blue-900" size={24}/>
      </div>

      {/* --- CATEGORY FOLDERS (Wapas Aagaye) --- */}
      {!selectedCategory && !query && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {categories.map((cat: any) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:border-blue-900 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <LayoutGrid size={18}/>
              </div>
              <span className="font-black text-[#1A365D] uppercase text-[10px] tracking-tighter">{cat}</span>
              <p className="text-[8px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">Open <ChevronRight size={10}/></p>
            </button>
          ))}
        </div>
      )}

      {/* --- PRODUCTS GRID --- */}
      {(selectedCategory || query) && (
        <div>
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="font-black text-xl text-blue-900 uppercase italic">
              {selectedCategory || "Search Results"}
            </h2>
            <button 
              onClick={() => {setSelectedCategory(null); setQuery("")}} 
              className="text-[10px] font-black uppercase text-blue-600 border-b-2 border-blue-600"
            >
              Show All Sections
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {filtered.map((item: any, idx: number) => (
              <div key={idx} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 flex flex-col relative group hover:shadow-xl transition-all">
                <div className="h-32 mb-4 flex items-center justify-center p-2">
                  <img 
                    src={`https://images.openfoodfacts.org/images/products/${item.Barcode?.split('.')[0]}/front_en.400.jpg`} 
                    className="max-h-full object-contain"
                    onError={(e: any) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-900 font-black text-xl uppercase">${item["Item Name"]?.charAt(0)}</div>`;
                    }}
                  />
                </div>
                <h3 className="font-bold text-[10px] text-[#1A365D] uppercase h-8 overflow-hidden mb-2 leading-tight">{item["Item Name"]}</h3>
                <p className="text-xl font-black text-[#1A365D] italic mb-4">₹{item["Sale Rate"]}</p>
                <button 
                  onClick={() => window.open(`https://wa.me/917081154604?text=Order: ${item["Item Name"]} - ₹${item["Sale Rate"]}`)}
                  className="w-full bg-[#25D366] text-white py-3 rounded-xl font-black text-[9px] uppercase shadow-md flex items-center justify-center gap-2"
                >
                  Order on WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

import { useState, useEffect } from "react";
import { Search, Barcode, Loader2, ShoppingBasket } from "lucide-react";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // आपकी वर्किंग API ID
  const SHEETDB_URL = "https://sheetdb.io/api/v1/n1voj7e2lp0le?sheet=Inventory";

  // वेबसाइट खुलते ही सारा डेटा एक बार में लोड कर लेगा
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      } catch (error) {
        console.error("Data Load Error:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter Logic: जो भी आप लिखोगे, वो 'allProducts' में से तुरंत ढूँढ लेगा
  const filteredResults = allProducts.filter((item) => {
    const itemName = item.Name ? String(item.Name).toLowerCase() : "";
    const searchPart = query.toLowerCase();
    return itemName.includes(searchPart);
  });

  return (
    <section className="py-12 bg-white/5 rounded-[3rem] border border-white/10 m-4 shadow-2xl">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-2xl font-black mb-6 italic text-[#FFD700] uppercase tracking-tighter">
          NM MART PRICE CHECKER
        </h3>
        
        <div className="relative max-w-2xl mx-auto mb-10">
          <input 
            type="text" 
            placeholder={loading ? "Connecting to NM Mart..." : "Type anything (ex: STAR, 5, HOT)"} 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            disabled={loading}
            className="w-full bg-white/10 border-2 border-white/10 p-5 rounded-2xl outline-none focus:border-[#FFD700] text-lg font-bold text-white transition-all placeholder:opacity-20" 
          />
          <div className="absolute right-5 top-5 text-[#FFD700]">
            {loading ? <Loader2 className="animate-spin"/> : <Search size={24}/>}
          </div>
        </div>

        <div className="grid gap-4 max-w-4xl mx-auto">
          {/* 2 अक्षर लिखते ही सर्च शुरू हो जाएगा */}
          {query.length >= 2 && filteredResults.map((item, index) => (
            <div key={index} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-wrap justify-between items-center hover:bg-white/10 transition-all transform hover:scale-[1.01]">
              <div className="text-left flex items-start gap-4">
                <div className="bg-[#FFD700]/20 p-3 rounded-xl text-[#FFD700]">
                  <ShoppingBasket size={24}/>
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase text-white leading-tight">
                    {item.Name}
                  </h4>
                  <p className="text-[10px] opacity-40 font-mono text-white flex items-center gap-1 mt-1">
                    <Barcode size={10}/> {item.Barcode || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6 items-center sm:mt-0 mt-4">
                <div className="text-right">
                  <p className="text-[10px] opacity-40 font-bold uppercase text-white font-mono">MRP</p>
                  <p className="text-lg font-bold line-through opacity-50 text-red-400 font-mono">₹{item.Mrp}</p>
                </div>
                <div className="text-right bg-[#FFD700]/10 p-2 px-4 rounded-xl border border-[#FFD700]/20 min-w-[100px]">
                  <p className="text-[10px] text-[#FFD700] font-bold uppercase font-mono text-center tracking-tighter">Sale Price</p>
                  <p className="text-2xl font-black text-[#FFD700] italic font-mono text-center">₹{item.Salerate}</p>
                </div>
              </div>
            </div>
          ))}

          {query.length >= 2 && filteredResults.length === 0 && !loading && (
            <div className="py-10 opacity-30 italic text-white text-center">
              <p>"{query}" ke naam se kuch nahi mila.</p>
              <p className="text-xs mt-2 uppercase">Check spelling in Google Sheet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSearch;

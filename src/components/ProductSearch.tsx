import { useState } from "react";
import { Search, Barcode, Loader2, ShoppingBasket } from "lucide-react";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Aapki nayi API ID
  const SHEETDB_URL = "https://sheetdb.io/api/v1/fng3l414zu66d?sheet=Inventory";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 2) return; 
    setLoading(true);
    try {
      // Yahan hum 'NAME' use kar rahe hain kyunki aapki sheet mein CAPITAL hai
      const response = await fetch(`${SHEETDB_URL}/search?NAME=*${query}*`);
      const data = await response.json();
      setResults(data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  return (
    <section className="py-12 bg-white/5 rounded-[3rem] border border-white/10 m-4 shadow-2xl">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-2xl font-black mb-6 italic text-[#FFD700] uppercase tracking-tighter">NM MART PRICE CHECKER</h3>
        
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-10">
          <input 
            type="text" 
            placeholder="Search Products (e.g. 5 STAR, PAPAD...)" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            className="w-full bg-white/10 border-2 border-white/10 p-5 rounded-2xl outline-none focus:border-[#FFD700] text-lg font-bold text-white transition-all" 
          />
          <button type="submit" className="absolute right-3 top-3 bg-[#FFD700] text-black p-3 rounded-xl hover:scale-105 transition-all">
            {loading ? <Loader2 className="animate-spin"/> : <Search size={24}/>}
          </button>
        </form>

        <div className="grid gap-4 max-w-4xl mx-auto">
          {results.length > 0 ? results.map((item, index) => (
            <div key={index} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-wrap justify-between items-center hover:bg-white/10 transition-colors">
              <div className="text-left flex items-start gap-4">
                <div className="bg-[#FFD700]/20 p-3 rounded-xl text-[#FFD700]"><ShoppingBasket size={24}/></div>
                <div>
                  {/* Yahan headings match honi chahiye */}
                  <h4 className="font-black text-lg uppercase text-white">{item.NAME}</h4>
                  <p className="text-[10px] opacity-40 font-mono text-white flex items-center gap-1"><Barcode size={10}/> {item.BARCODE}</p>
                </div>
              </div>
              
              <div className="flex gap-6 items-center">
                <div className="text-right">
                  <p className="text-[10px] opacity-40 font-bold uppercase text-white font-mono">MRP</p>
                  <p className="text-lg font-bold line-through opacity-50 text-red-400 font-mono">₹{item.MRP}</p>
                </div>
                <div className="text-right bg-[#FFD700]/10 p-2 px-4 rounded-xl border border-[#FFD700]/20 min-w-[100px]">
                  <p className="text-[10px] text-[#FFD700] font-bold uppercase font-mono text-center">Price</p>
                  <p className="text-2xl font-black text-[#FFD700] italic font-mono text-center">₹{item.SALERATE}</p>
                </div>
              </div>
            </div>
          )) : query.length > 2 && !loading && (
            <p className="opacity-30 italic text-white text-center">Item nahi mila. Spelling check karein.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSearch;

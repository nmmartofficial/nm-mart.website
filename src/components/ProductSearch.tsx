import { useState } from "react";
import { Search, Barcode, Loader2, ShoppingBasket, AlertCircle } from "lucide-react";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // आपकी API ID
  const SHEETDB_URL = "https://sheetdb.io/api/v1/fng3l414zu66d?sheet=Inventory";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 2) return; 
    setLoading(true);
    setError(false);
    
    try {
      // यह तरीका सबसे बेस्ट है, इसमें स्पेलिंग मैच होने के चांस ज्यादा हैं
      const response = await fetch(`${SHEETDB_URL}/search?Name=*${query}*&casesensitive=false`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (err) { 
      console.error("Search Error:", err);
      setError(true);
    }
    setLoading(false);
  };

  return (
    <section className="py-12 bg-[#0A0A0A] rounded-[3rem] border border-white/5 m-4 shadow-2xl overflow-hidden relative">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-2xl font-black mb-6 italic text-[#FFD700] uppercase tracking-widest">NM MART PRICE CHECKER</h3>
        
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-10 group">
          <input 
            type="text" 
            placeholder="Product ka naam likhein... (ex: 5 star)" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-2xl outline-none focus:border-[#FFD700] text-xl font-bold text-white transition-all placeholder:opacity-30" 
          />
          <button type="submit" className="absolute right-4 top-4 bg-[#FFD700] text-black p-3 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#FFD700]/20">
            {loading ? <Loader2 className="animate-spin" size={24}/> : <Search size={24}/>}
          </button>
        </form>

        <div className="grid gap-4 max-w-4xl mx-auto min-h-[100px]">
          {results.length > 0 ? results.map((item, index) => (
            <div key={index} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-wrap justify-between items-center hover:bg-white/10 transition-all transform hover:-translate-y-1">
              <div className="text-left flex items-start gap-4">
                <div className="bg-[#FFD700]/20 p-4 rounded-2xl text-[#FFD700]"><ShoppingBasket size={28}/></div>
                <div>
                  <h4 className="font-black text-xl uppercase text-white tracking-tight">{item.Name || "Unknown Item"}</h4>
                  <p className="text-xs opacity-40 font-mono text-white flex items-center gap-1 mt-1"><Barcode size={14}/> {item.Barcode || "No Barcode"}</p>
                </div>
              </div>
              
              <div className="flex gap-8 items-center mt-4 sm:mt-0">
                <div className="text-right">
                  <p className="text-[10px] opacity-40 font-bold uppercase text-white tracking-widest">MRP</p>
                  <p className="text-lg font-bold line-through opacity-50 text-red-500 font-mono">₹{item.Mrp}</p>
                </div>
                <div className="text-right bg-[#FFD700] p-3 px-6 rounded-2xl shadow-xl shadow-[#FFD700]/10">
                  <p className="text-[10px] text-black font-black uppercase text-center">OUR PRICE</p>
                  <p className="text-3xl font-black text-black italic font-mono leading-none">₹{item.Salerate}</p>
                </div>
              </div>
            </div>
          )) : query.length >= 2 && !loading && (
            <div className="flex flex-col items-center opacity-30 mt-4">
              <AlertCircle size={40} className="mb-2"/>
              <p className="italic text-white">Data nahi mila. Ek baar 'Reload' button dabayein SheetDB par.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSearch;

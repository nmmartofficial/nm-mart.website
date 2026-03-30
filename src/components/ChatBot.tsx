import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, TrendingDown } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! 🛒\nSearch any product to see Price & Photos.\nनमस्ते! सामान सर्च करें और फोटो के साथ रेट देखें।", isBot: true }
  ]);
  const chatEndRef = useRef(null);

  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/10e6molYJIH19uag6ViotpfaLU78CBjIWCf2Bh5ulY-U/gviz/tq?tqx=out:csv";

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(SHEET_CSV_URL);
        const data = await response.text();
        const rows = data.split(/\r?\n/).slice(1);
        const list = rows.map(row => {
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          return { 
            name: cols[0]?.replace(/"/g, '').trim(),
            mrp: parseFloat(cols[4]?.replace(/"/g, '').trim()) || 0,
            saleRate: parseFloat(cols[5]?.replace(/"/g, '').trim()) || 0,
            img: cols[6]?.replace(/"/g, '').trim(), // Column 6: Image URL
            subCat: cols[3]?.replace(/"/g, '').trim()
          };
        }).filter(item => item.name);
        setProducts(list);
      } catch (err) { console.error("Data failed"); }
    };
    loadData();
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);

    setTimeout(() => {
      const query = input.toLowerCase();
      const matches = products.filter(p => p.name && p.name.toLowerCase().includes(query)).slice(0, 5);

      if (matches.length > 0) {
        setMessages(prev => [...prev, { 
          text: `Checking NM Mart Stock... ✅\nFound these for you:`, 
          isBot: true,
          options: matches 
        }]);
      } else {
        setMessages(prev => [...prev, { text: "Item not found. Call 7081154604 for order.\nयह सामान नहीं मिला। ऑर्डर के लिए फोन करें।", isBot: true }]);
      }
    }, 400);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999] font-sans">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-4 rounded-full shadow-[0_0_20px_rgba(255,140,0,0.5)] text-black border-2 border-black hover:scale-110 transition-all active:scale-95">
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-[400px] bg-[#050505] border border-[#FF8C00]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px] animate-in fade-in zoom-in duration-200">
          <div className="bg-gradient-to-r from-[#FF8C00] to-[#ffae42] p-5 shadow-lg">
            <h3 className="font-black text-black text-center tracking-tighter uppercase italic text-lg">NM MART LIVE STORE</h3>
            <p className="text-[10px] text-black/80 font-bold text-center uppercase tracking-[2px]">Superfast Assistant</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[95%] p-4 rounded-2xl text-[13px] ${
                  msg.isBot ? 'bg-[#111] text-gray-200 border border-white/5' : 'bg-[#FF8C00] text-black font-bold'
                }`}>
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                  
                  {msg.options && (
                    <div className="mt-5 space-y-4">
                      {msg.options.map((prod, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex gap-3 hover:border-[#FF8C00]/50 transition-colors group">
                          {/* Image Box */}
                          <div className="w-20 h-20 bg-white/10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {prod.img ? <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" /> : <div className="text-[8px] text-gray-500 uppercase">No Image</div>}
                          </div>
                          
                          {/* Details Box */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-[#FF8C00] font-black text-[11px] leading-tight uppercase group-hover:text-white transition-colors">{prod.name}</div>
                              <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">{prod.subCat}</div>
                            </div>
                            
                            <div className="flex justify-between items-end mt-2">
                              <div>
                                <div className="text-gray-500 text-[10px] line-through italic">MRP ₹{prod.mrp}</div>
                                <div className="text-white font-black text-[18px] tracking-tight">₹{prod.saleRate}</div>
                              </div>
                              <button onClick={() => setMessages(prev => [...prev, { text: `🛒 ${prod.name} is added!`, isBot: true }])} className="bg-[#FF8C00] p-2.5 rounded-full text-black hover:bg-white hover:scale-110 transition-all shadow-lg">
                                <ShoppingCart size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex gap-3">
            <input 
              type="text" 
              placeholder="Type (e.g. Sugar, Oil)..."
              className="flex-1 bg-black text-white p-3 rounded-2xl border border-white/10 focus:border-[#FF8C00] outline-none text-sm placeholder:text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#FF8C00] p-3 rounded-2xl text-black hover:rotate-12 transition-transform shadow-lg">
              <Send size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

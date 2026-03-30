import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, Tag } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! Search for any product (Sugar, Oil, etc.)\nनमस्ते! NM Mart पर सामान और रेट सर्च करें।", isBot: true }
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
          // CSV को 7 कॉलम्स में सही से बांटना
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          return { 
            name: cols[0]?.replace(/"/g, '').trim(),     // Column 0: Item Name
            barcode: cols[1]?.replace(/"/g, '').trim(),  // Column 1: Barcode
            category: cols[2]?.replace(/"/g, '').trim(), // Column 2: Main Category
            subCat: cols[3]?.replace(/"/g, '').trim(),   // Column 3: Sub Category
            mrp: cols[4]?.replace(/"/g, '').trim(),      // Column 4: MRP
            saleRate: cols[5]?.replace(/"/g, '').trim(), // Column 5: Sale Rate
            img: cols[6]?.replace(/"/g, '').trim()       // Column 6: Image URL
          };
        }).filter(item => item.name && item.saleRate); 
        
        setProducts(list);
      } catch (err) {
        console.error("Data connection failed");
      }
    };
    loadData();
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, isBot: false }]);

    setTimeout(() => {
      const query = userText.toLowerCase();
      const matches = products.filter(p => 
        p.name && p.name.toLowerCase().includes(query)
      ).slice(0, 6);

      if (matches.length > 0) {
        setMessages(prev => [...prev, { 
          text: `I found ${matches.length} items at NM Mart:\nNM Mart पर ये सामान मिले हैं:`, 
          isBot: true,
          options: matches 
        }]);
      } else {
        setMessages(prev => [...prev, { text: "Sorry, item not found. / क्षमा करें, यह सामान नहीं मिला।", isBot: true }]);
      }
    }, 400);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999]">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-4 rounded-full shadow-2xl text-black border-2 border-black hover:scale-110 transition-all">
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-[#0a0a0a] border border-[#FF8C00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#FF8C00] p-4 flex flex-col items-center">
            <h3 className="font-bold text-black text-[12px] tracking-widest uppercase">NM Mart Helper</h3>
            <span className="text-[10px] text-black/70 font-bold">मंझनपुर, कौशाम्बी</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[95%] p-3 rounded-2xl text-[13px] ${
                  msg.isBot ? 'bg-[#1a1a1a] text-gray-200 border border-gray-800' : 'bg-[#FF8C00] text-black font-bold shadow-lg'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  
                  {msg.options && (
                    <div className="mt-4 flex flex-col gap-3">
                      {msg.options.map((prod, idx) => (
                        <div key={idx} className="bg-[#111] border border-[#FF8C00]/20 p-3 rounded-xl shadow-md">
                          <div className="text-[#FF8C00] font-extrabold text-[11px] mb-2 border-b border-white/5 pb-1 uppercase italic">
                            {prod.name}
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-gray-500 text-[10px] italic">MRP: <del>₹{prod.mrp}</del></span>
                              <span className="text-white font-black text-[16px] tracking-tight">NM RATE: ₹{prod.saleRate}</span>
                              <span className="text-[9px] text-[#FF8C00]/70 mt-1 uppercase font-bold">{prod.subCat}</span>
                            </div>
                            <button 
                              onClick={() => setMessages(prev => [...prev, { text: `✅ ${prod.name} added to cart!`, isBot: true }])}
                              className="bg-[#FF8C00] text-black p-2 rounded-lg hover:bg-white transition-all shadow-lg"
                            >
                              <ShoppingCart size={18} />
                            </button>
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

          <div className="p-3 bg-[#111] border-t border-gray-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Search (Sugar, Oil...)"
              className="flex-1 bg-black text-white p-2 rounded-xl border border-gray-800 focus:border-[#FF8C00] outline-none text-sm placeholder:text-gray-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#FF8C00] p-2 rounded-xl text-black hover:bg-white transition-all shadow-md shadow-[#FF8C00]/10">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, Tag } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! Search for any product.\nनमस्ते! किसी भी सामान का रेट और डिस्काउंट देखें।", isBot: true }
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
            price: cols[1]?.replace(/"/g, '').trim(), // NM Mart Rate
            mrp: cols[2]?.replace(/"/g, '').trim()    // MRP from Column C
          };
        }).filter(item => item.name);
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
          text: `I found these items at NM Mart:\nNM Mart पर ये सामान उपलब्ध हैं:`, 
          isBot: true,
          options: matches 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "Sorry, item not found. / क्षमा करें, यह सामान नहीं मिला।", 
          isBot: true 
        }]);
      }
    }, 400);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999]">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-4 rounded-full shadow-2xl hover:scale-110 transition text-black border-2 border-black">
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-black border border-[#FF8C00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#FF8C00] p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[#FF8C00] font-bold text-xs">NM</div>
            <h3 className="font-bold text-black text-sm tracking-widest uppercase">NM Mart Assistant</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                  msg.isBot ? 'bg-[#1a1a1a] text-gray-200 border border-gray-800' : 'bg-[#FF8C00] text-black font-semibold'
                }`}>
                  {msg.text}
                  
                  {msg.options && (
                    <div className="mt-3 flex flex-col gap-3">
                      {msg.options.map((prod, idx) => (
                        <div key={idx} className="bg-black/60 border border-white/10 p-3 rounded-xl">
                          <div className="font-bold text-white mb-1 uppercase text-[12px]">{prod.name}</div>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-gray-400 text-[10px] line-through">MRP: ₹{prod.mrp || '0'}</span>
                              <span className="text-[#FF8C00] font-bold text-[14px]">NM Rate: ₹{prod.price}</span>
                            </div>
                            <button 
                              onClick={() => setMessages(prev => [...prev, { text: `✅ ${prod.name} added to cart!`, isBot: true }])}
                              className="bg-[#FF8C00] text-black p-2 rounded-lg hover:scale-105 transition"
                            >
                              <ShoppingCart size={16} />
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
              placeholder="Type product name (e.g. Sugar)..."
              className="flex-1 bg-black text-white p-2 rounded-xl border border-gray-800 focus:border-[#FF8C00] outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#FF8C00] p-2 rounded-xl text-black shadow-lg shadow-[#FF8C00]/20">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

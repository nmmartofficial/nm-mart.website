import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, CheckCircle } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! Search for any product (e.g. Sugar / Oil).\nनमस्ते! किसी भी सामान को यहाँ सर्च करें।", isBot: true }
  ]);
  const chatEndRef = useRef(null);

  // 1. Google Sheet Data Connection
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
            price: cols[1]?.replace(/"/g, '').trim() 
          };
        }).filter(item => item.name && item.price);
        setProducts(list);
      } catch (err) {
        console.error("Data connection failed");
      }
    };
    loadData();
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // 2. Add to Cart Logic
  const addToCart = (product) => {
    setMessages(prev => [...prev, { 
      text: `✅ Added ${product.name} (₹${product.price}) to your list! / ${product.name} को लिस्ट में जोड़ दिया गया है!`, 
      isBot: true 
    }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, isBot: false }]);

    setTimeout(() => {
      const query = userText.toLowerCase();
      
      // 3. Finding all matches (Selection Menu Logic)
      const matches = products.filter(p => 
        p.name && p.name.toLowerCase().includes(query)
      ).slice(0, 6); // Top 6 results only

      if (matches.length > 0) {
        setMessages(prev => [...prev, { 
          text: `Found ${matches.length} matching items. Please select one:\nमुझे ${matches.length} सामान मिले हैं। कृपया एक चुनें:`, 
          isBot: true,
          options: matches 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "Sorry, I couldn't find that item. Try 'Sugar' or 'Oil'.\nक्षमा करें, यह सामान नहीं मिला। 'Sugar' या 'Oil' लिखकर देखें।", 
          isBot: true 
        }]);
      }
    }, 500);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999]">
      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-4 rounded-full shadow-2xl hover:scale-110 transition text-black border-2 border-black">
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-black border border-[#FF8C00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#FF8C00] p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[#FF8C00] font-bold text-xs">NM</div>
            <h3 className="font-bold text-black text-sm tracking-widest">NM MART HELPER</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line shadow-md ${
                  msg.isBot ? 'bg-[#1a1a1a] text-gray-200 border border-gray-800' : 'bg-[#FF8C00] text-black font-semibold'
                }`}>
                  {msg.text}
                  
                  {/* Selection Buttons (Options) */}
                  {msg.options && (
                    <div className="mt-3 flex flex-col gap-2">
                      {msg.options.map((prod, idx) => (
                        <button 
                          key={idx}
                          onClick={() => addToCart(prod)}
                          className="w-full bg-black/40 border border-white/20 text-white p-2 rounded-lg text-[11px] text-left flex justify-between items-center hover:bg-white hover:text-black transition font-medium"
                        >
                          <span>{prod.name}</span>
                          <span className="font-bold text-[#FF8C00]">₹{prod.price}</span>
                        </button>
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
              placeholder="Type product name..."
              className="flex-1 bg-black text-white p-2 rounded-xl border border-gray-800 focus:border-[#FF8C00] outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#FF8C00] p-2 rounded-xl text-black">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

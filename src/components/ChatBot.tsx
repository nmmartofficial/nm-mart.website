import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! Ask me about any product price.\nनमस्ते! किसी भी सामान का रेट पूछें।", isBot: true }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const SHEET_URL = "यहाँ_अपनी_CSV_लिंक_डालें"; // अपनी असली CSV लिंक यहाँ पेस्ट करें
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1);
        const list = rows.map(row => {
          const cols = row.split(',');
          return { name: cols[0]?.trim(), price: cols[1]?.trim() };
        }).filter(item => item.name);
        setProducts(list);
      } catch (err) {
        console.log("Sheet not loaded yet");
      }
    };
    loadData();
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const query = input.toLowerCase();
      const found = products.find(p => p.name && query.includes(p.name.toLowerCase()));
      let reply = found 
        ? `Yes, ${found.name} is available for ₹${found.price}.\nजी हाँ, ${found.name} का रेट ₹${found.price} है।`
        : "Sorry, I couldn't find that. Call 7081154604.\nक्षमा करें, इसकी जानकारी नहीं मिली। 7081154604 पर फोन करें।";
      
      setMessages(prev => [...prev, { text: reply, isBot: true, product: found }]);
    }, 500);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999]">
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#FF8C00] p-4 rounded-full shadow-2xl hover:scale-110 transition text-black border-2 border-black"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-black border border-[#FF8C00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#FF8C00] p-4 flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[#FF8C00] font-bold text-xs">NM</div>
            <h3 className="font-bold text-black tracking-tight text-sm">NM MART ASSISTANT</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line shadow-md ${
                  msg.isBot ? 'bg-[#1a1a1a] text-gray-200 border border-gray-800' : 'bg-[#FF8C00] text-black font-semibold'
                }`}>
                  {msg.text}
                  {msg.product && (
                    <button className="mt-3 w-full bg-green-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold hover:bg-green-700 transition">
                      <ShoppingCart size={14}/> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-[#111] border-t border-gray-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask price / रेट पूछें..."
              className="flex-1 bg-black text-white p-2 rounded-xl border border-gray-800 focus:border-[#FF8C00] outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#FF8C00] p-2 rounded-xl text-black hover:bg-[#e67e00] transition shadow-md">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

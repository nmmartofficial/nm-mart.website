import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, Info } from 'lucide-react';

const ChatBot = ({ products = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! How can I help you today? / नमस्ते! मैं आपकी क्या मदद कर सकता हूँ?", isBot: true }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const query = input.toLowerCase();
      // Searching 7,000 products by Name or Category
      const found = products.find(p => query.includes(p.name.toLowerCase()) || query.includes(p.category?.toLowerCase()));

      let reply = { en: "", hi: "" };

      if (found) {
        reply.en = `Yes, ${found.name} is available for ₹${found.price} at NM Mart.`;
        reply.hi = `जी हाँ, NM Mart पर ${found.name} का रेट ₹${found.price} है।`;
      } else if (query.includes("offer") || query.includes("discount") || query.includes("छूट")) {
        reply.en = "We have up to 50% OFF on Groceries and Dry Fruits right now!";
        reply.hi = "अभी Grocery और Dry Fruits पर 50% तक की भारी छूट चल रही है!";
      } else if (query.includes("location") || query.includes("address") || query.includes("pata")) {
        reply.en = "Our store is located in Manjhanpur, Kaushambi (UP).";
        reply.hi = "हमारा स्टोर मंझनपुर, कौशाम्बी (UP) में स्थित है।";
      } else {
        reply.en = "I'm sorry, I couldn't find that. Please call 7081154604 for help.";
        reply.hi = "क्षमा करें, मुझे इसकी जानकारी नहीं मिली। आप 7081154604 पर फोन कर सकते हैं।";
      }

      // Hinglish Combined Response
      const finalBotMsg = `${reply.en}\n\n${reply.hi}`;
      setMessages(prev => [...prev, { text: finalBotMsg, isBot: true, product: found }]);
    }, 600);

    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-4 rounded-full shadow-2xl hover:scale-110 transition text-black">
        {isOpen ? <X /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-[#0c0c0c] border border-[#FF8C00]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#FF8C00] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[#FF8C00] font-bold text-xs shadow-inner">NM</div>
              <span className="font-bold text-black text-sm tracking-tight">NM MART ASSISTANT</span>
            </div>
            <div className="text-[10px] bg-black/10 px-2 py-1 rounded text-black font-medium">EN/हिन्दी</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${
                  msg.isBot ? 'bg-[#1a1a1a] text-gray-200 border border-gray-800' : 'bg-[#FF8C00] text-black font-semibold shadow-lg'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.product && (
                    <button className="mt-3 w-full bg-green-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider hover:bg-green-700 transition">
                      <ShoppingCart size={14}/> Add to Cart / खरीदें
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-[#0c0c0c] border-t border-gray-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask price / रेट पूछें..."
              className="flex-1 bg-black text-white p-2 rounded-xl border border-gray-800 focus:border-[#FF8C00] outline-none text-sm transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#FF8C00] p-2 rounded-xl text-black hover:bg-[#e67e00] transition shadow-lg shadow-[#FF8C00]/20">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart } from 'lucide-react';

const ChatBot = ({ products = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "नमस्ते! 'NM MART' में आपका स्वागत है। 🙏 मैं आपकी कैसे मदद कर सकता हूँ?", isBot: true }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const query = input.toLowerCase();
      const found = products.find(p => query.includes(p.name.toLowerCase()));

      let botReply = "";
      if (found) {
        botReply = `जी हाँ, NM Mart पर ${found.name} का रेट ₹${found.price} है। क्या मैं इसे आपके वॉट्सऐप कार्ट में जोड़ दूँ?`;
      } else if (query.includes("offer") || query.includes("discount") || query.includes("छूट")) {
        botReply = "अभी हमारे पास Grocery और Dry Fruits पर 50% तक का डिस्काउंट चल रहा है! 🚀";
      } else if (query.includes("location") || query.includes("kahan") || query.includes("pata")) {
        botReply = "हमारा स्टोर मंझनपुर, कौशाम्बी (UP) में स्थित है। आप कभी भी आ सकते हैं! 📍";
      } else {
        botReply = "क्षमा करें, मुझे इसके बारे में जानकारी नहीं मिली। आप सहायता के लिए 7081154604 पर संपर्क कर सकते हैं।";
      }

      setMessages(prev => [...prev, { text: botReply, isBot: true, product: found }]);
    }, 800);

    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button - Premium Orange */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#FF8C00] p-4 rounded-full shadow-2xl hover:scale-110 transition animate-bounce text-black"
      >
        {isOpen ? <X /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window - Black & Orange Theme */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-black border border-[#FF8C00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#FF8C00] p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[#FF8C00] font-bold text-xs">NM</div>
            <h3 className="font-bold text-black">NM Mart सहायक</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.isBot ? 'bg-[#1a1a1a] text-gray-200 border border-gray-800' : 'bg-[#FF8C00] text-black font-semibold'
                }`}>
                  {msg.text}
                  {msg.product && (
                    <button className="mt-3 w-full bg-green-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-lg">
                      <ShoppingCart size={14}/> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-[#111] border-t border-gray-800 flex gap-2">
            <input 
              type="text" 
              placeholder="सामान का रेट पूछें..."
              className="flex-1 bg-black text-white p-2 rounded-lg border border-gray-700 focus:border-[#FF8C00] outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#FF8C00] p-2 rounded-lg text-black hover:bg-[#e67e00]">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, Phone, MapPin, Truck, List } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [messages, setMessages] = useState([
    { 
      text: "Welcome to NM MART! How can I help you today?\nनमस्ते! NM Mart में आपका स्वागत है। मैं आपकी क्या मदद कर सकता हूँ?", 
      isBot: true,
      isHelpMenu: true // यह शुरू में हेल्प बटन दिखाएगा
    }
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
            mrp: cols[4]?.replace(/"/g, '').trim(),
            saleRate: cols[5]?.replace(/"/g, '').trim(),
            img: cols[6]?.replace(/"/g, '').trim(),
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

  // हेल्प बटन क्लिक करने का लॉजिक
  const handleHelpAction = (action) => {
    let reply = "";
    if (action === 'location') {
      reply = "📍 NM Mart is located in Manjhanpur, Kaushambi (UP).\nहमारा स्टोर मंझनपुर, कौशाम्बी (UP) में स्थित है।";
    } else if (action === 'call') {
      window.location.href = "tel:7081154604";
      return;
    } else if (action === 'delivery') {
      reply = "🚚 We offer home delivery in Manjhanpur area. Call 7081154604 to order.\nहम मंझनपुर क्षेत्र में होम डिलीवरी देते हैं। ऑर्डर के लिए फोन करें।";
    } else if (action === 'list') {
      reply = "Please type the product name (e.g. Sugar) to see the price list.\nरेट देखने के लिए सामान का नाम लिखें (जैसे: Sugar)।";
    }
    setMessages(prev => [...prev, { text: reply, isBot: true }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    const query = input.toLowerCase();
    setTimeout(() => {
      const matches = products.filter(p => p.name && p.name.toLowerCase().includes(query)).slice(0, 5);
      if (matches.length > 0) {
        setMessages(prev => [...prev, { text: `Found these items:`, isBot: true, options: matches }]);
      } else {
        setMessages(prev => [...prev, { text: "Item not found. Try searching something else.\nसामान नहीं मिला। कुछ और सर्च करें।", isBot: true }]);
      }
    }, 400);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999]">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-4 rounded-full shadow-2xl text-black border-2 border-black hover:rotate-12 transition-all">
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-[#0a0a0a] border border-[#FF8C00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#FF8C00] p-4 text-center">
            <h3 className="font-bold text-black text-sm tracking-widest uppercase italic">NM Mart Support</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[95%] p-3 rounded-2xl text-[13px] ${
                  msg.isBot ? 'bg-[#1a1a1a] text-gray-200' : 'bg-[#FF8C00] text-black font-bold'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  
                  {/* --- HELP MENU BUTTONS --- */}
                  {msg.isHelpMenu && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button onClick={() => handleHelpAction('list')} className="flex items-center gap-2 bg-black border border-gray-700 p-2 rounded-lg text-[11px] hover:bg-gray-800"><List size={14} className="text-[#FF8C00]"/> Price List</button>
                      <button onClick={() => handleHelpAction('location')} className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded-lg text-[11px] hover:bg-gray-800"><MapPin size={14} className="text-[#FF8C00]"/> Location</button>
                      <button onClick={() => handleHelpAction('delivery')} className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded-lg text-[11px] hover:bg-gray-800"><Truck size={14} className="text-[#FF8C00]"/> Delivery</button>
                      <button onClick={() => handleHelpAction('call')} className="flex items-center gap-2 bg-[#FF8C00] text-black p-2 rounded-lg text-[11px] font-bold"><Phone size={14}/> Call Now</button>
                    </div>
                  )}

                  {/* Product Cards logic remains same as before */}
                  {msg.options && (
                    <div className="mt-3 space-y-3">
                      {msg.options.map((prod, idx) => (
                        <div key={idx} className="bg-black border border-white/10 p-2 rounded-xl flex gap-2">
                          <img src={prod.img} className="w-12 h-12 rounded object-cover bg-white/5" alt="" />
                          <div className="flex-1 text-[11px]">
                            <div className="text-[#FF8C00] font-bold truncate w-32">{prod.name}</div>
                            <div className="text-white">Sale: ₹{prod.saleRate} <span className="text-gray-500 line-through text-[9px]">₹{prod.mrp}</span></div>
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
            <input type="text" placeholder="Type here..." className="flex-1 bg-black text-white p-2 rounded-xl border border-gray-800 focus:border-[#FF8C00] outline-none text-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} className="bg-[#FF8C00] p-2 rounded-xl text-black"><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

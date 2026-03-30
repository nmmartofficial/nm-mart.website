import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, Phone, MapPin, Truck, List } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [messages, setMessages] = useState([
    { text: "NM Mart Helper! 🛒\nनमस्ते! मैं आपकी क्या मदद करूँ?", isBot: true, isHelpMenu: true }
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

  const handleHelpAction = (action) => {
    if (action === 'call') { window.location.href = "tel:7081154604"; return; }
    let reply = action === 'location' ? "📍 Manjhanpur, Kaushambi." : action === 'delivery' ? "🚚 Home Delivery available." : "Type item name.";
    setMessages(prev => [...prev, { text: reply, isBot: true }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    const query = input.toLowerCase();
    setTimeout(() => {
      const matches = products.filter(p => p.name && p.name.toLowerCase().includes(query)).slice(0, 4);
      if (matches.length > 0) {
        setMessages(prev => [...prev, { text: "Items found:", isBot: true, options: matches }]);
      } else {
        setMessages(prev => [...prev, { text: "Not found.", isBot: true }]);
      }
    }, 300);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-4 z-[9999]">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-3 rounded-full shadow-lg text-black border border-black active:scale-90 transition-all">
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[280px] md:w-[320px] bg-[#0a0a0a] border border-[#FF8C00]/30 rounded-xl shadow-2xl flex flex-col h-[400px]">
          <div className="bg-[#FF8C00] py-1.5 px-3 text-center rounded-t-xl">
            <h3 className="font-bold text-black text-[10px] uppercase tracking-tighter">NM Mart Assistant</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-3 bg-black scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] p-2 rounded-lg text-[10px] leading-tight ${
                  msg.isBot ? 'bg-[#151515] text-gray-300 border border-white/5' : 'bg-[#FF8C00] text-black font-bold'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  
                  {msg.isHelpMenu && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <button onClick={() => handleHelpAction('location')} className="bg-black border border-gray-800 p-1 rounded text-[9px] flex items-center gap-1"><MapPin size={10} className="text-[#FF8C00]"/> Shop</button>
                      <button onClick={() => handleHelpAction('call')} className="bg-[#FF8C00] text-black p-1 rounded text-[9px] font-bold flex items-center gap-1"><Phone size={10}/> Call</button>
                    </div>
                  )}

                  {msg.options && (
                    <div className="mt-2 space-y-1.5">
                      {msg.options.map((prod, idx) => (
                        <div key={idx} className="bg-black border border-white/5 p-1 rounded-md flex gap-2 items-center">
                          <div className="w-8 h-8 bg-white/5 rounded overflow-hidden flex-shrink-0">
                            {prod.img && <img src={prod.img} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[#FF8C00] font-bold truncate text-[9px]">{prod.name}</div>
                            <div className="text-white text-[9px]">₹{prod.saleRate} <span className="text-gray-500 line-through">₹{prod.mrp}</span></div>
                          </div>
                          <button onClick={() => setMessages(prev => [...prev, { text: `🛒 ${prod.name} selected!`, isBot: true }])} className="p-1 bg-[#FF8C00] rounded text-black active:bg-white">
                             <ShoppingCart size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2 bg-[#111] border-t border-gray-900 flex gap-1.5">
            <input type="text" placeholder="Search..." className="flex-1 bg-black text-white px-2 py-1 rounded-md border border-gray-800 outline-none text-[11px]" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} className="bg-[#FF8C00] p-1.5 rounded-md text-black hover:bg-white"><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

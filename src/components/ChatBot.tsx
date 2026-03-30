import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, SendHorizontal, Trash2 } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); 
  const [cart, setCart] = useState([]); // 🛒 ग्राहक की शॉपिंग लिस्ट
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! Search & Add items to your list.\nनमस्ते! सामान खोजें और लिस्ट में जोड़ें।", isBot: true }
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
            saleRate: cols[5]?.replace(/"/g, '').trim() || "0",
            img: cols[6]?.replace(/"/g, '').trim()
          };
        }).filter(item => item.name);
        setProducts(list);
      } catch (err) { console.error("Data failed"); }
    };
    loadData();
  }, []);

  // 1. कार्ट में सामान जोड़ना
  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setMessages(prev => [...prev, { text: `✅ Added ${product.name} to list.\n${product.name} लिस्ट में जुड़ गया है।`, isBot: true }]);
  };

  // 2. WhatsApp पर पूरी लिस्ट भेजना
  const sendToWhatsApp = () => {
    if (cart.length === 0) return;
    
    let orderList = "*NM MART ORDER LIST*\n--------------------------\n";
    let total = 0;
    
    cart.forEach((item, index) => {
      orderList += `${index + 1}. ${item.name} - ₹${item.saleRate}\n`;
      total += parseFloat(item.saleRate);
    });
    
    orderList += `--------------------------\n*Total Amount: ₹${total}*\n--------------------------\nOrder from NM Mart Website`;
    
    const encodedMsg = encodeURIComponent(orderList);
    window.open(`https://wa.me/7081154604?text=${encodedMsg}`, '_blank');
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    const query = input.toLowerCase();
    setTimeout(() => {
      const matches = products.filter(p => p.name.toLowerCase().includes(query)).slice(0, 4);
      if (matches.length > 0) {
        setMessages(prev => [...prev, { text: "Matching items:", isBot: true, options: matches }]);
      } else {
        setMessages(prev => [...prev, { text: "Not found.", isBot: true }]);
      }
    }, 300);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-4 z-[9999]">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#FF8C00] p-3 rounded-full shadow-lg border border-black relative">
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        {cart.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
            {cart.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[290px] md:w-[320px] bg-black border border-[#FF8C00]/30 rounded-xl shadow-2xl flex flex-col h-[450px]">
          <div className="bg-[#FF8C00] py-2 px-3 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-black text-[11px] uppercase tracking-tighter">NM Mart Shopping Assistant</h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} title="Clear Cart"><Trash2 size={14} className="text-black hover:text-red-700" /></button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] p-2 rounded-lg text-[10px] ${msg.isBot ? 'bg-[#151515] text-gray-300' : 'bg-[#FF8C00] text-black font-bold'}`}>
                  {msg.text}
                  {msg.options && (
                    <div className="mt-2 space-y-1.5">
                      {msg.options.map((prod, idx) => (
                        <div key={idx} className="bg-black border border-white/5 p-1 rounded-md flex gap-2 items-center">
                          <img src={prod.img} className="w-8 h-8 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[#FF8C00] font-bold truncate text-[9px]">{prod.name}</div>
                            <div className="text-white text-[9px]">₹{prod.saleRate}</div>
                          </div>
                          <button onClick={() => addToCart(prod)} className="p-1 bg-[#FF8C00] rounded text-black"><ShoppingCart size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* --- WHATSAPP ORDER BUTTON --- */}
          {cart.length > 0 && (
            <div className="p-2 bg-[#111] border-t border-gray-800">
              <button 
                onClick={sendToWhatsApp}
                className="w-full bg-[#25D366] text-black py-2 rounded-lg flex items-center justify-center gap-2 text-[11px] font-black hover:bg-white transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
              >
                <SendHorizontal size={14} /> SEND ORDER TO WHATSAPP ({cart.length})
              </button>
            </div>
          )}

          <div className="p-2 bg-[#050505] flex gap-1.5">
            <input type="text" placeholder="Search item..." className="flex-1 bg-black text-white px-2 py-1 rounded-md border border-gray-800 outline-none text-[11px]" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} className="bg-[#FF8C00] p-1.5 rounded-md text-black"><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

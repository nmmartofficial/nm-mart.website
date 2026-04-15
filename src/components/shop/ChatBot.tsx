import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, SendHorizontal, Trash2 } from 'lucide-react';

interface ChatMessage {
  text: string;
  isBot: boolean;
  options?: { name: string; saleRate: string; img: string }[];
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Check if user is admin
    const adminSession = localStorage.getItem("nm_admin_session") === "true";
    setIsAdmin(adminSession);

    // Listen for storage changes to update admin status
    const handleStorageChange = () => {
      setIsAdmin(localStorage.getItem("nm_admin_session") === "true");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [products, setProducts] = useState<{ name: string; saleRate: string; img: string }[]>([]);
  const [cart, setCart] = useState<{ name: string; saleRate: string; img: string }[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Welcome to NM MART! Search & Add items to your list.\nनमस्ते! सामान खोजें और लिस्ट में जोड़ें।", isBot: true }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addToCart = (product: { name: string; saleRate: string; img: string }) => {
    setCart(prev => [...prev, product]);
    setMessages(prev => [...prev, { text: `✅ ${product.name} लिस्ट में जुड़ गया!`, isBot: true }]);
  };

  const sendToWhatsApp = () => {
    if (cart.length === 0) return;
    let orderList = "*NM MART ORDER LIST*\n--------------------------\n";
    let total = 0;
    cart.forEach((item, index) => {
      orderList += `${index + 1}. ${item.name} - ₹${item.saleRate}\n`;
      total += parseFloat(item.saleRate);
    });
    orderList += `--------------------------\n*Total: ₹${total}*\n--------------------------\nOrder from NM Mart Website`;
    window.open(`https://wa.me/917081154604?text=${encodeURIComponent(orderList)}`, '_blank');
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
        setMessages(prev => [...prev, { text: "कोई आइटम नहीं मिला। दूसरे नाम से खोजें।", isBot: true }]);
      }
    }, 300);
    setInput('');
  };

  if (isAdmin) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[9999]">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-primary text-primary-foreground p-3 rounded-full shadow-2xl relative hover:scale-110 transition-all active:scale-95 border-2 border-white/20 group"
      >
        <div className="absolute -top-12 right-0 bg-black text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
          Chat with AI
        </div>
        <img src="/nm-mart-logo.png" alt="NM AI" className="w-6 h-6 rounded-full" />
        {cart.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-bounce shadow-lg border border-white/20">
            {cart.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-[270px] md:w-[300px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col h-[400px] overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-primary py-2 px-3 flex justify-between items-center">
            <h3 className="font-black text-primary-foreground text-[10px] uppercase tracking-tighter italic">NM Shopping AI</h3>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button onClick={() => setCart([])} title="Clear Cart" className="hover:scale-110 transition-transform"><Trash2 size={12} className="text-primary-foreground/80 hover:text-white" /></button>
              )}
              <button onClick={() => setIsOpen(false)} className="hover:scale-110 transition-transform"><X size={14} className="text-primary-foreground/80 hover:text-white" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hide bg-gray-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[10px] font-bold ${msg.isBot ? 'bg-white border border-gray-100 text-black shadow-sm' : 'bg-primary text-white shadow-md shadow-primary/10'}`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.options && (
                    <div className="mt-2 space-y-1.5 pt-1 border-t border-gray-50">
                      {msg.options.map((opt, j) => (
                        <div key={j} className="flex items-center justify-between gap-2 p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200">
                          <span className="flex-1 text-[9px] truncate text-gray-700">{opt.name} - ₹{opt.saleRate}</span>
                          <button onClick={() => addToCart(opt)} className="text-primary hover:text-black transition-colors shrink-0">
                            <ShoppingCart size={12} className="group-hover:scale-110" />
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

          <div className="p-2.5 bg-white border-t border-border flex flex-col gap-2">
            {cart.length > 0 && (
              <button 
                onClick={sendToWhatsApp}
                className="w-full bg-green-500 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-sm italic"
              >
                <SendHorizontal size={12} /> Order WhatsApp ({cart.length})
              </button>
            )}
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Search products..."
                className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:border-primary transition-all placeholder:text-gray-300"
              />
              <button 
                onClick={handleSend}
                className="bg-primary text-white p-1.5 rounded-lg hover:scale-105 transition-transform shadow-md"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

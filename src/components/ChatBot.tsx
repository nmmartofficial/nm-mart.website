import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, SendHorizontal, Trash2 } from 'lucide-react';

interface ChatMessage {
  text: string;
  isBot: boolean;
  options?: { name: string; saleRate: string; img: string }[];
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
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

  return (
    <div className="fixed bottom-24 right-4 z-[9999]">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg relative">
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        {cart.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
            {cart.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[290px] md:w-[320px] bg-card border border-border rounded-xl shadow-2xl flex flex-col h-[450px]">
          <div className="bg-primary py-2 px-3 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-primary-foreground text-[11px] uppercase tracking-tighter">NM Mart Shopping Assistant</h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} title="Clear Cart"><Trash2 size={14} className="text-primary-foreground hover:text-destructive" /></button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] p-2 rounded-lg text-[10px] ${msg.isBot ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground font-bold'}`}>
                  {msg.text}
                  {msg.options && (
                    <div className="mt-2 space-y-1.5">
                      {msg.options.map((prod, idx) => (
                        <div key={idx} className="bg-card border border-border p-1 rounded-md flex gap-2 items-center">
                          <img src={prod.img || "https://nmmart.in/logo.jpeg"} className="w-8 h-8 rounded object-cover" alt={prod.name} onError={e => { (e.target as HTMLImageElement).src = "https://nmmart.in/logo.jpeg"; }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-primary font-bold truncate text-[9px]">{prod.name}</div>
                            <div className="text-foreground text-[9px]">₹{prod.saleRate}</div>
                          </div>
                          <button onClick={() => addToCart(prod)} className="p-1 bg-primary rounded text-primary-foreground"><ShoppingCart size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {cart.length > 0 && (
            <div className="p-2 border-t border-border">
              <button
                onClick={sendToWhatsApp}
                className="w-full bg-[hsl(var(--success))] text-white py-2 rounded-lg flex items-center justify-center gap-2 text-[11px] font-black hover:opacity-90 transition-all"
              >
                <SendHorizontal size={14} /> SEND ORDER ({cart.length})
              </button>
            </div>
          )}

          <div className="p-2 bg-secondary/50 flex gap-1.5">
            <input type="text" placeholder="Search item..." className="flex-1 bg-card text-foreground px-2 py-1 rounded-md border border-border outline-none text-[11px]" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} className="bg-primary p-1.5 rounded-md text-primary-foreground"><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

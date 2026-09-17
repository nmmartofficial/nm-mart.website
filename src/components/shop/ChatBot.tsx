import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart, SendHorizontal, Trash2 } from 'lucide-react';
import { supabase } from "@/lib/supabase/client";
import { WA_NUMBER } from "@/lib/store-utils";

interface ChatMessage {
  text: string;
  isBot: boolean;
  options?: { name: string; saleRate: string; img: string }[];
}

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatBot = ({ isOpen, setIsOpen }: ChatBotProps) => {
  const ADMIN_EMAIL = "nmmart07@gmail.com";
  const [isAdmin, setIsAdmin] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAdmin(data.session?.user?.email?.toLowerCase() === ADMIN_EMAIL);
    };

    checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAdmin(session?.user?.email?.toLowerCase() === ADMIN_EMAIL);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
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
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(orderList)}`, '_blank');
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

  if (isAdmin || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card border border-border rounded-[32px] shadow-2xl flex flex-col h-[600px] max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-primary py-4 px-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <MessageCircle size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider leading-none">NM Mart AI Help</h3>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Online Support</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {cart.length > 0 && (
                <button onClick={() => setCart([])} title="Clear Cart" className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Trash2 size={16} className="text-white" /></button>
              )}
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><X size={18} className="text-white" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-bold ${msg.isBot ? 'bg-white border border-gray-100 text-black shadow-sm' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.options && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-gray-100">
                      {msg.options.map((opt, j) => (
                        <div key={j} className="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200">
                          <span className="flex-1 text-[10px] truncate text-gray-700 font-black">{opt.name} - ₹{opt.saleRate}</span>
                          <button onClick={() => addToCart(opt)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shrink-0">
                            <ShoppingCart size={14} />
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

          <div className="p-4 bg-white border-t border-border shrink-0">
            {cart.length > 0 && (
              <button 
                onClick={sendToWhatsApp}
                className="w-full bg-green-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md mb-3"
              >
                <SendHorizontal size={14} /> Send List to WhatsApp ({cart.length})
              </button>
            )}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask something or search products..."
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-gray-300"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ChatBot;

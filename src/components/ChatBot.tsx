import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShoppingCart } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]); // यहाँ शीट का डेटा स्टोर होगा
  const [messages, setMessages] = useState([
    { text: "Welcome to NM MART! Ask me about any product price.\nनमस्ते! किसी भी सामान का रेट पूछें।", isBot: true }
  ]);
  const chatEndRef = useRef(null);

  // 1. Google Sheet से डेटा खींचने का फंक्शन
  useEffect(() => {
    const loadSheetData = async () => {
      try {
        // यहाँ अपनी Google Sheet का CSV URL डालें
        const SHEET_URL = "यहाँ_अपनी_CSV_लिंक_डालें"; 
        const response = await fetch(SHEET_URL);
        const csvData = await response.text();
        
        // CSV को JSON में बदलना (Simple Logic)
        const rows = csvData.split('\n').slice(1);
        const formattedData = rows.map(row => {
          const cols = row.split(',');
          return { name: cols[0]?.trim(), price: cols[1]?.trim(), category: cols[2]?.trim() };
        });
        setProducts(formattedData);
      } catch (error) {
        console.error("Sheet load error:", error);
      }
    };
    loadSheetData();
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const query = input.toLowerCase();
      
      // 2. 7,000 प्रोडक्ट्स में सर्च करने का असली लॉजिक
      const found = products.find(p => 
        p.name && query.includes(p.name.toLowerCase())
      );

      let botReply = "";
      if (found) {
        botReply = `Yes, ${found.name} is available for ₹${found.price}.\nजी हाँ, ${found.name} का रेट ₹${found.price} है।`;
      } else {
        botReply = "Sorry, I couldn't find that. Call 7081154604.\nक्षमा करें, इसकी जानकारी नहीं मिली। 7081154604 पर फोन करें।";
      }

      setMessages(prev => [...prev, { text: botReply, isBot: true, product: found }]);
    }, 600);

    setInput('');
  };

  // ... (बाकी UI कोड पहले वाला ही रहेगा)
  return (
    <div className="fixed bottom-6 right-6 z-50">
       {/* UI code follows... */}
    </div>
  );
};

export default ChatBot;

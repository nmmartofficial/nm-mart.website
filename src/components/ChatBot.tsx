// ... (ऊपर का पिछला कोड वही रहेगा, बस handleSend के अंदर का हिस्सा बदलें)

const handleSend = () => {
  if (!input.trim()) return;
  const userMsg = { text: input, isBot: false };
  setMessages(prev => [...prev, userMsg]);

  setTimeout(() => {
    const query = input.toLowerCase().trim();
    
    // 1. ग्राहक के टाइप किए शब्द से मिलते-जुलते 'सारे' प्रोडक्ट्स ढूंढना
    const matches = products.filter(p => 
      p.name && p.name.toLowerCase().includes(query)
    ).slice(0, 5); // सिर्फ टॉप 5 ऑप्शन दिखाएंगे ताकि भीड़ न हो

    if (matches.length > 0) {
      const replyText = `I found ${matches.length} items. Please select one:\nमुझे ${matches.length} सामान मिले हैं। कृपया एक चुनें:`;
      
      // 2. इन सभी ऑप्शंस को बटन के रूप में मैसेज में भेजना
      setMessages(prev => [...prev, { 
        text: replyText, 
        isBot: true, 
        options: matches // यहाँ हम ऑप्शंस भेज रहे हैं
      }]);
    } else {
      setMessages(prev => [...prev, { 
        text: "Sorry, no product found. / क्षमा करें, यह सामान नहीं मिला।", 
        isBot: true 
      }]);
    }
  }, 500);
  setInput('');
};

// ... (UI वाले हिस्से में जहाँ मैसेज रेंडर (Render) होते हैं, वहां ये बदलाव करें)

{msg.options && (
  <div className="mt-3 flex flex-col gap-2">
    {msg.options.map((prod, idx) => (
      <button 
        key={idx}
        onClick={() => {
          // बटन क्लिक करने पर वो कार्ट में ऐड होने का मैसेज दिखाए
          setMessages(prev => [...prev, { 
            text: `Added ${prod.name} (₹${prod.price}) to cart! / ${prod.name} कार्ट में जोड़ दिया गया है!`, 
            isBot: true 
          }]);
        }}
        className="w-full bg-[#222] border border-[#FF8C00]/50 text-[#FF8C00] p-2 rounded-lg text-xs font-bold hover:bg-[#FF8C00] hover:text-black transition"
      >
        {prod.name} - ₹{prod.price}
      </button>
    ))}
  </div>
)}

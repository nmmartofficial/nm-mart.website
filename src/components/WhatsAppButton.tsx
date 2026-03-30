import React from 'react';
import { MessageSquare } from 'lucide-react'; // या WhatsApp का ओरिजिनल आइकन

const WhatsAppButton = () => {
  const phoneNumber = "7081154604"; // आपका नंबर
  const message = "Hello NM Mart! I want to order something."; // डिफ़ॉल्ट मैसेज

  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-4 z-[9999]">
      <button 
        onClick={handleClick}
        // साइज को 'p-3' और 'w-10 h-10' के आसपास रखा है ताकि चैट बटन से मैच करे
        className="bg-[#25D366] p-3 rounded-full shadow-lg text-white border border-black/10 active:scale-90 transition-all flex items-center justify-center hover:scale-110"
        title="WhatsApp Us"
      >
        {/* आइकन साइज 20 रखा है जैसा चैटबॉट में है */}
        <svg 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="currentColor" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.8A8.38 8.38 0 0 1 21 11.5Z"></path>
        </svg>
      </button>
    </div>
  );
};

export default WhatsAppButton;

import React from 'react';

const WhatsAppButton = () => {
  const phoneNumber = "7081154604";
  
  return (
    // 'bottom-6' पर ताकि ये सबसे नीचे रहे और इसके ऊपर चैटबॉट रहे
    <div className="fixed bottom-6 right-4 z-[9999]">
      <a 
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        // w-11 h-11 और p-0 से ये बटन एकदम छोटा और गोल हो जाएगा
        className="w-11 h-11 bg-[#25D366] rounded-full shadow-lg border border-black/10 flex items-center justify-center hover:scale-110 active:scale-90 transition-all overflow-hidden"
      >
        {/* असली WhatsApp का छोटा आइकन (Size 18) */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
          alt="WhatsApp" 
          className="w-6 h-6 object-contain"
        />
      </a>
    </div>
  );
};

export default WhatsAppButton;

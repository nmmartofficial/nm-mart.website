<div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
  {item.Barcode && item.Barcode.length > 5 ? (
    <img 
      // यह API दुनिया के करोड़ों बारकोड की फोटो फ्री में देता है
      src={`https://images.openfoodfacts.org/images/products/${item.Barcode}/front_en.400.jpg`} 
      alt={item.Name} 
      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
      onError={(e) => {
        // अगर ऊपर वाली साइट पर फोटो नहीं मिली, तो दूसरी बड़ी साइट (Flipkart/Amazon style) से कोशिश करो
        const target = e.currentTarget;
        target.src = `https://www.bigbasket.com/media/uploads/p/l/${item.Barcode}_1-tata-salt-iodized.jpg`; 
        
        // अगर कहीं भी फोटो नहीं मिली, तो सुंदर Logo दिखाओ
        target.onerror = () => {
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 font-black text-2xl shadow-inner uppercase">${item.Name?.charAt(0)}</div>`;
          }
        };
      }}
    />
  ) : (
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-2xl uppercase">
      {item.Name?.charAt(0)}
    </div>
  )}
</div>

<div className="h-44 bg-white flex items-center justify-center p-4 relative group overflow-hidden">
  {(() => {
    // POS Data Cleaning: Barcode को टेक्स्ट में बदलकर फालतू चीजें हटाना
    let barcode = item["Barcode"];
    
    // अगर नंबर Scientific format में है, तो उसे सीधा करना
    if (typeof barcode === 'number') {
      barcode = barcode.toLocaleString('fullwide', {useGrouping:false});
    }
    
    const cleanBarcode = String(barcode || "").trim().split('.')[0];

    if (cleanBarcode && cleanBarcode.length >= 8) {
      return (
        <img 
          src={`https://images.openfoodfacts.org/images/products/${cleanBarcode}/front_en.400.jpg`}
          alt={item["Item Name"]}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          // Retrying with Global Database if first one fails
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('world.openfoodfacts')) {
              target.src = `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.jpg`;
            } else {
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.pos-icon')) {
                const iconDiv = document.createElement('div');
                iconDiv.className = "pos-icon w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 font-black text-3xl shadow-inner uppercase";
                iconDiv.innerText = item["Item Name"]?.charAt(0) || "N";
                parent.appendChild(iconDiv);
              }
            }
          }}
        />
      );
    } else {
      return (
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 font-black text-3xl shadow-inner uppercase">
          {item["Item Name"]?.charAt(0)}
        </div>
      );
    }
  })()}
</div>

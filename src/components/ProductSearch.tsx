<img 
  // रास्ता 1: OpenFoodFacts (International)
  src={`https://images.openfoodfacts.org/images/products/${item["Barcode"]}/front_en.400.jpg`}
  alt={item["Item Name"]}
  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
  onError={(e) => {
    const target = e.currentTarget;
    // अगर रास्ता 1 फेल हुआ, तो रास्ता 2: BigBasket/Google style image
    if (!target.src.includes('bigbasket')) {
       target.src = `https://www.bigbasket.com/media/uploads/p/l/${item["Barcode"]}_1-tata-salt.jpg`;
    } else {
       // अगर कहीं भी फोटो न मिले, तो सुंदर Logo दिखाओ
       target.style.display = 'none';
       const parent = target.parentElement;
       if (parent) {
         parent.innerHTML = `<div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 font-black text-2xl uppercase">${item["Item Name"]?.charAt(0)}</div>`;
       }
    }
  }}
/>

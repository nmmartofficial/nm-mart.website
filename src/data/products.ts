export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  stock: "in-stock" | "limited";
  rating: number;
}

export const products: Product[] = [
  // Daily Essentials
  { id: 1, name: "Tata Salt (1kg)", price: 28, originalPrice: 32, category: "Daily Essentials", image: "🧂", stock: "in-stock", rating: 4.8 },
  { id: 2, name: "Fortune Sunflower Oil (1L)", price: 145, originalPrice: 165, category: "Daily Essentials", image: "🫒", stock: "in-stock", rating: 4.7 },
  { id: 3, name: "Aashirvaad Atta (5kg)", price: 265, originalPrice: 299, category: "Daily Essentials", image: "🌾", stock: "in-stock", rating: 4.9 },
  { id: 4, name: "Amul Butter (500g)", price: 275, originalPrice: 290, category: "Daily Essentials", image: "🧈", stock: "limited", rating: 4.8 },
  { id: 5, name: "Tata Tea Gold (500g)", price: 285, originalPrice: 310, category: "Daily Essentials", image: "🍵", stock: "in-stock", rating: 4.6 },
  { id: 6, name: "Sugar (1kg)", price: 48, originalPrice: 55, category: "Daily Essentials", image: "🍬", stock: "in-stock", rating: 4.5 },
  // Premium Home Textiles
  { id: 7, name: "Cotton Bedsheet Set (King)", price: 899, originalPrice: 1299, category: "Premium Home Textiles", image: "🛏️", stock: "limited", rating: 4.9 },
  { id: 8, name: "Bath Towel Set (4 pcs)", price: 699, originalPrice: 999, category: "Premium Home Textiles", image: "🛁", stock: "in-stock", rating: 4.7 },
  { id: 9, name: "Silk Cushion Covers (Set of 5)", price: 549, originalPrice: 799, category: "Premium Home Textiles", image: "🛋️", stock: "in-stock", rating: 4.8 },
  { id: 10, name: "Premium Curtains (7ft)", price: 1199, originalPrice: 1599, category: "Premium Home Textiles", image: "🪟", stock: "limited", rating: 4.6 },
  { id: 11, name: "Woolen Blanket (Double)", price: 1499, originalPrice: 1999, category: "Premium Home Textiles", image: "🧶", stock: "in-stock", rating: 4.9 },
  { id: 12, name: "Table Runner Set", price: 399, originalPrice: 599, category: "Premium Home Textiles", image: "🎀", stock: "in-stock", rating: 4.5 },
];

export const categories = [...new Set(products.map(p => p.category))];

export const reviews = [
  { name: "Priya Sharma", location: "Manjhanpur", rating: 5, text: "Best prices in the area! The home textiles quality is amazing. I saved so much with the Welfare Card." },
  { name: "Rajesh Kumar", location: "Kaushambi", rating: 5, text: "NM Mart has everything I need. Fresh products and great customer service. Highly recommended!" },
  { name: "Sunita Devi", location: "Manjhanpur", rating: 5, text: "The Welfare Card membership is a game changer. Extra discounts every time I shop here." },
  { name: "Amit Verma", location: "Pratappur", rating: 5, text: "Quick WhatsApp ordering is so convenient. Products delivered on time with best quality." },
];

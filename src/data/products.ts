import { supabase } from "@/lib/supabase/client";

// --- 2. PRODUCT INTERFACE ---
export interface Product {
  barcode: string;
  name: string;
  mrp: number;
  salerate: number;
  discount: number;
  category: string;
  image: string;
  stock: string;
}

// --- 3. LIVE DATA FETCHING FUNCTION ---
// यह फंक्शन सुपाबेस से ताजा माल उठाएगा
export const fetchLiveProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching products:", error.message);
      return [];
    }

    return data.map((item: any) => ({
      barcode: item.barcode,
      name: item.name,
      mrp: item.mrp,
      salerate: item.salerate,
      discount: item.discount,
      category: item.category || 'General',
      image: "🛍️", // फिलहाल एक डिफ़ॉल्ट इमोजी
      stock: item.stock > 0 ? "in-stock" : "limited"
    }));
  } catch (err) {
    console.error("Fetch Live Products Error:", err);
    return [];
  }
};

// --- 4. REVIEWS (इसे आप ऐसे ही रख सकते हैं) ---
export const reviews = [
  { name: "Priya Sharma", location: "Manjhanpur", rating: 5, text: "Best prices in the area! The home textiles quality is amazing." },
  { name: "Rajesh Kumar", location: "Kaushambi", rating: 5, text: "NM Mart has everything I need. Fresh products." },
  { name: "Sunita Devi", location: "Manjhanpur", rating: 5, text: "The Welfare Card membership is a game changer." },
];

import { supabase } from "@/lib/supabase/client";

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

export const fetchLiveProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("barcode, name, mrp, salerate, discount, category, image_url, stock")
      .gt("stock", 0)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error.message);
      return [];
    }

    return (data ?? [])
      .map((item: any) => ({
        barcode: String(item?.barcode ?? "").trim(),
        name: String(item?.name ?? "").trim(),
        mrp: Number(item?.mrp ?? 0),
        salerate: Number(item?.salerate ?? item?.sale_rate ?? item?.price ?? 0),
        discount: Number(item?.discount ?? item?.discount_percent ?? 0),
        category: String(item?.category ?? "General").trim() || "General",
        image: String(item?.image_url ?? "").trim(),
        stock: Number(item?.stock ?? 0) > 0 ? "in-stock" : "out-of-stock",
      }))
      .filter((item) => item.barcode && item.name);
  } catch (err) {
    console.error("Fetch Live Products Error:", err);
    return [];
  }
};

export const reviews: Array<{ name: string; location: string; rating: number; text: string }> = [];

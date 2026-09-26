import { supabase } from "@/lib/supabase/client";
import { TABLES, isProductInStock } from "@/lib/supabase/schema";

/** Mapped storefront product DTO (output of fetchLiveProducts, NOT a raw Supabase row).
 *  Field names here are local contract; actual Supabase column names are used in select() and mapping below.
 */
export interface Product {
  barcode: string;
  name: string;
  mrp: number;
  /** Local mapped field - populated from authoritative Supabase column `sale_rate` (with legacy ERP aliases as fallback). */
  salerate: number;
  discount: number;
  category: string;
  /** Local mapped field - populated from authoritative Supabase column `image_url`. */
  image: string;
  stock: string;
}

export const fetchLiveProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.products)
      // Only actual Supabase columns are selected here, in sync with live schema.
      .select("barcode, name, mrp, sale_rate, onlinerate, online_rate, retail_rate, restrate, selling_price, discount_percent, discount_pct, discperc, discount, category_name, item_group_name, item_group, item_category, image_url, picture, stock, opstock, opening_stock")
      .gt("stock", 0)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error.message);
      return [];
    }

    return (data ?? [])
      .filter((item: any) => isProductInStock(item))
      .map((item: any) => ({
        barcode: String(item?.barcode ?? "").trim(),
        name: String(item?.name ?? "").trim(),
        mrp: Number(item?.mrp ?? 0),
        // Authoritative column order per helpers in schema.ts: sale_rate > onlinerate > online_rate > retail_rate > restrate > selling_price
        salerate: Number(item?.sale_rate ?? item?.onlinerate ?? item?.online_rate ?? item?.retail_rate ?? item?.restrate ?? item?.selling_price ?? 0),
        // discount helpers order: discount_percent > discount_pct > discperc > discount
        discount: Number(item?.discount_percent ?? item?.discount_pct ?? item?.discperc ?? item?.discount ?? 0),
        // category helpers order: category_name > item_group_name > item_group > item_category
        category: String(item?.category_name ?? item?.item_group_name ?? item?.item_group ?? item?.item_category ?? "General").trim() || "General",
        image: String(item?.image_url ?? item?.picture ?? "").trim(),
        // stock helpers order: stock > opstock > opening_stock
        stock: "in-stock",
      }))
      .filter((item) => item.barcode && item.name);
  } catch (err) {
    console.error("Fetch Live Products Error:", err);
    return [];
  }
};

export const reviews: Array<{ name: string; location: string; rating: number; text: string }> = [];

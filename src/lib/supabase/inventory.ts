import { supabase } from "./client";

export interface InventoryItem {
  barcode: string;
  name: string;
  mrp: number;
  salerate: number;
  category: string;
  sub_category?: string;
  brand?: string;
  image_url?: string;
  stock_quantity?: number;
  updated_at?: string;
}

/**
 * Upserts a single product or bulk products into the inventory table.
 * If barcode exists, updates the entry. If new, creates one.
 */
export async function upsertInventory(data: InventoryItem | InventoryItem[]) {
  const isBulk = Array.isArray(data);
  const items = isBulk ? data : [data];
  
  const { data: result, error } = await supabase
    .from('products')
    .upsert(items, { onConflict: 'barcode' });

  if (error) {
    console.error("Supabase Inventory Upsert Error:", error);
    throw new Error(`[${error.code}] ${error.message || "Database rejected the update"}`);
  }

  return result;
}

/**
 * Fetches a single product by barcode.
 */
export async function getProductByBarcode(barcode: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle();

  if (error) {
    console.error("Supabase Get Product Error:", error);
    throw error;
  }

  return data;
}

/**
 * Fetches all products.
 */
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Supabase Get All Products Error:", error);
    throw error;
  }

  return data;
}

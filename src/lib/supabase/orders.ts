import { supabase } from "./client";

export type OrderRecord = {
  id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  landmark?: string | null;
  pincode?: string | null;
  items?: unknown;
  subtotal?: number | null;
  total?: number | null;
  payment_method?: string | null;
  status?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function placeWebsiteOrder(payload: Record<string, unknown>): Promise<OrderRecord | null> {
  const { data, error } = await supabase.rpc("place_website_order_atomic", payload);
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as OrderRecord | null;
}

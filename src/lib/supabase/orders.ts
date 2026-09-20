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

export async function placeWebsiteOrder(_payload: Record<string, unknown>): Promise<OrderRecord | null> {
  // Final Supabase wiring placeholder.
  // Use the canonical checkout RPC once the final migration is executed.
  return null;
}

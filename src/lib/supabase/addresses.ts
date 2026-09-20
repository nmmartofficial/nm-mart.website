export type SavedAddress = {
  id: number;
  user_id: string;
  label: string;
  full_name?: string | null;
  phone?: string | null;
  address: string;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode: string;
  address_type?: string | null;
  is_default: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function getCustomerAddresses(_userId: string): Promise<SavedAddress[]> {
  // Final Supabase wiring placeholder.
  return [];
}

export async function saveCustomerAddress(_userId: string, _payload: Partial<SavedAddress>): Promise<SavedAddress | null> {
  return null;
}

export async function deleteCustomerAddress(_userId: string, _addressId: number): Promise<boolean> {
  return false;
}

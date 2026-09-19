import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "@/lib/supabase/schema";

export type SavedAddress = {
  id: number;
  label: string;
  address: string;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string;
  is_default: boolean;
};

export function useSavedAddresses() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from(TABLES.customerAddresses)
      .select("id, label, address, landmark, city, state, pincode, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    setAddresses((data || []) as SavedAddress[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadAddresses(); }, [loadAddresses]);

  const saveAddress = async (address: Omit<SavedAddress, "id" | "is_default"> & { is_default?: boolean }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login before saving an address.");
    if (addresses.length >= 5) throw new Error("You can save up to 5 addresses.");

    const { error } = await supabase.from(TABLES.customerAddresses).insert({
      user_id: user.id,
      ...address,
      is_default: address.is_default ?? addresses.length === 0,
    });
    if (error) throw error;
    await loadAddresses();
  };

  const deleteAddress = async (id: number) => {
    const { error } = await supabase.from(TABLES.customerAddresses).delete().eq("id", id);
    if (error) throw error;
    setAddresses((current) => current.filter((address) => address.id !== id));
  };

  return { addresses, loading, saveAddress, deleteAddress, reloadAddresses: loadAddresses };
}

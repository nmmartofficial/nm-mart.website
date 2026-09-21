import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "@/lib/supabase/schema";
import { getActiveSession, getSupabaseErrorMessage } from "@/lib/supabase";

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

    try {
      const session = await getActiveSession();
      const user = session?.user;

      if (!user) {
        setAddresses([]);
        return;
      }

      const { data, error } = await supabase
        .from(TABLES.customerAddresses)
        .select(
          "id, label, address, landmark, city, state, pincode, is_default"
        )
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(
          getSupabaseErrorMessage(error, "Unable to load saved addresses.")
        );
      }

      setAddresses((data || []) as SavedAddress[]);
    } catch (error) {
      console.error("[SavedAddresses] Load error:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const saveAddress = async (
    address: Omit<SavedAddress, "id" | "is_default"> & {
      is_default?: boolean;
    }
  ) => {
    const session = await getActiveSession();
    const user = session?.user;

    if (!user) {
      throw new Error("Please login before saving an address.");
    }

    if (addresses.length >= 5) {
      throw new Error("You can save up to 5 addresses.");
    }

    const { error } = await supabase
      .from(TABLES.customerAddresses)
      .insert({
        user_id: user.id,
        ...address,
        is_default: address.is_default ?? addresses.length === 0,
      });

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(error, "Unable to save address.")
      );
    }

    await loadAddresses();
  };

  const deleteAddress = async (id: number) => {
    const session = await getActiveSession();
    const user = session?.user;

    if (!user) {
      throw new Error("Please login before deleting an address.");
    }

    const { error } = await supabase
      .from(TABLES.customerAddresses)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(error, "Unable to delete address.")
      );
    }

    setAddresses((current) =>
      current.filter((address) => address.id !== id)
    );
  };

  const updateAddress = async (
    id: number,
    address: Omit<SavedAddress, "id" | "is_default">
  ) => {
    const session = await getActiveSession();
    const user = session?.user;

    if (!user) {
      throw new Error("Please login before updating an address.");
    }

    const { error } = await supabase
      .from(TABLES.customerAddresses)
      .update(address)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(error, "Unable to update address.")
      );
    }

    await loadAddresses();
  };

  const setDefaultAddress = async (id: number) => {
    const session = await getActiveSession();
    const user = session?.user;

    if (!user) {
      throw new Error("Please login before selecting an address.");
    }

    const clearDefault = await supabase
      .from(TABLES.customerAddresses)
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (clearDefault.error) {
      throw new Error(
        getSupabaseErrorMessage(
          clearDefault.error,
          "Unable to update default address."
        )
      );
    }

    const { error } = await supabase
      .from(TABLES.customerAddresses)
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(error, "Unable to set default address.")
      );
    }

    await loadAddresses();
  };

  return {
    addresses,
    loading,
    saveAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    reloadAddresses: loadAddresses,
  };
}
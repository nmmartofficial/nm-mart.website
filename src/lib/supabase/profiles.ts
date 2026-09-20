import { supabase } from "./client";
import { TABLES } from "./schema";

export type ProfileRecord = {
  id: string;
  full_name?: string | null;
  mobile?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  landmark?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function getProfileById(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase.from(TABLES.profiles).select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as ProfileRecord | null;
}

export async function updateProfile(userId: string, changes: Partial<ProfileRecord>): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from(TABLES.profiles)
    .upsert({ id: userId, ...changes, updated_at: new Date().toISOString() })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProfileRecord;
}

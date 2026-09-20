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

export async function getProfileById(_userId: string): Promise<ProfileRecord | null> {
  // Final Supabase wiring placeholder.
  // Use a single centralized module once the final migration is executed.
  return null;
}

export async function updateProfile(_userId: string, _changes: Partial<ProfileRecord>): Promise<ProfileRecord | null> {
  return null;
}

import { supabase } from "./client";
import { TABLES } from "./schema";

export type WalletRecord = {
  id: number;
  user_id: string;
  balance: number;
  currency: string;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type WalletTransaction = {
  id: number;
  wallet_id: number;
  user_id: string;
  entry_type: "credit" | "debit" | "refund" | "cashback" | "admin_adjustment";
  amount: number;
  currency: string;
  reference_type?: string | null;
  reference_id?: string | null;
  reason?: string | null;
  created_at?: string | null;
};

export async function getWallet(userId: string): Promise<WalletRecord | null> {
  const { data, error } = await supabase.from(TABLES.wallets).select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as WalletRecord | null;
}

export async function getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from(TABLES.walletTransactions)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as WalletTransaction[];
}

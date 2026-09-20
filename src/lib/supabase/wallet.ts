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

export async function getWallet(_userId: string): Promise<WalletRecord | null> {
  // Final Supabase wiring placeholder.
  return null;
}

export async function getWalletTransactions(_userId: string): Promise<WalletTransaction[]> {
  return [];
}

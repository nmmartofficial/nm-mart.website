import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminRole = "super_admin" | "cashier";

export interface AdminRow {
  id?: string | number | null;
  auth_user_id?: string | null;
  role?: AdminRole | null;
  is_active?: boolean | null;
  status?: string | null;
  permissions?: Record<string, unknown> | null;
}

const ACTIVE_ADMIN_ROLES = new Set<AdminRole>(["super_admin", "cashier"]);

export async function isActiveAdminUser(
  supabaseClient: Pick<SupabaseClient, "from">,
  authUserId: string | null | undefined,
): Promise<boolean> {
  if (!authUserId) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from("admin_users")
    .select("id, auth_user_id, role, is_active, status, permissions")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  const role = typeof data.role === "string" ? data.role.trim().toLowerCase() : "";
  const isActive = data.is_active === true;
  const isStatusActive = !data.status || data.status.toString().trim().toLowerCase() === "active";
  const isRoleAdmin = ACTIVE_ADMIN_ROLES.has(role as AdminRole);

  return isActive && isStatusActive && isRoleAdmin;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return false;
}

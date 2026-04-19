import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type WebsiteBanner = {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  whatsapp_link?: string;
  /** Optional: internal path, hash (e.g. #products), or full URL (DB column may be `banner_link` or legacy `link`) */
  banner_link?: string | null;
  link?: string | null;
  active: boolean;
  display_order: number;
};

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function logSupabaseDebug(action: string, payload?: unknown, error?: unknown): void {
  if (error) {
    console.error(`[Supabase:${action}]`, { payload, error });
    return;
  }
  console.debug(`[Supabase:${action}]`, payload);
}

export function getSupabaseErrorMessage(
  error: SupabaseErrorLike | null | undefined,
  fallback = "Operation failed"
): string {
  const msg = error?.message || "";
  const code = error?.code || "";
  const lower = msg.toLowerCase();

  if (lower.includes("jwt") || lower.includes("auth") || code === "PGRST301") {
    return "Please login again.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("timeout")) {
    return "Checking connection. Please try again.";
  }
  if (lower.includes("relation") && lower.includes("does not exist")) {
    return `Table not found: ${msg}`;
  }
  if (code === "23505") {
    return `Duplicate data conflict: ${msg}`;
  }
  if (msg) return msg;
  return fallback;
}

export async function getActiveSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    logSupabaseDebug("getActiveSession:error", undefined, error);
    throw new Error(getSupabaseErrorMessage(error, "Please login again."));
  }
  return data.session ?? null;
}

export async function fetchActiveBanners(): Promise<WebsiteBanner[]> {
  try {
    const { data, error } = await supabase
      .from("website_banners")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true, nullsFirst: false });

    if (error) throw error;
    const banners = (data || [])
      .filter((banner: any) => banner?.image_url)
      .map((banner: any, index: number) => ({
        ...banner,
        display_order: typeof banner.display_order === "number" ? banner.display_order : index,
      }));
    logSupabaseDebug("fetchActiveBanners", { count: banners.length });
    return banners;
  } catch (error: any) {
    logSupabaseDebug("fetchActiveBanners:error", undefined, error);
    throw new Error(getSupabaseErrorMessage(error, "Unable to fetch banners"));
  }
}

export async function persistBannerOrder(banners: WebsiteBanner[]): Promise<void> {
  const ordered = [...banners]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((banner, index) => ({
      ...banner,
      display_order: index,
    }));

  logSupabaseDebug("persistBannerOrder:payload", ordered.map(b => ({ id: b.id, display_order: b.display_order })));

  try {
    for (const banner of ordered) {
      const { error } = await supabase
        .from("website_banners")
        .update({ display_order: banner.display_order })
        .eq("id", banner.id);
      if (error) throw error;
    }
  } catch (error: any) {
    logSupabaseDebug("persistBannerOrder:error", ordered, error);
    throw new Error(getSupabaseErrorMessage(error, "Failed to persist banner order"));
  }
}

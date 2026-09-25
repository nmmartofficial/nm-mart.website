import { supabase } from "@/lib/supabase/client";
import { TABLES } from "@/lib/supabase/schema";
import { resolveStorageImageUrl } from "@/lib/supabase/productImagesStorage";
import type { Session } from "@supabase/supabase-js";

export type WebsiteBanner = {
  id: string;
  name?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  whatsapp_link?: string | null;
  banner_link?: string | null;
  link?: string | null;
  link_url?: string | null;
  link_type?: string | null;
  link_id?: string | null;
  linked_product_id?: string | null;
  action_type?: string | null;
  action_value?: string | null;
  banner_type?: string | null;
  is_active: boolean;
  is_deleted?: boolean | null;
  sort_order?: number | null;
  active: boolean;
  display_order: number;
  start_date?: string | null;
  end_date?: string | null;
  itname?: string | null;
  company_code?: string | null;
  tenant_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function logSupabaseDebug(action: string, payload?: unknown, error?: unknown): void {
  if (import.meta.env.PROD) return;
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
  const msg = (error?.message || "").replace(/\s+/g, " ").trim();
  const code = error?.code || "";
  const details = (error?.details || "").replace(/\s+/g, " ").trim();
  const hint = (error?.hint || "").replace(/\s+/g, " ").trim();
  const combined = [msg, details, hint].filter(Boolean).join(" | ");
  const lower = combined.toLowerCase();

  if (lower.includes("jwt") || lower.includes("auth") || code === "PGRST301") {
    return "Please login again.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("timeout")) {
    return "Checking connection. Please try again.";
  }
  if (lower.includes("permission denied") || lower.includes("row-level security") || lower.includes("rls")) {
    return "Permission issue: this action is not allowed in the current session. Please check login status or backend policy.";
  }
  if (lower.includes("relation") && lower.includes("does not exist")) {
    return `Database issue: a required table is missing. Please update the Supabase schema. Details: ${combined}`;
  }
  if (lower.includes("column") && lower.includes("does not exist")) {
    return `Database issue: a required column is missing. Please update the Supabase schema. Details: ${combined}`;
  }
  if (code === "23505" || lower.includes("duplicate key") || lower.includes("already exists")) {
    return `Duplicate entry detected. This record already exists and cannot be saved again. Details: ${combined}`;
  }
  if (code === "23503" || lower.includes("foreign key") || lower.includes("violates foreign key")) {
    return `Related data is missing. Please check the linked record before saving. Details: ${combined}`;
  }
  if (lower.includes("not-null") || lower.includes("null value") || lower.includes("cannot be null")) {
    return `Missing required field. Please complete all required values before trying again.`;
  }
  if (lower.includes("invalid input syntax") || lower.includes("invalid text representation") || lower.includes("bad request")) {
    return `Invalid value format. Please check the entered data and try again. Details: ${combined}`;
  }
  if (combined) {
    return `${combined}`;
  }
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

export function normalizeBannerType(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

export function getBannerPlacementKey(banner: Partial<WebsiteBanner> | null | undefined): "top" | "middle" | "bottom" | "other" {
  const haystack = normalizeBannerType([
    banner?.banner_type,
    banner?.action_type,
    banner?.action_value,
    banner?.name,
    banner?.title,
    banner?.description,
  ].join(" "));

  if (!haystack) return "other";

  if (/(^|_)(top|hero|main|home|slider)(_|$)/.test(haystack) || haystack.includes("top_slider")) return "top";
  if (/(^|_)(middle|mid|promo|feature|offer|product_section)(_|$)/.test(haystack)) return "middle";
  if (/(^|_)(bottom|footer|app|popup)(_|$)/.test(haystack)) return "bottom";

  return "other";
}

export function matchesBannerType(banner: Partial<WebsiteBanner> | null | undefined, allowedTypes: string[]): boolean {
  const bannerType = normalizeBannerType(banner?.banner_type ?? banner?.name ?? "");
  if (!bannerType) return false;
  return allowedTypes.some((type) => bannerType === type || bannerType.includes(type));
}

export async function fetchActiveBannersByType(types: string | string[]): Promise<WebsiteBanner[]> {
  const allowedTypes = (Array.isArray(types) ? types : [types])
    .map((type) => normalizeBannerType(type))
    .filter(Boolean);

  if (allowedTypes.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.banners)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const banners = (data || [])
      .filter((banner: any) => banner?.image_url && banner?.is_active !== false && banner?.is_deleted !== true)
      .filter((banner: any) => matchesBannerType(banner, allowedTypes))
      .map((banner: any, index: number) => ({
        ...banner,
        image_url: resolveStorageImageUrl(banner.image_url, "banners"),
        title: banner.title ?? banner.name ?? "NM Mart",
        subtitle: banner.description ?? "",
        whatsapp_link: banner.link_url ?? null,
        banner_link: banner.link_url ?? null,
        link: banner.link_url ?? null,
        active: banner.is_active !== false,
        display_order: typeof banner.sort_order === "number" ? banner.sort_order : index,
      }));

    logSupabaseDebug("fetchActiveBannersByType", { types: allowedTypes, count: banners.length });
    return banners;
  } catch (error: any) {
    logSupabaseDebug("fetchActiveBannersByType:error", { types: allowedTypes }, error);
    return [];
  }
}

export async function fetchActiveBanners(): Promise<WebsiteBanner[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.banners)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const banners = (data || [])
      .filter((banner: any) => banner?.image_url && banner?.is_active !== false && banner?.is_deleted !== true)
      .map((banner: any, index: number) => ({
        ...banner,
        image_url: resolveStorageImageUrl(banner.image_url, "banners"),
        title: banner.title ?? banner.name ?? "NM Mart",
        subtitle: banner.description ?? "",
        whatsapp_link: banner.link_url ?? null,
        banner_link: banner.link_url ?? null,
        link: banner.link_url ?? null,
        active: banner.is_active !== false,
        display_order: typeof banner.sort_order === "number" ? banner.sort_order : index,
      }));

    const ordered = [...banners].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    logSupabaseDebug("fetchActiveBanners", { count: ordered.length });
    return ordered;
  } catch (error: any) {
    logSupabaseDebug("fetchActiveBanners:error", undefined, error);
    return [];
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
        .from(TABLES.banners)
        .update({ sort_order: banner.display_order })
        .eq("id", banner.id);
      if (error) throw error;
    }
  } catch (error: any) {
    logSupabaseDebug("persistBannerOrder:error", ordered, error);
    throw new Error(getSupabaseErrorMessage(error, "Failed to persist banner order"));
  }
}

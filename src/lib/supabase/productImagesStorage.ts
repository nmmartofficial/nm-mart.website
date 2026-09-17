/**
 * Existing Supabase Storage paths used by the Website read-side.
 */
import { supabase } from "./client";

const PRODUCT_BUCKET = "products";

export function getProductImagesBucket(): string {
  return PRODUCT_BUCKET;
}

/** Object key convention used when an admin stores a product image path. */
export function getProductImageStoragePath(barcode: string, timestamp: number, ext: string): string {
  const safeBarcode = String(barcode).trim().replace(/\//g, "_");
  return `${safeBarcode}/${timestamp}.${ext}`;
}

export function resolveStorageImageUrl(value: unknown, bucket: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;

  const path = raw.replace(/^\/+/, "").replace(new RegExp(`^${bucket}/`), "");
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

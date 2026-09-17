/** Supabase table and column names — keep in sync with the live database (read-only reference).
 *  Row types are aliased directly from the canonical `types.ts` (`Tables<T>`) so regeneration stays in sync automatically.
 */

import type { Tables } from "./types";
import { resolveStorageImageUrl } from "./productImagesStorage";

export const TABLES = {
  products: "products",
  orders: "orders",
  profiles: "profiles",
  categories: "categories",
  banners: "banners",
} as const;

/** Alias of Tables<"products"> from types.ts — always in sync with Supabase schema generation. */
export type DbProductRow = Tables<"products">;

/** Alias of Tables<"banners"> from types.ts. */
export type DbBannerRow = Tables<"banners">;

/** Alias of Tables<"categories"> from types.ts. */
export type DbCategoryRow = Tables<"categories">;

/** Alias of Tables<"profiles"> from types.ts. */
export type DbProfileRow = Tables<"profiles">;

export function getProductBarcode(row: Partial<DbProductRow> | null | undefined): string {
  return String(row?.barcode ?? "").trim();
}

export function getProductName(row: Partial<DbProductRow> | null | undefined): string {
  return String(row?.name ?? "Unknown Product").trim();
}

export function getProductMrp(row: Partial<DbProductRow> | null | undefined): number {
  return Number(row?.mrp ?? 0);
}

export function getProductSaleRate(row: Partial<DbProductRow> | null | undefined): number {
  return Number(row?.sale_rate ?? row?.onlinerate ?? row?.online_rate ?? row?.retail_rate ?? row?.restrate ?? row?.selling_price ?? 0);
}

export function getProductStock(row: Partial<DbProductRow> | null | undefined): number {
  return Number(row?.stock ?? row?.opstock ?? row?.opening_stock ?? 0);
}

export function getProductCategory(row: Partial<DbProductRow> | null | undefined): string {
  return String(row?.category_name ?? row?.item_group_name ?? row?.item_group ?? row?.item_category ?? "GENERAL").trim();
}

export function getProductDiscount(row: Partial<DbProductRow> | null | undefined): number {
  return Number(row?.discount_percent ?? row?.discount_pct ?? row?.discperc ?? row?.discount ?? 0);
}

export function getProductImageUrl(row: Partial<DbProductRow> | null | undefined): string {
  return resolveStorageImageUrl(row?.image_url ?? row?.picture ?? "", "products");
}

export function isProductActive(row: Partial<DbProductRow> | null | undefined): boolean {
  return row?.is_active !== false && row?.is_deleted !== true;
}

export function isProductFeatured(row: Partial<DbProductRow> | null | undefined): boolean {
  return Boolean(row?.is_favourite ?? row?.isfav);
}

export function getProductBrand(row: Partial<DbProductRow> | null | undefined): string {
  return String(row?.brand_name ?? "Local").trim();
}

export function getProductSubcategory(row: Partial<DbProductRow> | null | undefined): string {
  return String(row?.subcategory_name ?? row?.sub_category_name ?? "").trim();
}

export function getProductUnit(row: Partial<DbProductRow> | null | undefined): string {
  return String(row?.unit_name ?? row?.unitcode ?? "pcs").trim();
}

export function getProductDescription(row: Partial<DbProductRow> | null | undefined): string {
  return String(row?.description ?? row?.item_description ?? row?.itemdescription ?? "").trim();
}

export function posToSupabaseProduct(pos: {
  RawCodeNew?: string;
  Barcode?: string;
  RawName?: string;
  ItemName?: string;
  MRP?: number;
  Rate?: number;
  SalesRate?: number;
  OpStock?: number;
  Stock?: number;
  discountPerc?: number;
  Discount?: number;
  ItemGroupName?: string;
  Category?: string;
  image_url?: string | null;
}) {
  const barcode = String(pos.RawCodeNew ?? pos.Barcode ?? "").trim();
  return {
    barcode,
    name: String(pos.RawName ?? pos.ItemName ?? "Unknown Product").trim(),
    mrp: Number(pos.MRP ?? 0),
    sale_rate: Number(pos.Rate ?? pos.SalesRate ?? 0),
    stock: Number(pos.OpStock ?? pos.Stock ?? 0),
    discount_percent: Number(pos.discountPerc ?? pos.Discount ?? 0),
    category_name: String(pos.ItemGroupName ?? pos.Category ?? "General").trim(),
    image_url: pos.image_url ? String(pos.image_url).trim() : null,
    updated_at: new Date().toISOString(),
  };
}

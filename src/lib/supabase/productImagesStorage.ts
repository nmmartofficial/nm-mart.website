/**
 * Product photo uploads (Quick Edit + Inventory).
 *
 * Default bucket is `nm-mart-assets` (same as banners/categories in this project) with
 * objects under the `product-images/` folder so uploads work before you create a dedicated bucket.
 *
 * After you create a **public** `product-images` bucket in Supabase (Storage → New bucket →
 * name `product-images`, public) and add policies for authenticated INSERT/UPDATE/SELECT,
 * set in `.env`:
 *   VITE_PRODUCT_IMAGES_BUCKET=product-images
 * and redeploy — paths will become `{barcode}/{timestamp}.ext` at the bucket root.
 */
const DEFAULT_BUCKET = "nm-mart-assets";
const FOLDER_IN_SHARED_BUCKET = "product-images";

export function getProductImagesBucket(): string {
  const fromEnv = (import.meta.env.VITE_PRODUCT_IMAGES_BUCKET as string | undefined)?.trim();
  return fromEnv || DEFAULT_BUCKET;
}

/** Object key inside the bucket (no leading slash). */
export function getProductImageStoragePath(barcode: string, timestamp: number, ext: string): string {
  const safeBarcode = String(barcode).trim().replace(/\//g, "_");
  const file = `${timestamp}.${ext}`;
  const bucket = getProductImagesBucket();
  if (bucket === DEFAULT_BUCKET) {
    return `${FOLDER_IN_SHARED_BUCKET}/${safeBarcode}/${file}`;
  }
  return `${safeBarcode}/${file}`;
}

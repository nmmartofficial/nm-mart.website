// ─── Types ───
export interface Product {
  name: string;
  mrp: number;
  saleRate: number; 
  category: string;
  brand: string;
  subCategory: string;
  barcode: string;
  imageUrl: string;
  discount: number;
  save: number;
  stock?: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface OrderRecord {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: "Pending" | "Packed" | "Out for Delivery";
}

// ─── Constants ───
export const WA_NUMBER = "917081154604";
export const UPI_ID = "paytmqr5fwdiq@ptys";
export const ITEMS_PER_PAGE = 60;
export const MIN_ORDER = 500;
export const LOGO_FALLBACK = "https://nmmart.in/logo.jpeg";

// ─── Order History ───
export function getOrderHistory(): OrderRecord[] {
  try { return JSON.parse(localStorage.getItem("nm_orders") || "[]"); } catch { return []; }
}
export function saveOrder(order: OrderRecord) {
  const h = getOrderHistory();
  h.unshift(order);
  localStorage.setItem("nm_orders", JSON.stringify(h.slice(0, 50)));
}

// ─── Loyalty Points ───
export function getLoyaltyPoints(): number {
  return parseInt(localStorage.getItem("nm_loyalty_points") || "0", 10);
}
export function addLoyaltyPoints(n: number) {
  localStorage.setItem("nm_loyalty_points", String(getLoyaltyPoints() + n));
}

// ─── Slug generator for URLs ───
export function productSlug(product: Product): string {
  return encodeURIComponent(`${product.name}__${product.barcode}`);
}

// ─── Smart Category Normalization ───
export function normalizeCategory(cat: string): string {
  if (!cat) return "GENERAL";
  return cat.trim().toUpperCase();
}

export function parseProductSlug(slug: string): { name: string; barcode: string } {
  const decoded = decodeURIComponent(slug);
  const parts = decoded.split("__");
  return { name: parts[0] || "", barcode: parts[1] || "" };
}

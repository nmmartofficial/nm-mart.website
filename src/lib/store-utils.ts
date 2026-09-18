// ─── Types ───
export interface Product {
  id: number; // Authoritative Supabase products.id
  product_id: number; // Explicit order-item identifier alias
  name: string;
  mrp: number;
  price: number; // From salerate
  saleRate: number; // Alias for backward compatibility
  category: string;
  brand: string;
  subCategory: string;
  barcode: string;
  imageUrl: string;
  discount: number;
  save: number;
  stock?: number;
  unit?: string;
  description?: string;
  isFeatured?: boolean;
  badge?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export function calculateSalePrice(mrp: number, storedPrice: number, discount: number): number {
  const validMrp = Number.isFinite(mrp) && mrp > 0;
  const validPrice = Number.isFinite(storedPrice) && storedPrice > 0;
  const validDiscount = Number.isFinite(discount) && discount > 0 && discount < 100;

  if (validMrp && validDiscount && (!validPrice || storedPrice >= mrp)) {
    return Math.max(0, Math.round(mrp * (1 - discount / 100)));
  }

  return validPrice ? storedPrice : validMrp ? mrp : 0;
}

export interface OrderRecord {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: "Pending" | "Packed" | "Out for Delivery";
}

// ─── Constants ───
export const WA_NUMBER = "918282827240";
export const UPI_ID = "paytmqr5fwdiq@ptys";
export const ITEMS_PER_PAGE = 60;
export const MIN_ORDER = 1499;
export const FREE_DELIVERY_THRESHOLD = 2999;
export const FLAT_DELIVERY_FEE = 70;
export const LOGO_FALLBACK = "/nm-mart-logo.png";

export const STORE_DETAILS = {
  name: "NM MART",
  address: "Naya Nagar, First Dhata Road, Manjhanpur, Kaushambi, UP, PIN-212207",
  mob: "+91-8282827240",
  gstin: "09CCFPR9966P1Z9"
};

export const SAFE_LOGO_URL = "/nm-mart-logo.png";

// ─── Calculations ───
export function calculateDeliveryFee(total: number): number {
  if (total >= FREE_DELIVERY_THRESHOLD) return 0;
  if (total >= MIN_ORDER) return FLAT_DELIVERY_FEE;
  return FLAT_DELIVERY_FEE; // Still show fee for reference even if below min order
}

export function calculateTaxes(total: number) {
  // Simplified GST calculation (assuming 18% inclusive GST for POS display)
  const gstRate = 0.18;
  const taxableAmount = total / (1 + gstRate);
  const totalGst = total - taxableAmount;
  return {
    cgst: Number((totalGst / 2).toFixed(2)),
    sgst: Number((totalGst / 2).toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2))
  };
}

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

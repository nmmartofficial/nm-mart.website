// ─── Types ───
export interface Product {
  name: string;
  mrp: number;
  saleRate: number;
  category: string;
  subCategory: string;
  barcode: string;
  imageUrl: string;
  discount: number;
  save: number;
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
export const CSV_URL = "https://docs.google.com/spreadsheets/d/10e6molYJIH19uag6ViotpfaLU78CBjIWCf2Bh5ulY-U/export?format=csv";
export const WA_NUMBER = "917081154604";
export const UPI_ID = "paytmqr5fwdiq@ptys";
export const ITEMS_PER_PAGE = 60;
export const MIN_ORDER = 500;
export const LOGO_FALLBACK = "https://nmmart.in/logo.jpeg";
export const SUPPORT_EMAIL = "support@nmmart.in";
export const HELPLINE = "+917081154604";
export const MEMBERSHIP_FEE = 599;
export const MEMBERSHIP_VALUE = 1500;

// ─── CSV Parser (now includes Image URL from column G) ───
export function parseCSV(text: string): Product[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map(line => {
    const cols: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const name = cols[0] || "";
    const barcode = cols[1] || "";
    const category = cols[2] || "General";
    const subCategory = cols[3] || "";
    const mrp = parseFloat(cols[4]) || 0;
    const saleRate = parseFloat(cols[5]) || 0;
    const imageUrl = cols[6] || "";
    const discount = mrp > 0 ? Math.round(((mrp - saleRate) / mrp) * 100) : 0;
    const save = mrp > 0 ? Math.round(mrp - saleRate) : 0;
    return { name, barcode, category, subCategory, mrp, saleRate, imageUrl, discount, save };
  }).filter(p => p.name && p.mrp > 0 && p.saleRate > 0);
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
export function parseProductSlug(slug: string): { name: string; barcode: string } {
  const decoded = decodeURIComponent(slug);
  const parts = decoded.split("__");
  return { name: parts[0] || "", barcode: parts[1] || "" };
}

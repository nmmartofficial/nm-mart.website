import { supabase } from "@/lib/supabase/client";

export interface StoreConfig {
  id?: string;
  key: string;
  value: any;
  created_at?: string;
  updated_at?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  storeName: string;
  storeLogo: string;
  announcementText: string;
  announcementVisible: boolean;
  fontFamily: string;
}

export interface SectionLayout {
  id: string;
  name: string;
  order: number;
  visible: boolean;
}

export interface HighlightItem {
  id?: string;
  title: string;
  iconUrl: string;
  link: string;
  order: number;
  active: boolean;
}

export interface OfferConfig {
  type: 'global' | 'category' | 'product';
  discountPercent: number;
  targetId?: string;
  label?: string;
  active: boolean;
}

const DEFAULT_CONFIG: Record<string, any> = {
  theme: {
    primaryColor: "#CC0000",
    secondaryColor: "#D4AF37",
    storeName: "NM Mart",
    storeLogo: "/nm-mart-logo.png",
    announcementText: "Free Delivery on orders above ₹1499!",
    announcementVisible: true,
    fontFamily: "Inter"
  },
  layout: [
    { id: "hero", name: "Hero Banner", order: 0, visible: true },
    { id: "categories", name: "Categories", order: 1, visible: true },
    { id: "highlights", name: "Highlights (Stories)", order: 2, visible: true },
    { id: "flash_sale", name: "Flash Sale", order: 3, visible: true },
    { id: "flat_50", name: "50% OFF Offers", order: 4, visible: true },
    { id: "flat_33", name: "33% OFF Offers", order: 5, visible: true },
    { id: "weekly_deals", name: "Weekly Deals", order: 6, visible: true },
    { id: "fresh_deals", name: "Fresh Deals", order: 7, visible: true },
    { id: "buy_again", name: "Buy Again", order: 8, visible: true },
    { id: "munafa_mela", name: "Munafa Mela", order: 9, visible: true },
    { id: "brands", name: "Shop by Brand", order: 10, visible: true },
    { id: "products", name: "All Products", order: 11, visible: true }
  ],
  highlights: [],
  offers: {
    globalDiscount: 0,
    categoryDiscounts: {},
    productDiscounts: {}
  },
  gridStyle: {
    categoryColumns: 6,
    productColumns: 4
  },
  pincodes: ["212207", "212201", "212216"],
  loyalty: {
    enabled: true,
    spendPerPoint: 100
  }
};

export async function getStoreConfig(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('store_config')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching config ${key}:`, error);
      return DEFAULT_CONFIG[key] || null;
    }

    return data?.value ?? DEFAULT_CONFIG[key] ?? null;
  } catch (err) {
    console.error(`Error getting config ${key}:`, err);
    return DEFAULT_CONFIG[key] || null;
  }
}

export async function setStoreConfig(key: string, value: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('store_config')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.error(`Error saving config ${key}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error setting config ${key}:`, err);
    return false;
  }
}

export async function getThemeConfig(): Promise<ThemeConfig> {
  const theme = await getStoreConfig('theme');
  return theme || DEFAULT_CONFIG.theme;
}

export async function setThemeConfig(config: Partial<ThemeConfig>): Promise<boolean> {
  const current = await getThemeConfig();
  return setStoreConfig('theme', { ...current, ...config });
}

export async function getSectionLayout(): Promise<SectionLayout[]> {
  const layout = await getStoreConfig('homepage_layout');
  if (!layout || !Array.isArray(layout) || layout.length === 0) {
    return DEFAULT_CONFIG.layout;
  }
  return layout;
}

export async function setSectionLayout(layout: SectionLayout[]): Promise<boolean> {
  return setStoreConfig('homepage_layout', layout);
}

export async function getHighlights(): Promise<HighlightItem[]> {
  const highlights = await getStoreConfig('highlights');
  return highlights || [];
}

export async function setHighlights(highlights: HighlightItem[]): Promise<boolean> {
  return setStoreConfig('highlights', highlights);
}

export async function getOfferConfig(): Promise<any> {
  const offers = await getStoreConfig('offers');
  return offers || DEFAULT_CONFIG.offers;
}

export async function setOfferConfig(offers: any): Promise<boolean> {
  return setStoreConfig('offers', offers);
}

export async function getGridStyle(): Promise<{ categoryColumns: number; productColumns: number }> {
  const grid = await getStoreConfig('gridStyle');
  return grid || DEFAULT_CONFIG.gridStyle;
}

export async function setGridStyle(grid: { categoryColumns: number; productColumns: number }): Promise<boolean> {
  return setStoreConfig('gridStyle', grid);
}

export async function initializeDefaultConfig(): Promise<void> {
  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    await getStoreConfig(key);
    const { data } = await supabase
      .from('store_config')
      .select('key')
      .eq('key', key)
      .maybeSingle();

    if (!data) {
      await supabase
        .from('store_config')
        .insert({ key, value });
    }
  }
}
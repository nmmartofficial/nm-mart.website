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
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
  accentColor?: string;
  presetName?: string;
  storeName: string;
  storeLogo: string;
  announcementText: string;
  announcementVisible: boolean;
  fontFamily: string;
  headingFont?: string;
  bodyFont?: string;
  fontSizeBase?: number;
  letterSpacing?: string;
  lineHeight?: number;
  bannerRadius?: number;
  cardRadius?: number;
  buttonRadius?: number;
  categoryCardStyle?: "soft" | "glass" | "bold";
  bannerTextPosition?: "left" | "center" | "right";
  bannerCtaStyle?: "solid" | "outline" | "pill";
  productCardStyle?: "compact" | "premium" | "offer";
  headerStyle?: "classic" | "minimal" | "modern" | "centered";
  footerStyle?: "simple" | "detailed" | "modern";
  buttonStyle?: "flat" | "gradient" | "outline" | "shadow";
  sectionBackgrounds?: Record<string, string>;
  customCss?: string;
  animationsEnabled?: boolean;
  animationSpeed?: "slow" | "normal" | "fast";
  shadowStyle?: "none" | "soft" | "bold" | "glow";
  isDraft?: boolean;
  eventMode?: "normal" | "festival" | "sale";
  festiveSchedule?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    presetName?: string;
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  config: ThemeConfig;
  isSystem?: boolean;
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
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    highlightColor: "#FF0000",
    accentColor: "#FBBF24",
    presetName: "NM Classic",
    storeName: "NM Mart",
    storeLogo: "/nm-mart-logo.png",
    announcementText: "Free Delivery on orders above ₹1499!",
    announcementVisible: true,
    fontFamily: "Inter",
    headingFont: "Inter",
    bodyFont: "Inter",
    fontSizeBase: 14,
    letterSpacing: "0em",
    lineHeight: 1.5,
    bannerRadius: 16,
    cardRadius: 12,
    buttonRadius: 8,
    categoryCardStyle: "soft",
    bannerTextPosition: "left",
    bannerCtaStyle: "solid",
    productCardStyle: "compact",
    headerStyle: "classic",
    footerStyle: "simple",
    buttonStyle: "flat",
    customCss: "",
    animationsEnabled: true,
    animationSpeed: "normal",
    shadowStyle: "soft",
    isDraft: false,
    eventMode: "normal",
    sectionBackgrounds: {
      categories: "",
      flat_50: "",
      flat_33: "",
      brands: "",
      products: ""
    },
    festiveSchedule: {
      enabled: false,
      startDate: "",
      endDate: "",
      presetName: "Festive"
    }
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
      .from('app_config')
      .select('value, key')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) {
      const fallback = await supabase
        .from('store_config')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (fallback.error) {
        console.error(`Error fetching config ${key}:`, fallback.error);
        return DEFAULT_CONFIG[key] || null;
      }

      return fallback.data?.value ?? DEFAULT_CONFIG[key] ?? null;
    }

    return data.value ?? DEFAULT_CONFIG[key] ?? null;
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

export async function getThemeConfig(draft = false): Promise<ThemeConfig> {
  const theme = await getStoreConfig(draft ? 'theme_draft' : 'theme');
  return {
    ...DEFAULT_CONFIG.theme,
    ...(theme || {})
  };
}

export async function setThemeConfig(config: Partial<ThemeConfig>, draft = false): Promise<boolean> {
  const current = await getThemeConfig(draft);
  return setStoreConfig(draft ? 'theme_draft' : 'theme', { ...current, ...config });
}

export async function publishTheme(): Promise<boolean> {
  const draft = await getThemeConfig(true);
  return setThemeConfig(draft, false);
}

export async function getThemePresets(): Promise<ThemePreset[]> {
  const presets = await getStoreConfig('theme_presets');
  return presets || [];
}

export async function saveThemePreset(preset: ThemePreset): Promise<boolean> {
  const presets = await getThemePresets();
  const index = presets.findIndex(p => p.id === preset.id);
  if (index >= 0) {
    presets[index] = preset;
  } else {
    presets.push(preset);
  }
  return setStoreConfig('theme_presets', presets);
}

export async function deleteThemePreset(id: string): Promise<boolean> {
  const presets = await getThemePresets();
  const filtered = presets.filter(p => p.id !== id);
  return setStoreConfig('theme_presets', filtered);
}

export async function getSectionLayout(): Promise<SectionLayout[]> {
  const layout = await getStoreConfig('homepage_layout');
  if (!layout || !Array.isArray(layout) || layout.length === 0) {
    return DEFAULT_CONFIG.layout.map((section) =>
      section.id === "categories" ? { ...section, visible: true } : section
    );
  }
  // Hard safety: categories menu should never disappear from homepage.
  return layout.map((section: SectionLayout) =>
    section.id === "categories" ? { ...section, visible: true } : section
  );
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
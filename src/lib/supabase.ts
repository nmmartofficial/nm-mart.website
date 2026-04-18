import { supabase } from "@/lib/supabase/client";

export type WebsiteBanner = {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  whatsapp_link?: string;
  active: boolean;
  display_order: number;
};

export async function fetchActiveBanners(): Promise<WebsiteBanner[]> {
  const { data, error } = await supabase
    .from("website_banners")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data || [])
    .filter((banner: any) => banner?.image_url)
    .map((banner: any, index: number) => ({
      ...banner,
      display_order: typeof banner.display_order === "number" ? banner.display_order : index,
    }));
}

export async function persistBannerOrder(banners: WebsiteBanner[]): Promise<void> {
  const ordered = [...banners].map((banner, index) => ({
    ...banner,
    display_order: index,
  }));

  for (const banner of ordered) {
    const { error } = await supabase
      .from("website_banners")
      .update({ display_order: banner.display_order })
      .eq("id", banner.id);
    if (error) throw error;
  }
}

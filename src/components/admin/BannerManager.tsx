import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Image as ImageIcon, Loader2, Copy, Check, Eye, EyeOff, ArrowUp, ArrowDown
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { persistBannerOrder, WebsiteBanner } from "@/lib/supabase";
import { toast } from "sonner";
import { WA_NUMBER } from "@/lib/store-utils";

const BannerManager = () => {
  const [banners, setBanners] = useState<WebsiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      const normalized = (data || []).map((banner: any, index: number) => ({
        ...banner,
        display_order: typeof banner.display_order === "number" ? banner.display_order : index,
      }));
      setBanners(normalized);
    } catch (err: any) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('nm-mart-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nm-mart-assets')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('website_banners')
        .insert([{
          image_url: publicUrl,
          title: file.name.split('.')[0], // Use filename as title
          whatsapp_link: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`I'm interested in this offer: ${publicUrl}`)}`,
          active: true,
          display_order: banners.length
        }]);

      if (dbError) throw dbError;

      toast.success("Banner uploaded successfully!");
      fetchBanners();
    } catch (err: any) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteBanner = async (id: string, url: string) => {
    try {
      // 1. Delete from storage
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('nm-mart-assets').remove([`banners/${fileName}`]);
      }

      // 2. Delete from DB
      const { error } = await supabase.from('website_banners').delete().eq('id', id);
      if (error) throw error;

      await normalizeDisplayOrder();
      toast.success("Banner removed");
      fetchBanners();
    } catch (err: any) {
      toast.error("Delete failed");
    }
  };

  const normalizeDisplayOrder = async () => {
    const ordered = [...banners]
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((banner, index) => ({ ...banner, display_order: index }));
    await persistBannerOrder(ordered);
  };

  const moveBanner = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const updated = [...banners].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    const normalized = updated.map((banner, idx) => ({ ...banner, display_order: idx }));
    setBanners(normalized);
    setReordering(true);
    try {
      await persistBannerOrder(normalized);
      toast.success("Banner order updated");
    } catch (err) {
      toast.error("Failed to update order");
      fetchBanners();
    } finally {
      setReordering(false);
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('website_banners')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      setBanners(banners.map(b => b.id === id ? { ...b, active: !currentStatus } : b));
      toast.success(currentStatus ? "Banner hidden" : "Banner visible");
    } catch (err: any) {
      toast.error("Update failed");
    }
  };

  const copyWhatsAppLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link || "");
    setCopiedId(id);
    toast.success("WhatsApp Link Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center text-[#CC0000]">
            <ImageIcon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-black">Banner Manager</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Banners: {banners.length} (Add as many as needed)
            </p>
          </div>
        </div>

        <label className="cursor-pointer bg-[#CC0000] text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2">
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          Upload Banner
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#CC0000]" size={32} />
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">No banners uploaded yet.</p>
          </div>
        ) : (
          banners
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((banner, index) => (
            <div key={banner.id} className={`group bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all relative ${!banner.active ? 'opacity-60 grayscale' : ''}`}>
              <div className="aspect-[21/9] w-full bg-gray-100 overflow-hidden">
                <img src={banner.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-4 pt-4 flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Preview #{index + 1}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBanner(index, "up")}
                    disabled={index === 0 || reordering}
                    className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary hover:text-white disabled:opacity-40 transition-all"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveBanner(index, "down")}
                    disabled={index === banners.length - 1 || reordering}
                    className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary hover:text-white disabled:opacity-40 transition-all"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex items-center justify-between gap-3">
                <button 
                  onClick={() => toggleVisibility(banner.id, banner.active)}
                  className={`p-3 rounded-xl transition-all ${banner.active ? 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-primary text-white hover:bg-black'}`}
                  title={banner.active ? "Hide Banner" : "Show Banner"}
                >
                  {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button 
                  onClick={() => copyWhatsAppLink(banner.id, banner.whatsapp_link)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                >
                  {copiedId === banner.id ? <Check size={14} /> : <Copy size={14} />}
                  Copy WA Link
                </button>
                <button 
                  onClick={() => deleteBanner(banner.id, banner.image_url)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BannerManager;

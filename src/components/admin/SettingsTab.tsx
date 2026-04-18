import { useState, useEffect, useRef } from "react";
import { Settings, Palette, Save, Loader2, Type, Megaphone, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getThemeConfig, setThemeConfig, ThemeConfig } from "@/lib/storeConfig";
import { useTheme } from "@/lib/ThemeProvider";
import { supabase } from "@/lib/supabase/client";

const THEME_PRESETS = [
  { name: "NM Red", primary: "#CC0000" },
  { name: "Sky Blue", primary: "#0EA5E9" },
  { name: "Forest Green", primary: "#10B981" },
  { name: "NM Gold", primary: "#D4AF37" },
  { name: "Purple", primary: "#8B5CF6" },
  { name: "Pink", primary: "#EC4899" },
];

const FONTS = ["Inter", "Poppins", "Roboto", "Montserrat", "Open Sans"];

const SettingsTab = () => {
  const { refreshTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: "#CC0000",
    secondaryColor: "#D4AF37",
    storeName: "NM Mart",
    storeLogo: "/nm-mart-logo.png",
    announcementText: "Free Delivery on orders above ₹1499!",
    announcementVisible: true,
    fontFamily: "Inter"
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const themeData = await getThemeConfig();
      setTheme(themeData);
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const themeOk = await setThemeConfig(theme);

      if (themeOk) {
        toast.success("Settings saved successfully!");
        await refreshTheme();
      } else {
        toast.error("Settings failed to save");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('nm-mart-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nm-mart-assets')
        .getPublicUrl(filePath);

      setTheme(prev => ({ ...prev, storeLogo: publicUrl }));
      toast.success("Logo uploaded!");
    } catch (err) {
      console.error("Logo upload error:", err);
      toast.error("Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-black">Control Center</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Store Branding & Global Engine
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2 active:scale-95"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Apply Engine Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module 1: Branding Engine */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Settings size={20} /></div>
            <h4 className="text-lg font-black italic uppercase">Branding Engine</h4>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Store Name</label>
              <input
                type="text"
                value={theme.storeName}
                onChange={(e) => setTheme(prev => ({ ...prev, storeName: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 font-bold text-sm outline-none focus:border-primary transition-all shadow-inner"
                placeholder="Enter store name"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Store Logo</label>
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                  <img src={theme.storeLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 space-y-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full bg-white border border-gray-200 text-black py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest hover:border-primary transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    Upload New Logo
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  <p className="text-[8px] text-gray-400 font-bold uppercase text-center">Recommended: PNG 512x512</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Font Engine</label>
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map(font => (
                  <button
                    key={font}
                    onClick={() => setTheme(prev => ({ ...prev, fontFamily: font }))}
                    className={`py-3 px-4 rounded-xl border text-[11px] font-bold transition-all ${
                      theme.fontFamily === font ? "border-primary bg-primary text-white" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-primary"
                    }`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Theme & Visuals */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Palette size={20} /></div>
            <h4 className="text-lg font-black italic uppercase">Theme & Visuals</h4>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Primary Engine Color</label>
              <div className="flex items-center gap-6">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-20 h-20 rounded-[32px] border-4 border-white shadow-xl cursor-pointer"
                />
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setTheme(prev => ({ ...prev, primaryColor: preset.primary }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                        theme.primaryColor === preset.primary ? "border-primary bg-primary/5" : "border-gray-100 hover:border-primary"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.primary }} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Announcement Bar</label>
                <button 
                  onClick={() => setTheme(prev => ({ ...prev, announcementVisible: !prev.announcementVisible }))}
                  className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${
                    theme.announcementVisible ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {theme.announcementVisible ? "Active" : "Hidden"}
                </button>
              </div>
              <div className="relative group">
                <Megaphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={theme.announcementText}
                  onChange={(e) => setTheme(prev => ({ ...prev, announcementText: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-5 font-bold text-sm outline-none focus:border-primary transition-all shadow-inner"
                  placeholder="Ticker message..."
                />
              </div>
              <p className="text-[8px] text-gray-400 font-bold uppercase italic px-1">Tip: Use emojis to make it professional 🚀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
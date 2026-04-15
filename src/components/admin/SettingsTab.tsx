import { useState, useEffect } from "react";
import { Settings, Palette, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getThemeConfig, setThemeConfig, ThemeConfig } from "@/lib/storeConfig";
import { useTheme } from "@/lib/ThemeProvider";

const THEME_PRESETS = [
  { name: "NM Red", primary: "#CC0000" },
  { name: "Sky Blue", primary: "#0EA5E9" },
  { name: "Forest Green", primary: "#10B981" },
  { name: "NM Gold", primary: "#D4AF37" },
];

const SettingsTab = () => {
  const { refreshTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: "#CC0000",
    secondaryColor: "#D4AF37",
    storeName: "NM Mart",
    storeLogo: "/nm-mart-logo.png"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-black">Store Settings</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Store Name & Theme Color
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Name Section */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Settings className="text-primary" size={20} />
            <h4 className="text-lg font-black italic uppercase">Store Identity</h4>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Store Name</label>
            <input
              type="text"
              value={theme.storeName}
              onChange={(e) => setTheme(prev => ({ ...prev, storeName: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:border-primary transition-all"
              placeholder="Enter store name"
            />
          </div>
        </div>

        {/* Theme Color Section */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="text-primary" size={20} />
            <h4 className="text-lg font-black italic uppercase">Primary Theme Color</h4>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Choose Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-16 h-16 rounded-2xl border-4 border-gray-100 cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-2 flex-1">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setTheme(prev => ({ ...prev, primaryColor: preset.primary }))}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      theme.primaryColor === preset.primary ? "border-primary bg-primary/5" : "border-gray-100 hover:border-primary"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
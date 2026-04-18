import { useState, useEffect } from "react";
import { 
  Layout, Eye, EyeOff, ChevronUp, ChevronDown, Save, Loader2, Info
} from "lucide-react";
import { toast } from "sonner";
import { getSectionLayout, setSectionLayout, SectionLayout } from "@/lib/storeConfig";

const LayoutManager = () => {
  const [layout, setLayout] = useState<SectionLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = async () => {
    setLoading(true);
    try {
      const data = await getSectionLayout();
      setLayout(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Error loading layout:", err);
    } finally {
      setLoading(false);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...layout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newLayout.length) return;

    // Swap
    [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];

    // Re-assign orders
    const updatedLayout = newLayout.map((section, idx) => ({
      ...section,
      order: idx
    }));

    setLayout(updatedLayout);
  };

  const toggleVisibility = (index: number) => {
    const newLayout = [...layout];
    if (newLayout[index].id === "categories") {
      toast.info("Categories section is mandatory and always visible.");
      return;
    }
    newLayout[index].visible = !newLayout[index].visible;
    setLayout(newLayout);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await setSectionLayout(layout);
      if (ok) {
        toast.success("Homepage layout updated!");
      } else {
        toast.error("Failed to save layout");
      }
    } catch (err) {
      console.error("Error saving layout:", err);
      toast.error("Error saving layout");
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
            <Layout size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-black">Homepage Layout</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Drag or use arrows to reorder sections
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Layout
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-center">
        <Info className="text-amber-500 shrink-0" size={20} />
        <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
          <span className="font-black">Note:</span> Changing the order here will immediately affect how customers see the homepage.
        </p>
      </div>

      <div className="space-y-3">
        {layout.map((section, index) => (
          <div 
            key={section.id} 
            className={`flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 transition-all ${!section.visible ? 'opacity-50 grayscale bg-gray-50' : 'hover:border-primary/30 shadow-sm'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-xs text-gray-400">
                {index + 1}
              </div>
              <div>
                <h4 className="font-black text-sm uppercase italic tracking-tight">{section.name}</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase">ID: {section.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleVisibility(index)}
                disabled={section.id === "categories"}
                className={`p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  section.visible ? 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-primary text-white hover:bg-black'
                }`}
                title={section.id === "categories" ? "Categories cannot be hidden" : (section.visible ? "Hide Section" : "Show Section")}
              >
                {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-400 transition-all"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === layout.length - 1}
                  className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-400 transition-all"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutManager;
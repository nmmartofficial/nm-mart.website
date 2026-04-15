import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Grid, Loader2, Upload, Palette, Type, Eye, EyeOff
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const CategoryManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Category State
  const [title, setTitle] = useState("");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");

    setSaving(true);
    try {
      let iconUrl = "";
      if (iconFile) {
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('nm-mart-assets')
          .upload(filePath, iconFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('nm-mart-assets')
          .getPublicUrl(filePath);
        
        iconUrl = publicUrl;
      }

      const { error } = await supabase
        .from('categories')
        .insert([{
          name: title,
          image_url: iconUrl,
          bg_color: bgColor,
          display_order: categories.length
        }]);

      if (error) throw error;

      toast.success("Category added!");
      setTitle("");
      setBgColor("#FFFFFF");
      setIconFile(null);
      setPreviewUrl(null);
      fetchCategories();
    } catch (err: any) {
      toast.error("Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success("Category removed");
      fetchCategories();
    } catch (err: any) {
      toast.error("Delete failed");
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_visible: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? { ...c, is_visible: !currentStatus } : c));
      toast.success(currentStatus ? "Category hidden" : "Category visible");
    } catch (err: any) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Add Category Form */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
            <Grid size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-black">Create New Category</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Add cards to the Shop by Category section
            </p>
          </div>
        </div>

        <form onSubmit={addCategory} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Title</label>
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#CC0000] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Pharmacy, Staples..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-[#CC0000] transition-all font-bold text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">BG Color</label>
            <div className="relative group">
              <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#CC0000] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="#FFFFFF"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-[#CC0000] transition-all font-bold text-sm"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
              <input 
                type="color" 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 border-0 bg-transparent cursor-pointer"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Icon/Image</label>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 hover:bg-gray-100 transition-all">
              <Upload className="text-gray-400" size={18} />
              <span className="text-xs font-bold text-gray-500 truncate">{iconFile ? iconFile.name : "Choose Icon"}</span>
              <input type="file" className="hidden" onChange={handleIconChange} accept="image/*" />
            </label>
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="bg-[#CC0000] text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Create Category
          </button>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-[#CC0000]" size={32} />
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">No categories created yet.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className={`group bg-white border border-gray-100 rounded-[32px] p-6 text-center relative hover:shadow-xl transition-all ${!cat.is_visible ? 'opacity-60 grayscale' : ''}`} style={{ backgroundColor: cat.bg_color + '10' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-10 h-10 object-contain" />
                ) : (
                  <Grid size={24} className="text-gray-200" />
                )}
              </div>
              <h4 className="font-black text-xs uppercase italic tracking-tight mb-4">{cat.name}</h4>
              
              <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => toggleVisibility(cat.id, cat.is_visible)}
                  className={`p-2 rounded-full shadow-sm border transition-all ${cat.is_visible ? "bg-white text-primary border-primary/20" : "bg-primary text-white border-transparent"}`}
                  title={cat.is_visible ? "Hide Category" : "Show Category"}
                >
                  {cat.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button 
                  onClick={() => deleteCategory(cat.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryManager;

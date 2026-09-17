import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Eye, EyeOff, Loader2, Upload, Link as LinkIcon, Type, MousePointer2, ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getActiveSession, getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Highlights table is OPTIONAL in the authoritative Supabase schema for this project.
 * If/when the admin provisions `public.highlights` in Supabase, this component will auto-switch to DB mode.
 * Until then, all CRUD operations gracefully degrade to `localStorage` (browser-only, per-device persistence).
 */
const OPTIONAL_HIGHLIGHTS_TABLE = "highlights";
const HIGHLIGHTS_STORAGE_KEY = "nm_mart_highlights_local";

function loadLocalHighlights(): any[] {
  try {
    return JSON.parse(localStorage.getItem(HIGHLIGHTS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalHighlights(items: any[]) {
  try {
    localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save highlights to localStorage:", e);
  }
}

/** Detects when the optional `highlights` table is not provisioned in the live Supabase project. */
function isTableMissingError(err: any): boolean {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("relation") &&
    (msg.includes("does not exist") || msg.includes("not found"))
  ) || String(err?.code || "") === "42P01" || msg.includes("status:404") || msg.includes("404");
}

const HighlightsManager = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [localMode, setLocalMode] = useState(false);

  // New Highlight State
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchHighlights();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessionActive(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessionActive(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchHighlights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(OPTIONAL_HIGHLIGHTS_TABLE)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHighlights(data || []);
      setLocalMode(false);
    } catch (err: any) {
      if (isTableMissingError(err)) {
        const local = loadLocalHighlights();
        setHighlights(local);
        setLocalMode(true);
        logSupabaseDebug("highlights:localMode", { count: local.length });
      } else {
        console.error("Error fetching highlights:", err);
      }
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

  const addHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !iconFile) return toast.error("Title and Icon are required");

    setSaving(true);
    try {
      const session = await getActiveSession();
      if (!session) {
        setSessionActive(false);
        toast.error("Please login again.");
        return;
      }
      const fileExt = iconFile.name.split('.').pop();
      const fileName = `highlight_${Date.now()}.${fileExt}`;
      const filePath = `highlights/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('nm-mart-assets')
        .upload(filePath, iconFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nm-mart-assets')
        .getPublicUrl(filePath);

      const newItem = {
        id: `local_${Date.now()}`,
        title,
        image_url: publicUrl,
        link: link || "#",
        is_visible: true,
        display_order: highlights.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const { error } = await supabase
          .from(OPTIONAL_HIGHLIGHTS_TABLE)
          .insert([{
            title: newItem.title,
            image_url: newItem.image_url,
            link: newItem.link,
            is_visible: true,
            display_order: highlights.length
          }]);
        if (error) throw error;
        setLocalMode(false);
      } catch (dbErr: any) {
        if (isTableMissingError(dbErr)) {
          const local = [...loadLocalHighlights(), newItem];
          saveLocalHighlights(local);
          setHighlights(local);
          setLocalMode(true);
        } else {
          throw dbErr;
        }
      }

      logSupabaseDebug("highlightAdd:success", { title, link, localMode });
      toast.success("Highlight added!" + (localMode ? " (Saved locally)" : ""));
      setTitle("");
      setLink("");
      setIconFile(null);
      setPreviewUrl(null);
      if (!localMode) fetchHighlights();
    } catch (err: any) {
      logSupabaseDebug("highlightAdd:error", { title, link }, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to add highlight"));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const session = await getActiveSession();
      if (!session) {
        setSessionActive(false);
        toast.error("Please login again.");
        return;
      }
      try {
        const { error } = await supabase
          .from(OPTIONAL_HIGHLIGHTS_TABLE)
          .update({ is_visible: !currentStatus })
          .eq('id', id);
        if (error) throw error;
      } catch (dbErr: any) {
        if (isTableMissingError(dbErr)) {
          const local = loadLocalHighlights().map(h =>
            h.id === id ? { ...h, is_visible: !currentStatus, updated_at: new Date().toISOString() } : h
          );
          saveLocalHighlights(local);
          setLocalMode(true);
          setHighlights(local);
          toast.success(currentStatus ? "Highlight hidden" : "Highlight visible");
          return;
        }
        throw dbErr;
      }
      setHighlights(highlights.map(h => h.id === id ? { ...h, is_visible: !currentStatus } : h));
      toast.success(currentStatus ? "Highlight hidden" : "Highlight visible");
    } catch (err: any) {
      logSupabaseDebug("highlightVisibility:error", { id, currentStatus }, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to update highlight visibility"));
    }
  };

  const deleteHighlight = async (id: string, imageUrl: string) => {
    if (!confirm("Delete this highlight?")) return;

    try {
      const session = await getActiveSession();
      if (!session) {
        setSessionActive(false);
        toast.error("Please login again.");
        return;
      }
      let deleted = false;
      try {
        const { error } = await supabase.from(OPTIONAL_HIGHLIGHTS_TABLE).delete().eq('id', id);
        if (error) throw error;
        deleted = true;
      } catch (dbErr: any) {
        if (isTableMissingError(dbErr)) {
          const local = loadLocalHighlights().filter(h => h.id !== id);
          saveLocalHighlights(local);
          setHighlights(local);
          setLocalMode(true);
        } else {
          throw dbErr;
        }
      }

      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        try {
          await supabase.storage.from('nm-mart-assets').remove([`highlights/${fileName}`]);
        } catch (_) { /* ignore storage cleanup errors */ }
      }

      toast.success("Highlight removed" + (localMode ? " (local)" : ""));
      if (deleted) fetchHighlights();
    } catch (err: any) {
      logSupabaseDebug("highlightDelete:error", { id }, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to delete highlight"));
    }
  };

  const moveHighlight = async (index: number, direction: 'up' | 'down') => {
    const newHighlights = [...highlights];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newHighlights.length) return;

    [newHighlights[index], newHighlights[targetIndex]] = [newHighlights[targetIndex], newHighlights[index]];
    const reordered = newHighlights.map((h, idx) => ({ ...h, display_order: idx }));
    setHighlights(reordered);

    try {
      const session = await getActiveSession();
      if (!session) {
        setSessionActive(false);
        toast.error("Please login again.");
        return;
      }
      let dbOk = true;
      try {
        for (const h of reordered) {
          await supabase
            .from(OPTIONAL_HIGHLIGHTS_TABLE)
            .update({ display_order: h.display_order })
            .eq('id', h.id);
        }
      } catch (dbErr: any) {
        if (isTableMissingError(dbErr)) {
          saveLocalHighlights(reordered);
          setLocalMode(true);
        } else {
          dbOk = false;
          throw dbErr;
        }
      }
      if (!dbOk) fetchHighlights();
    } catch (err: any) {
      logSupabaseDebug("highlightOrder:error", reordered, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to update highlight order"));
      fetchHighlights();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!sessionActive && (
        <div className="text-[10px] font-black uppercase tracking-wider text-red-500">
          Please Login - save actions are disabled.
        </div>
      )}
      {localMode && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800">
          <AlertTriangle size={18} className="shrink-0" />
          <div className="text-xs font-bold">
            <strong>Local Storage Mode:</strong> The <code className="bg-amber-100 px-1 rounded">highlights</code> table was not found in Supabase. Highlights are currently saved in your browser's localStorage only.
          </div>
        </div>
      )}
      {/* Add Highlight Form */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-black">Add New Highlight</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Instagram-style circular story icons
            </p>
          </div>
        </div>

        <form onSubmit={addHighlight} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Title</label>
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Offer, New, Best..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Redirect Link</label>
            <div className="relative group">
              <MousePointer2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="/category/spices or #..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold text-sm"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Icon/Image</label>
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 hover:bg-gray-100 transition-all h-[46px]">
                <Upload className="text-gray-400" size={18} />
                <span className="text-xs font-bold text-gray-500 truncate">{iconFile ? iconFile.name : "Choose Icon"}</span>
                <input type="file" className="hidden" onChange={handleIconChange} accept="image/*" />
              </label>
            </div>
            <button 
              type="submit"
              disabled={saving || !sessionActive}
              className="bg-primary text-white h-[46px] px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Highlights List */}
      <div className="flex flex-wrap gap-8 justify-center md:justify-start">
        {loading ? (
          <div className="w-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-primary" size={32} />
          </div>
        ) : highlights.length === 0 ? (
          <div className="w-full py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">No highlights created yet.</p>
          </div>
        ) : (
          highlights.map((h, index) => (
            <div key={h.id} className="relative group flex flex-col items-center gap-2">
              {/* Order Controls - Top Right */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                <button 
                  onClick={() => moveHighlight(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 bg-white border border-gray-100 text-primary rounded-lg shadow-lg hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-primary transition-all"
                >
                  <ChevronLeft size={14} className="rotate-90" />
                </button>
                <button 
                  onClick={() => moveHighlight(index, 'down')}
                  disabled={index === highlights.length - 1}
                  className="p-1.5 bg-white border border-gray-100 text-primary rounded-lg shadow-lg hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-primary transition-all"
                >
                  <ChevronRight size={14} className="rotate-90" />
                </button>
              </div>

              <div className={`w-20 h-20 rounded-full p-1 border-2 transition-all ${h.is_visible ? "border-primary" : "border-gray-200 opacity-50 grayscale"}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border border-white shadow-sm">
                  <img src={h.image_url} alt={h.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tight italic ${h.is_visible ? "text-black" : "text-gray-400"}`}>{h.title}</span>
              
              <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => toggleVisibility(h.id, h.is_visible)}
                  className={`p-2 rounded-full shadow-lg border transition-all ${h.is_visible ? "bg-white text-primary border-primary/20" : "bg-primary text-white border-transparent"}`}
                >
                  {h.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button 
                  onClick={() => deleteHighlight(h.id, h.image_url)}
                  className="p-2 bg-red-50 text-red-500 rounded-full shadow-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all"
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

export default HighlightsManager;
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getThemeConfig, setThemeConfig, ThemeConfig, 
  getThemePresets, saveThemePreset, ThemePreset,
  getSectionLayout, setSectionLayout, SectionLayout,
  publishTheme
} from "@/lib/storeConfig";
import { useTheme } from "@/lib/ThemeProvider";
import { toast } from "sonner";
import { 
  Palette, Type, Layout as LayoutIcon, Image as ImageIcon, 
  Settings, Save, RotateCcw, Monitor, Smartphone, 
  ChevronLeft, Moon, Sun, Plus, Trash2, Eye,
  Undo2, Redo2, Rocket, CloudUpload, History,
  Box, MousePointer2, SmartphoneNfc, Sparkles,
  Zap, Clock, Gift, ShoppingBag, Globe, Info,
  CheckCircle2, AlertTriangle, FileJson
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Index from "@/pages/Index";

const GOOGLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Poppins", 
  "Montserrat", "Raleway", "Playfair Display", "Oswald", "Ubuntu", "Merriweather"
];

const Customize = () => {
  const navigate = useNavigate();
  const { theme: currentTheme, refreshTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<ThemeConfig | null>(null);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [layout, setLayout] = useState<SectionLayout[]>([]);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [history, setHistory] = useState<ThemeConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mode, setMode] = useState<"draft" | "live">("draft");

  useEffect(() => {
    const load = async () => {
      const config = await getThemeConfig(true); // Load draft by default
      setLocalTheme(config);
      setHistory([config]);
      setHistoryIndex(0);
      const p = await getThemePresets();
      setPresets(p);
      const l = await getSectionLayout();
      setLayout(l);
    };
    load();
  }, []);

  const handleUpdate = useCallback((updates: Partial<ThemeConfig>, skipHistory = false) => {
    if (!localTheme) return;
    const newTheme = { ...localTheme, ...updates };
    setLocalTheme(newTheme);

    if (!skipHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newTheme);
      if (newHistory.length > 15) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    // Real-time preview variables
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'primaryColor') document.documentElement.style.setProperty('--primary-dynamic', value as string);
      if (key === 'secondaryColor') document.documentElement.style.setProperty('--secondary-dynamic', value as string);
      if (key === 'backgroundColor') document.documentElement.style.setProperty('--bg-dynamic', value as string);
      if (key === 'textColor') document.documentElement.style.setProperty('--text-dynamic', value as string);
      if (key === 'accentColor') document.documentElement.style.setProperty('--accent-dynamic', value as string);
    });
  }, [localTheme, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setLocalTheme(prev);
      handleUpdate(prev, true);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setLocalTheme(next);
      handleUpdate(next, true);
    }
  };

  const handleSave = async () => {
    if (!localTheme) return;
    setIsSaving(true);
    try {
      await setThemeConfig(localTheme, true); // Save to draft
      await setSectionLayout(layout);
      toast.success("Draft saved successfully!");
    } catch (err) {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!localTheme) return;
    setIsPublishing(true);
    try {
      await setThemeConfig(localTheme, true);
      await publishTheme();
      await refreshTheme();
      toast.success("Site published successfully! Changes are now live.");
    } catch (err) {
      toast.error("Failed to publish changes");
    } finally {
      setIsPublishing(false);
    }
  };

  const exportPreset = () => {
    if (!localTheme) return;
    const blob = new Blob([JSON.stringify(localTheme, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nm-mart-theme-${Date.now()}.json`;
    a.click();
  };

  const handleSavePreset = async () => {
    if (!localTheme) return;
    const name = prompt("Enter theme preset name:");
    if (!name) return;
    const newPreset: ThemePreset = {
      id: Date.now().toString(),
      name,
      config: localTheme
    };
    await saveThemePreset(newPreset);
    setPresets([...presets, newPreset]);
    toast.success("Preset saved to library!");
  };

  const applyPreset = (preset: ThemePreset) => {
    handleUpdate(preset.config);
    toast.info(`Theme "${preset.name}" applied as draft`);
  };

  const applyEventMode = (mode: "festival" | "sale" | "normal") => {
    if (mode === "festival") {
      handleUpdate({
        primaryColor: "#CC0000",
        secondaryColor: "#D4AF37",
        accentColor: "#FFD700",
        highlightColor: "#FF0000",
        eventMode: "festival",
        animationsEnabled: true,
        animationSpeed: "normal"
      });
    } else if (mode === "sale") {
      handleUpdate({
        primaryColor: "#000000",
        secondaryColor: "#FFD700",
        accentColor: "#FF0000",
        highlightColor: "#FFFF00",
        eventMode: "sale",
        animationsEnabled: true,
        animationSpeed: "fast"
      });
    } else {
      handleUpdate({
        primaryColor: "#CC0000",
        secondaryColor: "#D4AF37",
        accentColor: "#FBBF24",
        highlightColor: "#FF0000",
        eventMode: "normal",
        animationsEnabled: true,
        animationSpeed: "normal"
      });
    }
    toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} mode preset applied!`);
  };

  if (!localTheme) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-slate-200">
      {/* Left Sidebar - Ultra Controls */}
      <div className="w-[420px] border-r border-slate-800 flex flex-col bg-[#111111] shadow-2xl z-20">
        <div className="p-4 border-b border-slate-800 flex flex-col gap-4 bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => navigate("/admin")}>
                <ChevronLeft size={20} />
              </Button>
              <div>
                <h1 className="font-black uppercase tracking-tighter text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Ultra Customizer
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[8px] h-4 border-primary/50 text-primary">v2.0 PRO</Badge>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Draft Mode</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={undo} disabled={historyIndex <= 0}>
                <Undo2 size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo2 size={16} />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent border-slate-700 hover:bg-slate-800 text-xs h-9" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : <CloudUpload size={14} className="mr-2" />} Save Draft
            </Button>
            <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[10px] h-9" onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : <Rocket size={14} className="mr-2" />} Publish Live
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-2">
          <Tabs defaultValue="visuals" className="w-full">
            <TabsList className="w-full justify-start rounded-xl border border-slate-800 h-11 bg-black/40 p-1 mb-6">
              <TabsTrigger value="visuals" className="flex-1 gap-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Palette size={14} /> Visuals</TabsTrigger>
              <TabsTrigger value="content" className="flex-1 gap-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><LayoutIcon size={14} /> Sections</TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1 gap-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Zap size={14} /> Pro</TabsTrigger>
            </TabsList>

            <TabsContent value="visuals" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300 pb-8">
              {/* Core Colors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Palette size={12} /> Color Palette</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold text-primary" onClick={() => applyPreset(presets[0])}>Reset Defaults</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400">Primary Brand</Label>
                    <div className="flex gap-2">
                      <div className="relative group">
                        <Input type="color" value={localTheme.primaryColor} onChange={(e) => handleUpdate({ primaryColor: e.target.value })} className="w-10 h-10 p-0.5 bg-slate-800 border-slate-700 cursor-pointer rounded-lg" />
                        <div className="absolute inset-0 rounded-lg ring-1 ring-white/10 pointer-events-none" />
                      </div>
                      <Input value={localTheme.primaryColor} onChange={(e) => handleUpdate({ primaryColor: e.target.value })} className="text-[10px] font-black h-10 bg-slate-900/50 border-slate-800 text-slate-300 uppercase tracking-widest" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={localTheme.accentColor || "#FBBF24"} onChange={(e) => handleUpdate({ accentColor: e.target.value })} className="w-10 h-10 p-0.5 bg-slate-800 border-slate-700 cursor-pointer rounded-lg" />
                      <Input value={localTheme.accentColor || "#FBBF24"} onChange={(e) => handleUpdate({ accentColor: e.target.value })} className="text-[10px] font-black h-10 bg-slate-900/50 border-slate-800 text-slate-300 uppercase tracking-widest" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400">Background</Label>
                    <Input type="color" value={localTheme.backgroundColor} onChange={(e) => handleUpdate({ backgroundColor: e.target.value })} className="w-full h-10 p-0.5 bg-slate-800 border-slate-700 cursor-pointer rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400">Global Text</Label>
                    <Input type="color" value={localTheme.textColor} onChange={(e) => handleUpdate({ textColor: e.target.value })} className="w-full h-10 p-0.5 bg-slate-800 border-slate-700 cursor-pointer rounded-lg" />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Typography Ultra */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Type size={12} /> Typography Control</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Heading Font Family</Label>
                    <Select value={localTheme.headingFont} onValueChange={(v) => handleUpdate({ headingFont: v })}>
                      <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        {GOOGLE_FONTS.map(f => <SelectItem key={f} value={f} className="focus:bg-primary focus:text-white">{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Body Font Family</Label>
                    <Select value={localTheme.bodyFont} onValueChange={(v) => handleUpdate({ bodyFont: v })}>
                      <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        {GOOGLE_FONTS.map(f => <SelectItem key={f} value={f} className="focus:bg-primary focus:text-white">{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold text-slate-400">Font Size ({localTheme.fontSizeBase}px)</Label>
                      </div>
                      <Slider value={[localTheme.fontSizeBase || 14]} min={12} max={18} step={1} onValueChange={([v]) => handleUpdate({ fontSizeBase: v })} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold text-slate-400">Line Height ({localTheme.lineHeight})</Label>
                      </div>
                      <Slider value={[localTheme.lineHeight || 1.5]} min={1} max={2} step={0.1} onValueChange={([v]) => handleUpdate({ lineHeight: v })} />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Event Modes */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Globe size={12} /> One-Click Event Modes</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className={`flex flex-col h-16 gap-1 border-slate-800 bg-slate-900/40 hover:bg-slate-800 transition-all ${localTheme.eventMode === "normal" ? "border-primary bg-primary/10" : ""}`} onClick={() => applyEventMode("normal")}>
                    <Monitor size={14} className="text-blue-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Normal</span>
                  </Button>
                  <Button variant="outline" className={`flex flex-col h-16 gap-1 border-slate-800 bg-slate-900/40 hover:bg-slate-800 transition-all ${localTheme.eventMode === "festival" ? "border-primary bg-primary/10" : ""}`} onClick={() => applyEventMode("festival")}>
                    <Gift size={14} className="text-red-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Festival</span>
                  </Button>
                  <Button variant="outline" className={`flex flex-col h-16 gap-1 border-slate-800 bg-slate-900/40 hover:bg-slate-800 transition-all ${localTheme.eventMode === "sale" ? "border-primary bg-primary/10" : ""}`} onClick={() => applyEventMode("sale")}>
                    <ShoppingBag size={14} className="text-yellow-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Big Sale</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Layout Control */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><LayoutIcon size={12} /> Homepage Sections</Label>
                <div className="space-y-2">
                  {layout.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800 hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">{idx + 1}</div>
                        <span className="text-xs font-bold text-slate-300">{item.name}</span>
                      </div>
                      <Switch checked={item.visible} onCheckedChange={(v) => {
                        const newLayout = [...layout];
                        newLayout[idx].visible = v;
                        setLayout(newLayout);
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Design Styles */}
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Box size={12} /> Component Styles</Label>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Header Style</Label>
                  <Select value={localTheme.headerStyle} onValueChange={(v: any) => handleUpdate({ headerStyle: v })}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="classic">Classic Side Menu</SelectItem>
                      <SelectItem value="modern">Modern Floating</SelectItem>
                      <SelectItem value="minimal">Minimal Top Bar</SelectItem>
                      <SelectItem value="centered">Centered Logo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Card Design</Label>
                  <Select value={localTheme.productCardStyle} onValueChange={(v: any) => handleUpdate({ productCardStyle: v })}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="compact">Compact Grid</SelectItem>
                      <SelectItem value="premium">Premium Shadow</SelectItem>
                      <SelectItem value="offer">Offer Focused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Button Appearance</Label>
                  <Select value={localTheme.buttonStyle} onValueChange={(v: any) => handleUpdate({ buttonStyle: v })}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="flat">Classic Flat</SelectItem>
                      <SelectItem value="gradient">Modern Gradient</SelectItem>
                      <SelectItem value="outline">Clean Outline</SelectItem>
                      <SelectItem value="shadow">Premium Glow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Presets Library */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><History size={12} /> Theme Library</Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={handleSavePreset}><Plus size={16} /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {presets.map(p => (
                    <Card key={p.id} className="cursor-pointer bg-slate-900/40 border-slate-800 hover:border-primary transition-all group relative overflow-hidden h-24" onClick={() => applyPreset(p)}>
                      <CardHeader className="p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.config.primaryColor }} />
                          <CardTitle className="text-[10px] font-black uppercase truncate text-slate-200">{p.name}</CardTitle>
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          <div className="h-1 rounded-full bg-slate-700 w-full" />
                          <div className="h-1 rounded-full bg-slate-700 w-1/2" />
                          <div className="h-1 rounded-full bg-slate-700 w-3/4" />
                        </div>
                      </CardHeader>
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); /* delete */ }}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Performance & Effects */}
              <div className="space-y-6">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Zap size={12} /> Performance & Effects</Label>
                
                <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-300">Global Animations</p>
                    <p className="text-[9px] text-slate-500 font-medium">Toggle smooth transitions</p>
                  </div>
                  <Switch checked={localTheme.animationsEnabled} onCheckedChange={(v) => handleUpdate({ animationsEnabled: v })} />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Animation Speed</Label>
                  <Select value={localTheme.animationSpeed} onValueChange={(v: any) => handleUpdate({ animationSpeed: v })}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="slow">Cinema (Slow)</SelectItem>
                      <SelectItem value="normal">Default (Smooth)</SelectItem>
                      <SelectItem value="fast">Instant (Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Global CSS</Label>
                  <textarea 
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-emerald-500 focus:border-primary outline-none transition-all"
                    placeholder="/* Custom CSS here */\n.my-class { ... }"
                    value={localTheme.customCss}
                    onChange={(e) => handleUpdate({ customCss: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-slate-900 border-slate-800 h-9 text-[10px] font-black uppercase tracking-widest" onClick={exportPreset}>
                  <FileJson size={14} className="mr-2" /> Export Config
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Right - Pro Preview System */}
      <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        {/* Preview Toolbar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a1a]/80 backdrop-blur-xl border border-slate-800 px-4 py-2 rounded-2xl shadow-2xl z-50">
          <div className="flex items-center gap-1 mr-4 pr-4 border-r border-slate-800">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Preview</span>
          </div>
          <Button variant={viewMode === "desktop" ? "default" : "ghost"} size="sm" className={`rounded-xl h-8 text-[10px] font-black uppercase tracking-widest ${viewMode === "desktop" ? "bg-primary text-white" : "text-slate-400"}`} onClick={() => setViewMode("desktop")}>
            <Monitor size={14} className="mr-2" /> Desktop
          </Button>
          <Button variant={viewMode === "mobile" ? "default" : "ghost"} size="sm" className={`rounded-xl h-8 text-[10px] font-black uppercase tracking-widest ${viewMode === "mobile" ? "bg-primary text-white" : "text-slate-400"}`} onClick={() => setViewMode("mobile")}>
            <Smartphone size={14} className="mr-2" /> Mobile
          </Button>
        </div>

        {/* Dynamic Canvas */}
        <div className="flex-1 flex items-center justify-center p-12 mt-8 overflow-hidden">
          <div className={`bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-700 ease-in-out overflow-hidden relative ${
            viewMode === "mobile" ? "w-[375px] h-[760px] rounded-[50px] border-[14px] border-[#1a1a1a]" : "w-full h-full rounded-3xl border border-slate-800"
          }`}>
            {/* Device Details for Mobile */}
            {viewMode === "mobile" && (
              <>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-3xl z-[60] flex items-center justify-center gap-2">
                   <div className="w-10 h-1 rounded-full bg-slate-800" />
                   <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-800 rounded-full z-[60]" />
              </>
            )}
            
            <ScrollArea className="h-full bg-slate-100">
               <Index previewTheme={localTheme} previewLayout={layout} />
            </ScrollArea>
          </div>
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] pointer-events-none">
           <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Autosave Draft Active</div>
           <div className="flex items-center gap-2"><Info size={12} className="text-blue-500" /> Changes visible only in preview</div>
        </div>
      </div>
    </div>
  );
};

export default Customize;

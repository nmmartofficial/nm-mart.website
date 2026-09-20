import { useEffect, useState } from "react";
import { ArrowLeft, Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { supabase } from "@/lib/supabase/client";
import { TABLES } from "@/lib/supabase/schema";
import { toast } from "sonner";

export default function Addresses() {
  const navigate = useNavigate();
  const { addresses, loading, saveAddress, updateAddress, deleteAddress, setDefaultAddress } = useSavedAddresses();
  const [form, setForm] = useState({ label: "Home", address: "", landmark: "", city: "", state: "", pincode: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from(TABLES.profiles).select("full_name").eq("id", user.id).maybeSingle();
      setProfileName(data?.full_name || user.user_metadata?.full_name || "");
    });
  }, []);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.address.trim() || !/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Enter your address and a valid 6-digit pincode.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, address: form.address.trim(), pincode: form.pincode.trim() };
      if (editingId) await updateAddress(editingId, payload);
      else await saveAddress(payload);
      setForm({ label: "Home", address: "", landmark: "", city: "", state: "", pincode: "" });
      setEditingId(null);
      setShowForm(false);
      toast.success(editingId ? "Address updated successfully." : "Address saved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save address.");
    } finally { setSaving(false); }
  };

  const startEditing = (address: (typeof addresses)[number]) => {
    setEditingId(address.id);
    setShowForm(true);
    setForm({ label: address.label, address: address.address, landmark: address.landmark || "", city: address.city || "", state: address.state || "", pincode: address.pincode });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAdding = () => {
    setEditingId(null);
    setForm({ label: "Home", address: "", landmark: "", city: "", state: "", pincode: "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({ label: "Home", address: "", landmark: "", city: "", state: "", pincode: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary"><ArrowLeft size={14} /> Back</button>
        <h1 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">Delivery Addresses</h1>
        <p className="mt-2 text-sm text-slate-500">Choose where you want your NM Mart order delivered.</p>

        <div className="mt-8 max-w-3xl">
          <section className="space-y-3">
            {loading ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">Loading addresses...</div> : addresses.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No saved addresses yet.</div> : addresses.map((address) => (
              <article key={address.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${address.is_default ? "border-primary/40 ring-1 ring-primary/10" : "border-slate-200"}`}>
                <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3"><MapPin className="mt-1 shrink-0 text-primary" size={19} /><div className="min-w-0"><p className="text-sm font-black uppercase tracking-[0.12em] text-slate-800">{address.label}</p><p className="mt-1 text-sm font-bold text-slate-700">{profileName || "NM Mart customer"}</p><p className="mt-1 text-sm leading-5 text-slate-600">{address.address}</p><p className="text-sm leading-5 text-slate-500">{[address.landmark, address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p></div></div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => startEditing(address)} className="rounded-full p-2 text-primary hover:bg-primary/10" aria-label={`Edit ${address.label} address`}><Pencil size={15} /> </button>
                  <button type="button" onClick={() => deleteAddress(address.id).catch(() => toast.error("Unable to delete address."))} className="rounded-full p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${address.label} address`}><Trash2 size={16} /></button>
                </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  {address.is_default ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700"><Check size={12} /> Default</span> : <span />}
                  <button type="button" onClick={() => address.is_default ? startEditing(address) : setDefaultAddress(address.id).catch(() => toast.error("Unable to select default address."))} className="text-xs font-black text-primary hover:underline">{address.is_default ? "Change" : "Select"}</button>
                </div>
              </article>
            ))}
          </section>

          <button type="button" onClick={showForm ? cancelForm : startAdding} disabled={addresses.length >= 5 && !showForm} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 text-sm font-black text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17} /> {showForm ? "Cancel" : "Add New Address"}</button>

          {showForm && <form onSubmit={handleSave} className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{editingId ? "Edit address" : `Add address ${addresses.length}/5`}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["label", "address", "landmark", "city", "state", "pincode"] as const).map((key) => (
                <input key={key} value={form[key]} onChange={(event) => update(key, event.target.value)} placeholder={key === "label" ? "Label (Home, Office...)" : key === "address" ? "Street / Area" : key === "pincode" ? "6-digit Pincode" : key[0].toUpperCase() + key.slice(1)} disabled={saving || (addresses.length >= 5 && !editingId)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary disabled:opacity-50 sm:last:col-span-2" />
              ))}
            </div>
            <button type="submit" disabled={saving || (addresses.length >= 5 && !editingId)} className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white disabled:opacity-50">{saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}</button>
          </form>}
        </div>
      </main>
      <Footer />
    </div>
  );
}

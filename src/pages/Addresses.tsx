import { useState } from "react";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { toast } from "sonner";

export default function Addresses() {
  const navigate = useNavigate();
  const { addresses, loading, saveAddress, deleteAddress } = useSavedAddresses();
  const [form, setForm] = useState({ label: "Home", address: "", landmark: "", city: "", state: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.address.trim() || !/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Enter your address and a valid 6-digit pincode.");
      return;
    }
    setSaving(true);
    try {
      await saveAddress({ ...form, address: form.address.trim(), pincode: form.pincode.trim() });
      setForm({ label: "Home", address: "", landmark: "", city: "", state: "", pincode: "" });
      toast.success("Address saved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save address.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary"><ArrowLeft size={14} /> Back</button>
        <h1 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">Saved Addresses</h1>
        <p className="mt-2 text-sm text-slate-500">Save up to 5 delivery addresses and choose one at checkout.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={handleSave} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Add address {addresses.length}/5</p>
            <div className="mt-4 space-y-3">
              {(["label", "address", "landmark", "city", "state", "pincode"] as const).map((key) => (
                <input key={key} value={form[key]} onChange={(event) => update(key, event.target.value)} placeholder={key === "label" ? "Label (Home, Office...)" : key === "address" ? "Street / Area" : key === "pincode" ? "6-digit Pincode" : key[0].toUpperCase() + key.slice(1)} disabled={saving || addresses.length >= 5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary disabled:opacity-50" />
              ))}
            </div>
            <button type="submit" disabled={saving || addresses.length >= 5} className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white disabled:opacity-50">{saving ? "Saving..." : "Save Address"}</button>
          </form>

          <section className="space-y-3">
            {loading ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">Loading addresses...</div> : addresses.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No saved addresses yet.</div> : addresses.map((address) => (
              <article key={address.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex gap-3"><MapPin className="mt-1 shrink-0 text-primary" size={18} /><div><p className="text-xs font-black uppercase tracking-[0.15em] text-slate-800">{address.label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{address.address}</p><p className="text-xs text-slate-500">{[address.landmark, address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p></div></div>
                <button type="button" onClick={() => deleteAddress(address.id).catch(() => toast.error("Unable to delete address."))} className="rounded-full p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${address.label} address`}><Trash2 size={16} /></button>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

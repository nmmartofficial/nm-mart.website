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
  const [form, setForm] = useState({
    label: "Home",
    addressType: "Home",
    fullName: "",
    mobileNumber: "",
    street: "",
    landmark: "",
    city: "",
    pincode: "",
    is_default: false,
  });
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

  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const mobileNumber = form.mobileNumber.trim();
    const streetLine = form.street.trim();
    const city = form.city.trim();
    const pincode = form.pincode.trim();
    const state = "Uttar Pradesh";

    if (!fullName) {
      toast.error("Enter full name for the delivery address.");
      return;
    }

    if (!/^\+?[0-9\s()-]{10,15}$/.test(mobileNumber)) {
      toast.error("Enter a valid mobile number.");
      return;
    }

    if (!streetLine || !city || !/^\d{6}$/.test(pincode)) {
      toast.error("Fill in the address, city, and valid 6-digit pincode.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: form.addressType || "Home",
        address: streetLine,
        landmark: form.landmark.trim(),
        city,
        state,
        pincode,
        is_default: form.is_default,
      };

      if (editingId) await updateAddress(editingId, payload);
      else await saveAddress(payload);

      setForm({
        label: "Home",
        addressType: "Home",
        fullName: profileName || "",
        mobileNumber: "",
        street: "",
        landmark: "",
        city: "",
        pincode: "",
        is_default: false,
      });
      setEditingId(null);
      setShowForm(false);
      toast.success(editingId ? "Address updated successfully." : "Address saved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save address.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (address: (typeof addresses)[number]) => {
    setEditingId(address.id);
    setShowForm(true);
    setForm({
      label: address.label,
      addressType: address.label || "Home",
      fullName: profileName || "Rahul Kumar",
      mobileNumber: "",
      street: address.address || "",
      landmark: address.landmark || "",
      city: address.city || "",
      pincode: address.pincode || "",
      is_default: !!address.is_default,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAdding = () => {
    setEditingId(null);
    setForm({
      label: "Home",
      addressType: "Home",
      fullName: profileName || "",
      mobileNumber: "",
      street: "",
      landmark: "",
      city: "",
      pincode: "",
      is_default: false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAddress = async (id: number) => {
    const confirmed = window.confirm("Delete this saved address?");
    if (!confirmed) return;
    await deleteAddress(id).catch(() => toast.error("Unable to delete address."));
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      label: "Home",
      addressType: "Home",
      fullName: profileName || "",
      mobileNumber: "",
      street: "",
      landmark: "",
      city: "",
      pincode: "",
      is_default: false,
    });
  };

  const displayName = profileName || "Rahul Kumar";
  const fallbackPhone = "+91 98765 43210";
  const addressTypeOptions = ["Home", "Work", "Other"] as const;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft size={14} />
          Delivery Addresses
        </button>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Saved Addresses</p>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Loading addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No saved addresses yet.
              </div>
            ) : (
              addresses.map((address) => {
                const addressLines = [
                  address.address,
                  address.landmark,
                  [address.city, address.state].filter(Boolean).join(", "),
                  `Uttar Pradesh - ${address.pincode}`,
                ].filter(Boolean);

                return (
                  <article
                    key={address.id}
                    className={`rounded-[22px] border bg-white p-4 shadow-sm ${
                      address.is_default ? "border-primary/30 ring-1 ring-primary/10" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <MapPin size={16} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.14em] text-slate-800">
                          {address.label || "Home"}
                        </span>
                      </div>

                      {address.is_default && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                          <Check size={14} />
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-1 pl-1 text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-900">{displayName}</p>
                      {addressLines.map((line, index) => (
                        <p key={`${address.id}-${index}`} className={index === 0 ? "font-medium" : "text-slate-600"}>
                          {line}
                        </p>
                      ))}
                      <p className="pt-1 text-slate-600">{fallbackPhone}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      {!address.is_default ? (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(address.id).catch(() => toast.error("Unable to select default address."))}
                          className="text-[11px] font-black uppercase tracking-[0.12em] text-primary hover:text-primary/80"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-600">Default</span>
                      )}

                      <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
                        <button
                          type="button"
                          onClick={() => startEditing(address)}
                          className="transition-colors hover:text-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteAddress(address.id)}
                          className="transition-colors hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={showForm ? cancelForm : startAdding}
            disabled={addresses.length >= 5 && !showForm}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3 text-sm font-black text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            {showForm ? "Cancel" : "Add New Address"}
          </button>

          {showForm && (
            <form onSubmit={handleSave} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Add New Address</p>

              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-700">Address Type</p>
                <div className="mt-3 flex flex-wrap items-center gap-5">
                  {addressTypeOptions.map((type) => (
                    <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="addressType"
                        checked={form.addressType === type}
                        onChange={() => update("addressType", type)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                    placeholder="Full Name"
                    disabled={saving || (addresses.length >= 5 && !editingId)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Mobile Number</label>
                  <input
                    value={form.mobileNumber}
                    onChange={(event) => update("mobileNumber", event.target.value)}
                    placeholder="Mobile Number"
                    disabled={saving || (addresses.length >= 5 && !editingId)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Street / Area</label>
                  <input
                    value={form.street}
                    onChange={(event) => update("street", event.target.value)}
                    placeholder="Street / Area"
                    disabled={saving || (addresses.length >= 5 && !editingId)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Landmark</label>
                  <input
                    value={form.landmark}
                    onChange={(event) => update("landmark", event.target.value)}
                    placeholder="Landmark"
                    disabled={saving || (addresses.length >= 5 && !editingId)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
                  <input
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    placeholder="City"
                    disabled={saving || (addresses.length >= 5 && !editingId)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Pincode</label>
                  <input
                    value={form.pincode}
                    onChange={(event) => update("pincode", event.target.value)}
                    placeholder="Pincode"
                    disabled={saving || (addresses.length >= 5 && !editingId)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(event) => update("is_default", event.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                Set as default address
              </label>

              <button
                type="submit"
                disabled={saving || (addresses.length >= 5 && !editingId)}
                className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Address"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

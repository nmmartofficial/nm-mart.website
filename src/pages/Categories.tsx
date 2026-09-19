import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { useProducts } from "@/hooks/useProducts";

export default function Categories() {
  const navigate = useNavigate();
  const { allProducts, categories, loading, error } = useProducts();
  const imageByCategory = useMemo(() => {
    const images: Record<string, string> = {};
    for (const product of allProducts) {
      const key = product.category.trim().toUpperCase();
      if (key && product.imageUrl && !images[key]) images[key] = product.imageUrl;
    }
    return images;
  }, [allProducts]);

  const liveCategories = categories.filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="mb-7">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Live store</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">All Categories</h1>
          <p className="mt-2 text-sm text-slate-500">Browse every category currently available in the store.</p>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading categories...</div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-12 text-center text-sm font-semibold text-red-600">{error}</div>
        ) : liveCategories.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No categories available right now.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {liveCategories.map((category) => {
              const image = imageByCategory[category.toUpperCase()];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => navigate(`/shop?category=${encodeURIComponent(category)}`)}
                  className="group flex min-h-[170px] flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-50 ring-1 ring-slate-100">
                    {image ? <img src={image} alt={category} className="h-full w-full object-contain p-2" loading="lazy" /> : <LayoutGrid className="h-8 w-8 text-slate-400" />}
                  </div>
                  <span className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 group-hover:text-orange-600">{category}</span>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

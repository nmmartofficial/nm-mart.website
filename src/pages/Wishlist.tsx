import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";

export default function Wishlist() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistBarcodes } = useWishlist();
  const { allProducts, loading } = useProducts();
  const wishlist = allProducts.filter((product) => wishlistBarcodes.includes(product.barcode));

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Saved products</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">My Wishlist</h1>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 shadow-sm">
            {wishlist.length} saved
          </span>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading saved products...</div>
        ) : wishlist.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm md:p-16">
            <Heart className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-5 text-2xl font-black uppercase tracking-[-0.05em]">Your wishlist is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Save products here while you browse the live store.</p>
            <Link to="/shop" className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
            {wishlist.map((product) => (
              <ProductCard key={product.id || product.barcode} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

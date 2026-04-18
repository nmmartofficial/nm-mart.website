import { useState, useEffect, useRef } from "react";
import { 
  Search, Loader2, Edit2, Check, X, ChevronLeft, ChevronRight, AlertCircle, Package, Eye, EyeOff
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const InventoryTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const [editingBarcode, setEditingBarcode] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,barcode.eq.${searchQuery}`);
      }

      const { data, count, error } = await query
        .order('name', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const startEditing = (product: any) => {
    setEditingBarcode(product.barcode);
    setEditPrice(String(product.salerate || product.Rate || 0));
    setEditStock(String(product.stock_quantity || product.OpStock || 0));
    setEditBadge(product.badge || "");
  };

  const cancelEditing = () => {
    setEditingBarcode(null);
  };

  const saveEdit = async (barcode: string) => {
    setSaving(true);
    try {
      // SAFE MODE: Only update salerate and stock_quantity
      const { error } = await supabase
        .from('products')
        .update({
          salerate: Number(editPrice),
          stock_quantity: Number(editStock),
          badge: editBadge,
          updated_at: new Date().toISOString()
        })
        .eq('barcode', barcode);

      if (error) throw error;

      toast.success("Product updated safely!");
      setEditingBarcode(null);
      fetchProducts();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (barcode: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_visible: !currentStatus })
        .eq('barcode', barcode);

      if (error) throw error;
      setProducts(products.map(p => p.barcode === barcode ? { ...p, is_visible: !currentStatus } : p));
      toast.success(currentStatus ? "Product hidden" : "Product visible");
    } catch (err: any) {
      toast.error("Update failed");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center text-[#CC0000]">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-black">Product Inventory</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total: <span className="text-[#CC0000]">{totalCount.toLocaleString()}</span> Items
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or barcode..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-[#CC0000] transition-all font-bold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Safe Mode Warning */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-center">
        <AlertCircle className="text-amber-500 shrink-0" size={20} />
        <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
          <span className="font-black">Safe Mode Active:</span> Only Price and Stock can be edited to maintain POS synchronization.
        </p>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Price (₹)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#CC0000]" size={32} />
                    <p className="mt-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading Inventory...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-gray-400 font-bold italic">No products found matching your search.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.barcode} className={`hover:bg-gray-50/50 transition-colors ${!product.is_visible ? 'opacity-60 grayscale' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase italic leading-tight">{product.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest mt-1">{product.barcode}</p>
                          {editingBarcode === product.barcode && (
                            <input 
                              type="text"
                              placeholder="Badge (e.g. Sale, New)"
                              className="mt-2 w-full bg-white border border-primary rounded-lg px-2 py-1 font-bold text-[10px] outline-none"
                              value={editBadge}
                              onChange={(e) => setEditBadge(e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingBarcode === product.barcode ? (
                        <input 
                          type="number"
                          className="w-24 bg-white border border-primary rounded-lg px-2 py-1 text-center font-bold text-sm outline-none"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      ) : (
                        <span className="font-black text-sm text-primary">₹{product.salerate || product.Rate || 0}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingBarcode === product.barcode ? (
                        <input 
                          type="number"
                          className="w-20 bg-white border border-primary rounded-lg px-2 py-1 text-center font-bold text-sm outline-none"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs font-black px-3 py-1 rounded-full uppercase italic ${
                            (product.stock_quantity || product.OpStock || 0) > 10 
                            ? "bg-green-50 text-green-600" 
                            : (product.stock_quantity || product.OpStock || 0) <= 5
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-red-50 text-red-600"
                          }`}>
                            {product.stock_quantity || product.OpStock || 0} In Stock
                          </span>
                          {(product.stock_quantity || product.OpStock || 0) <= 5 && (
                            <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">Low Stock Alert!</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleVisibility(product.barcode, product.is_visible)}
                          className={`p-2 rounded-xl transition-all ${product.is_visible ? 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-primary text-white hover:bg-black'}`}
                          title={product.is_visible ? "Hide Product" : "Show Product"}
                        >
                          {product.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        {editingBarcode === product.barcode ? (
                          <>
                            <button 
                              onClick={() => saveEdit(product.barcode)}
                              disabled={saving}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                            >
                              {saving ? <Loader2 className="animate-spin" size="16" /> : <Check size={16} />}
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => startEditing(product)}
                            className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-black hover:text-white transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing <span className="text-black">{products.length}</span> of <span className="text-black">{totalCount}</span> Products
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:border-[#CC0000] transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${
                        page === pageNum 
                        ? "bg-[#CC0000] text-white shadow-lg" 
                        : "bg-white border border-gray-200 text-gray-400 hover:border-[#CC0000] hover:text-[#CC0000]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:border-[#CC0000] transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTab;

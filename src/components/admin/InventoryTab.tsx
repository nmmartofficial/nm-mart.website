import { ScanBarcode, FileUp, Loader2, Database, TrendingUp, AlertCircle } from "lucide-react";
import React from "react";

interface InventoryTabProps {
  barcode: string;
  setBarcode: (v: string) => void;
  productName: string;
  setProductName: (v: string) => void;
  mrp: string;
  setMrp: (v: string) => void;
  salePrice: string;
  setSalePrice: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  subCategory: string;
  setSubCategory: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  stockQuantity: string;
  setStockQuantity: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
  loading: boolean;
  isImporting: boolean;
  fetchingProduct: boolean;
  productExists: boolean | null;
  discount: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInventorySubmit: (e: React.FormEvent) => void;
  fetchProductDetails: (code: string) => void;
  barcodeInputRef: React.RefObject<HTMLInputElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const InventoryTab = ({
  barcode, setBarcode, productName, setProductName, mrp, setMrp,
  salePrice, setSalePrice, category, setCategory, subCategory, setSubCategory,
  brand, setBrand, stockQuantity, setStockQuantity,
  imageUrl, setImageUrl, isScanning, setIsScanning, loading, isImporting,
  fetchingProduct, productExists, discount, handleFileUpload, handleInventorySubmit, fetchProductDetails,
  barcodeInputRef, fileInputRef
}: InventoryTabProps) => {
  return (
    <div className="grid lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Form Section */}
      <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <ScanBarcode size={24} />
            </div>
            Update Inventory
          </h3>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {isImporting ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
              <span className="hidden sm:inline">Import Excel</span>
            </button>
            <button 
              onClick={() => setIsScanning(!isScanning)}
              className={`p-3 rounded-2xl transition-all shadow-sm ${isScanning ? "bg-red-500 text-white" : "bg-primary text-white hover:bg-black"}`}
            >
              <ScanBarcode size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleInventorySubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Barcode / Product Code</label>
            <div className="relative group">
              <input 
                ref={barcodeInputRef}
                type="text" 
                placeholder="SCAN OR TYPE BARCODE"
                className={`w-full bg-gray-50 border rounded-2xl py-4 px-6 outline-none transition-all font-bold tracking-widest text-sm ${
                  productExists === true ? "border-green-500 ring-2 ring-green-100" : 
                  productExists === false ? "border-blue-500 ring-2 ring-blue-100" : 
                  "border-gray-100 focus:border-primary"
                }`}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchProductDetails(barcode);
                  }
                }}
                onBlur={() => {
                  if (barcode) fetchProductDetails(barcode);
                }}
              />
              {fetchingProduct && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={20} />}
            </div>
            {productExists === true && <p className="text-[10px] font-bold text-green-600 ml-1 uppercase italic">Product Found - Edit Mode</p>}
            {productExists === false && <p className="text-[10px] font-bold text-blue-600 ml-1 uppercase italic">New Product Detected - Create Mode</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Product Name</label>
            <input 
              type="text" 
              placeholder="ENTER PRODUCT NAME"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">MRP (₹)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Sale Price (₹)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm text-primary"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Discount (%)</label>
              <div className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-4 px-6 font-black text-sm text-red-500 flex items-center justify-center italic">
                {discount}% OFF
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Category</label>
              <input 
                type="text" 
                placeholder="e.g. Snacks"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Sub-Category</label>
              <input 
                type="text" 
                placeholder="e.g. Biscuits"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Brand</label>
              <input 
                type="text" 
                placeholder="e.g. Tata"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Stock Quantity</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Image URL</label>
            <input 
              type="text" 
              placeholder="PASTE IMAGE LINK"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full text-white py-5 rounded-2xl font-black uppercase tracking-[2px] transition-all shadow-sm flex items-center justify-center gap-3 italic ${
              productExists === true ? "bg-green-600 hover:bg-black" : 
              productExists === false ? "bg-blue-600 hover:bg-black" : 
              "bg-primary hover:bg-black"
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <Database size={18} /> 
                {productExists === true ? "Update Product" : 
                 productExists === false ? "Create New Entry" : 
                 "Update Store Database"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Activity / Status Section */}
      <div className="space-y-8">
        <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm">
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[4px] mb-8 italic">System Status</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <TrendingUp size={24} className="text-green-500 mb-4" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Database Sync</p>
              <h5 className="text-xl font-black text-black italic">Connected</h5>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <AlertCircle size={24} className="text-primary mb-4" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Low Stock Alert</p>
              <h5 className="text-xl font-black text-black italic">12 Items</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;

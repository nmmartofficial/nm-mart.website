import { ScanBarcode, FileUp, Loader2, Database, TrendingUp, AlertCircle, Camera, Upload, Image as ImageIcon, X } from "lucide-react";
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
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  imageInputRef: React.RefObject<HTMLInputElement>;
  startScanner: () => void;
  stopScanner: () => void;
}

const InventoryTab = ({
  barcode, setBarcode, productName, setProductName, mrp, setMrp,
  salePrice, setSalePrice, category, setCategory, subCategory, setSubCategory,
  brand, setBrand, stockQuantity, setStockQuantity,
  imageUrl, setImageUrl, isScanning, setIsScanning, loading, isImporting,
  fetchingProduct, productExists, discount, handleFileUpload, handleInventorySubmit, fetchProductDetails,
  barcodeInputRef, fileInputRef, handleImageUpload, uploading, imageInputRef, startScanner, stopScanner
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
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {isImporting ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
              <span className="hidden sm:inline">Import Excel</span>
            </button>
            <button 
              type="button"
              onClick={() => isScanning ? stopScanner() : startScanner()}
              className={`p-3 rounded-2xl transition-all shadow-sm ${isScanning ? "bg-red-500 text-white" : "bg-primary text-white hover:bg-black"}`}
            >
              {isScanning ? <X size={20} /> : <ScanBarcode size={20} />}
            </button>
          </div>
        </div>

        {isScanning && (
          <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-primary">
            <div id="reader" className="w-full h-full"></div>
            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary rounded-3xl animate-pulse"></div>
            </div>
            <button 
              type="button"
              onClick={stopScanner}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
            >
              Cancel Scan
            </button>
          </div>
        )}

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

          {/* Quick Photo Upload Section */}
          {barcode && (
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase italic text-primary flex items-center gap-2">
                  <Camera size={14} /> Quick Product Photo
                </h4>
                {uploading && <Loader2 className="animate-spin text-primary" size={16} />}
              </div>
              
              <div className="flex gap-3">
                <input 
                  type="file" 
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 bg-white border-2 border-primary/20 text-primary py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Camera size={18} /> Take Photo
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (imageInputRef.current) {
                      imageInputRef.current.removeAttribute('capture');
                      imageInputRef.current.click();
                    }
                  }}
                  disabled={uploading}
                  className="flex-1 bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
                >
                  <Upload size={18} /> Gallery
                </button>
              </div>
              <p className="text-[8px] font-bold text-gray-400 uppercase text-center italic">Photo will be saved as {barcode}.jpg</p>
            </div>
          )}

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
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Image URL (Auto-filled on upload)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://..."
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-xs"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <button 
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              )}
            </div>
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
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <Database size={24} /> 
                {productExists === true ? "Update Product" : 
                 productExists === false ? "Create New Entry" : 
                 "Update Store Database"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="space-y-8">
        <div className="bg-[#0f172a] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <TrendingUp size={24} />
            </div>
            Live Preview
          </h3>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-full aspect-square bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center overflow-hidden relative group">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <ImageIcon size={64} className="opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 italic">No Image Uploaded</p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={48} />
                </div>
              )}
            </div>

            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between">
                <span className="bg-primary/20 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-wider">
                  {category || "Category"}
                </span>
                <span className="text-green-500 text-[10px] font-black uppercase italic flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  In Stock: {stockQuantity || 0}
                </span>
              </div>
              
              <h4 className="text-2xl font-black uppercase italic tracking-tight truncate w-full">
                {productName || "Product Name"}
              </h4>
              
              <div className="flex items-center justify-center gap-4">
                <div className="text-3xl font-black text-primary italic">₹{salePrice || "0"}</div>
                {mrp && Number(mrp) > Number(salePrice) && (
                  <div className="text-lg text-gray-500 line-through font-bold">₹{mrp}</div>
                )}
              </div>

              {discount !== "0" && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[4px] italic">
                  Save {discount}% Today
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
          <AlertCircle className="text-amber-500 shrink-0" size={24} />
          <div className="space-y-1">
            <h5 className="font-black uppercase italic text-xs text-amber-900">Pro Tip</h5>
            <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
              Use your mobile camera to scan barcodes and take instant photos. Photos are automatically optimized and linked to the barcode for a seamless catalog update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;

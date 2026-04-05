import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  ScanBarcode, LogOut, Database, Package, Star, BarChart3, 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

// Shared Components
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

// Admin Components
import AdminLogin from "@/components/admin/AdminLogin";
import InventoryTab from "@/components/admin/InventoryTab";
import WelfareTab from "@/components/admin/WelfareTab";
import OrdersTab from "@/components/admin/OrdersTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";

const SLOGAN = "Shop More, Save More"; // v5.0.3

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("nm_admin_session") === "true";
  });
  const [activeTab, setActiveTab] = useState<'inventory' | 'welfare' | 'orders' | 'analytics'>('inventory');
  const [password, setPassword] = useState("");
  
  // Inventory States
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [mrp, setMrp] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [productExists, setProductExists] = useState<boolean | null>(null);
  const [discount, setDiscount] = useState("0");

  // Auto-calculate discount when MRP or Sale Price changes
  useEffect(() => {
    const m = Number(mrp);
    const s = Number(salePrice);
    if (m > 0 && s > 0) {
      const d = Math.round(((m - s) / m) * 100);
      setDiscount(String(Math.max(0, d)));
    } else {
      setDiscount("0");
    }
  }, [mrp, salePrice]);

  // Welfare States
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [welfareLoading, setWelfareLoading] = useState(false);

  // Orders States
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [totalInventory, setTotalInventory] = useState(0);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchTotalCount = async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setTotalInventory(count);
      }
    };
    
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('ItemGroupName')
        .not('ItemGroupName', 'is', null);
      
      if (!error && data) {
        const unique = Array.from(new Set(data.map(d => d.ItemGroupName))).sort();
        setAllCategories(unique as string[]);
      }
    };

    if (isAuthenticated) {
      fetchTotalCount();
      fetchCategories();
    }
  }, [isAuthenticated]);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScanner = () => {
    if (scannerRef.current) return;
    
    setIsScanning(true);
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      html5QrCode.start(
        { facingMode: "environment" },
        { 
          fps: 60, 
          qrbox: (viewfinderWidth, vh) => {
            const minEdge = Math.min(viewfinderWidth, vh);
            const size = Math.floor(minEdge * 0.8);
            return { width: size, height: size / 2 }; // Rectangular for barcodes
          },
          aspectRatio: 1.0,
          disableFlip: true,
          rememberLastUsedCamera: true
        },
        (decodedText) => {
          setBarcode(decodedText);
          fetchProductDetails(decodedText);
          stopScanner();
        },
        () => {}
      ).catch(err => {
        console.error("Scanner error:", err);
        toast.error("Camera access denied");
        setIsScanning(false);
      });
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  const ADMIN_PASS = "NMMART2026";

  // Auto-focus barcode input
  useEffect(() => {
    if (isAuthenticated && activeTab === 'inventory' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isAuthenticated, activeTab]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("You must be logged in as an admin to import products.");
        }

        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error("The file is empty");
          setIsImporting(false);
          return;
        }

        const productsToInsert = jsonData.map((row: any) => ({
          barcode: String(row.Barcode || row.barcode || row.barcode || row.ID || ""),
          name: row.Name || row.name || row.Product || row.product_name || "",
          mrp: Number(row.MRP || row.mrp || row.Price || 0),
          salerate: Number(row.SalePrice || row.sale_price || row.SaleRate || row.saleRate || row.Price || row.salerate || 0),
          category: row.Category || row.category || "General",
          sub_category: row.SubCategory || row.subCategory || row.sub_category || "",
          brand: row.Brand || row.brand || "Local",
          image_url: row.Image || row.imageUrl || row.image || row.image_url || "",
          stock_quantity: Number(row.Stock || row.stock || row.stock_quantity || 0),
          updated_at: new Date().toISOString()
        })).filter(p => p.barcode && p.name);

        if (productsToInsert.length === 0) {
          toast.error("No valid products found in file (Need Barcode and Name)");
          setIsImporting(false);
          return;
        }

        const { error } = await supabase
          .from('products')
          .upsert(productsToInsert, { onConflict: 'barcode' });

        if (error) {
          console.error("Bulk Upsert Error Details:", error);
          throw new Error(`[${error.code}] ${error.message || "Bulk database update failed"}`);
        }

        toast.success(`Successfully imported ${productsToInsert.length} products!`);
      } catch (err: any) {
        console.error("Import error:", err);
        toast.error(err.message || "Import failed");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Order ${status}`);
      fetchOrders();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
      localStorage.setItem("nm_admin_session", "true");
      toast.success("Welcome back, Admin!");
    } else {
      toast.error("Invalid Admin PIN");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("nm_admin_session");
    toast.info("Logged out from NM Mart Dashboard");
    
    // Show Tawk.to again on logout
    if ((window as any).Tawk_API && (window as any).Tawk_API.showWidget) {
      (window as any).Tawk_API.showWidget();
    }
  };

  useEffect(() => {
    // Hide Tawk.to if authenticated, show if not
    if ((window as any).Tawk_API) {
      if (isAuthenticated) {
        if ((window as any).Tawk_API.hideWidget) (window as any).Tawk_API.hideWidget();
      } else {
        if ((window as any).Tawk_API.showWidget) (window as any).Tawk_API.showWidget();
      }
    }
  }, [isAuthenticated]);

  const fetchProductDetails = async (code: string) => {
    if (!code) {
      setProductExists(null);
      return;
    }
    setFetchingProduct(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('RawCodeNew', code)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProductName(data.RawName || data.name || "Unknown Product");
        setMrp(String(data.MRP || data.mrp || ""));
        setSalePrice(String(data.Rate || data.salerate || ""));
        setCategory(data.ItemGroupName || data.category || "");
        setSubCategory(data.sub_category || "");
        setBrand(data.brand || "");
        setStockQuantity(String(data.OpStock || data.stock_quantity || data.stock || ""));
        setImageUrl(data.image_url || "");
        setProductExists(true);
        if (navigator.vibrate) navigator.vibrate(100);
        toast.success(`Found: ${data.RawName || data.name}`);
      } else {
        setProductName(""); setMrp(""); setSalePrice(""); 
        setCategory(""); setSubCategory(""); setBrand(""); setStockQuantity(""); setImageUrl("");
        setProductExists(false);
        toast.info("New Product Detected");
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barcode) {
      if (!barcode) toast.error("Please scan/enter barcode first!");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${barcode}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('nm-mart-assets')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('nm-mart-assets')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !productName || !salePrice) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in as an admin to update inventory.");
      }

      const { error } = await supabase
        .from('products')
        .upsert({
          RawCodeNew: barcode,
          RawName: productName,
          MRP: Number(mrp),
          Rate: Number(salePrice),
          discountPerc: Number(discount),
          ItemGroupName: category,
          OpStock: Number(stockQuantity || 0),
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'RawCodeNew' });

      if (error) {
        console.error("Supabase Error Details:", error);
        throw new Error(`[${error.code}] ${error.message || "Database rejected the update"}`);
      }

      toast.success(productExists ? "Product updated successfully!" : "New product created successfully!");
      setBarcode(""); setProductName(""); setMrp(""); setSalePrice("");
      setCategory(""); setSubCategory(""); setBrand(""); setStockQuantity(""); setImageUrl("");
      setProductExists(null);
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    } catch (err: any) {
      console.error("Error updating inventory:", err);
      toast.error(err.message || "Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSearch = async () => {
    if (!customerSearch) return;
    setWelfareLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`mobile.eq.${customerSearch},full_name.ilike.%${customerSearch}%`)
        .maybeSingle();

      if (error) throw error;
      setCustomerData(data);
      if (!data) toast.error("Customer not found");
    } catch (err: any) {
      toast.error("Error searching customer");
    } finally {
      setWelfareLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!customerData || !pointsToAdd) return;
    setWelfareLoading(true);
    try {
      const currentPoints = customerData.loyalty_points || customerData.points_balance || 0;
      const newPoints = currentPoints + Number(pointsToAdd);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          loyalty_points: newPoints,
          points_balance: newPoints // Sync both fields just in case
        })
        .eq('id', customerData.id);

      if (error) throw error;
      setCustomerData({ ...customerData, loyalty_points: newPoints, points_balance: newPoints });
      setPointsToAdd("");
      toast.success(`Added ${pointsToAdd} points!`);
    } catch (err: any) {
      toast.error("Failed to update points");
    } finally {
      setWelfareLoading(false);
    }
  };

  const handleToggleWelfare = async () => {
    if (!customerData) return;
    setWelfareLoading(true);
    try {
      const newStatus = customerData.welfare_status === 'active' ? 'inactive' : 'active';
      
      const updateData: any = { welfare_status: newStatus };
      
      // If activating and they don't have a card number, generate one
      if (newStatus === 'active' && !customerData.welfare_card_number) {
        updateData.welfare_card_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', customerData.id);

      if (error) throw error;
      
      setCustomerData({ ...customerData, ...updateData });
      toast.success(newStatus === 'active' ? "Welfare Membership Activated!" : "Membership Deactivated");
    } catch (err: any) {
      toast.error("Failed to update membership status");
    } finally {
      setWelfareLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin password={password} setPassword={setPassword} handleLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black font-sans flex flex-col">
      <Header />
      
      {/* Admin Dashboard Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <Database size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                Admin <span className="text-primary">Panel</span>
              </h1>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mt-1 italic">Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {[
              { id: 'inventory', label: 'Inventory', icon: ScanBarcode },
              { id: 'welfare', label: 'Welfare', icon: Star },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-400 hover:text-black"
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-50 text-gray-500 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-gray-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Inventory Counter */}
        {activeTab === 'inventory' && (
          <div className="mb-8 flex items-center justify-between bg-primary/5 border border-primary/10 rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Package size={24} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] italic">Live Inventory</h4>
                <p className="text-2xl font-black italic uppercase text-black">
                  Total Inventory: <span className="text-primary">{totalInventory.toLocaleString()} Items</span>
                </p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase text-primary italic tracking-widest">Database Synced</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">v5.0.3 Live</p>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryTab 
                barcode={barcode} setBarcode={setBarcode}
                productName={productName} setProductName={setProductName}
                mrp={mrp} setMrp={setMrp}
                salePrice={salePrice} setSalePrice={setSalePrice}
                category={category} setCategory={setCategory}
                subCategory={subCategory} setSubCategory={setSubCategory}
                brand={brand} setBrand={setBrand}
                stockQuantity={stockQuantity} setStockQuantity={setStockQuantity}
                imageUrl={imageUrl} setImageUrl={setImageUrl}
                isScanning={isScanning} setIsScanning={setIsScanning}
                loading={loading} isImporting={isImporting}
                fetchingProduct={fetchingProduct} productExists={productExists}
                discount={discount} handleFileUpload={handleFileUpload}
                handleInventorySubmit={handleInventorySubmit}
                fetchProductDetails={fetchProductDetails}
                barcodeInputRef={barcodeInputRef} fileInputRef={fileInputRef}
                handleImageUpload={handleImageUpload}
                uploading={uploading}
                imageInputRef={imageInputRef}
                startScanner={startScanner}
                stopScanner={stopScanner}
                allCategories={allCategories}
              />
        )}

        {activeTab === 'welfare' && (
          <WelfareTab 
            customerSearch={customerSearch} setCustomerSearch={setCustomerSearch}
            customerData={customerData}
            pointsToAdd={pointsToAdd} setPointsToAdd={setPointsToAdd}
            welfareLoading={welfareLoading}
            handleCustomerSearch={handleCustomerSearch}
            handleAddPoints={handleAddPoints}
            handleToggleWelfare={handleToggleWelfare}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders}
            ordersLoading={ordersLoading}
            fetchOrders={fetchOrders}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Admin;

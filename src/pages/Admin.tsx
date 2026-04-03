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
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  // Welfare States
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [welfareLoading, setWelfareLoading] = useState(false);

  // Orders States
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          barcode: String(row.Barcode || row.barcode || row.ID || ""),
          product_name: row.Name || row.name || row.Product || row.product_name || "",
          mrp: Number(row.MRP || row.mrp || row.Price || 0),
          sale_price: Number(row.SalePrice || row.sale_price || row.SaleRate || row.saleRate || row.Price || 0),
          category: row.Category || row.category || "General",
          sub_category: row.SubCategory || row.subCategory || row.sub_category || "",
          brand: row.Brand || row.brand || "Local",
          image_url: row.Image || row.imageUrl || row.image || row.image_url || "",
          stock_quantity: Number(row.Stock || row.stock || row.stock_quantity || 0),
          updated_at: new Date().toISOString()
        })).filter(p => p.barcode && p.product_name);

        if (productsToInsert.length === 0) {
          toast.error("No valid products found in file (Need Barcode and Name)");
          setIsImporting(false);
          return;
        }

        const { error } = await supabase
          .from('inventory')
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
  };

  const fetchProductDetails = async (code: string) => {
    if (!code) return;
    setFetchingProduct(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('barcode', code)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProductName(data.product_name || data.name);
        setMrp(data.mrp || "");
        setSalePrice(data.sale_price || data.saleRate || "");
        setCategory(data.category || "");
        setSubCategory(data.sub_category || data.subCategory || "");
        setBrand(data.brand || "");
        setStockQuantity(String(data.stock_quantity || ""));
        setImageUrl(data.image_url || data.imageUrl || "");
        if (navigator.vibrate) navigator.vibrate(100);
        toast.success(`Found: ${data.product_name || data.name}`);
      } else {
        setProductName(""); setMrp(""); setSalePrice(""); 
        setCategory(""); setSubCategory(""); setBrand(""); setStockQuantity(""); setImageUrl("");
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
    } finally {
      setFetchingProduct(false);
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
        .from('inventory')
        .upsert({
          barcode,
          product_name: productName,
          mrp: Number(mrp),
          sale_price: Number(salePrice),
          category,
          sub_category: subCategory,
          brand,
          stock_quantity: Number(stockQuantity || 0),
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'barcode' });

      if (error) {
        console.error("Supabase Error Details:", error);
        throw new Error(`[${error.code}] ${error.message || "Database rejected the update"}`);
      }

      toast.success("Inventory updated successfully!");
      setBarcode(""); setProductName(""); setMrp(""); setSalePrice("");
      setCategory(""); setSubCategory(""); setBrand(""); setStockQuantity(""); setImageUrl("");
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
      const newPoints = (customerData.loyalty_points || 0) + Number(pointsToAdd);
      const { error } = await supabase
        .from('profiles')
        .update({ loyalty_points: newPoints })
        .eq('id', customerData.id);

      if (error) throw error;
      setCustomerData({ ...customerData, loyalty_points: newPoints });
      setPointsToAdd("");
      toast.success(`Added ${pointsToAdd} points!`);
    } catch (err: any) {
      toast.error("Failed to update points");
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
            fetchingProduct={fetchingProduct}
            handleFileUpload={handleFileUpload}
            handleInventorySubmit={handleInventorySubmit}
            fetchProductDetails={fetchProductDetails}
            barcodeInputRef={barcodeInputRef}
            fileInputRef={fileInputRef}
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

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { lazy, Suspense, type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/adminAccess";

// Pages
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import UserProfile from "@/pages/UserProfile";
import OrderTracker from "@/pages/OrderTracker";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import ResetPassword from "@/pages/ResetPassword";
import ShopPage from "@/pages/ShopPage";
import CartPage from "@/pages/CartPage";
import Orders from "@/pages/Orders";
import OrderDetails from "@/pages/OrderDetails";
import OrderConfirmation from "@/pages/OrderConfirmation";
import NotFound from "@/pages/NotFound";
import Delivery from "@/pages/Delivery";
const Admin = lazy(() => import("@/pages/Admin"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCustomize = lazy(() => import("@/pages/admin/Customize"));
import { CartProvider } from "@/hooks/useCart";

function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let mounted = true;

    const updateAccess = (email?: string | null) => {
      if (!mounted) return;
      setStatus(isAdminEmail(email) ? "allowed" : "denied");
    };

    supabase.auth.getSession().then(({ data }) => updateAccess(data.session?.user?.email));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAccess(session?.user?.email);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        Checking admin access...
      </div>
    );
  }

  if (status === "denied") {
    const nextPath = location.pathname.startsWith("/admin") ? location.pathname : "/admin";
    return <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
        <Toaster position="top-center" expand={false} richColors />
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-500">Loading NM Mart...</div>}>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/tracker" element={<OrderTracker />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
          <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/customize" element={<AdminGuard><AdminCustomize /></AdminGuard>} />
          <Route path="*" element={<NotFound />} />

        </Routes>
        </Suspense>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;

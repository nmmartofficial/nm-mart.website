import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { useEffect, useState } from "react";
import { initializeDefaultConfig } from "@/lib/storeConfig";
import { supabase } from "@/lib/supabase/client";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import UserProfile from "@/pages/UserProfile";
import OrderTracker from "@/pages/OrderTracker";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import ResetPassword from "@/pages/ResetPassword";

// Admin Pages
import Admin from "@/pages/Admin";
import Customize from "@/pages/admin/Customize";
import Dashboard from "@/pages/admin/Dashboard";
import DeliveryDashboard from "@/pages/Delivery";

const ADMIN_EMAIL = "nmmart07@gmail.com";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      const isAdmin = data.session?.user?.email?.toLowerCase() === ADMIN_EMAIL;
      if (mounted) {
        setAllowed(Boolean(isAdmin));
        setLoading(false);
      }
    };

    checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;
      setAllowed(Boolean(isAdmin));
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return allowed ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  useEffect(() => {
    initializeDefaultConfig();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-center" expand={false} richColors />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/tracker" element={<OrderTracker />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/customize" element={<AdminRoute><Customize /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/delivery" element={<AdminRoute><DeliveryDashboard /></AdminRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

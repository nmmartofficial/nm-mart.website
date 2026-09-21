import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { lazy, Suspense, type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isActiveAdminUser } from "@/lib/adminAccess";

// Pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const Login = lazy(() => import("@/pages/Login"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Settings = lazy(() => import("@/pages/Settings"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const OrderTracker = lazy(() => import("@/pages/OrderTracker"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const Categories = lazy(() => import("@/pages/Categories"));
const Addresses = lazy(() => import("@/pages/Addresses"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const Coupons = lazy(() => import("@/pages/Coupons"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Delivery = lazy(() => import("@/pages/Delivery"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCustomize = lazy(() => import("@/pages/admin/Customize"));
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import AnnouncementTicker from "@/components/site/AnnouncementTicker";
import BottomNavigation from "@/components/shop/BottomNavigation";
import WhatsAppButton from "@/components/shop/WhatsAppButton";

function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let mounted = true;

    const updateAccess = async (authUserId?: string | null) => {
      if (!mounted) return;
      const allowed = await isActiveAdminUser(supabase, authUserId ?? null);
      setStatus(allowed ? "allowed" : "denied");
    };

    supabase.auth.getSession().then(({ data }) => updateAccess(data.session?.user?.id));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAccess(session?.user?.id);
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

function CustomerAuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let mounted = true;
    const timeout = window.setTimeout(() => {
      if (mounted) setStatus("denied");
    }, 5000);
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        window.clearTimeout(timeout);
        setStatus(data.session ? "allowed" : "denied");
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && !session) setStatus("denied");
    });
    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, [location.hash, location.pathname, location.search]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Checking your session...</div>;
  }

  if (status === "denied") {
    const destination = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?next=${encodeURIComponent(destination)}`} replace />;
  }

  return <>{children}</>;
}

function CustomerScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    return () => {
      sessionStorage.setItem(`nm-scroll:${location.key}`, String(window.scrollY));
    };
  }, [location.key]);

  useEffect(() => {
    const savedPosition = navigationType === "POP" ? Number(sessionStorage.getItem(`nm-scroll:${location.key}`) || 0) : 0;
    requestAnimationFrame(() => window.scrollTo(0, savedPosition));
  }, [location.key, navigationType]);

  return null;
}

function CustomerNavigation() {
  const { pathname } = useLocation();
  const isPrivateChromeHidden = pathname === "/login" || pathname === "/reset-password" || pathname.startsWith("/admin");

  if (isPrivateChromeHidden) return null;

  return <><BottomNavigation /><WhatsAppButton /></>;
}

function CustomerAnnouncement() {
  const { pathname } = useLocation();
  const isPrivateScreen = pathname === "/login" || pathname === "/reset-password" || pathname === "/profile" || pathname.startsWith("/admin");

  return isPrivateScreen ? null : <AnnouncementTicker />;
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CustomerScrollRestoration />
        <Toaster position="top-center" expand={false} richColors />
        <CustomerAnnouncement />
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-500">Loading NM Mart...</div>}>
          <div className="pb-safe-nav md:pb-0">
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/profile" element={<CustomerAuthGuard><UserProfile /></CustomerAuthGuard>} />
              <Route path="/wishlist" element={<CustomerAuthGuard><Wishlist /></CustomerAuthGuard>} />
              <Route path="/orders" element={<CustomerAuthGuard><Orders /></CustomerAuthGuard>} />
              <Route path="/orders/:orderId" element={<CustomerAuthGuard><OrderDetails /></CustomerAuthGuard>} />
              <Route path="/order-confirmation/:orderId" element={<CustomerAuthGuard><OrderConfirmation /></CustomerAuthGuard>} />
              <Route path="/tracker" element={<OrderTracker />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/addresses" element={<CustomerAuthGuard><Addresses /></CustomerAuthGuard>} />
              <Route path="/wallet" element={<CustomerAuthGuard><Wallet /></CustomerAuthGuard>} />
              <Route path="/coupons" element={<CustomerAuthGuard><Coupons /></CustomerAuthGuard>} />
              <Route path="/products" element={<ShopPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<CustomerAuthGuard><Checkout /></CustomerAuthGuard>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
              <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/customize" element={<AdminGuard><AdminCustomize /></AdminGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
        <CustomerNavigation />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;

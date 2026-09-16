import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { useEffect } from "react";
import { initializeDefaultConfig } from "@/lib/storeConfig";

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
import { CartProvider } from "@/hooks/useCart";

function App() {
  useEffect(() => {
    initializeDefaultConfig();
  }, []);

  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
        <Toaster position="top-center" expand={false} richColors />
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
          <Route path="*" element={<NotFound />} />

        </Routes>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;

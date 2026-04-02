import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

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

// Admin Pages
import Admin from "@/pages/admin/Admin";
import DeliveryDashboard from "@/pages/admin/Delivery";

function App() {
  return (
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

        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

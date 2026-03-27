import React, { useState } from 'react';
// पुराने सारे फोल्डर्स (Components) को यहाँ वापस बुला रहे हैं
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductList from "./components/ProductList"; // अगर नाम अलग है तो चेक करें
import Welfare from "./components/Welfare";
import Footer from "./components/Footer";

function App() {
  const [cartCount, setCartCount] = useState(0);

  // कार्ट में सामान जोड़ने का फंक्शन
  const addToCart = () => setCartCount(cartCount + 1);

  return (
    <div className="min-h-screen bg-[#f0f9ff]">
      {/* 1. आपका नया Sky Blue Navbar */}
      <Navbar cartCount={cartCount} />

      {/* 2. मुख्य बैनर (Hero Section) */}
      <Hero onAddToCart={addToCart} />

      {/* 3. आपके प्रोडक्ट्स (Product List) */}
      <div className="py-10">
        <ProductList onAddToCart={addToCart} />
      </div>

      {/* 4. आपका लॉगिन कार्ड (Welfare/Member Card) */}
      <Welfare />

      {/* 5. नीचे का हिस्सा (Footer) */}
      <Footer />
    </div>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// नीचे वाली लाइन में अपनी पुरानी फाइल का सही नाम लिखें (जैसे ProductSearch या Home)
import ProductSearch from "./ProductSearch"; 
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. ग्राहकों के लिए: nmmart.in पर पुरानी दुकान दिखेगी */}
        <Route path="/" element={<ProductSearch />} />
        
        {/* 2. आपके लिए: nmmart.in/admin पर स्कैनर खुलेगा */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
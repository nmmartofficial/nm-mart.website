import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // आपकी फोटो में Index.tsx दिख रही है, यही होम पेज है
import Admin from "./pages/Admin"; // जो आपने नई फाइल बनाई है

function App() {
  return (
    <Router>
      <Routes>
        {/* जब कोई nmmart.in खोलेगा, तो Index वाला पेज (दुकान) दिखेगी */}
        <Route path="/" element={<Index />} />

        {/* जब आप /admin लिखेंगे, तब स्कैनर वाला पेज खुलेगा */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
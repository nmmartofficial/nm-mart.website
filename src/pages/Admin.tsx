import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// आपका पुराना वाला Home पेज यहाँ Import होना चाहिए (जैसे नीचे है)
// import Home from "./pages/Home"; 

const App = () => {
  return (
    <Router>
      <Routes>
        {/* ग्राहक के लिए असली दुकान (Purana Data) */}
        <Route path="/" element={<Home />} /> 
        
        {/* आपके लिए एडमिन पैनल (Naya Scanner) */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

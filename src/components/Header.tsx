import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 gradient-navy shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shadow-gold">
            <ShoppingCart className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground font-display tracking-tight leading-none">NM Mart</h1>
            <p className="text-xs text-gold-light tracking-wide">Shop More, Save More</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {["Home", "Products", "Welfare Card", "Contact"].map((item) => (
            <a key={item} href={item === "Home" ? "/" : `#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden gradient-navy border-t border-primary/30 px-4 pb-4 space-y-2">
          {["Home", "Products", "Welfare Card", "Contact"].map((item) => (
            <a key={item} href={item === "Home" ? "/" : `#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="block py-2 text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors"
              onClick={() => setMobileOpen(false)}>
              {item}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;

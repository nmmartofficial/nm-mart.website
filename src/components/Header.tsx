import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const el = document.getElementById("products");
      el?.scrollIntoView({ behavior: "smooth" });
      // Dispatch custom event for product filtering
      window.dispatchEvent(new CustomEvent("nm-search", { detail: searchQuery.trim() }));
    }
  };

  return (
    <header className="sticky top-0 z-50 gradient-navy shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shadow-gold">
            <ShoppingCart className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground font-display tracking-tight leading-none">NM Mart</h1>
            <p className="text-xs text-gold-light tracking-wide">Shop More, Save More</p>
          </div>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 rounded-full bg-primary-foreground/10 text-sm text-primary-foreground placeholder:text-primary-foreground/40 border border-primary-foreground/10 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {["Home", "Products", "Welfare Card", "Contact"].map((item) => (
            <a key={item} href={item === "Home" ? "/" : `#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button className="text-primary-foreground p-1" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="w-5 h-5" />
          </button>
          <button className="text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-primary-foreground/10 text-sm text-primary-foreground placeholder:text-primary-foreground/40 border border-primary-foreground/10 focus:outline-none focus:border-gold/50"
            />
          </div>
        </form>
      )}

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

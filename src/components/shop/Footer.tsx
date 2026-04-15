import { ShoppingCart, MapPin, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";

const SLOGAN = "Shop More, Save More";

const Footer = () => {
  const { theme } = useTheme();

  const renderStoreName = () => {
    const name = theme.storeName || "NM MART";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (
        <>
          {parts[0]} <span className="text-primary">{parts.slice(1).join(" ")}</span>
        </>
      );
    }
    return <span className="text-primary">{name}</span>;
  };

  return (
    <footer id="contact" className="bg-[#f8f9fa] text-black border-t border-gray-100 font-sans">
      <div className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                {theme.storeLogo ? (
                  <img src={theme.storeLogo} alt="Logo" className="w-7 h-7 object-contain" />
                ) : (
                  <ShoppingCart className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter uppercase italic text-black leading-none">
                  {renderStoreName()}
                </span>
                <span className="text-[8px] font-black text-black uppercase tracking-[3px] mt-1">{SLOGAN}</span>
              </div>
            </Link>
            <p className="text-[11px] text-black font-medium leading-relaxed uppercase tracking-widest italic">
              The leading modern departmental store in Manjhanpur, providing premium quality at affordable prices.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="font-black text-primary mb-6 text-[10px] tracking-[4px] uppercase italic flex items-center gap-2">
              <div className="w-4 h-[1px] bg-primary/30"></div> Explore
            </h4>
            <div className="flex flex-col gap-4">
              {[
                { to: '/about', label: `About ${theme.storeName || 'NM Mart'}` },
                { to: '/contact', label: 'Contact Support' },
                { to: '/tracker', label: 'Track Your Order' },
                { to: '/privacy', label: 'Privacy Policy' }
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-[11px] font-medium text-black hover:text-primary transition-all hover:translate-x-2 flex items-center gap-3 uppercase tracking-widest">
                  <span className="w-1 h-1 bg-black rounded-full"></span> {link.label}
                </Link>
              ))}
              
              <Link to="/admin" className="mt-4 text-[9px] text-primary font-black uppercase tracking-[3px] border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all text-center w-fit italic">
                Admin Panel
              </Link>
            </div>
          </div>

          {/* Contact - मंझनपुर डिटेल्स */}
          <div>
            <h4 className="font-black text-primary mb-6 text-[10px] tracking-[4px] uppercase italic flex items-center gap-2">
              <div className="w-4 h-[1px] bg-primary/30"></div> Contact
            </h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4 group">
                <div className="bg-white p-2 rounded-lg group-hover:bg-primary/10 transition-colors shadow-sm border border-gray-100">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                </div>
                <span className="text-[11px] text-black font-medium uppercase tracking-wider leading-relaxed">
                  Naya Nagar, Dhata Road,<br />Manjhanpur, Kaushambi, UP
                </span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="bg-white p-2 rounded-lg group-hover:bg-primary/10 transition-colors shadow-sm border border-gray-100">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                </div>
                <span className="text-[11px] text-black font-medium uppercase tracking-wider">support@nmmart.in</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="bg-white p-2 rounded-lg group-hover:bg-primary/10 transition-colors shadow-sm border border-gray-100">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                </div>
                <span className="text-[11px] text-black font-medium uppercase tracking-wider italic">Daily 09 AM – 09 PM</span>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div>
            <h4 className="font-black text-primary mb-6 text-[10px] tracking-[4px] uppercase italic flex items-center gap-2">
              <div className="w-4 h-[1px] bg-primary/30"></div> Promise
            </h4>
            <p className="text-[11px] text-black leading-relaxed font-medium uppercase tracking-wider italic">
              "Your trusted local partner for quality & savings. 100% purity and freshness guaranteed in every item."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar with New Branding */}
      <div className="border-t border-gray-100 py-8 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] font-black text-black uppercase tracking-[2px] italic">
            © 2026 {theme.storeName?.toUpperCase() || 'NM MART'} | Powered by {theme.storeName || 'NM Mart'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

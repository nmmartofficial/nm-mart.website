import { ShoppingCart, MapPin, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer id="contact" className="bg-navy text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="font-bold font-display text-lg">NM Mart</span>
          </div>
          <p className="text-sm text-primary-foreground/60 leading-relaxed">
            Your trusted neighbourhood store for quality daily essentials and premium home textiles.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gold mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
          <div className="space-y-2">
            <Link to="/about" className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors">About Us</Link>
            <Link to="/contact" className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors">Contact Us</Link>
            <Link to="/privacy" className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors">Privacy Policy</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-gold mb-4 text-sm tracking-wide uppercase">Contact</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span className="text-sm text-primary-foreground/60">Manjhanpur, Kaushambi, UP - 212207</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <span className="text-sm text-primary-foreground/60">support@nmmart.in</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold shrink-0" />
              <span className="text-sm text-primary-foreground/60">Daily 8 AM – 10 PM</span>
            </div>
          </div>
        </div>

        {/* Store Hours */}
        <div>
          <h4 className="font-semibold text-gold mb-4 text-sm tracking-wide uppercase">Store Info</h4>
          <p className="text-sm text-primary-foreground/60">We serve Manjhanpur and nearby areas with free local delivery on orders above ₹500.</p>
        </div>
      </div>
    </div>

    <div className="border-t border-primary-foreground/10 py-4">
      <p className="text-center text-xs text-primary-foreground/40">
        Powered by NM MART – RETAIL OS v5.0 &nbsp;|&nbsp; NM Mart – Manjhanpur, Kaushambi, UP – 212207 &nbsp;|&nbsp; © {new Date().getFullYear()} NM Mart. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;

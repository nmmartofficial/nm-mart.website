import { ShoppingCart, MapPin, Mail, Clock, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer id="contact" className="bg-black text-white border-t border-white/5">
    <div className="container mx-auto px-4 py-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF8C00] flex items-center justify-center shadow-[0_0_15px_rgba(255,140,0,0.3)]">
              <ShoppingCart className="w-5 h-5 text-black font-bold" />
            </div>
            <span className="font-black font-display text-xl tracking-tighter uppercase italic">NM Mart</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed uppercase font-bold tracking-wider">
            Your trusted neighbourhood store for quality daily essentials and premium home textiles.
          </p>
        </div>

        {/* Quick Links Section */}
<div>
  <h4 className="font-black text-[#FF8C00] mb-4 text-[11px] tracking-[3px] uppercase italic">Quick Links</h4>
  <div className="flex flex-col gap-3">
    
    {/* About Us Link */}
    <Link to="/about" className="text-[13px] text-gray-400 hover:text-white transition-all hover:translate-x-1 flex items-center gap-2">
      <span className="w-1 h-1 bg-[#FF8C00] rounded-full"></span> About Us
    </Link>
    
    {/* Contact Us Link */}
    <Link to="/contact" className="text-[13px] text-gray-400 hover:text-white transition-all hover:translate-x-1 flex items-center gap-2">
      <span className="w-1 h-1 bg-[#FF8C00] rounded-full"></span> Contact Us
    </Link>
    
    {/* Privacy Policy Link */}
    <Link to="/privacy" className="text-[13px] text-gray-400 hover:text-white transition-all hover:translate-x-1 flex items-center gap-2">
      <span className="w-1 h-1 bg-[#FF8C00] rounded-full"></span> Privacy Policy
    </Link>

    {/* Admin Link (Special Look) */}
    <Link to="/admin" className="mt-2 text-[11px] text-[#FF8C00] font-black uppercase tracking-widest border border-[#FF8C00]/20 px-3 py-1 rounded-lg hover:bg-[#FF8C00] hover:text-black transition-all text-center w-fit">
      Admin Panel
    </Link>

  </div>
</div>
        {/* Contact - मंझनपुर डिटेल्स */}
        <div>
          <h4 className="font-black text-[#FF8C00] mb-5 text-[11px] tracking-[3px] uppercase italic">Contact</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#FF8C00] shrink-0" />
              <span className="text-[12px] text-gray-400 font-medium leading-snug">Manjhanpur, Kaushambi, UP - 212207</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#FF8C00] shrink-0" />
              <span className="text-[12px] text-gray-400 font-medium">support@nmmart.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#FF8C00] shrink-0" />
              <span className="text-[12px] text-gray-400 font-medium">Daily 8 AM – 10 PM</span>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div>
          <h4 className="font-black text-[#FF8C00] mb-5 text-[11px] tracking-[3px] uppercase italic">Store Info</h4>
          <p className="text-[12px] text-gray-400 leading-relaxed font-medium">
            We serve Manjhanpur and nearby areas with free local delivery on orders above ₹500. Quality you can trust!
          </p>
        </div>
      </div>
    </div>

    {/* Bottom Bar with RETAIL OS Branding */}
    <div className="border-t border-white/5 py-6 bg-[#050505]">
      <div className="container mx-auto px-4">
        <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-[2px] space-y-2 md:space-y-0 md:space-x-4">
          <span className="text-[#FF8C00]">Powered by NM MART – RETAIL OS v5.0</span>
          <span className="hidden md:inline">|</span>
          <span>NM Mart – Manjhanpur, Kaushambi, UP – 212207</span>
          <span className="hidden md:inline">|</span>
          <span>© {new Date().getFullYear()} NM Mart. All rights reserved.</span>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

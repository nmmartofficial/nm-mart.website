import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Package, MapPin, LogOut, Star } from "lucide-react";

const UserProfile = () => {
  // यहाँ बाद में हम Google Login या Mobile Login जोड़ेंगे
  const userData = {
    name: "अब्दुल भाई (Customer)",
    phone: "7081154604",
    address: "Manjhanpur, Kaushambi",
    points: 450
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        {/* Profile Header */}
        <div className="bg-[#1a1a1a] rounded-[40px] p-8 border border-white/5 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-[#FF8C00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,140,0,0.4)]">
            <User size={48} className="text-black" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">{userData.name}</h2>
            <p className="text-gray-500 font-bold text-sm uppercase">{userData.phone}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
            <p className="text-[10px] uppercase font-black text-gray-500 mb-1">NM Loyalty Points</p>
            <div className="flex items-center gap-2 text-[#FF8C00] font-black text-2xl">
              <Star fill="#FF8C00" size={20} /> {userData.points}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Settings / Address Card */}
          <div className="bg-[#1a1a1a] rounded-[40px] p-8 border border-white/5">
            <h3 className="text-[#FF8C00] font-black uppercase italic text-sm mb-6 flex items-center gap-2">
              <MapPin size={18} /> My Address
            </h3>
            <p className="text-gray-300 font-medium mb-6">{userData.address}</p>
            <button className="w-full py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-[#FF8C00] hover:text-black transition-all">
              Edit Profile
            </button>
          </div>

          {/* Orders Quick View */}
          <div className="bg-[#1a1a1a] rounded-[40px] p-8 border border-white/5">
            <h3 className="text-[#FF8C00] font-black uppercase italic text-sm mb-6 flex items-center gap-2">
              <Package size={18} /> Recent Orders
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Order #1024</p>
                  <p className="text-xs font-black italic">Dry Fruits & Snacks</p>
                </div>
                <span className="text-green-500 font-black text-[10px] uppercase italic">Delivered</span>
              </div>
            </div>
            <button className="w-full mt-6 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:border-[#FF8C00]/50 transition-all">
              View All Orders
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full mt-12 py-5 bg-red-600/10 text-red-500 rounded-[30px] font-black uppercase text-[10px] tracking-[4px] border border-red-500/20 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3">
          <LogOut size={16} /> Logout from NM Mart
        </button>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;

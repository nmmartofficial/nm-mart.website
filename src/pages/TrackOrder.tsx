import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Truck, Search, Phone, Hash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TrackOrder = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [orderId, setOrderId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || !orderId) {
      toast.error("Please fill in all fields");
      return;
    }
    // In a real app, you would fetch order status from an API.
    // For now, we'll just show a professional toast.
    toast.info("Order status: Your order is being processed and will be updated soon.", {
      description: `Tracking for Order ID ending in ...${orderId}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-white font-sans">
      <Header />
      
      {/* Banner Section */}
      <div className="bg-[#D32F2F] py-10 px-4 relative overflow-hidden">
        {/* Abstract background pattern for professional look */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2">
              Track Your <span className="text-black">Order</span>
            </h1>
            <p className="text-white/80 font-bold uppercase tracking-[2px] text-[10px]">
              Real-time updates on your delivery status
            </p>
          </div>
          <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-md border border-white/30 animate-float">
            <Truck size={48} className="text-white" />
          </div>
        </div>
      </div>

      <main className="flex-1 py-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Tracking Card */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group hover:border-[#D32F2F]/30 transition-all duration-500">
            {/* Subtle glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D32F2F]/10 rounded-full blur-3xl group-hover:bg-[#D32F2F]/20 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#D32F2F] p-2.5 rounded-xl shadow-lg shadow-[#D32F2F]/20">
                  <Package size={20} className="text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">
                  Secure Order Tracking
                </h2>
              </div>

              <form onSubmit={handleTrack} className="space-y-6">
                {/* Mobile Number Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Enter Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Order ID Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Last 5 Digits of Order ID
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. 12345"
                      maxLength={5}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                </div>

                {/* Track Button */}
                <button
                  type="submit"
                  className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-black uppercase italic py-5 rounded-2xl shadow-[0_10px_30px_rgba(211,47,47,0.3)] hover:shadow-[0_15px_40px_rgba(211,47,47,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <Search size={20} />
                  Track Order
                </button>
              </form>

              {/* Help text */}
              <p className="mt-8 text-center text-gray-600 text-[10px] uppercase font-bold tracking-widest">
                Need help? <span className="text-[#D32F2F] cursor-pointer hover:underline">Contact Support</span>
              </p>
            </div>
          </div>

          {/* Additional info below the card */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 flex flex-col items-center text-center">
               <div className="bg-white/5 p-2 rounded-full mb-2">
                  <Truck size={16} className="text-gray-400" />
               </div>
               <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Fast Delivery</span>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-white/5 flex flex-col items-center text-center">
               <div className="bg-white/5 p-2 rounded-full mb-2">
                  <Package size={16} className="text-gray-400" />
               </div>
               <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Secure Packing</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;

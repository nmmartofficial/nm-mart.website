import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Phone, CreditCard, Banknote, QrCode, 
  Loader2, CheckCircle2, ShoppingBag, Truck, ShieldCheck, 
  ChevronRight, Building2, Landmark, Map as MapIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getActiveSession, getSupabaseErrorMessage, logSupabaseDebug } from "@/lib/supabase";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { motion, AnimatePresence } from "framer-motion";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    houseNo: "",
    street: "",
    landmark: "",
    pincode: "212207", // Default for Manjhanpur
    paymentMethod: "cod" as "cod" | "upi" | "card_at_home"
  });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionActive(Boolean(session));
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile to pre-fill phone and name
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, mobile')
          .eq('id', session.user.id)
          .single();
        if (profileError) {
          logSupabaseDebug("checkoutProfilePrefill:error", { userId: session.user.id }, profileError);
        }
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || "",
            phone: profile.mobile || session.user.phone?.replace("+91", "") || ""
          }));
        }
      }
    };
    fetchUserAndProfile();

    if (cart.length === 0 && !orderSuccess) {
      navigate("/");
    }
  }, [cart.length, navigate, orderSuccess]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionActive(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.houseNo || !formData.street) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const session = await getActiveSession();
      if (!session) {
        setSessionActive(false);
        toast.error("Please login again.");
        return;
      }
      const orderId = `NMM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const fullAddress = `${formData.houseNo}, ${formData.street}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.pincode}`;

      const { error } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_id: user?.id || null,
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          shipping_address: fullAddress,
          landmark: formData.landmark,
          pincode: formData.pincode,
          items: cart,
          total: cartTotal,
          payment_method: formData.paymentMethod,
          status: 'Pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setOrderSuccess(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err: any) {
      logSupabaseDebug("checkoutOrder:error", { userId: user?.id, total: cartTotal }, err);
      toast.error(getSupabaseErrorMessage(err, "Unable to place order"));
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white border border-gray-100 p-12 rounded-[50px] shadow-2xl text-center space-y-8"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg animate-bounce">
            <CheckCircle2 size={50} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black">Order <span className="text-primary">Success!</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic leading-relaxed">
              Your order has been placed and is being processed. We will contact you shortly for delivery.
            </p>
          </div>
          <div className="pt-4 space-y-4">
            <button 
              onClick={() => navigate("/")}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-sm italic text-sm"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => navigate("/tracker")}
              className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-white hover:text-black border border-transparent hover:border-gray-100 transition-all text-[10px] italic"
            >
              Track My Order
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-2">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-400 hover:text-primary font-black uppercase tracking-widest text-[10px] mb-4 group transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Cart
              </button>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black leading-none">
                Secure <span className="text-primary">Checkout</span>
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">
                Finalize your order for Manjhanpur delivery
              </p>
            </div>
            
            <div className="bg-white border border-gray-100 px-8 py-4 rounded-[30px] shadow-sm flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] leading-none mb-1">Total Amount</p>
                <p className="text-3xl font-black text-primary italic leading-none">₹{cartTotal}</p>
              </div>
              <div className="w-[1px] h-10 bg-gray-100"></div>
              <div className="p-2 bg-primary/5 rounded-xl text-primary">
                <ShoppingBag size={24} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
            {/* Left: Address Form */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[40px] shadow-sm space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase text-black">Delivery Details</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Full Name *</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="ENTER YOUR NAME"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Mobile Number *</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-DIGIT MOBILE"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">House No / Flat *</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        name="houseNo"
                        value={formData.houseNo}
                        onChange={handleInputChange}
                        placeholder="HOUSE/FLAT NO"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Street / Area *</label>
                    <div className="relative group">
                      <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="STREET NAME / COLONY"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Landmark (Optional)</label>
                    <div className="relative group">
                      <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="E.G. NEAR B.P. SCHOOL"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Pincode *</label>
                    <input 
                      type="text" 
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="PINCODE"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[40px] shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <CreditCard size={24} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase text-black">Payment Method</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { id: 'cod', label: 'Cash On Delivery', icon: Banknote, sub: 'Popular in Manjhanpur' },
                    { id: 'upi', label: 'Pay via UPI', icon: QrCode, sub: 'PhonePe / GPay' },
                    { id: 'card_at_home', label: 'Card at Home', icon: Truck, sub: 'Delivery Swipe Machine' },
                  ].map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id as any }))}
                      className={`cursor-pointer p-6 rounded-[30px] border-2 transition-all flex flex-col items-center text-center gap-4 ${
                        formData.paymentMethod === method.id 
                        ? "border-primary bg-primary/5 shadow-inner" 
                        : "border-gray-50 bg-gray-50/50 hover:border-primary/20"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        formData.paymentMethod === method.id ? "bg-primary text-white" : "bg-white text-gray-300"
                      }`}>
                        <method.icon size={24} />
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-wider ${
                          formData.paymentMethod === method.id ? "text-primary" : "text-gray-500"
                        }`}>{method.label}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic">{method.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary & Action */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden sticky top-28">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="text-xl font-black italic uppercase text-black">Order Summary</h3>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {cart.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <p className="text-[11px] font-black uppercase text-black italic line-clamp-1">{item.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Qty: {item.qty} × ₹{item.saleRate}</p>
                        </div>
                        <p className="text-sm font-black text-black italic">₹{item.saleRate * item.qty}</p>
                      </div>
                    ))}
                  </div>

                  <div className="h-[1px] bg-gray-100 my-6"></div>
                {!sessionActive && (
                  <div className="text-[10px] font-black uppercase tracking-wider text-red-500">
                    Please Login - order submit is disabled.
                  </div>
                )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-green-500 uppercase tracking-widest">
                      <span>Delivery</span>
                      <span className="italic">FREE</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-sm font-black uppercase tracking-[2px] text-black">To Pay</span>
                      <span className="text-3xl font-black text-primary italic">₹{cartTotal}</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || !sessionActive}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[2px] hover:bg-black transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 italic mt-8 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        Place Order <ChevronRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-6">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Secure NM Mart Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

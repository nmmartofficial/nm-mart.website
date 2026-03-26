import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Gift, HeadphonesIcon, Star, Calendar, CheckCircle } from "lucide-react";

const WelfareCard = () => {
  const [mobile, setMobile] = useState("");
  const [showStatus, setShowStatus] = useState(false);

  // लॉजिक: आज से 6 महीने बाद वाले महीने की आखिरी तारीख निकालना
  const getExpiryDate = () => {
    const d = new Date();
    // आज से 7 महीने आगे जाएँ और उसकी 0 तारीख चुनें (0 तारीख मतलब पिछले महीने की आखिरी तारीख)
    const futureDate = new Date(d.getFullYear(), d.getMonth() + 7, 0);
    
    return futureDate.toLocaleDateString('hi-IN', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  const formattedExpiry = getExpiryDate();

  return (
    <section id="welfare-card" className="py-16 gradient-navy relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground">
            NM Mart <span className="text-gold">Welfare Card</span>
          </h2>
          <p className="text-primary-foreground/60 mt-2">6 महीने की विशेष सदस्यता (Membership)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          {/* Card & Status Check */}
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              animate={{ rotateY: [0, 5, 0, -5, 0] }} 
              transition={{ duration: 6, repeat: Infinity }} 
              className="w-80 h-48 rounded-2xl gradient-gold shadow-gold p-6 flex flex-col justify-between relative"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-secondary-foreground">
                  <ShoppingCart className="w-5 h-5" /> NM Mart
                </div>
                <span className="text-[10px] font-bold opacity-70">WELFARE MEMBER</span>
              </div>
              <div>
                <p className="text-[10px] opacity-60 uppercase font-semibold">Valid Till Month End</p>
                <p className="text-lg font-bold text-secondary-foreground uppercase tracking-wider">{mobile || "91XXXXXXXX"}</p>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-secondary-foreground text-secondary-foreground" />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Input Field Area */}
            <div className="w-full max-w-sm bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
              <label className="text-primary-foreground text-sm block mb-2 font-medium">अपना मोबाइल नंबर दर्ज करें:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="मोबाइल नंबर"
                  className="bg-white/5 border border-white/20 text-white p-2 rounded-lg w-full focus:outline-none focus:border-gold placeholder:text-white/30"
                />
                <button 
                  onClick={() => mobile.length === 10 ? setShowStatus(true) : alert("कृपया 10 अंकों का नंबर डालें")}
                  className="bg-gold text-secondary-foreground px-5 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
                >
                  Check
                </button>
              </div>

              {showStatus && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-100 text-sm shadow-inner"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-400" /> 
                    <strong className="text-white">आपका कार्ड एक्टिव है!</strong>
                  </div>
                  <p className="opacity-90 text-xs">यह कार्ड <span className="text-gold font-bold">{formattedExpiry}</span> तक मान्य रहेगा।</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-5">
            {[
              { icon: Gift, title: "Extra 5% Discount", desc: "हर खरीदारी पर तुरंत बचत" },
              { icon: Calendar, title: "6 Month Validity", desc: `महीने की आखिरी तारीख (${formattedExpiry}) तक मान्य` },
              { icon: HeadphonesIcon, title: "Priority Support", desc: "Welfare मेंबर्स के लिए खास हेल्पलाइन" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shrink-0 shadow-gold">
                  <Icon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">{title}</h3>
                  <p className="text-sm text-primary-foreground/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelfareCard;

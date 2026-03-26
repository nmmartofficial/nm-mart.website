import { motion } from "framer-motion";
import { ShoppingCart, Gift, HeadphonesIcon, Star } from "lucide-react";

const WelfareCard = () => (
  <section id="welfare-card" className="py-16 gradient-navy relative overflow-hidden">
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold blur-3xl" />
    </div>
    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground">
          NM Mart <span className="text-gold">Welfare Card</span>
        </h2>
        <p className="text-primary-foreground/60 mt-2">Exclusive membership for smart shoppers</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
        {/* 3D Card */}
        <motion.div
          animate={{ rotateY: [0, 5, 0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ perspective: 1000 }}
          className="flex justify-center"
        >
          <div className="w-80 h-48 rounded-2xl gradient-gold shadow-gold p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-foreground/10 to-transparent" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-secondary-foreground" />
                <span className="font-bold font-display text-secondary-foreground">NM Mart</span>
              </div>
              <span className="text-xs font-semibold text-secondary-foreground/70 tracking-wider">WELFARE</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-secondary-foreground/60 tracking-widest">MEMBER SINCE 2024</p>
              <p className="text-lg font-bold text-secondary-foreground font-display mt-1">NM Mart Member</p>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-secondary-foreground text-secondary-foreground" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <div className="space-y-5">
          {[
            { icon: Gift, title: "Extra 5% Discount", desc: "On every purchase, every time you shop" },
            { icon: Star, title: "6-Month Loyalty Rewards", desc: "Earn points & get exclusive cashback rewards" },
            { icon: HeadphonesIcon, title: "Priority Support", desc: "Dedicated support line for all Welfare members" },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shrink-0 shadow-gold">
                <Icon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">{title}</h3>
                <p className="text-sm text-primary-foreground/60">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WelfareCard;

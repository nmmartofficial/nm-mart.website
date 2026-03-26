import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, Percent } from "lucide-react";

const Hero = () => (
  <section className="gradient-hero relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-gold blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary blur-3xl" />
    </div>
    <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        className="max-w-2xl">
        <span className="inline-block px-4 py-1.5 rounded-full gradient-gold text-secondary-foreground text-xs font-semibold tracking-wide mb-6 shadow-gold">
          🎉 Grand Savings — Up to 40% Off
        </span>
        <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground font-display leading-tight mb-4">
          Your Trusted <span className="text-gold">Neighbourhood</span> Store
        </h2>
        <p className="text-lg text-primary-foreground/70 mb-8 max-w-lg">
          Quality daily essentials & premium home textiles at unbeatable prices. Serving Manjhanpur with pride.
        </p>
        <a href="#products" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-gold text-secondary-foreground font-semibold shadow-gold hover:opacity-90 transition-opacity">
          Shop Now <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-3 gap-4 mt-12 max-w-lg">
        {[
          { icon: Truck, label: "Free Local Delivery" },
          { icon: Shield, label: "Genuine Products" },
          { icon: Percent, label: "Best Prices" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3">
            <Icon className="w-5 h-5 text-gold" />
            <span className="text-xs text-primary-foreground/80 text-center font-medium">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Hero;

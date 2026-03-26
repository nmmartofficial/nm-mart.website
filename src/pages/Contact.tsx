import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Mail, Clock, Phone } from "lucide-react";

const Contact = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-6">Contact <span className="text-gold">Us</span></h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: MapPin, title: "Location", desc: "Manjhanpur, Uttar Pradesh" },
            { icon: Mail, title: "Email", desc: "support@nmmart.in" },
            { icon: Clock, title: "Timings", desc: "Daily 9 AM – 9 PM" },
            { icon: Phone, title: "WhatsApp", desc: "Order via WhatsApp anytime" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-xl p-6 shadow-card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;

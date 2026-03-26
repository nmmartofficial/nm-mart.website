import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-6">About <span className="text-gold">NM Mart</span></h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>NM Mart is Manjhanpur's most trusted neighbourhood retail store, serving our community with quality daily essentials and premium home textiles at unbeatable prices since our founding.</p>
          <p>Our mission is simple: to provide every household in Manjhanpur and the surrounding areas with access to genuine, high-quality products without breaking the bank. We believe that great quality shouldn't come at a premium.</p>
          <p>With our innovative Welfare Card membership, we reward our loyal customers with extra discounts, loyalty rewards, and priority support — because we truly believe in the motto <strong className="text-foreground">"Shop More, Save More."</strong></p>
          <p>Visit us at our store in Manjhanpur, Uttar Pradesh, or order conveniently through WhatsApp. We're open daily from 9 AM to 9 PM and always happy to serve you.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;

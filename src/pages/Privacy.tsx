import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-6">Privacy <span className="text-gold">Policy</span></h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>At NM Mart, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your information.</p>
          <h3 className="text-lg font-semibold text-foreground">Information We Collect</h3>
          <p>We collect only the information necessary to process your orders, such as your name, phone number, and delivery address when you place an order via WhatsApp.</p>
          <h3 className="text-lg font-semibold text-foreground">How We Use Your Information</h3>
          <p>Your information is used solely for order processing, delivery coordination, and communicating offers related to NM Mart. We never sell or share your data with third parties.</p>
          <h3 className="text-lg font-semibold text-foreground">Data Security</h3>
          <p>We implement reasonable security measures to protect your personal information from unauthorized access or disclosure.</p>
          <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
          <p>For questions about this Privacy Policy, contact us at support@nmmart.in.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;

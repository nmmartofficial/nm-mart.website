import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919999999999"; // Replace with actual number

const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to place an order at NM Mart.")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-success text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-float"
    aria-label="Order on WhatsApp"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);

export default WhatsAppButton;

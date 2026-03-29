import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User as UserIcon, Phone, Mail, Minimize2 } from "lucide-react";
import { SUPPORT_EMAIL, HELPLINE } from "@/lib/store-utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! Welcome to NM MART. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! I'm your NM MART assistant. I can help you with orders, products, membership, or any questions you have. What would you like to know?";
    }

    if (lowerMessage.includes("membership") || lowerMessage.includes("member")) {
      return "Our Premium Membership costs just ₹599 and gives you ₹1500 shopping value valid for 6 months! You also get loyalty points, priority support, and exclusive discounts. Would you like to activate your membership?";
    }

    if (lowerMessage.includes("order") || lowerMessage.includes("track")) {
      return "To track your order, please go to your Profile Dashboard > Orders section. You can view all your order history there. Need help with a specific order?";
    }

    if (lowerMessage.includes("delivery") || lowerMessage.includes("shipping")) {
      return "We offer free delivery on orders above ₹500 in Manjhanpur and nearby areas. Delivery typically takes 1-2 hours. For urgent orders, contact us on WhatsApp!";
    }

    if (lowerMessage.includes("payment") || lowerMessage.includes("pay") || lowerMessage.includes("upi")) {
      return "We accept multiple payment methods: Cash on Delivery (COD), UPI, and online payments. All payments are 100% secure and encrypted.";
    }

    if (lowerMessage.includes("product") || lowerMessage.includes("search") || lowerMessage.includes("find")) {
      return "You can search from 7000+ products using the search bar on the home page. Use product names, categories, or even barcodes to find what you need!";
    }

    if (lowerMessage.includes("discount") || lowerMessage.includes("offer") || lowerMessage.includes("sale")) {
      return "We have amazing offers! Check out our Flat 50% OFF and Flat 33% OFF collections on the home page. Plus, members get extra discounts!";
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("support") || lowerMessage.includes("help")) {
      return `For immediate assistance:\n\nEmail: ${SUPPORT_EMAIL}\nHelpline: ${HELPLINE}\nWhatsApp: Available 24/7\n\nOur support team is always ready to help!`;
    }

    if (lowerMessage.includes("return") || lowerMessage.includes("refund") || lowerMessage.includes("exchange")) {
      return "We have a hassle-free return policy. Contact our support team within 24 hours of delivery for returns or exchanges. Refunds are processed within 3-5 business days.";
    }

    if (lowerMessage.includes("store") || lowerMessage.includes("location") || lowerMessage.includes("address")) {
      return "NM MART is located at Naya Nagar Dhata Road, Manjhanpur, Kaushambi, Uttar Pradesh - 212207. We're open daily from 8 AM to 10 PM!";
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with today?";
    }

    if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
      return "Thank you for shopping with NM MART! Have a great day! Feel free to reach out anytime.";
    }

    return "I'm here to help! You can ask me about:\n\n• Products & Search\n• Orders & Tracking\n• Membership Benefits\n• Delivery Information\n• Offers & Discounts\n• Contact & Support\n\nWhat would you like to know?";
  };

  const saveMessageToDatabase = async (message: Message) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("chat_messages").insert({
          user_id: user.id,
          session_id: sessionId.current,
          message_type: "text",
          message_text: message.text,
          sender: message.sender,
        });
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await saveMessageToDatabase(userMessage);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(input),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
      saveMessageToDatabase(botResponse);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl flex items-center justify-center hover:shadow-3xl transition-shadow"
            aria-label="Open AI Chatbot"
          >
            <MessageCircle size={28} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--secondary))] rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
          >
            <div className="gradient-navy text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">NM MART Assistant</h3>
                  <p className="text-xs opacity-80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-[hsl(var(--success))] rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="bg-[hsl(var(--secondary))]/10 border-b border-border px-4 py-2 flex items-center justify-around text-xs">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail size={12} />
                <span className="font-bold">{SUPPORT_EMAIL}</span>
              </a>
              <a
                href={`tel:${HELPLINE}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone size={12} />
                <span className="font-bold">{HELPLINE}</span>
              </a>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.sender === "bot"
                        ? "bg-primary text-primary-foreground"
                        : "bg-[hsl(var(--secondary))] text-white"
                    }`}
                  >
                    {message.sender === "bot" ? <Bot size={16} /> : <UserIcon size={16} />}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.sender === "bot"
                        ? "bg-card border border-border text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        message.sender === "bot" ? "text-muted-foreground" : "text-primary-foreground/70"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-card border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Powered by NM MART AI Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;

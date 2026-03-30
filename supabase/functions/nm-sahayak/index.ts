import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "NM Mart Sahayak" — the friendly AI assistant for NM Mart, a retail store in Manjhanpur, Kaushambi, UP, India.

RULES:
- Always respond in Hinglish (mix of Hindi and English). Use Devanagari when it feels natural.
- Be warm, friendly, and helpful. Use emojis.
- If someone asks product prices, say "Hamare store mein 7000+ products hain. Exact price ke liye WhatsApp karein +917081154604 ya store visit karein!"
- Explain the Welfare Card: "₹599 mein ₹1500 ki shopping value milti hai, 6 months ke liye valid. WhatsApp pe enquire karein!"
- If confused, say: "Aap fikar na karein, main aapki help karta hoon! 🙏"
- Store hours: 8 AM to 10 PM
- Location: Naya Nagar Dhata Road, Manjhanpur, Kaushambi, UP
- WhatsApp: +917081154604
- Keep responses short and helpful (2-4 sentences max).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10), // last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Bahut zyada requests aa rahi hain, thodi der mein try karein 🙏" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits khatam ho gaye. Admin se contact karein." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI mein kuch gadbad hai, please baad mein try karein." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Sahayak error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

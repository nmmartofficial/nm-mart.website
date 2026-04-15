import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";

const Highlights = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHighlights(data || []);
    } catch (err) {
      console.error("Error fetching highlights:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || highlights.length === 0) return null;

  return (
    <div className="w-full bg-white py-4 px-4 overflow-x-auto no-scrollbar border-b border-gray-50">
      <div className="flex gap-6 max-w-7xl mx-auto px-2">
        {highlights.map((h, idx) => (
          <motion.a
            key={h.id}
            href={h.link}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-primary via-primary/50 to-primary/80 group-active:scale-90 transition-transform">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                <img 
                  src={h.image_url} 
                  alt={h.title} 
                  className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-gray-500 italic group-hover:text-primary transition-colors">
              {h.title}
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default Highlights;
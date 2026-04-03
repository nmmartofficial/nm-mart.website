import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

function useCountdown() {
  const getRemaining = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  };
  const [sec, setSec] = useState(getRemaining);
  useEffect(() => {
    const t = setInterval(() => setSec(getRemaining()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const FlashSaleBanner = () => {
  const countdown = useCountdown();
  return (
    <div className="gradient-orange text-white text-center py-2 text-xs font-bold tracking-wide flex items-center justify-center gap-2">
      <Clock size={14} />
      <span>⚡ FLASH SALE ENDS IN</span>
      <span className="bg-black/30 text-white px-2.5 py-0.5 rounded font-mono text-sm">{countdown}</span>
    </div>
  );
};

export default FlashSaleBanner;

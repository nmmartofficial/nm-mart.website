import React, { createContext, useContext, useEffect, useState } from 'react';
import { getThemeConfig, ThemeConfig } from './storeConfig';

interface ThemeContextType {
  theme: ThemeConfig;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const PRESET_COLORS: Record<string, { primary: string; secondary: string }> = {
  "NM Classic": { primary: "#CC0000", secondary: "#D4AF37" },
  "Sky Fresh": { primary: "#0EA5E9", secondary: "#E0F2FE" },
  "Forest": { primary: "#10B981", secondary: "#D1FAE5" },
  "Royal": { primary: "#8B5CF6", secondary: "#EDE9FE" },
  "Festive": { primary: "#F97316", secondary: "#FFEDD5" },
  "Luxury": { primary: "#111827", secondary: "#F3F4F6" }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: "#CC0000",
    secondaryColor: "#D4AF37",
    presetName: "NM Classic",
    storeName: "NM Mart",
    storeLogo: "/nm-mart-logo.png",
    announcementText: "Free Delivery on orders above ₹1499!",
    announcementVisible: true,
    fontFamily: "Inter",
    bannerRadius: 0,
    categoryCardStyle: "soft"
  });

  const applyTheme = (
    color: string,
    secondaryColor: string = "#D4AF37",
    font: string = "Inter",
    bannerRadius: number = 0
  ) => {
    // Inject CSS variables
    document.documentElement.style.setProperty('--primary-hex', color);
    
    // Set Font
    document.documentElement.style.fontFamily = font;
    
    const styleId = 'dynamic-theme-style';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    styleTag.innerHTML = `
      :root {
        --primary-dynamic: ${color};
        --secondary-dynamic: ${secondaryColor};
        --nm-banner-radius: ${bannerRadius}px;
        --font-dynamic: ${font}, sans-serif;
      }
      body { font-family: var(--font-dynamic); }
      .bg-primary { background-color: ${color} !important; }
      .bg-secondary { background-color: ${secondaryColor} !important; }
      .text-primary { color: ${color} !important; }
      .border-primary { border-color: ${color} !important; }
      .hover\\:bg-primary:hover { background-color: ${color} !important; }
      .hover\\:text-primary:hover { color: ${color} !important; }
      .focus\\:border-primary:focus { border-color: ${color} !important; }
    `;
  };

  const refreshTheme = async () => {
    const config = await getThemeConfig();
    const now = new Date();
    const schedule = config.festiveSchedule;
    const start = schedule?.startDate ? new Date(schedule.startDate) : null;
    const end = schedule?.endDate ? new Date(schedule.endDate) : null;
    const inWindow =
      Boolean(schedule?.enabled) &&
      Boolean(start && end) &&
      now >= start &&
      now <= new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1);

    let resolved = { ...config };
    if (inWindow && schedule?.presetName && PRESET_COLORS[schedule.presetName]) {
      resolved = {
        ...resolved,
        presetName: schedule.presetName,
        primaryColor: PRESET_COLORS[schedule.presetName].primary,
        secondaryColor: PRESET_COLORS[schedule.presetName].secondary
      };
    }

    setTheme(resolved);
    applyTheme(resolved.primaryColor, resolved.secondaryColor, resolved.fontFamily, resolved.bannerRadius || 0);
  };

  useEffect(() => {
    refreshTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
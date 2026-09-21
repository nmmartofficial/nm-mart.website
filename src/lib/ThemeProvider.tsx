import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMainStoreLogo, getThemeConfig, ThemeConfig } from './storeConfig';

interface ThemeContextType {
  theme: ThemeConfig;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const PRESET_COLORS: Record<string, { primary: string; secondary: string }> = {
  "NM Classic": { primary: "#155EEF", secondary: "#EFF6FF" },
  "Sky Fresh": { primary: "#155EEF", secondary: "#DBEAFE" },
  "Deep Blue": { primary: "#0B1F3A", secondary: "#E2E8F0" },
  "Retail Premium": { primary: "#155EEF", secondary: "#F8FAFC" },
  "Sale Alert": { primary: "#E11D48", secondary: "#FEE2E2" },
  "Luxury": { primary: "#0B1F3A", secondary: "#F8FAFC" }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: "#155EEF",
    secondaryColor: "#EFF6FF",
    backgroundColor: "#F8FAFC",
    textColor: "#111827",
    highlightColor: "#DBEAFE",
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
    config: ThemeConfig
  ) => {
    const { 
      primaryColor, secondaryColor, backgroundColor, textColor, highlightColor,
      fontFamily, headingFont, bodyFont, fontSizeBase, letterSpacing, lineHeight,
      bannerRadius, cardRadius, customCss, animationsEnabled, shadowStyle
    } = config;

    // Inject CSS variables
    document.documentElement.style.setProperty('--primary-hex', primaryColor);
    
    // Inject Google Fonts if needed
    const fontToLoad = headingFont || bodyFont || fontFamily;
    if (fontToLoad && fontToLoad !== "Inter") {
      const fontId = 'dynamic-google-font';
      let fontLink = document.getElementById(fontId) as HTMLLinkElement;
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = fontId;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontToLoad.replace(/ /g, '+')}:wght@400;700;900&display=swap`;
    }

    // Set Font
    document.documentElement.style.fontFamily = bodyFont || fontFamily;
    
    const styleId = 'dynamic-theme-style';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    const shadowValue = shadowStyle === "bold" 
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)" 
      : shadowStyle === "soft" 
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
        : "none";

    const hexToHsl = (hex: string) => {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      }
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const primaryHsl = hexToHsl(primaryColor);
    const bgHsl = hexToHsl(backgroundColor);
    const textHsl = hexToHsl(textColor);
    const accentColor = config.accentColor || "#FBBF24";
    const accentHsl = hexToHsl(accentColor);

    styleTag.innerHTML = `
      :root {
        --nm-primary: ${primaryColor};
        --nm-primary-dark: ${primaryColor};
        --nm-primary-light: ${highlightColor || '#EAF3FF'};
        --nm-primary-border: ${highlightColor || '#BBD8FF'};
        --primary: ${primaryHsl};
        --background: ${bgHsl};
        --foreground: ${textHsl};
        --card: ${bgHsl};
        --popover: ${bgHsl};
        --accent: ${accentHsl};
        --primary-dynamic: ${primaryColor};
        --secondary-dynamic: ${secondaryColor};
        --bg-dynamic: ${backgroundColor};
        --text-dynamic: ${textColor};
        --highlight-dynamic: ${highlightColor};
        --accent-dynamic: ${accentColor};
        --font-heading: ${headingFont || fontFamily}, sans-serif;
        --font-body: ${bodyFont || fontFamily}, sans-serif;
        --base-font-size: ${fontSizeBase}px;
        --letter-spacing: ${letterSpacing};
        --line-height: ${lineHeight};
        --nm-banner-radius: ${bannerRadius}px;
        --nm-card-radius: ${cardRadius}px;
        --nm-button-radius: ${config.buttonRadius || 8}px;
        --nm-shadow: ${shadowValue};
        --animations-display: ${animationsEnabled ? 'block' : 'none'};
        --animation-speed: ${config.animationSpeed === "slow" ? "0.5s" : config.animationSpeed === "fast" ? "0.15s" : "0.3s"};
      }
      body { 
        font-family: var(--font-body); 
        background-color: var(--bg-dynamic);
        color: var(--text-dynamic);
        font-size: var(--base-font-size);
        letter-spacing: var(--letter-spacing);
        line-height: var(--line-height);
        transition: background-color var(--animation-speed) ease, color var(--animation-speed) ease;
      }
      h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
      
      /* Dynamic Button Styles */
      .btn-dynamic {
        border-radius: var(--nm-button-radius);
        transition: all var(--animation-speed) ease;
      }
      ${config.buttonStyle === "gradient" ? `
        .btn-dynamic {
          background: linear-gradient(135deg, ${primaryColor}, ${highlightColor});
          border: none;
          color: white;
        }
      ` : config.buttonStyle === "outline" ? `
        .btn-dynamic {
          background: transparent;
          border: 2px solid ${primaryColor};
          color: ${primaryColor};
        }
      ` : config.buttonStyle === "shadow" ? `
        .btn-dynamic {
          background: ${primaryColor};
          box-shadow: 0 4px 14px 0 ${primaryColor}66;
          color: white;
        }
      ` : ''}

      /* Force override existing classes to use dynamic variables */
      .bg-primary { background-color: ${primaryColor} !important; }
      .bg-secondary { background-color: ${secondaryColor} !important; }
      .text-primary { color: ${primaryColor} !important; }
      .border-primary { border-color: ${primaryColor} !important; }
      
      ${customCss || ''}
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

    const storeLogo = await getMainStoreLogo();
    setTheme({ ...resolved, storeLogo });
    applyTheme(resolved);
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
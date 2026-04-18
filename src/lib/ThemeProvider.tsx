import React, { createContext, useContext, useEffect, useState } from 'react';
import { getThemeConfig, ThemeConfig } from './storeConfig';

interface ThemeContextType {
  theme: ThemeConfig;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: "#CC0000",
    secondaryColor: "#D4AF37",
    storeName: "NM Mart",
    storeLogo: "/nm-mart-logo.png"
  });

  const applyTheme = (color: string, font: string = "Inter") => {
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
        --font-dynamic: ${font}, sans-serif;
      }
      body { font-family: var(--font-dynamic); }
      .bg-primary { background-color: ${color} !important; }
      .text-primary { color: ${color} !important; }
      .border-primary { border-color: ${color} !important; }
      .hover\\:bg-primary:hover { background-color: ${color} !important; }
      .hover\\:text-primary:hover { color: ${color} !important; }
      .focus\\:border-primary:focus { border-color: ${color} !important; }
    `;
  };

  const refreshTheme = async () => {
    const config = await getThemeConfig();
    setTheme(config);
    applyTheme(config.primaryColor, config.fontFamily);
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
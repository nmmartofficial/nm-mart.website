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

  const refreshTheme = async () => {
    const config = await getThemeConfig();
    setTheme(config);
    applyTheme(config.primaryColor);
  };

  const applyTheme = (color: string) => {
    // Inject CSS variables
    document.documentElement.style.setProperty('--primary-hex', color);
    
    // If you use HSL in Tailwind, you might need to convert hex to HSL
    // For simplicity, we'll use a data attribute or style tag
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
      }
      .bg-primary { background-color: ${color} !important; }
      .text-primary { color: ${color} !important; }
      .border-primary { border-color: ${color} !important; }
      .hover\\:bg-primary:hover { background-color: ${color} !important; }
      .hover\\:text-primary:hover { color: ${color} !important; }
      .focus\\:border-primary:focus { border-color: ${color} !important; }
    `;
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
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Colors } from '@/constants/theme';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark theme
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? Colors.light : Colors.dark;
  const isDark = theme === 'dark';

  const value: ThemeContextType = useMemo(() => ({
    theme,
    colors,
    toggleTheme,
    isDark,
  }), [theme, colors, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
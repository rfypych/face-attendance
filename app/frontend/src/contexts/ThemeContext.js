import React, { createContext, useState, useEffect } from 'react';

// Definisikan tema aplikasi
export const themes = {
  light: {
    type: 'light',
    primaryColor: '#007bff',
    backgroundColor: '#ffffff',
    textColor: '#212529',
    navbarBg: '#f8f9fa',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0, 0, 0, 0.125)',
    inputBg: '#ffffff',
    inputBorder: '#ced4da',
    inputText: '#495057'
  },
  dark: {
    type: 'dark',
    primaryColor: '#60a5fa',
    backgroundColor: '#121212',
    textColor: '#e4e6eb',
    navbarBg: '#1c1e21',
    cardBg: '#242526',
    cardBorder: 'rgba(255, 255, 255, 0.125)',
    inputBg: '#3a3b3c',
    inputBorder: '#5d5d5d',
    inputText: '#e4e6eb'
  }
};

// Buat context dengan nilai default tema terang
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// Komponen provider
export const ThemeProvider = ({ children }) => {
  // Gunakan localStorage untuk menyimpan preferensi tema
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Fungsi untuk toggle tema
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Terapkan tema ke elemen HTML
  useEffect(() => {
    const root = document.documentElement;
    const themeObj = themes[theme];
    
    // Terapkan variabel CSS untuk tema
    if (themeObj) {
      root.style.setProperty('--card-bg', themeObj.cardBg);
      root.style.setProperty('--card-border', themeObj.cardBorder);
      root.style.setProperty('--input-bg', themeObj.inputBg);
      root.style.setProperty('--input-border', themeObj.inputBorder);
      root.style.setProperty('--input-text', themeObj.inputText);
      root.style.setProperty('--link-color', themeObj.primaryColor);
      root.style.setProperty('--navbar-bg', themeObj.navbarBg);
      root.style.setProperty('--navbar-text', theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)');
      root.style.setProperty('--navbar-hover-text', theme === 'light' ? '#000000' : '#ffffff');
      
      // Ubah warna background dan text pada body
      document.body.style.backgroundColor = themeObj.backgroundColor;
      document.body.style.color = themeObj.textColor;

      // Tambahkan kelas tema ke body untuk styling tambahan
      document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  // Gaya inline sederhana untuk tombol
  const buttonStyle = {
    padding: '0.5rem 0.8rem',
    borderRadius: 'var(--border-radius)',
    border: '1px solid var(--input-border)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-color)',
    cursor: 'pointer',
    fontSize: '1.2rem', // Ukuran ikon
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    marginLeft: 'auto', // Posisikan di kanan navbar
  };

  return (
    <button 
      onClick={toggleTheme} 
      style={buttonStyle}
      aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === 'dark' ? '☀️' : '🌙'} 
    </button>
  );
};

export default DarkModeToggle; 
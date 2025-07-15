
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Starting application...');

// Enhanced initialization with theme persistence
const initialize = () => {
  try {
    // Handle color theme (always purple)
    const savedColorTheme = localStorage.getItem("color-theme");
    if (!savedColorTheme) {
      document.documentElement.classList.add("purple");
      localStorage.setItem("color-theme", "purple");
    }
    
    // Handle dark/light theme with proper persistence
    const savedTheme = localStorage.getItem("hisaabdost-theme");
    console.log('Initial theme from storage:', savedTheme);
    
    if (savedTheme) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (savedTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } else {
      // Default to dark theme if no preference is set
      document.documentElement.classList.add('dark');
      localStorage.setItem('hisaabdost-theme', 'dark');
    }
    
    console.log('✅ Theme initialized with persistence');
  } catch (error) {
    console.warn('Theme initialization failed:', error);
  }
};

initialize();

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('✅ App rendered successfully');
} else {
  console.error('❌ Root element not found');
}

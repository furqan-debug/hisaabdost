
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Starting application...');

// Optimized preload operations
const preloadResources = () => {
  try {
    // Initialize theme without DOM manipulation during render
    const savedTheme = localStorage.getItem("color-theme");
    if (!savedTheme) {
      document.documentElement.classList.add("purple");
      localStorage.setItem("color-theme", "purple");
    }
    console.log('✅ Theme initialized');
  } catch (error) {
    console.warn('Theme initialization failed:', error);
  }
};

// Run initialization
preloadResources();

// Get root element and render app
const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  // Remove React.StrictMode in development for better performance during development
  root.render(<App />);
  console.log('✅ App rendered successfully');
} else {
  console.error('❌ Root element not found');
}


import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Optimized preload operations
const preloadResources = () => {
  // Initialize theme without DOM manipulation during render
  const savedTheme = localStorage.getItem("color-theme");
  if (!savedTheme) {
    document.documentElement.classList.add("purple");
    localStorage.setItem("color-theme", "purple");
  }
};

// Run initialization
preloadResources();

// Get root element and render app
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  
  // Remove React.StrictMode in development for better performance during development
  root.render(<App />);
} else {
  console.error('Root element not found');
}


import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Preload critical resources
const preloadResources = () => {
  // Preload auth state before rendering
  const preloadAuth = () => {
    try {
      return JSON.parse(localStorage.getItem('hisaabdost_user_cache') || 'null');
    } catch (e) {
      return null;
    }
  };
  
  // Initialize color theme from localStorage before rendering
  const initColorTheme = () => {
    const savedColorTheme = localStorage.getItem("color-theme");
    
    // Remove any existing theme classes
    document.documentElement.classList.remove("pink", "purple");
    
    // Apply saved theme if it exists, otherwise use default (which is green)
    if (savedColorTheme === "pink") {
      document.documentElement.classList.add("pink");
    } else if (savedColorTheme === "purple") {
      document.documentElement.classList.add("purple");
    }
  };
  
  // Execute preload operations
  initColorTheme();
  preloadAuth();
};

// Run initialization
preloadResources();

// Use createRoot in non-blocking microtask
setTimeout(() => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      // Remove React.StrictMode in production to prevent double rendering/effects
      import.meta.env.DEV ? (
        <React.StrictMode>
          <App />
        </React.StrictMode>
      ) : (
        <App />
      )
    );
  }
}, 0);

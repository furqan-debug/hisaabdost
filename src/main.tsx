
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error handling for environment variables
if (typeof __WS_TOKEN__ === 'undefined') {
  console.error('__WS_TOKEN__ is not defined. This might cause issues with WebSocket connections.');
}

// Preload critical resources
const preloadResources = () => {
  // Preload auth state before rendering
  const preloadAuth = () => {
    try {
      return JSON.parse(localStorage.getItem('hisaabdost_user_cache') || 'null');
    } catch (e) {
      console.error('Error preloading auth state:', e);
      return null;
    }
  };
  
  // Initialize color theme from localStorage before rendering
  const initColorTheme = () => {
    try {
      const savedColorTheme = localStorage.getItem("color-theme");
      
      // Remove any existing theme classes
      document.documentElement.classList.remove("pink", "purple");
      
      // Apply saved theme if it exists, otherwise use default (which is green)
      if (savedColorTheme === "pink") {
        document.documentElement.classList.add("pink");
      } else if (savedColorTheme === "purple") {
        document.documentElement.classList.add("purple");
      }
    } catch (e) {
      console.error('Error initializing color theme:', e);
    }
  };
  
  // Execute preload operations
  try {
    initColorTheme();
    preloadAuth();
  } catch (e) {
    console.error('Error during preload operations:', e);
  }
};

// Run initialization
preloadResources();

// Use createRoot in non-blocking microtask
setTimeout(() => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    try {
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
    } catch (e) {
      console.error('Error rendering application:', e);
      // Display fallback error message
      rootElement.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Something went wrong</h2><p>Please try refreshing the page.</p></div>';
    }
  }
}, 0);

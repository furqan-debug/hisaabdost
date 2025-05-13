
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global error handling
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error caught:', { message, source, lineno, colno, error });
  return false;
};

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
    console.error('Error in preload resources:', e);
  }
};

// Run initialization
try {
  preloadResources();
} catch (e) {
  console.error('Failed to preload resources:', e);
}

// Use createRoot in non-blocking microtask with error handling
setTimeout(() => {
  try {
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
    } else {
      console.error("Root element not found");
    }
  } catch (e) {
    console.error('Failed to render app:', e);
    // Display a fallback error message to the user
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Something went wrong</h2><p>Please try refreshing the page</p></div>';
  }
}, 0);

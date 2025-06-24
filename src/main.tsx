
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
  
  // Initialize purple theme as default for all users
  const initColorTheme = () => {
    // Remove any existing theme classes
    document.documentElement.classList.remove("pink", "purple");
    
    // Always apply purple theme
    document.documentElement.classList.add("purple");
    localStorage.setItem("color-theme", "purple");
  };
  
  // Execute preload operations
  initColorTheme();
  preloadAuth();
};

// Run initialization
preloadResources();

// Get root element and render app
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    import.meta.env.DEV ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <App />
    )
  );
} else {
  console.error('Root element not found');
}

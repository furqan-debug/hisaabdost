
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/auth';

// Initialize color theme from localStorage before rendering
const initColorTheme = () => {
  const savedColorTheme = localStorage.getItem("color-theme");
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  // Remove any existing theme classes
  document.documentElement.classList.remove("pink", "purple");
  
  // If system theme is selected and it's light, apply purple theme
  if (!savedColorTheme && systemTheme === 'light') {
    document.documentElement.classList.add("purple");
    localStorage.setItem("color-theme", "purple");
  }
  // Apply saved theme if it exists
  else if (savedColorTheme === "pink") {
    document.documentElement.classList.add("pink");
  } else if (savedColorTheme === "purple") {
    document.documentElement.classList.add("purple");
  }
};

// Run initialization
initColorTheme();

// Wrap the entire app with AuthProvider
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);


import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize color theme from localStorage before rendering
const initColorTheme = () => {
  const savedColorTheme = localStorage.getItem("color-theme");
  
  // Remove any existing theme classes
  document.documentElement.classList.remove("pink", "blue");
  
  // Apply saved theme if it exists
  if (savedColorTheme === "pink") {
    document.documentElement.classList.add("pink");
  } else if (savedColorTheme === "blue") {
    document.documentElement.classList.add("blue");
  }
};

// Run initialization
initColorTheme();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

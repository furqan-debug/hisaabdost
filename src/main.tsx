
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Starting application...');

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('✅ App rendered successfully');
} else {
  console.error('❌ Root element not found');
}

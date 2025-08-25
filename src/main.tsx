
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Starting application...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('✅ Root element found, creating React root...');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('✅ App rendered successfully');

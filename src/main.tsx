
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 Starting application...');
console.log('React version:', React.version);

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, creating React root...');

try {
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  throw error;
}

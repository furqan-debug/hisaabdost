
/// <reference types="vite/client" />

// Prevent TypeScript errors from Cordova global
interface Window {
  cordova?: any;
}

// Define environment variables with proper typing
declare const __WS_TOKEN__: string;

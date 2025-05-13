
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Properly define ConfigEnv type
import { ConfigEnv } from 'vite';

export default defineConfig(({ mode }: ConfigEnv) => ({
  base: "./",

  build: {
    outDir: "dist",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true
      }
    },
    // Add rollup options for better chunk management
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-router-dom') || 
              id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@radix-ui') || id.includes('/components/ui/')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-animations';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },

  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Enhanced HMR config
      protocol: 'ws',
      timeout: 30000,
      host: 'localhost',
      clientPort: 8080,
      overlay: true
    },
    // Fix host blocking by setting allowedHosts to true
    allowedHosts: true
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "@tanstack/react-query"
    ],
    exclude: ["@capacitor/core"]
  },

  // Define environment variables directly without any complex processing
  define: {
    '__WS_TOKEN__': JSON.stringify('development-token'),
    'process.env': '{}'
  }
}));

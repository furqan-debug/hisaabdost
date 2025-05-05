
import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // ensure all assets load correctly inside Capacitor's WebView:
  base: "./",

  // explicitly target output dir
  build: {
    outDir: "dist",
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 800,
    // Minify output
    minify: "terser",
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true
      }
    },
    // Optimize rollup output
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-router-dom', 'react-dom'],
          'ui': ['@/components/ui'],
          'charts': ['recharts'],
          'animations': ['framer-motion'],
        }
      }
    }
  },

  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    // Add vendor chunk splitting
    splitVendorChunkPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Optimize dependencies scanning
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', '@tanstack/react-query'],
    exclude: ['@capacitor/core']
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
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
}
// 🔴 Removed rollupOptions to avoid chunking issues
},

server: {
host: "::",
port: 8080,
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
}
}));
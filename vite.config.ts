import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic', // Ensures React is imported
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    },
    allowedHosts: [
      "39ad8dd0-038e-42ac-a22b-35e772975603-00-3pkqyn5pdevvq.sisko.replit.dev",
      "*.replit.dev"
    ]
  }
});

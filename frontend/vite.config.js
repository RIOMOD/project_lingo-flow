import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyRequest) => {
            proxyRequest.removeHeader("origin");
          });
        },
      },
    },
  },
});

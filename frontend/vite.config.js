import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyRequest) => {
            // The browser Origin belongs to Vite (often :5173 or :5174).
            // The dev proxy is same-origin from the browser's perspective, so
            // do not forward that Origin and trigger backend CORS rejection.
            proxyRequest.removeHeader("origin");
          });
        },
      },
    },
  },
});

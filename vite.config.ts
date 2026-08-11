import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["scottbook-icon.svg"],
      manifest: {
        id: "/",
        name: "ScottBook",
        short_name: "ScottBook",
        description: "Đọc tiếng Trung theo nhịp của bạn.",
        theme_color: "#f4efe4",
        background_color: "#f4efe4",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "vi",
        icons: [
          {
            src: "/scottbook-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true
      }
    })
  ]
});

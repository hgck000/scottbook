import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "scottbook-icon.svg",
        "scottbook-icon-192.png",
        "scottbook-icon-512.png",
        "scottbook-icon-maskable-512.png",
        "scottbook-apple-touch-icon.png"
      ],
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
        categories: ["education", "books"],
        icons: [
          {
            src: "/scottbook-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "/scottbook-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/scottbook-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/scottbook-icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
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

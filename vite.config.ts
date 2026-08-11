import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

function normalizeBasePath(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "/") return "/";
  if (trimmed.includes("..") || /[\\:?#\s]/.test(trimmed)) {
    throw new Error("SCOTTBOOK_BASE_PATH must be a safe URL path");
  }
  const path = trimmed.replace(/^\/+|\/+$/g, "");
  return path ? `/${path}/` : "/";
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, ".", "SCOTTBOOK_");
  const base = normalizeBasePath(environment.SCOTTBOOK_BASE_PATH);

  return {
    base,
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
          id: base,
          name: "ScottBook",
          short_name: "ScottBook",
          description: "Đọc tiếng Trung theo nhịp của bạn.",
          theme_color: "#f4efe4",
          background_color: "#f4efe4",
          display: "standalone",
          start_url: base,
          scope: base,
          lang: "vi",
          categories: ["education", "books"],
          icons: [
            {
              src: `${base}scottbook-icon.svg`,
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any"
            },
            {
              src: `${base}scottbook-icon-192.png`,
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: `${base}scottbook-icon-512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: `${base}scottbook-icon-maskable-512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        },
        workbox: {
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true
        }
      })
    ]
  };
});

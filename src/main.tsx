import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { registerSW } from "virtual:pwa-register";
import { pwaStatusStore } from "./features/pwa/pwaStatus";
import { startBrowserPwaUpdateChecks } from "./features/pwa/pwaUpdateChecks";
import AppLoader from "./AppLoader";
import "./styles.css";

pwaStatusStore.initialize();
if (!Capacitor.isNativePlatform()) {
  const updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh: pwaStatusStore.notifyNeedRefresh,
    onNeedReload: pwaStatusStore.handleServiceWorkerNeedsReload,
    onOfflineReady: pwaStatusStore.notifyOfflineReady,
    onRegisteredSW: (_serviceWorkerUrl, registration) => {
      pwaStatusStore.notifyServiceWorkerRegistered(registration);
      if (registration) startBrowserPwaUpdateChecks(registration);
    },
    onRegisterError: pwaStatusStore.notifyRegisterError
  });
  pwaStatusStore.setUpdateServiceWorker(() => updateServiceWorker(true));
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("ScottBook root element was not found");
}

createRoot(root).render(
  <StrictMode>
    <AppLoader />
  </StrictMode>
);

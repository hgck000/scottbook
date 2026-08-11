import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { pwaStatusStore } from "./features/pwa/pwaStatus";
import "./styles.css";

pwaStatusStore.initialize();
const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh: pwaStatusStore.notifyNeedRefresh,
  onNeedReload: pwaStatusStore.handleServiceWorkerNeedsReload,
  onOfflineReady: pwaStatusStore.notifyOfflineReady,
  onRegisterError: pwaStatusStore.notifyRegisterError
});
pwaStatusStore.setUpdateServiceWorker(() => updateServiceWorker(true));

const root = document.getElementById("root");

if (!root) {
  throw new Error("ScottBook root element was not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";

export const NATIVE_BACK_EVENT = "scottbook:native-back";

export type AndroidBackAction = "history" | "home" | "exit";

export function getAndroidBackAction(
  hash: string,
  canGoBack: boolean
): AndroidBackAction {
  if (!hash || hash === "#" || hash === "#/") return "exit";
  return canGoBack ? "history" : "home";
}

export async function registerAndroidBackNavigation(): Promise<
  PluginListenerHandle | null
> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return null;
  }

  return CapacitorApp.addListener("backButton", ({ canGoBack }) => {
    const nativeBack = new Event(NATIVE_BACK_EVENT, { cancelable: true });
    if (!window.dispatchEvent(nativeBack)) return;

    const action = getAndroidBackAction(window.location.hash, canGoBack);
    if (action === "history") {
      window.history.back();
    } else if (action === "home") {
      window.location.assign("#/");
    } else {
      void CapacitorApp.exitApp();
    }
  });
}

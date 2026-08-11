import { describe, expect, it, vi } from "vitest";
import { createPwaStatusStore } from "./pwaStatus";

describe("controlled PWA lifecycle", () => {
  it("tracks connection changes and reloads only after an accepted update", async () => {
    let online = true;
    let connectionListener: () => void = () => undefined;
    const reload = vi.fn();
    const environment = {
      getOnline: () => online,
      addConnectionListener: (listener: () => void) => {
        connectionListener = listener;
        return () => undefined;
      },
      reload
    };
    const store = createPwaStatusStore(environment);
    const updateServiceWorker = vi.fn(async () => undefined);

    store.initialize();
    online = false;
    connectionListener();
    expect(store.getSnapshot().isOnline).toBe(false);

    store.setUpdateServiceWorker(updateServiceWorker);
    store.notifyNeedRefresh();
    expect(store.getSnapshot().needRefresh).toBe(true);
    await store.applyUpdate();
    expect(updateServiceWorker).toHaveBeenCalledOnce();
    expect(reload).not.toHaveBeenCalled();

    store.handleServiceWorkerNeedsReload();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("defers a reload triggered by another tab until the user accepts", async () => {
    const reload = vi.fn();
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload
    });

    store.handleServiceWorkerNeedsReload();
    expect(store.getSnapshot().reloadPending).toBe(true);
    expect(store.getSnapshot().needRefresh).toBe(true);
    expect(reload).not.toHaveBeenCalled();

    await store.applyUpdate();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("reports persistent-storage results without blocking normal storage", async () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined,
      storage: {
        persisted: vi.fn(async () => false),
        persist: vi.fn(async () => true)
      }
    });

    store.initialize();
    await Promise.resolve();
    expect(store.getSnapshot().storagePersistence).toBe("available");

    await expect(store.requestPersistentStorage()).resolves.toBe(true);
    expect(store.getSnapshot().storagePersistence).toBe("granted");
  });

  it("keeps the current app running when service-worker activation fails", async () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });
    store.setUpdateServiceWorker(async () => {
      throw new Error("activation failed");
    });

    await store.applyUpdate();

    expect(store.getSnapshot().updating).toBe(false);
    expect(store.getSnapshot().updateError).toContain(
      "Dữ liệu đọc vẫn được giữ nguyên"
    );
  });
});

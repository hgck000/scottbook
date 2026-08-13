export const PWA_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export type PwaUpdateRegistration = {
  update: () => Promise<unknown>;
};

export type PwaUpdateCheckEnvironment = {
  getOnline: () => boolean;
  getVisible: () => boolean;
  now: () => number;
  addOnlineListener: (listener: () => void) => () => void;
  addVisibilityListener: (listener: () => void) => () => void;
  setInterval: (listener: () => void, intervalMs: number) => unknown;
  clearInterval: (intervalId: unknown) => void;
};

export function createPwaUpdateChecker(
  registration: PwaUpdateRegistration,
  environment: PwaUpdateCheckEnvironment,
  minimumIntervalMs = PWA_UPDATE_CHECK_INTERVAL_MS
) {
  let lastAttemptAt = Number.NEGATIVE_INFINITY;
  let activeCheck: Promise<boolean> | null = null;

  const check = async (): Promise<boolean> => {
    if (!environment.getOnline() || !environment.getVisible()) return false;
    if (activeCheck) return activeCheck;

    const attemptedAt = environment.now();
    if (attemptedAt - lastAttemptAt < minimumIntervalMs) return false;
    lastAttemptAt = attemptedAt;

    activeCheck = Promise.resolve()
      .then(() => registration.update())
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        activeCheck = null;
      });
    return activeCheck;
  };

  const start = () => {
    const removeOnlineListener = environment.addOnlineListener(() => {
      void check();
    });
    const removeVisibilityListener = environment.addVisibilityListener(() => {
      if (environment.getVisible()) void check();
    });
    const intervalId = environment.setInterval(() => {
      void check();
    }, PWA_UPDATE_CHECK_INTERVAL_MS);

    return () => {
      removeOnlineListener();
      removeVisibilityListener();
      environment.clearInterval(intervalId);
    };
  };

  return { check, start };
}

export function startBrowserPwaUpdateChecks(
  registration: PwaUpdateRegistration
): () => void {
  const checker = createPwaUpdateChecker(registration, {
    getOnline: () => navigator.onLine,
    getVisible: () => document.visibilityState === "visible",
    now: () => Date.now(),
    addOnlineListener: (listener) => {
      window.addEventListener("online", listener);
      return () => window.removeEventListener("online", listener);
    },
    addVisibilityListener: (listener) => {
      document.addEventListener("visibilitychange", listener);
      return () => document.removeEventListener("visibilitychange", listener);
    },
    setInterval: (listener, intervalMs) =>
      window.setInterval(listener, intervalMs),
    clearInterval: (intervalId) =>
      window.clearInterval(intervalId as number)
  });

  return checker.start();
}

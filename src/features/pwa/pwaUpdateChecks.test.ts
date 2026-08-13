import { describe, expect, it, vi } from "vitest";
import {
  createPwaUpdateChecker,
  PWA_UPDATE_CHECK_INTERVAL_MS,
  type PwaUpdateCheckEnvironment
} from "./pwaUpdateChecks";

function createEnvironment() {
  let online = true;
  let visible = true;
  let now = PWA_UPDATE_CHECK_INTERVAL_MS;
  let onlineListener: () => void = () => undefined;
  let visibilityListener: () => void = () => undefined;
  let intervalListener: () => void = () => undefined;
  const removeOnline = vi.fn();
  const removeVisibility = vi.fn();
  const clearInterval = vi.fn();

  const environment: PwaUpdateCheckEnvironment = {
    getOnline: () => online,
    getVisible: () => visible,
    now: () => now,
    addOnlineListener: (listener) => {
      onlineListener = listener;
      return removeOnline;
    },
    addVisibilityListener: (listener) => {
      visibilityListener = listener;
      return removeVisibility;
    },
    setInterval: (listener) => {
      intervalListener = listener;
      return 17;
    },
    clearInterval
  };

  return {
    environment,
    setOnline: (value: boolean) => {
      online = value;
    },
    setVisible: (value: boolean) => {
      visible = value;
    },
    advance: (milliseconds: number) => {
      now += milliseconds;
    },
    emitOnline: () => onlineListener(),
    emitVisibility: () => visibilityListener(),
    emitInterval: () => intervalListener(),
    removeOnline,
    removeVisibility,
    clearInterval
  };
}

describe("foreground PWA update checks", () => {
  it("skips network checks while offline or hidden", async () => {
    const fixture = createEnvironment();
    const update = vi.fn(async () => undefined);
    const checker = createPwaUpdateChecker(
      { update },
      fixture.environment
    );

    fixture.setOnline(false);
    await expect(checker.check()).resolves.toBe(false);
    fixture.setOnline(true);
    fixture.setVisible(false);
    await expect(checker.check()).resolves.toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("checks once on a foreground event and throttles repeated events", async () => {
    const fixture = createEnvironment();
    const update = vi.fn(async () => undefined);
    const checker = createPwaUpdateChecker(
      { update },
      fixture.environment
    );
    checker.start();

    fixture.emitVisibility();
    await Promise.resolve();
    fixture.emitOnline();
    await Promise.resolve();

    expect(update).toHaveBeenCalledOnce();
  });

  it("checks again after the safe interval and absorbs registration errors", async () => {
    const fixture = createEnvironment();
    const update = vi
      .fn<() => Promise<void>>()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockImplementationOnce(() => {
        throw new Error("registration unavailable");
      });
    const checker = createPwaUpdateChecker(
      { update },
      fixture.environment
    );

    await expect(checker.check()).resolves.toBe(true);
    fixture.advance(PWA_UPDATE_CHECK_INTERVAL_MS);
    await expect(checker.check()).resolves.toBe(false);
    fixture.advance(PWA_UPDATE_CHECK_INTERVAL_MS);
    await expect(checker.check()).resolves.toBe(false);
    expect(update).toHaveBeenCalledTimes(3);
  });

  it("uses an hourly timer and removes every listener on cleanup", async () => {
    const fixture = createEnvironment();
    const update = vi.fn(async () => undefined);
    const checker = createPwaUpdateChecker(
      { update },
      fixture.environment
    );
    const stop = checker.start();

    fixture.emitInterval();
    await Promise.resolve();
    expect(update).toHaveBeenCalledOnce();

    stop();
    expect(fixture.removeOnline).toHaveBeenCalledOnce();
    expect(fixture.removeVisibility).toHaveBeenCalledOnce();
    expect(fixture.clearInterval).toHaveBeenCalledWith(17);
  });
});

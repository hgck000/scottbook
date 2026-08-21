import { describe, expect, it } from "vitest";
import { shouldWaitForLocalData } from "./localDataReadiness";

describe("local data startup readiness", () => {
  it("waits for the authoritative IndexedDB snapshot before interaction", () => {
    expect(shouldWaitForLocalData("checking", true)).toBe(true);
  });

  it("does not block the localStorage fallback when IndexedDB is unavailable", () => {
    expect(shouldWaitForLocalData("checking", false)).toBe(false);
  });

  it.each(["ready", "fallback"] as const)(
    "does not wait after storage reaches %s",
    (phase) => {
      expect(shouldWaitForLocalData(phase, true)).toBe(false);
    }
  );
});

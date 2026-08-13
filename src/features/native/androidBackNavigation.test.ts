import { describe, expect, it } from "vitest";
import { getAndroidBackAction } from "./androidBackNavigation";

describe("Android hardware Back navigation", () => {
  it("exits only from the library root", () => {
    expect(getAndroidBackAction("#/", true)).toBe("exit");
    expect(getAndroidBackAction("", false)).toBe("exit");
  });

  it("uses WebView history for an existing ScottBook route", () => {
    expect(getAndroidBackAction("#/read/hsk1-my-morning", true)).toBe(
      "history"
    );
  });

  it("returns a directly opened deep link to the library", () => {
    expect(getAndroidBackAction("#/review", false)).toBe("home");
  });
});

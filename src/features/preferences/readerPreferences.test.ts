import { describe, expect, it } from "vitest";
import {
  isReaderPreferences,
  validateReaderPreferences
} from "./readerPreferences";

describe("reader preference migration", () => {
  it("defaults a v0.10 two-field snapshot to word assistance", () => {
    expect(
      validateReaderPreferences({ theme: "night", fontSize: 29 })
    ).toEqual({
      theme: "night",
      fontSize: 29,
      assistanceScope: "word",
      fontFamily: "serif",
      lineHeight: "comfortable",
      contentWidth: "balanced"
    });
  });

  it("migrates v0.11 preferences while keeping the assistance scope", () => {
    const preferences = {
      theme: "paper" as const,
      fontSize: 25,
      assistanceScope: "sentence" as const
    };

    expect(isReaderPreferences(preferences)).toBe(false);
    expect(validateReaderPreferences(preferences)).toEqual({
      ...preferences,
      fontFamily: "serif",
      lineHeight: "comfortable",
      contentWidth: "balanced"
    });
  });

  it("keeps a complete current personalization snapshot", () => {
    const preferences = {
      theme: "oled" as const,
      fontSize: 31,
      assistanceScope: "character" as const,
      fontFamily: "sans" as const,
      lineHeight: "airy" as const,
      contentWidth: "wide" as const
    };

    expect(isReaderPreferences(preferences)).toBe(true);
    expect(validateReaderPreferences(preferences)).toEqual(preferences);
  });

  it("rejects unknown fields and unsupported personalization values", () => {
    expect(
      validateReaderPreferences({
        theme: "paper",
        fontSize: 25,
        assistanceScope: "paragraph"
      })
    ).toBeNull();
    expect(
      validateReaderPreferences({
        theme: "paper",
        fontSize: 25,
        assistanceScope: "word",
        fontFamily: "sans",
        lineHeight: "tight",
        contentWidth: "wide"
      })
    ).toBeNull();
    expect(
      validateReaderPreferences({
        theme: "paper",
        fontSize: 25,
        assistanceScope: "word",
        unsafe: true
      })
    ).toBeNull();
  });
});

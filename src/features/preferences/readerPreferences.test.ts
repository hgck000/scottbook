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
      assistanceScope: "word"
    });
  });

  it("keeps a valid current assistance scope", () => {
    const preferences = {
      theme: "paper" as const,
      fontSize: 25,
      assistanceScope: "sentence" as const
    };

    expect(isReaderPreferences(preferences)).toBe(true);
    expect(validateReaderPreferences(preferences)).toEqual(preferences);
  });

  it("rejects unknown fields and unsupported scopes", () => {
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
        unsafe: true
      })
    ).toBeNull();
  });
});

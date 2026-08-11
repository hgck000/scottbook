import { describe, expect, it } from "vitest";
import { advanceAssistance } from "./assistance";

describe("assistance interaction", () => {
  it("cycles one token through pinyin, meaning, and closed", () => {
    const pinyin = advanceAssistance(null, "sentence:token");
    expect(pinyin).toEqual({ key: "sentence:token", level: 1 });

    const meaning = advanceAssistance(pinyin, "sentence:token");
    expect(meaning).toEqual({ key: "sentence:token", level: 2 });

    expect(advanceAssistance(meaning, "sentence:token")).toBeNull();
  });

  it("starts at pinyin when the reader selects another token", () => {
    expect(
      advanceAssistance({ key: "old-token", level: 2 }, "new-token")
    ).toEqual({ key: "new-token", level: 1 });
  });
});

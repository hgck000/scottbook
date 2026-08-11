import { describe, expect, it } from "vitest";
import { builtInLibrary } from "./builtInLibrary";
import { formatValidationIssues, validateBuiltInLibrary } from "./validateLibrary";

describe("built-in ScottBook library", () => {
  it("ships a fully annotated offline article for each pilot level", () => {
    expect(builtInLibrary.map((article) => article.level)).toEqual([
      "HSK 1",
      "HSK 2",
      "HSK 3"
    ]);
  });

  it("contains no missing pinyin, meanings or sentence translations", () => {
    const issues = validateBuiltInLibrary(builtInLibrary);
    expect(formatValidationIssues(issues)).toBe("");
  });

  it("contains only authored annotations and no remote content URL", () => {
    const serialized = JSON.stringify(builtInLibrary);
    expect(serialized).not.toMatch(/https?:\/\//);
    expect(serialized).not.toMatch(/apiKey|provider|endpoint/i);
  });
});

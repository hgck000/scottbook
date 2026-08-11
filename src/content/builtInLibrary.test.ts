import { describe, expect, it } from "vitest";
import { builtInLibrary } from "./builtInLibrary";
import type { BuiltInArticle } from "./types";
import { formatValidationIssues, validateBuiltInLibrary } from "./validateLibrary";

describe("built-in ScottBook library", () => {
  it("ships a fully annotated offline article for each pilot level", () => {
    expect(builtInLibrary.map((article) => article.level)).toEqual([
      "HSK 1",
      "HSK 2",
      "HSK 3"
    ]);
  });

  it("contains no missing character, word, or sentence annotations", () => {
    const issues = validateBuiltInLibrary(builtInLibrary);
    expect(formatValidationIssues(issues)).toBe("");
  });

  it("contains only authored annotations and no remote content URL", () => {
    const serialized = JSON.stringify(builtInLibrary);
    expect(serialized).not.toMatch(/https?:\/\//);
    expect(serialized).not.toMatch(/apiKey|provider|endpoint/i);
  });

  it("rejects a word when even one character annotation is missing", () => {
    const incompleteArticle = structuredClone(
      builtInLibrary[0]
    ) as BuiltInArticle;
    const firstWord = incompleteArticle.paragraphs[0]?.sentences[0]?.tokens.find(
      (token) => token.kind === "word" && token.characters.length > 1
    );
    if (!firstWord || firstWord.kind !== "word") {
      throw new Error("multi-character fixture expected");
    }
    firstWord.characters = firstWord.characters.slice(1);

    expect(validateBuiltInLibrary([incompleteArticle])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "every character requires one authored annotation"
        })
      ])
    );
  });
});

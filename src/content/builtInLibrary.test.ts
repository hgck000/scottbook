import { describe, expect, it } from "vitest";
import { builtInLibrary } from "./builtInLibrary";
import type { BuiltInArticle } from "./types";
import { formatValidationIssues, validateBuiltInLibrary } from "./validateLibrary";

describe("built-in ScottBook library", () => {
  it("ships nine balanced pilot articles with four sentences each", () => {
    expect(builtInLibrary).toHaveLength(9);
    for (const level of ["HSK 1", "HSK 2", "HSK 3"] as const) {
      expect(
        builtInLibrary.filter((article) => article.level === level)
      ).toHaveLength(3);
    }
    for (const article of builtInLibrary) {
      const sentenceCount = article.paragraphs.reduce(
        (count, paragraph) => count + paragraph.sentences.length,
        0
      );
      expect(sentenceCount).toBe(4);
    }
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

  it("rejects incomplete metadata and duplicate paragraph ids", () => {
    const malformedArticle = structuredClone(
      builtInLibrary[0]
    ) as BuiltInArticle;
    malformedArticle.summary = "";
    malformedArticle.estimatedMinutes = 0;
    malformedArticle.paragraphs[1]!.id = malformedArticle.paragraphs[0]!.id;

    expect(validateBuiltInLibrary([malformedArticle])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "summary is required" }),
        expect.objectContaining({
          message: "estimated minutes must be a positive integer"
        }),
        expect.objectContaining({
          message: "paragraph id must be unique in article"
        })
      ])
    );
  });
});

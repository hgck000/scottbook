import { describe, expect, it } from "vitest";
import { builtInLibrary } from "./builtInLibrary";
import type { BuiltInArticle } from "./types";
import { formatValidationIssues, validateBuiltInLibrary } from "./validateLibrary";

describe("built-in ScottBook library", () => {
  it("ships nine medium-to-long readings for every supported HSK level", () => {
    expect(builtInLibrary).toHaveLength(27);
    const accentByLevel = {
      "HSK 1": "jade",
      "HSK 2": "amber",
      "HSK 3": "coral"
    } as const;
    for (const level of ["HSK 1", "HSK 2", "HSK 3"] as const) {
      const levelArticles = builtInLibrary.filter((article) => article.level === level);
      expect(levelArticles).toHaveLength(9);
      expect(levelArticles.every((article) => article.accent === accentByLevel[level])).toBe(true);
      expect(
        levelArticles.filter((article) =>
          ["May mặc", "Công sở", "Thời trang", "Thiết kế"].includes(article.topic)
        ).length
      ).toBeGreaterThanOrEqual(3);
    }
    for (const article of builtInLibrary) {
      expect(article.paragraphs).toHaveLength(2);
      const sentenceCount = article.paragraphs.reduce(
        (count, paragraph) => count + paragraph.sentences.length,
        0
      );
      expect(sentenceCount).toBe(10);
      expect(
        article.paragraphs.every((paragraph) =>
          Boolean(
            paragraph.sectionTitle &&
              paragraph.sectionTitlePinyin &&
              paragraph.sectionTitleTranslation
          )
        )
      ).toBe(true);
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

  it("keeps contextual pinyin and concise meanings in the generated pack", () => {
    const wordTokens = builtInLibrary.flatMap((article) =>
      article.paragraphs.flatMap((paragraph) =>
        paragraph.sentences.flatMap((sentence) =>
          sentence.tokens.filter((token) => token.kind === "word")
        )
      )
    );

    expect(
      wordTokens
        .filter((token) => token.hanzi === "了")
        .every((token) => token.pinyin === "le")
    ).toBe(true);
    expect(
      wordTokens.find((token) => token.hanzi === "十分钟")
    ).toMatchObject({ pinyin: "shí fēn zhōng", meaning: "mười phút" });
    expect(
      wordTokens.find((token) => token.hanzi === "汉语课")
    ).toMatchObject({ pinyin: "hàn yǔ kè", meaning: "tiết học tiếng Trung" });
    expect(builtInLibrary[0]?.titlePinyin).toBe("Wǒ de zǎo shang");
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
    malformedArticle.paragraphs[0]!.sectionTitle = "";

    expect(validateBuiltInLibrary([malformedArticle])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "summary is required" }),
        expect.objectContaining({ message: "section title is required" }),
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

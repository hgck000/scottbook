import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  countArticlesByLength,
  countArticlesByTopic,
  filterDiscoverArticles,
  getArticleLength,
  getArticleLengthLabel,
  getArticleMetadata
} from "./articleCatalog";

describe("offline discover catalog", () => {
  it("derives stable authored reading metadata without changing content", () => {
    const article = builtInLibrary.find(
      (candidate) => candidate.id === "hsk1-my-morning"
    );
    if (!article) throw new Error("Expected the HSK 1 morning article");

    expect(getArticleMetadata(article)).toEqual({
      paragraphCount: 2,
      sentenceCount: 4,
      wordCount: 19,
      characterCount: 31,
      length: "short"
    });
  });

  it("uses a transparent duration grouping for all authored articles", () => {
    expect(getArticleLength(2)).toBe("short");
    expect(getArticleLength(3)).toBe("medium");
    expect(getArticleLength(4)).toBe("long");
    expect(getArticleLengthLabel("long")).toBe("Dài · từ 4 phút");
    expect(countArticlesByLength(builtInLibrary)).toEqual({
      short: 3,
      medium: 3,
      long: 3
    });
  });

  it("combines level, topic, and length filters using only offline metadata", () => {
    expect(
      filterDiscoverArticles(builtInLibrary, {
        level: "HSK 2",
        topic: "Học tập",
        length: "medium"
      }).map((article) => article.id)
    ).toEqual(["hsk2-library-visit"]);
    expect(
      filterDiscoverArticles(builtInLibrary, {
        level: "all",
        topic: "Đời sống",
        length: "all"
      }).map((article) => article.id)
    ).toEqual([
      "hsk1-my-morning",
      "hsk1-my-family",
      "hsk2-shopping-with-mom",
      "hsk3-keep-a-promise"
    ]);
    expect(countArticlesByTopic(builtInLibrary)).toEqual({
      "Đời sống": 4,
      "Kế hoạch": 1,
      "Học tập": 4
    });
  });
});

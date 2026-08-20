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
      sentenceCount: 10,
      wordCount: 63,
      characterCount: 95,
      length: "medium"
    });
  });

  it("uses a transparent duration grouping for all authored articles", () => {
    expect(getArticleLength(3)).toBe("short");
    expect(getArticleLength(4)).toBe("medium");
    expect(getArticleLength(6)).toBe("long");
    expect(getArticleLengthLabel("long")).toBe("Dài · từ 6 phút");
    expect(countArticlesByLength(builtInLibrary)).toEqual({
      short: 0,
      medium: 18,
      long: 27
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
      "hsk1-birthday-noodles",
      "hsk2-lost-umbrella",
      "hsk2-cook-with-neighbor",
      "hsk3-keep-a-promise",
      "hsk3-missed-bus",
      "hsk3-grandma-smartphone",
      "hsk4-lost-camera",
      "hsk4-family-trip-change",
      "hsk5-recording-grandfather",
      "hsk5-listening-volunteer"
    ]);
    expect(countArticlesByTopic(builtInLibrary)).toEqual({
      "Đời sống": 12,
      "Kế hoạch": 8,
      "Học tập": 7,
      "May mặc": 3,
      "Công sở": 7,
      "Thời trang": 4,
      "Thiết kế": 4
    });
  });
});

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

    const metadata = getArticleMetadata(article);
    expect(metadata).toEqual({
      paragraphCount: 2,
      sentenceCount: 10,
      wordCount: 63,
      characterCount: 95,
      length: "medium"
    });
    expect(getArticleMetadata(article)).toBe(metadata);
  });

  it("uses a transparent duration grouping for all authored articles", () => {
    expect(getArticleLength(3)).toBe("short");
    expect(getArticleLength(4)).toBe("medium");
    expect(getArticleLength(6)).toBe("long");
    expect(getArticleLengthLabel("long")).toBe("Dài · từ 6 phút");
    expect(countArticlesByLength(builtInLibrary)).toEqual({
      short: 0,
      medium: 18,
      long: 87
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
      "hsk1-story-red-umbrella",
      "hsk1-story-grandma-birthday",
      "hsk1-story-uncle-home",
      "hsk1-story-new-neighbor-dinner",
      "hsk1-story-white-cat",
      "hsk1-story-grandfather-glasses",
      "hsk1-story-zoo-closed",
      "hsk1-story-village-boat",
      "hsk2-story-cooking-day",
      "hsk2-story-birthday-surprise",
      "hsk2-story-lost-cat-notice",
      "hsk2-story-grandpa-garden",
      "hsk3-story-neighborhood-market",
      "hsk3-story-family-album",
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
      "Đời sống": 26,
      "Kế hoạch": 20,
      "Học tập": 16,
      "May mặc": 11,
      "Công sở": 14,
      "Thời trang": 6,
      "Thiết kế": 12
    });
  });
});

import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  filterArticleVocabulary,
  getArticleVocabulary
} from "./articleVocabulary";

const morningArticle = builtInLibrary.find(
  (article) => article.id === "hsk1-my-morning"
);

if (!morningArticle) throw new Error("morning article fixture is missing");

describe("offline article vocabulary", () => {
  it("keeps unique authored word types in first-reading order", () => {
    const entries = getArticleVocabulary(morningArticle);

    expect(entries).toHaveLength(16);
    expect(entries.slice(0, 4).map((entry) => entry.hanzi)).toEqual([
      "早上",
      "六点",
      "我",
      "起床"
    ]);
    expect(entries.find((entry) => entry.hanzi === "高兴")).toMatchObject({
      pinyin: "gāoxìng",
      meaning: "vui"
    });
  });

  it("retains every sentence occurrence for a repeated word", () => {
    const entry = getArticleVocabulary(morningArticle).find(
      (item) => item.hanzi === "我"
    );

    expect(entry?.occurrences).toHaveLength(4);
    expect(entry?.occurrences.map((occurrence) => occurrence.sentenceId)).toEqual([
      "s1",
      "s2",
      "s3",
      "s4"
    ]);
  });

  it("searches Hanzi, tone-free pinyin, compact pinyin, and Vietnamese", () => {
    const entries = getArticleVocabulary(morningArticle);

    expect(filterArticleVocabulary(entries, "高兴").map((item) => item.hanzi)).toEqual([
      "高兴"
    ]);
    expect(filterArticleVocabulary(entries, "gao").map((item) => item.hanzi)).toEqual([
      "高兴"
    ]);
    expect(filterArticleVocabulary(entries, "liudian").map((item) => item.hanzi)).toEqual([
      "六点"
    ]);
    expect(filterArticleVocabulary(entries, "buoi sang").map((item) => item.hanzi)).toEqual([
      "早上"
    ]);
    expect(filterArticleVocabulary(entries, "bua sang").map((item) => item.hanzi)).toEqual([
      "早饭"
    ]);
  });

  it("returns the full list for a blank query and no rows for a miss", () => {
    const entries = getArticleVocabulary(morningArticle);

    expect(filterArticleVocabulary(entries, "   ")).toHaveLength(16);
    expect(filterArticleVocabulary(entries, "khong-co-tu-nay")).toEqual([]);
  });
});

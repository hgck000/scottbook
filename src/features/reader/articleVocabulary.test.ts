import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  filterArticleVocabulary,
  getArticleVocabulary,
  getLibraryVocabularyContexts
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

  it("keeps the authored Hanzi and translation for context comparison", () => {
    const entry = getArticleVocabulary(morningArticle).find(
      (item) => item.hanzi === "我"
    );

    expect(entry?.occurrences[0]).toEqual({
      sentenceId: "s1",
      sentenceText: "早上六点，我起床。",
      sentenceTranslation: "Sáu giờ sáng, tôi thức dậy."
    });
    expect(entry?.occurrences[3]).toEqual({
      sentenceId: "s4",
      sentenceText: "今天有汉语课，我很高兴。",
      sentenceTranslation: "Hôm nay có tiết tiếng Trung, tôi rất vui."
    });
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

  it("groups an exact vocabulary identity across the offline library", () => {
    const entry = getArticleVocabulary(morningArticle).find(
      (item) => item.hanzi === "我"
    );
    if (!entry) throw new Error("repeated word fixture is missing");

    const groups = getLibraryVocabularyContexts(builtInLibrary, entry);

    expect(groups).toHaveLength(9);
    expect(
      groups.reduce((total, group) => total + group.occurrences.length, 0)
    ).toBe(25);
    expect(groups[0]).toMatchObject({
      articleId: "hsk1-my-morning",
      articleTitle: "我的早上",
      articleTitleTranslation: "Buổi sáng của tôi",
      articleLevel: "HSK 1"
    });
    expect(groups[0]?.occurrences).toHaveLength(4);
  });

  it("finds library repetition even when the current article has one occurrence", () => {
    const entry = getArticleVocabulary(morningArticle).find(
      (item) => item.hanzi === "学校"
    );
    if (!entry) throw new Error("single article occurrence fixture is missing");

    const groups = getLibraryVocabularyContexts(builtInLibrary, entry);

    expect(entry.occurrences).toHaveLength(1);
    expect(groups).toHaveLength(3);
    expect(
      groups.reduce((total, group) => total + group.occurrences.length, 0)
    ).toBe(3);
  });

  it("does not merge the same Hanzi with a different authored reading or meaning", () => {
    const entry = getArticleVocabulary(morningArticle).find(
      (item) => item.hanzi === "我"
    );
    if (!entry) throw new Error("repeated word fixture is missing");

    const changedIdentity = {
      ...entry,
      pinyin: "wò",
      id: JSON.stringify([entry.hanzi, "wò", entry.meaning])
    };

    expect(
      getLibraryVocabularyContexts(builtInLibrary, changedIdentity)
    ).toEqual([]);
  });
});

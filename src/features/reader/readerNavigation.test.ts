import { describe, expect, it } from "vitest";
import {
  createReaderHash,
  createVocabularyReaderHash,
  parseReaderHash
} from "./readerNavigation";

describe("reader context navigation", () => {
  it("keeps the normal reader route backward compatible", () => {
    expect(createReaderHash("hsk1-my-morning")).toBe(
      "#/read/hsk1-my-morning"
    );
    expect(parseReaderHash("#/read/hsk1-my-morning")).toEqual({
      articleId: "hsk1-my-morning"
    });
  });

  it("round-trips an exact saved sentence without unsafe path characters", () => {
    const hash = createReaderHash("article/中文", "sentence 4/最后");

    expect(hash).toBe(
      "#/read/article%2F%E4%B8%AD%E6%96%87/context/sentence%204%2F%E6%9C%80%E5%90%8E"
    );
    expect(parseReaderHash(hash)).toEqual({
      articleId: "article/中文",
      contextSentenceId: "sentence 4/最后",
      contextSource: "review"
    });
  });

  it("round-trips a cross-article vocabulary context with its return article", () => {
    const hash = createVocabularyReaderHash(
      "target/文章",
      "sentence 2/二",
      "origin/开始"
    );

    expect(hash).toBe(
      "#/read/target%2F%E6%96%87%E7%AB%A0/context/sentence%202%2F%E4%BA%8C/from-vocabulary/origin%2F%E5%BC%80%E5%A7%8B"
    );
    expect(parseReaderHash(hash)).toEqual({
      articleId: "target/文章",
      contextSentenceId: "sentence 2/二",
      contextSource: "vocabulary",
      returnArticleId: "origin/开始"
    });
  });

  it("rejects unrelated, incomplete, and malformed hashes", () => {
    expect(parseReaderHash("#/review")).toBeNull();
    expect(parseReaderHash("#/read/article/context/")).toBeNull();
    expect(
      parseReaderHash("#/read/article/context/s1/from-vocabulary/")
    ).toBeNull();
    expect(parseReaderHash("#/read/%E0%A4%A")).toBeNull();
  });
});

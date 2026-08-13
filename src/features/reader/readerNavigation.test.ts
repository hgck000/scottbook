import { describe, expect, it } from "vitest";
import { createReaderHash, parseReaderHash } from "./readerNavigation";

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
      contextSentenceId: "sentence 4/最后"
    });
  });

  it("rejects unrelated, incomplete, and malformed hashes", () => {
    expect(parseReaderHash("#/review")).toBeNull();
    expect(parseReaderHash("#/read/article/context/")).toBeNull();
    expect(parseReaderHash("#/read/%E0%A4%A")).toBeNull();
  });
});

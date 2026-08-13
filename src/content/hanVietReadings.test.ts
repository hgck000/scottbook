import { describe, expect, it } from "vitest";
import { builtInLibrary } from "./builtInLibrary";
import { getHanVietReading } from "./hanVietReadings";

describe("offline Hán-Việt readings", () => {
  it("resolves common simplified words through Unicode variants", () => {
    expect(getHanVietReading("学习")?.display).toBe("học tập");
    expect(getHanVietReading("汉字")?.display).toBe("hán tự");
  });

  it("preserves possible readings instead of guessing one", () => {
    const reading = getHanVietReading("行", ["xíng"]);
    expect(reading?.ambiguous).toBe(true);
    expect(reading?.display).toMatch(/^\(.+\)$/u);
  });

  it("covers every authored word and character in the built-in library", () => {
    const missing = new Set<string>();
    for (const article of builtInLibrary) {
      for (const paragraph of article.paragraphs) {
        for (const sentence of paragraph.sentences) {
          for (const token of sentence.tokens) {
            if (token.kind !== "word") continue;
            if (
              !getHanVietReading(
                token.hanzi,
                token.characters.map((character) => character.pinyin)
              )
            ) {
              missing.add(token.hanzi);
            }
            for (const character of token.characters) {
              if (!getHanVietReading(character.hanzi, [character.pinyin])) {
                missing.add(character.hanzi);
              }
            }
          }
        }
      }
    }
    expect([...missing]).toEqual([]);
  });
});

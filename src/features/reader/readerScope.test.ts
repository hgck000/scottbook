import { describe, expect, it } from "vitest";
import type { AnnotatedSentence } from "../../content/types";
import {
  getSentenceAssistanceUnits,
  getSentencePinyin,
  getTokenAssistanceUnits
} from "./readerScope";

const sentence: AnnotatedSentence = {
  id: "s1",
  translation: "Sáu giờ sáng, tôi thức dậy.",
  tokens: [
    {
      id: "t1",
      kind: "word",
      hanzi: "早上",
      pinyin: "zǎoshang",
      meaning: "buổi sáng",
      characters: [
        { hanzi: "早", pinyin: "zǎo", meaning: "sớm" },
        { hanzi: "上", pinyin: "shang", meaning: "trong 早上: buổi sáng" }
      ]
    },
    { id: "p1", kind: "punctuation", hanzi: "，" },
    {
      id: "t2",
      kind: "word",
      hanzi: "我",
      pinyin: "wǒ",
      meaning: "tôi",
      characters: [{ hanzi: "我", pinyin: "wǒ", meaning: "tôi" }]
    },
    { id: "p2", kind: "punctuation", hanzi: "。" }
  ]
};

describe("reader assistance scopes", () => {
  it("keeps authored characters separate from their parent word", () => {
    const token = sentence.tokens[0];
    if (!token || token.kind !== "word") {
      throw new Error("word fixture expected");
    }

    expect(getTokenAssistanceUnits(token, "character")).toMatchObject([
      { id: "character:t1:0", scope: "character", hanzi: "早", pinyin: "zǎo" },
      { id: "character:t1:1", scope: "character", hanzi: "上", pinyin: "shang" }
    ]);
    expect(getTokenAssistanceUnits(token, "word")).toMatchObject([
      { id: "word:t1", scope: "word", hanzi: "早上", pinyin: "zǎoshang" }
    ]);
  });

  it("builds sentence pinyin only from authored word readings", () => {
    expect(getSentencePinyin(sentence)).toBe("zǎoshang， wǒ。");
    expect(getSentenceAssistanceUnits(sentence, "sentence")).toEqual([
      {
        id: "sentence:s1",
        scope: "sentence",
        hanzi: "早上，我。",
        pinyin: "zǎoshang， wǒ。",
        meaning: "Sáu giờ sáng, tôi thức dậy."
      }
    ]);
  });
});

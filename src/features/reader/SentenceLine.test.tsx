import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AnnotatedSentence, WordToken } from "../../content/types";
import { SentenceLine } from "./SentenceLine";
import {
  getNextReaderTokenIndex,
  getReaderTokenLabel
} from "./readerAccessibility";
import { getTokenAssistanceUnits } from "./readerScope";

const token: WordToken = {
  id: "w1",
  kind: "word",
  hanzi: "学习",
  pinyin: "xuéxí",
  meaning: "học tập",
  characters: [
    { hanzi: "学", pinyin: "xué", meaning: "học" },
    { hanzi: "习", pinyin: "xí", meaning: "luyện tập" }
  ]
};

describe("reader keyboard and screen-reader behavior", () => {
  it("moves within token boundaries with arrows, Home, and End", () => {
    expect(getNextReaderTokenIndex(2, 5, "ArrowRight")).toBe(3);
    expect(getNextReaderTokenIndex(4, 5, "ArrowRight")).toBe(4);
    expect(getNextReaderTokenIndex(2, 5, "ArrowLeft")).toBe(1);
    expect(getNextReaderTokenIndex(0, 5, "ArrowLeft")).toBe(0);
    expect(getNextReaderTokenIndex(3, 5, "Home")).toBe(0);
    expect(getNextReaderTokenIndex(1, 5, "End")).toBe(4);
    expect(getNextReaderTokenIndex(2, 5, "Enter")).toBe(2);
  });

  it("announces the next assistance level instead of a generic tap label", () => {
    const key = "s1:word:w1";
    const unit = getTokenAssistanceUnits(token, "word")[0];
    if (!unit) throw new Error("word unit expected");
    expect(getReaderTokenLabel(unit, null, key)).toContain("mở pinyin");
    expect(
      getReaderTokenLabel(unit, { key, level: 1 }, key)
    ).toContain("xuéxí; mở nghĩa");
    expect(
      getReaderTokenLabel(unit, { key, level: 2 }, key)
    ).toContain("học tập; đóng trợ giúp");
  });

  it("renders a selected token as an expanded disclosure", () => {
    const sentence: AnnotatedSentence = {
      id: "s1",
      translation: "Tôi học tiếng Trung.",
      tokens: [token, { id: "p1", kind: "punctuation", hanzi: "。" }]
    };

    const markup = renderToStaticMarkup(
      <SentenceLine
        sentence={sentence}
        scope="word"
        selection={{ key: "s1:word:w1", level: 1 }}
        chooseUnit={() => undefined}
      />
    );

    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('aria-controls="reader-assistance"');
    expect(markup).toContain('lang="zh-Hans"');
    expect(markup).not.toContain("aria-pressed");
  });

  it("marks an exact review context as a focusable reader target", () => {
    const sentence: AnnotatedSentence = {
      id: "s4",
      translation: "Hôm nay tôi rất vui.",
      tokens: [token]
    };

    const markup = renderToStaticMarkup(
      <SentenceLine
        sentence={sentence}
        scope="word"
        selection={null}
        chooseUnit={() => undefined}
        targetSource="review"
      />
    );

    expect(markup).toContain('class="sentence context-target"');
    expect(markup).toContain('data-context-target="true"');
    expect(markup).toContain('data-sentence-id="s4"');
    expect(markup).toContain('tabindex="-1"');
  });

  it("distinguishes a vocabulary jump from a Review context", () => {
    const sentence: AnnotatedSentence = {
      id: "s2",
      translation: "Tôi học từ trong bài.",
      tokens: [token]
    };

    const markup = renderToStaticMarkup(
      <SentenceLine
        sentence={sentence}
        scope="word"
        selection={null}
        chooseUnit={() => undefined}
        targetSource="vocabulary"
      />
    );

    expect(markup).toContain('class="sentence context-target"');
    expect(markup).toContain('data-vocabulary-target="true"');
    expect(markup).not.toContain("data-context-target");
    expect(markup).toContain('tabindex="-1"');
  });
});

describe("long-reader rendering budget", () => {
  it("renders a 20,000-character annotated sentence within two seconds", () => {
    const tokens: WordToken[] = Array.from({ length: 2_500 }, (_, index) => ({
      id: `word-${index}`,
      kind: "word",
      hanzi: "学习中文很有意思",
      pinyin: "xuéxí Zhōngwén hěn yǒuyìsi",
      meaning: "học tiếng Trung rất thú vị",
      characters: Array.from("学习中文很有意思").map((hanzi) => ({
        hanzi,
        pinyin: "fixture",
        meaning: "fixture"
      }))
    }));
    const sentence: AnnotatedSentence = {
      id: "long-sentence",
      translation: "Performance fixture only.",
      tokens
    };

    const startedAt = performance.now();
    const markup = renderToStaticMarkup(
      <SentenceLine
        sentence={sentence}
        scope="word"
        selection={null}
        chooseUnit={() => undefined}
      />
    );
    const elapsed = performance.now() - startedAt;

    expect(tokens.reduce((sum, item) => sum + item.hanzi.length, 0)).toBe(
      20_000
    );
    expect(markup.length).toBeGreaterThan(20_000);
    expect(elapsed).toBeLessThan(2_000);
  });
});

import { describe, expect, it } from "vitest";
import {
  createEmptyAssistanceHistory,
  deleteAssistanceItem,
  getAssistanceItemId,
  markAssistanceKnown,
  recordAssistance,
  setAssistanceRecording,
  toggleAssistancePinned,
  validateAssistanceHistorySnapshot
} from "./assistanceHistory";

const baseInput = {
  articleId: "hsk1-my-morning",
  sentenceId: "s1",
  sentenceText: "早上六点，我起床。",
  sentenceTranslation: "Sáu giờ sáng, tôi thức dậy.",
  hanzi: "早上",
  pinyin: "zǎoshang",
  meaning: "buổi sáng",
  scope: "word" as const,
  level: "pinyin" as const,
  occurredAt: 100
};

describe("assistance review history", () => {
  it("keeps pinyin and meaning needs distinct while aggregating contexts", () => {
    const pinyin = recordAssistance(createEmptyAssistanceHistory(), baseInput);
    const meaning = recordAssistance(pinyin, {
      ...baseInput,
      level: "meaning",
      occurredAt: 120
    });
    const anotherContext = recordAssistance(meaning, {
      ...baseInput,
      articleId: "another-article",
      sentenceId: "sentence-2",
      sentenceText: "今天早上我学习中文。",
      sentenceTranslation: "Sáng nay tôi học tiếng Trung.",
      occurredAt: 150
    });

    const item = anotherContext.items[getAssistanceItemId(baseInput)];
    expect(item).toMatchObject({
      pinyinCount: 2,
      meaningCount: 1,
      firstSeenAt: 100,
      lastSeenAt: 150,
      knownAt: null
    });
    expect(item?.contexts).toHaveLength(2);
    expect(item?.contexts[0]).toMatchObject({
      articleId: "another-article",
      seenCount: 1
    });
  });

  it("supports pin, known, relearn, delete, and recording opt-out", () => {
    const itemId = getAssistanceItemId(baseInput);
    const recorded = recordAssistance(createEmptyAssistanceHistory(), baseInput);
    const pinned = toggleAssistancePinned(recorded, itemId);
    const known = markAssistanceKnown(pinned, itemId, 200);
    expect(known.items[itemId]).toMatchObject({ pinned: true, knownAt: 200 });

    const relearned = recordAssistance(known, {
      ...baseInput,
      occurredAt: 300
    });
    expect(relearned.items[itemId]?.knownAt).toBeNull();

    const disabled = setAssistanceRecording(relearned, false);
    expect(
      recordAssistance(disabled, { ...baseInput, occurredAt: 400 })
    ).toBe(disabled);
    expect(deleteAssistanceItem(disabled, itemId).items).toEqual({});
  });

  it("rejects a corrupt external snapshot instead of partially importing it", () => {
    const state = recordAssistance(createEmptyAssistanceHistory(), baseInput);
    const itemId = getAssistanceItemId(baseInput);
    const corrupt = {
      ...state,
      items: {
        ...state.items,
        [itemId]: { ...state.items[itemId], meaningCount: 2 }
      }
    };

    expect(validateAssistanceHistorySnapshot(state)).toEqual(state);
    expect(validateAssistanceHistorySnapshot(corrupt)).toBeNull();
  });

  it("keeps character and word evidence separate for a one-character token", () => {
    const word = recordAssistance(createEmptyAssistanceHistory(), {
      ...baseInput,
      hanzi: "我",
      pinyin: "wǒ",
      meaning: "tôi"
    });
    const character = recordAssistance(word, {
      ...baseInput,
      scope: "character",
      hanzi: "我",
      pinyin: "wǒ",
      meaning: "tôi",
      occurredAt: 200
    });

    expect(Object.values(character.items).map((item) => item.scope)).toEqual([
      "word",
      "character"
    ]);
  });

  it("does not turn whole-sentence help into a review item", () => {
    const state = createEmptyAssistanceHistory();
    const result = recordAssistance(state, {
      ...baseInput,
      scope: "sentence",
      hanzi: "早上六点，我起床。",
      pinyin: "zǎoshang liù diǎn, wǒ qǐchuáng.",
      meaning: "Sáu giờ sáng, tôi thức dậy.",
      level: "meaning"
    });

    expect(result).toBe(state);
  });

  it("drops sentence records saved by an earlier release", () => {
    const current = recordAssistance(createEmptyAssistanceHistory(), baseInput);
    const sentenceId = getAssistanceItemId({
      scope: "sentence",
      hanzi: "早上六点，我起床。",
      pinyin: "zǎoshang liù diǎn, wǒ qǐchuáng.",
      meaning: "Sáu giờ sáng, tôi thức dậy."
    });
    const sentenceItem = {
      id: sentenceId,
      scope: "sentence",
      hanzi: "早上六点，我起床。",
      pinyin: "zǎoshang liù diǎn, wǒ qǐchuáng.",
      meaning: "Sáu giờ sáng, tôi thức dậy.",
      pinyinCount: 1,
      meaningCount: 1,
      firstSeenAt: 100,
      lastSeenAt: 100,
      knownAt: null,
      pinned: false,
      contexts: [{
        id: JSON.stringify([baseInput.articleId, baseInput.sentenceId]),
        articleId: baseInput.articleId,
        sentenceId: baseInput.sentenceId,
        sentenceText: baseInput.sentenceText,
        sentenceTranslation: baseInput.sentenceTranslation,
        seenCount: 1,
        lastSeenAt: 100
      }]
    };

    expect(validateAssistanceHistorySnapshot({
      ...current,
      items: { ...current.items, [sentenceId]: sentenceItem }
    })).toEqual(current);
  });

  it("migrates v1 review items to word-scoped v2 identifiers", () => {
    const current = recordAssistance(createEmptyAssistanceHistory(), baseInput);
    const currentItem = Object.values(current.items)[0];
    if (!currentItem) throw new Error("review fixture expected");
    const { scope, ...legacyItem } = currentItem;
    expect(scope).toBe("word");
    const legacyId = JSON.stringify([
      legacyItem.hanzi,
      legacyItem.pinyin,
      legacyItem.meaning
    ]);
    const legacy = {
      version: 1,
      recordingEnabled: true,
      items: { [legacyId]: { ...legacyItem, id: legacyId } }
    };

    expect(validateAssistanceHistorySnapshot(legacy)).toEqual(current);
  });

  it("ignores identifiers whose derived storage key exceeds its safe bound", () => {
    const state = createEmptyAssistanceHistory();

    expect(
      recordAssistance(state, {
        ...baseInput,
        articleId: "a".repeat(2_000)
      })
    ).toBe(state);
  });
});

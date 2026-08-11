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

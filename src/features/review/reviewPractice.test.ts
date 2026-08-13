import { describe, expect, it } from "vitest";
import {
  createEmptyAssistanceHistory,
  markAssistanceKnown,
  recordAssistance,
  toggleAssistancePinned
} from "./assistanceHistory";
import {
  advanceReviewPracticeStage,
  createReviewPracticeQueue
} from "./reviewPractice";

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

function createMixedItems() {
  let history = recordAssistance(createEmptyAssistanceHistory(), baseInput);
  history = recordAssistance(history, {
    ...baseInput,
    sentenceId: "s2",
    hanzi: "学习",
    pinyin: "xuéxí",
    meaning: "học tập",
    level: "meaning",
    occurredAt: 200
  });
  history = recordAssistance(history, {
    ...baseInput,
    sentenceId: "s3",
    hanzi: "中文",
    pinyin: "Zhōngwén",
    meaning: "tiếng Trung",
    occurredAt: 300
  });

  const items = Object.values(history.items);
  const morning = items.find((item) => item.hanzi === "早上");
  const chinese = items.find((item) => item.hanzi === "中文");
  if (!morning || !chinese) throw new Error("review fixture is incomplete");
  history = toggleAssistancePinned(history, morning.id);
  return markAssistanceKnown(history, chinese.id, 400);
}

describe("quick review practice", () => {
  it("prioritizes pinned active evidence and excludes known items", () => {
    const queue = createReviewPracticeQueue(
      Object.values(createMixedItems().items)
    );

    expect(queue.map((item) => item.hanzi)).toEqual(["早上", "学习"]);
  });

  it("limits a practice session without mutating the stored collection", () => {
    const items = Object.values(createMixedItems().items);
    const queue = createReviewPracticeQueue(items, 1);

    expect(queue).toHaveLength(1);
    expect(items).toHaveLength(3);
    expect(createReviewPracticeQueue(items, -1)).toEqual([]);
  });

  it("reveals help in the same Hanzi to pinyin to meaning order as Reader", () => {
    expect(advanceReviewPracticeStage("hanzi")).toBe("pinyin");
    expect(advanceReviewPracticeStage("pinyin")).toBe("meaning");
    expect(advanceReviewPracticeStage("meaning")).toBe("meaning");
  });
});

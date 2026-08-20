import { describe, expect, it } from "vitest";
import {
  createEmptyAssistanceHistory,
  recordAssistance,
  toggleAssistancePinned
} from "./assistanceHistory";
import {
  countAssistanceReviewItems,
  filterAssistanceReviewItems,
  type AssistanceReviewDiscoveryFilters
} from "./reviewDiscovery";

const filters: AssistanceReviewDiscoveryFilters = {
  filter: "reading",
  scope: "all",
  query: "",
  sort: "priority"
};

function createItems() {
  let history = createEmptyAssistanceHistory();
  history = recordAssistance(history, {
    articleId: "hsk1-my-morning",
    sentenceId: "s1",
    sentenceText: "早上六点，我起床。",
    sentenceTranslation: "Sáu giờ sáng, tôi thức dậy.",
    hanzi: "早上",
    pinyin: "zǎoshang",
    meaning: "buổi sáng",
    scope: "word",
    level: "pinyin",
    occurredAt: 100
  });
  history = recordAssistance(history, {
    articleId: "hsk2-weekend-plan",
    sentenceId: "s2",
    sentenceText: "我们去公园吧。",
    sentenceTranslation: "Chúng ta đi công viên nhé.",
    hanzi: "公",
    pinyin: "gōng",
    meaning: "công; công cộng",
    scope: "character",
    level: "meaning",
    occurredAt: 200
  });
  const wordId = Object.values(history.items).find(
    (item) => item.hanzi === "早上"
  )?.id;
  return wordId ? toggleAssistancePinned(history, wordId) : history;
}

describe("review discovery", () => {
  it("searches Hanzi, untoned pinyin, Vietnamese meaning, and saved context", () => {
    const items = Object.values(createItems().items);

    expect(filterAssistanceReviewItems(items, { ...filters, query: "zaosh" })).toHaveLength(1);
    expect(filterAssistanceReviewItems(items, { ...filters, filter: "meaning", query: "công viên" })).toHaveLength(1);
    expect(filterAssistanceReviewItems(items, { ...filters, filter: "meaning", query: "cong cong" })).toHaveLength(1);
  });

  it("combines need, scope, and sorting without changing stored items", () => {
    const items = Object.values(createItems().items);
    const result = filterAssistanceReviewItems(items, {
      ...filters,
      filter: "meaning",
      scope: "character",
      sort: "alphabetical"
    });

    expect(result.map((item) => item.scope)).toEqual(["character"]);
    expect(items).toHaveLength(2);
  });

  it("reports the stable counts used by the need filters", () => {
    expect(countAssistanceReviewItems(Object.values(createItems().items))).toEqual({
      reading: 1,
      meaning: 1,
      known: 0
    });
  });
});

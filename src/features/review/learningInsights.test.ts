import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  createEmptyAssistanceHistory,
  markAssistanceKnown,
  recordAssistance
} from "./assistanceHistory";
import { getArticleAssistanceInsights } from "./learningInsights";

const morningAssistance = {
  articleId: "hsk1-my-morning",
  sentenceId: "s1",
  sentenceText: "早上六点，我起床。",
  sentenceTranslation: "Sáu giờ sáng, tôi thức dậy.",
  hanzi: "早上",
  pinyin: "zǎo shang",
  meaning: "buổi sáng sớm",
  scope: "word" as const,
  level: "pinyin" as const,
  occurredAt: 100
};

describe("per-article learning insights", () => {
  it("derives word coverage and review counts from existing local evidence", () => {
    let history = recordAssistance(
      createEmptyAssistanceHistory(),
      morningAssistance
    );
    history = recordAssistance(history, {
      ...morningAssistance,
      level: "meaning",
      occurredAt: 110
    });
    history = recordAssistance(history, {
      ...morningAssistance,
      hanzi: "六点",
      pinyin: "liù diǎn",
      meaning: "sáu giờ",
      occurredAt: 120
    });

    const insight = getArticleAssistanceInsights(
      builtInLibrary,
      history
    ).find((item) => item.article.id === morningAssistance.articleId);

    expect(insight).toBeDefined();
    expect(insight).toMatchObject({
      assistedWordTypes: 2,
      assistanceOpens: 3,
      activeReviewItems: 2,
      knownReviewItems: 0,
      lastAssistedAt: 120
    });
    expect(insight?.assistedWordPercent).toBeGreaterThan(0);
    expect(insight?.assistedWordPercent).toBeLessThanOrEqual(100);
  });

  it("counts one assisted word across repeated contexts and keeps known evidence", () => {
    let history = recordAssistance(
      createEmptyAssistanceHistory(),
      morningAssistance
    );
    history = recordAssistance(history, {
      ...morningAssistance,
      sentenceId: "s2",
      sentenceText: "早上我学习中文。",
      sentenceTranslation: "Buổi sáng tôi học tiếng Trung.",
      occurredAt: 200
    });
    const itemId = Object.keys(history.items)[0];
    if (!itemId) throw new Error("assistance fixture is incomplete");
    history = markAssistanceKnown(history, itemId, 300);

    const insight = getArticleAssistanceInsights(
      builtInLibrary,
      history
    ).find((item) => item.article.id === morningAssistance.articleId);

    expect(insight).toMatchObject({
      assistedWordTypes: 1,
      assistanceOpens: 2,
      activeReviewItems: 0,
      knownReviewItems: 1,
      lastAssistedAt: 200
    });
  });

  it("puts articles with evidence first and returns stable zeroes for the rest", () => {
    const history = recordAssistance(
      createEmptyAssistanceHistory(),
      morningAssistance
    );
    const insights = getArticleAssistanceInsights(builtInLibrary, history);

    expect(insights).toHaveLength(105);
    expect(insights[0]?.article.id).toBe(morningAssistance.articleId);
    expect(insights.at(-1)).toMatchObject({
      assistedWordTypes: 0,
      assistedWordPercent: 0,
      assistanceOpens: 0,
      activeReviewItems: 0,
      knownReviewItems: 0,
      lastAssistedAt: 0
    });
  });
});

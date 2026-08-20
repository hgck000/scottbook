import {
  isReviewableAssistanceItem,
  type AssistanceReviewItem
} from "./assistanceHistory";

export const MAX_QUICK_REVIEW_ITEMS = 20;

export type ReviewPracticeStage = "hanzi" | "pinyin" | "meaning";

export function createReviewPracticeQueue(
  items: readonly AssistanceReviewItem[],
  limit = MAX_QUICK_REVIEW_ITEMS
): AssistanceReviewItem[] {
  const safeLimit = Number.isSafeInteger(limit) && limit > 0 ? limit : 0;

  return items
    .filter((item) => isReviewableAssistanceItem(item) && item.knownAt === null)
    .sort(
      (left, right) =>
        Number(right.pinned) - Number(left.pinned) ||
        right.meaningCount - left.meaningCount ||
        right.pinyinCount + right.meaningCount -
          (left.pinyinCount + left.meaningCount) ||
        right.lastSeenAt - left.lastSeenAt ||
        left.hanzi.localeCompare(right.hanzi, "zh-Hans")
    )
    .slice(0, safeLimit);
}

export function advanceReviewPracticeStage(
  stage: ReviewPracticeStage
): ReviewPracticeStage {
  if (stage === "hanzi") return "pinyin";
  return "meaning";
}

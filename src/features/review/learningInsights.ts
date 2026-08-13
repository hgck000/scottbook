import type { BuiltInArticle } from "../../content/types";
import {
  getAssistanceItemId,
  type AssistanceHistoryState
} from "./assistanceHistory";

export type ArticleAssistanceInsight = {
  article: BuiltInArticle;
  totalWordTypes: number;
  assistedWordTypes: number;
  assistedWordPercent: number;
  assistanceOpens: number;
  activeReviewItems: number;
  knownReviewItems: number;
  lastAssistedAt: number;
};

function getArticleWordTypeIds(article: BuiltInArticle): Set<string> {
  const ids = new Set<string>();

  for (const paragraph of article.paragraphs) {
    for (const sentence of paragraph.sentences) {
      for (const token of sentence.tokens) {
        if (token.kind !== "word") continue;
        ids.add(
          getAssistanceItemId({
            scope: "word",
            hanzi: token.hanzi,
            pinyin: token.pinyin,
            meaning: token.meaning
          })
        );
      }
    }
  }

  return ids;
}

export function getArticleAssistanceInsights(
  articles: readonly BuiltInArticle[],
  history: AssistanceHistoryState
): ArticleAssistanceInsight[] {
  const historyItems = Object.values(history.items);

  return articles
    .map((article) => {
      const wordTypeIds = getArticleWordTypeIds(article);
      const assistedWordTypeIds = new Set<string>();
      let assistanceOpens = 0;
      let activeReviewItems = 0;
      let knownReviewItems = 0;
      let lastAssistedAt = 0;

      for (const item of historyItems) {
        const articleContexts = item.contexts.filter(
          (context) => context.articleId === article.id
        );
        if (articleContexts.length === 0) continue;

        if (item.knownAt === null) activeReviewItems += 1;
        else knownReviewItems += 1;

        if (item.scope === "word" && wordTypeIds.has(item.id)) {
          assistedWordTypeIds.add(item.id);
        }

        for (const context of articleContexts) {
          assistanceOpens += context.seenCount;
          lastAssistedAt = Math.max(lastAssistedAt, context.lastSeenAt);
        }
      }

      const assistedWordTypes = assistedWordTypeIds.size;
      return {
        article,
        totalWordTypes: wordTypeIds.size,
        assistedWordTypes,
        assistedWordPercent:
          wordTypeIds.size === 0
            ? 0
            : Math.min(100, Math.round((assistedWordTypes / wordTypeIds.size) * 100)),
        assistanceOpens,
        activeReviewItems,
        knownReviewItems,
        lastAssistedAt
      };
    })
    .sort(
      (left, right) =>
        Number(right.assistanceOpens > 0) - Number(left.assistanceOpens > 0) ||
        right.assistedWordPercent - left.assistedWordPercent ||
        right.activeReviewItems - left.activeReviewItems ||
        right.assistanceOpens - left.assistanceOpens ||
        right.lastAssistedAt - left.lastAssistedAt ||
        left.article.id.localeCompare(right.article.id)
    );
}

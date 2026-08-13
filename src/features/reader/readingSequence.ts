import type { BuiltInArticle } from "../../content/types";
import type { LibraryState } from "../library/readingState";

export type NextReadingReason = "new" | "in-progress" | "revisit";

export type NextReadingChoice = {
  article: BuiltInArticle;
  reason: NextReadingReason;
};

function isCompleted(state: LibraryState, articleId: string): boolean {
  return state.historyByArticle[articleId]?.completedAt != null;
}

/**
 * Keeps reading order deterministic and entirely local. Starting immediately
 * after the open article, ScottBook wraps once through the authored catalog and
 * selects the first unfinished article. Only a fully completed catalog falls
 * back to the next authored article as a reread.
 */
export function getNextReadingChoice(
  articles: readonly BuiltInArticle[],
  currentArticleId: string,
  state: LibraryState
): NextReadingChoice | null {
  if (articles.length < 2) return null;

  const currentIndex = articles.findIndex(
    (article) => article.id === currentArticleId
  );
  if (currentIndex < 0) return null;

  const following = Array.from(
    { length: articles.length - 1 },
    (_, offset) => articles[(currentIndex + offset + 1) % articles.length]
  ).filter((article): article is BuiltInArticle => article !== undefined);
  const unfinished = following.find(
    (article) => !isCompleted(state, article.id)
  );

  if (unfinished) {
    return {
      article: unfinished,
      reason: state.historyByArticle[unfinished.id]
        ? "in-progress"
        : "new"
    };
  }

  if (!isCompleted(state, currentArticleId)) return null;

  const next = following[0];
  return next ? { article: next, reason: "revisit" } : null;
}

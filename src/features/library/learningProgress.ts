import type { BuiltInArticle, HskLevel } from "../../content/types";
import type { LibraryState } from "./readingState";

export const LEARNING_PROGRESS_LEVELS = ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5"] as const;

export type LevelLearningProgress = {
  level: HskLevel;
  total: number;
  completed: number;
  inProgress: number;
  unread: number;
  progressPercent: number;
};

export type LearningProgressOverview = {
  total: number;
  completed: number;
  inProgress: number;
  unread: number;
  progressPercent: number;
  continueArticleId: string | null;
  byLevel: LevelLearningProgress[];
};

type ArticleProgress = {
  article: BuiltInArticle;
  completed: boolean;
  inProgress: boolean;
  progressPercent: number;
  lastOpenedAt: number;
};

function getArticleProgress(
  article: BuiltInArticle,
  state: LibraryState
): ArticleProgress {
  const savedProgress = state.progressByArticle[article.id]?.progressPercent ?? 0;
  const history = state.historyByArticle[article.id];
  const completed = history?.completedAt !== null && history?.completedAt !== undefined;
  const inProgress = !completed && history !== undefined;

  return {
    article,
    completed,
    inProgress,
    progressPercent: completed ? 100 : savedProgress,
    lastOpenedAt: history?.lastOpenedAt ?? 0
  };
}

function summarizeLevel(
  level: HskLevel,
  articles: readonly ArticleProgress[]
): LevelLearningProgress {
  const matching = articles.filter((item) => item.article.level === level);
  const completed = matching.filter((item) => item.completed).length;
  const inProgress = matching.filter((item) => item.inProgress).length;
  const progressTotal = matching.reduce(
    (total, item) => total + item.progressPercent,
    0
  );

  return {
    level,
    total: matching.length,
    completed,
    inProgress,
    unread: matching.length - completed - inProgress,
    progressPercent:
      matching.length === 0 ? 0 : Math.round(progressTotal / matching.length)
  };
}

export function getLearningProgressOverview(
  articles: readonly BuiltInArticle[],
  state: LibraryState
): LearningProgressOverview {
  const articleProgress = articles.map((article) =>
    getArticleProgress(article, state)
  );
  const completed = articleProgress.filter((item) => item.completed).length;
  const inProgressItems = articleProgress
    .filter((item) => item.inProgress)
    .sort((left, right) => right.lastOpenedAt - left.lastOpenedAt);
  const progressTotal = articleProgress.reduce(
    (total, item) => total + item.progressPercent,
    0
  );

  return {
    total: articleProgress.length,
    completed,
    inProgress: inProgressItems.length,
    unread: articleProgress.length - completed - inProgressItems.length,
    progressPercent:
      articleProgress.length === 0
        ? 0
        : Math.round(progressTotal / articleProgress.length),
    continueArticleId: inProgressItems[0]?.article.id ?? null,
    byLevel: LEARNING_PROGRESS_LEVELS.map((level) =>
      summarizeLevel(level, articleProgress)
    )
  };
}

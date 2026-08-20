import type { BuiltInArticle, HskLevel } from "../../content/types";
import type { LibraryState } from "./readingState";

export type LibraryLevelFilter = "all" | HskLevel;
export type LibraryStatusFilter =
  | "all"
  | "in-progress"
  | "completed"
  | "favorites";

export type LibraryDiscoveryFilters = {
  query: string;
  level: LibraryLevelFilter;
  status: LibraryStatusFilter;
};

export function normalizeLibrarySearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .replace(/\s+/g, " ")
    .trim();
}

type ArticleSearchIndex = {
  text: string;
  words: readonly string[];
};

const articleSearchIndex = new WeakMap<BuiltInArticle, ArticleSearchIndex>();

function createArticleSearchIndex(article: BuiltInArticle): ArticleSearchIndex {
  const authoredContent = article.paragraphs.flatMap((paragraph) =>
    paragraph.sentences.flatMap((sentence) => [
      sentence.translation,
      ...sentence.tokens.flatMap((token) =>
        token.kind === "word"
          ? [token.hanzi, token.pinyin, token.pinyin.replace(/\s+/gu, ""), token.meaning]
          : [token.hanzi]
      )
    ])
  );

  const text = normalizeLibrarySearchText(
    [
      article.title,
      article.titlePinyin,
      article.titlePinyin.replace(/\s+/gu, ""),
      article.titleTranslation,
      article.summary,
      article.level,
      article.topic,
      ...article.paragraphs.flatMap((paragraph) => [
        paragraph.sectionTitle ?? "",
        paragraph.sectionTitlePinyin ?? "",
        paragraph.sectionTitlePinyin?.replace(/\s+/gu, "") ?? "",
        paragraph.sectionTitleTranslation ?? ""
      ]),
      ...authoredContent
    ].join(" ")
  );
  return {
    text,
    words: text.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  };
}

function getArticleSearchIndex(article: BuiltInArticle): ArticleSearchIndex {
  const cached = articleSearchIndex.get(article);
  if (cached) return cached;
  const index = createArticleSearchIndex(article);
  articleSearchIndex.set(article, index);
  return index;
}

function matchesStatus(
  articleId: string,
  status: LibraryStatusFilter,
  state: LibraryState
): boolean {
  if (status === "all") return true;
  if (status === "favorites") {
    return state.favoriteArticleIds.includes(articleId);
  }

  const completed =
    state.historyByArticle[articleId]?.completedAt !== null &&
    state.historyByArticle[articleId]?.completedAt !== undefined;
  if (status === "completed") return completed;

  return !completed && state.progressByArticle[articleId] !== undefined;
}

export function filterLibraryArticles(
  articles: readonly BuiltInArticle[],
  state: LibraryState,
  filters: LibraryDiscoveryFilters
): BuiltInArticle[] {
  const terms =
    normalizeLibrarySearchText(filters.query).match(/[\p{L}\p{N}]+/gu) ?? [];

  return articles.filter((article) => {
    if (filters.level !== "all" && article.level !== filters.level) {
      return false;
    }
    if (!matchesStatus(article.id, filters.status, state)) return false;
    if (terms.length === 0) return true;

    const searchIndex = getArticleSearchIndex(article);
    return terms.every((term) =>
      /^[a-z0-9]+$/.test(term)
        ? searchIndex.words.some((word) => word.startsWith(term))
        : searchIndex.text.includes(term)
    );
  });
}

export function countArticlesByLevel(
  articles: readonly BuiltInArticle[]
): Record<HskLevel, number> {
  const counts: Record<HskLevel, number> = {
    "HSK 1": 0,
    "HSK 2": 0,
    "HSK 3": 0,
    "HSK 4": 0,
    "HSK 5": 0
  };
  for (const article of articles) counts[article.level] += 1;
  return counts;
}

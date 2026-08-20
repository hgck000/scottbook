import type { BuiltInArticle, HskLevel } from "../../content/types";

export type ArticleTopic = BuiltInArticle["topic"];
export type DiscoverLevelFilter = "all" | HskLevel;
export type DiscoverTopicFilter = "all" | ArticleTopic;
export type ArticleLength = "short" | "medium" | "long";
export type DiscoverLengthFilter = "all" | ArticleLength;

export type DiscoverCatalogFilters = {
  level: DiscoverLevelFilter;
  topic: DiscoverTopicFilter;
  length: DiscoverLengthFilter;
};

export type ArticleMetadata = {
  paragraphCount: number;
  sentenceCount: number;
  wordCount: number;
  characterCount: number;
  length: ArticleLength;
};

const articleMetadataCache = new WeakMap<BuiltInArticle, ArticleMetadata>();

export const articleTopics = [
  "Đời sống",
  "Kế hoạch",
  "Học tập",
  "May mặc",
  "Công sở",
  "Thời trang",
  "Thiết kế"
] as const;

export function getArticleLength(estimatedMinutes: number): ArticleLength {
  if (estimatedMinutes <= 3) return "short";
  if (estimatedMinutes <= 5) return "medium";
  return "long";
}

export function getArticleLengthLabel(length: ArticleLength): string {
  return {
    short: "Ngắn · tối đa 3 phút",
    medium: "Vừa · khoảng 4–5 phút",
    long: "Dài · từ 6 phút"
  }[length];
}

export function getArticleMetadata(article: BuiltInArticle): ArticleMetadata {
  const cached = articleMetadataCache.get(article);
  if (cached) return cached;

  const sentences = article.paragraphs.flatMap((paragraph) => paragraph.sentences);
  const words = sentences.flatMap((sentence) =>
    sentence.tokens.filter((token) => token.kind === "word")
  );

  const metadata = {
    paragraphCount: article.paragraphs.length,
    sentenceCount: sentences.length,
    wordCount: words.length,
    characterCount: words.reduce(
      (total, word) => total + Array.from(word.hanzi).length,
      0
    ),
    length: getArticleLength(article.estimatedMinutes)
  };
  articleMetadataCache.set(article, metadata);
  return metadata;
}

export function filterDiscoverArticles(
  articles: readonly BuiltInArticle[],
  filters: DiscoverCatalogFilters
): BuiltInArticle[] {
  return articles.filter((article) => {
    if (filters.level !== "all" && article.level !== filters.level) {
      return false;
    }
    if (filters.topic !== "all" && article.topic !== filters.topic) {
      return false;
    }
    if (
      filters.length !== "all" &&
      getArticleLength(article.estimatedMinutes) !== filters.length
    ) {
      return false;
    }
    return true;
  });
}

export function countArticlesByTopic(
  articles: readonly BuiltInArticle[]
): Record<ArticleTopic, number> {
  const counts: Record<ArticleTopic, number> = {
    "Đời sống": 0,
    "Kế hoạch": 0,
    "Học tập": 0,
    "May mặc": 0,
    "Công sở": 0,
    "Thời trang": 0,
    "Thiết kế": 0
  };
  for (const article of articles) counts[article.topic] += 1;
  return counts;
}

export function countArticlesByLength(
  articles: readonly BuiltInArticle[]
): Record<ArticleLength, number> {
  const counts: Record<ArticleLength, number> = {
    short: 0,
    medium: 0,
    long: 0
  };
  for (const article of articles) {
    counts[getArticleLength(article.estimatedMinutes)] += 1;
  }
  return counts;
}

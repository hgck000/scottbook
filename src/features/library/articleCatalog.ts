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
  const sentences = article.paragraphs.flatMap((paragraph) => paragraph.sentences);
  const words = sentences.flatMap((sentence) =>
    sentence.tokens.filter((token) => token.kind === "word")
  );

  return {
    paragraphCount: article.paragraphs.length,
    sentenceCount: sentences.length,
    wordCount: words.length,
    characterCount: words.reduce(
      (total, word) => total + Array.from(word.hanzi).length,
      0
    ),
    length: getArticleLength(article.estimatedMinutes)
  };
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
  return articles.reduce<Record<ArticleTopic, number>>(
    (counts, article) => ({
      ...counts,
      [article.topic]: counts[article.topic] + 1
    }),
    {
      "Đời sống": 0,
      "Kế hoạch": 0,
      "Học tập": 0,
      "May mặc": 0,
      "Công sở": 0,
      "Thời trang": 0,
      "Thiết kế": 0
    }
  );
}

export function countArticlesByLength(
  articles: readonly BuiltInArticle[]
): Record<ArticleLength, number> {
  return articles.reduce<Record<ArticleLength, number>>(
    (counts, article) => ({
      ...counts,
      [getArticleLength(article.estimatedMinutes)]:
        counts[getArticleLength(article.estimatedMinutes)] + 1
    }),
    { short: 0, medium: 0, long: 0 }
  );
}

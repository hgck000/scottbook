import type { BuiltInArticle, ReaderArticle } from "../../content/types";
import { normalizeLibrarySearchText } from "../library/libraryDiscovery";
import { getSentenceText } from "./readerScope";

export type ArticleVocabularyOccurrence = {
  sentenceId: string;
  sentenceText: string;
  sentenceTranslation: string;
};

export type ArticleVocabularyEntry = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  occurrences: readonly ArticleVocabularyOccurrence[];
};

export type LibraryVocabularyContextGroup = {
  articleId: string;
  articleTitle: string;
  articleTitleTranslation: string;
  articleLevel: BuiltInArticle["level"];
  occurrences: readonly ArticleVocabularyOccurrence[];
};

type MutableArticleVocabularyEntry = Omit<
  ArticleVocabularyEntry,
  "occurrences"
> & {
  occurrences: ArticleVocabularyOccurrence[];
};

type VocabularySearchIndex = {
  text: string;
  words: readonly string[];
};

const vocabularySearchIndexes = new WeakMap<
  ArticleVocabularyEntry,
  VocabularySearchIndex
>();
const libraryVocabularyContextIndexes = new WeakMap<
  readonly BuiltInArticle[],
  ReadonlyMap<string, readonly LibraryVocabularyContextGroup[]>
>();
const emptyLibraryVocabularyContexts: readonly LibraryVocabularyContextGroup[] = [];

function getVocabularyId(
  hanzi: string,
  pinyin: string,
  meaning: string
): string {
  return JSON.stringify([hanzi, pinyin, meaning]);
}

export function getArticleVocabulary(
  article: ReaderArticle
): ArticleVocabularyEntry[] {
  const entries = new Map<string, MutableArticleVocabularyEntry>();

  for (const paragraph of article.paragraphs) {
    for (const sentence of paragraph.sentences) {
      const occurrence = {
        sentenceId: sentence.id,
        sentenceText: getSentenceText(sentence),
        sentenceTranslation: sentence.translation
      };

      for (const token of sentence.tokens) {
        if (token.kind !== "word") continue;
        const id = getVocabularyId(token.hanzi, token.pinyin, token.meaning);
        const existing = entries.get(id);
        if (existing) {
          existing.occurrences.push(occurrence);
          continue;
        }

        entries.set(id, {
          id,
          hanzi: token.hanzi,
          pinyin: token.pinyin,
          meaning: token.meaning,
          occurrences: [occurrence]
        });
      }
    }
  }

  return [...entries.values()];
}

function matchesVocabularyQuery(
  entry: ArticleVocabularyEntry,
  query: string
): boolean {
  const terms = normalizeLibrarySearchText(query).match(/[\p{L}\p{N}]+/gu) ?? [];
  if (terms.length === 0) return true;

  let searchIndex = vocabularySearchIndexes.get(entry);
  if (!searchIndex) {
    const text = normalizeLibrarySearchText(
      [
        entry.hanzi,
        entry.pinyin,
        entry.pinyin.replace(/\s+/g, ""),
        entry.meaning
      ].join(" ")
    );
    searchIndex = {
      text,
      words: text.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
    };
    vocabularySearchIndexes.set(entry, searchIndex);
  }

  return terms.every((term) =>
    /^[a-z0-9]+$/.test(term)
      ? searchIndex.words.some((word) => word.startsWith(term))
      : searchIndex.text.includes(term)
  );
}

export function filterArticleVocabulary(
  entries: readonly ArticleVocabularyEntry[],
  query: string
): ArticleVocabularyEntry[] {
  return entries.filter((entry) => matchesVocabularyQuery(entry, query));
}

export function getLibraryVocabularyContexts(
  articles: readonly BuiltInArticle[],
  entry: ArticleVocabularyEntry
): readonly LibraryVocabularyContextGroup[] {
  let index = libraryVocabularyContextIndexes.get(articles);
  if (!index) {
    const mutableIndex = new Map<string, LibraryVocabularyContextGroup[]>();
    for (const article of articles) {
      for (const articleEntry of getArticleVocabulary(article)) {
        const group = {
          articleId: article.id,
          articleTitle: article.title,
          articleTitleTranslation: article.titleTranslation,
          articleLevel: article.level,
          occurrences: articleEntry.occurrences
        };
        const existing = mutableIndex.get(articleEntry.id);
        if (existing) existing.push(group);
        else mutableIndex.set(articleEntry.id, [group]);
      }
    }
    index = mutableIndex;
    libraryVocabularyContextIndexes.set(articles, index);
  }

  return index.get(entry.id) ?? emptyLibraryVocabularyContexts;
}

import type { BuiltInArticle } from "../../content/types";
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

function getVocabularyId(
  hanzi: string,
  pinyin: string,
  meaning: string
): string {
  return JSON.stringify([hanzi, pinyin, meaning]);
}

export function getArticleVocabulary(
  article: BuiltInArticle
): ArticleVocabularyEntry[] {
  const entries = new Map<string, ArticleVocabularyEntry>();

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
          entries.set(id, {
            ...existing,
            occurrences: [...existing.occurrences, occurrence]
          });
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

  const searchText = normalizeLibrarySearchText(
    [
      entry.hanzi,
      entry.pinyin,
      entry.pinyin.replace(/\s+/g, ""),
      entry.meaning
    ].join(" ")
  );
  const words = searchText.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  return terms.every((term) =>
    /^[a-z0-9]+$/.test(term)
      ? words.some((word) => word.startsWith(term))
      : searchText.includes(term)
  );
}

export function filterArticleVocabulary(
  entries: readonly ArticleVocabularyEntry[],
  query: string
): ArticleVocabularyEntry[] {
  return entries.filter((entry) => matchesVocabularyQuery(entry, query));
}

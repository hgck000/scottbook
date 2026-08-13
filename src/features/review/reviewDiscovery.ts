import { normalizeLibrarySearchText } from "../library/libraryDiscovery";
import type { ReaderAssistanceScope } from "../reader/readerScope";
import type { AssistanceReviewItem } from "./assistanceHistory";

export type AssistanceReviewFilter = "reading" | "meaning" | "known";
export type AssistanceReviewScopeFilter = "all" | ReaderAssistanceScope;
export type AssistanceReviewSort = "priority" | "recent" | "alphabetical";

export type AssistanceReviewDiscoveryFilters = {
  filter: AssistanceReviewFilter;
  scope: AssistanceReviewScopeFilter;
  query: string;
  sort: AssistanceReviewSort;
};

function matchesNeed(item: AssistanceReviewItem, filter: AssistanceReviewFilter) {
  if (filter === "known") return item.knownAt !== null;
  if (item.knownAt !== null) return false;
  return filter === "meaning" ? item.meaningCount > 0 : item.meaningCount === 0;
}

function getSearchText(item: AssistanceReviewItem): string {
  return normalizeLibrarySearchText(
    [
      item.hanzi,
      item.pinyin,
      item.meaning,
      ...item.contexts.flatMap((context) => [
        context.sentenceText,
        context.sentenceTranslation
      ])
    ].join(" ")
  );
}

function matchesQuery(item: AssistanceReviewItem, query: string): boolean {
  const terms = normalizeLibrarySearchText(query).match(/[\p{L}\p{N}]+/gu) ?? [];
  if (terms.length === 0) return true;

  const searchText = getSearchText(item);
  const words = searchText.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return terms.every((term) =>
    /^[a-z0-9]+$/.test(term)
      ? words.some((word) => word.startsWith(term))
      : searchText.includes(term)
  );
}

function compareItems(sort: AssistanceReviewSort) {
  if (sort === "alphabetical") {
    return (left: AssistanceReviewItem, right: AssistanceReviewItem) =>
      left.hanzi.localeCompare(right.hanzi, "zh-Hans") ||
      right.lastSeenAt - left.lastSeenAt;
  }

  if (sort === "recent") {
    return (left: AssistanceReviewItem, right: AssistanceReviewItem) =>
      right.lastSeenAt - left.lastSeenAt ||
      left.hanzi.localeCompare(right.hanzi, "zh-Hans");
  }

  return (left: AssistanceReviewItem, right: AssistanceReviewItem) =>
    Number(right.pinned) - Number(left.pinned) ||
    right.meaningCount - left.meaningCount ||
    right.lastSeenAt - left.lastSeenAt ||
    left.hanzi.localeCompare(right.hanzi, "zh-Hans");
}

export function filterAssistanceReviewItems(
  items: readonly AssistanceReviewItem[],
  filters: AssistanceReviewDiscoveryFilters
): AssistanceReviewItem[] {
  return items
    .filter(
      (item) =>
        matchesNeed(item, filters.filter) &&
        (filters.scope === "all" || item.scope === filters.scope) &&
        matchesQuery(item, filters.query)
    )
    .sort(compareItems(filters.sort));
}

export function countAssistanceReviewItems(
  items: readonly AssistanceReviewItem[]
): Record<AssistanceReviewFilter, number> {
  return {
    reading: items.filter((item) => matchesNeed(item, "reading")).length,
    meaning: items.filter((item) => matchesNeed(item, "meaning")).length,
    known: items.filter((item) => matchesNeed(item, "known")).length
  };
}

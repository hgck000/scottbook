import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  createEmptyLibraryState,
  markArticleCompleted,
  markArticleOpened,
  toggleFavoriteArticle,
  updateReadingProgress
} from "./readingState";
import {
  countArticlesByLevel,
  filterLibraryArticles,
  normalizeLibrarySearchText,
  type LibraryDiscoveryFilters
} from "./libraryDiscovery";

const DEFAULT_FILTERS: LibraryDiscoveryFilters = {
  query: "",
  level: "all",
  status: "all"
};

describe("offline library discovery", () => {
  it("normalizes Vietnamese accents and pinyin tone marks", () => {
    expect(normalizeLibrarySearchText("Hiểu · Xiān lǐjiě · Đọc")).toBe(
      "hieu · xian lijie · doc"
    );
  });

  it("searches authored Hanzi, untoned pinyin, and Vietnamese content", () => {
    const state = createEmptyLibraryState();

    expect(
      filterLibraryArticles(builtInLibrary, state, {
        ...DEFAULT_FILTERS,
        query: "Xiān lǐjiě fānyì"
      }).map((article) => article.id)
    ).toEqual(["hsk3-understand-first"]);
    expect(
      filterLibraryArticles(builtInLibrary, state, {
        ...DEFAULT_FILTERS,
        query: "公园"
      }).map((article) => article.id)
    ).toEqual([
      "hsk1-my-family",
      "hsk1-rainy-day",
      "hsk1-story-grandma-blue-coat",
      "hsk1-story-rainy-picnic",
      "hsk1-story-grandfather-glasses",
      "hsk3-story-park-signs",
      "hsk2-weekend-plan",
      "hsk3-fashion-window",
      "hsk5-old-tree-debate"
    ]);
    const VietnameseSearchResults = filterLibraryArticles(builtInLibrary, state, {
      ...DEFAULT_FILTERS,
      query: "dich tung chu"
    }).map((article) => article.id);
    expect(VietnameseSearchResults).toContain("hsk3-understand-first");
  });

  it("combines level and multi-term search filters", () => {
    const result = filterLibraryArticles(
      builtInLibrary,
      createEmptyLibraryState(),
      {
        query: "zhōumò jìhuà",
        level: "HSK 2",
        status: "all"
      }
    );

    expect(result.map((article) => article.id)).toEqual([
      "hsk2-story-book-exchange",
      "hsk2-weekend-plan"
    ]);
  });

  it("filters in-progress, completed, and favorite articles", () => {
    const opened = markArticleOpened(
      createEmptyLibraryState(),
      "hsk1-my-morning",
      100
    );
    const inProgress = updateReadingProgress(
      opened,
      {
        articleId: "hsk1-my-morning",
        sentenceId: "s2",
        progressPercent: 50,
        updatedAt: 200
      }
    );
    const favorite = toggleFavoriteArticle(
      inProgress,
      "hsk2-weekend-plan"
    );
    const completed = markArticleCompleted(
      markArticleOpened(favorite, "hsk3-understand-first", 300),
      "hsk3-understand-first",
      "s4",
      400
    );

    expect(
      filterLibraryArticles(builtInLibrary, completed, {
        ...DEFAULT_FILTERS,
        status: "in-progress"
      }).map((article) => article.id)
    ).toEqual(["hsk1-my-morning"]);
    expect(
      filterLibraryArticles(builtInLibrary, completed, {
        ...DEFAULT_FILTERS,
        status: "completed"
      }).map((article) => article.id)
    ).toEqual(["hsk3-understand-first"]);
    expect(
      filterLibraryArticles(builtInLibrary, completed, {
        ...DEFAULT_FILTERS,
        status: "favorites"
      }).map((article) => article.id)
    ).toEqual(["hsk2-weekend-plan"]);
  });

  it("reports stable counts for every supported level", () => {
    expect(countArticlesByLevel(builtInLibrary)).toEqual({
      "HSK 1": 39,
      "HSK 2": 24,
      "HSK 3": 24,
      "HSK 4": 9,
      "HSK 5": 9
    });
  });
});

import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  LEGACY_LIBRARY_STATE_STORAGE_KEY,
  LIBRARY_STATE_BACKUP_STORAGE_KEY,
  LIBRARY_STATE_STORAGE_KEY,
  createEmptyLibraryState,
  getArticleSentenceIds,
  getSentenceProgressPercent,
  loadLibraryState,
  markArticleCompleted,
  markArticleOpened,
  parseLibraryState,
  persistLibraryState,
  resetArticleProgress,
  toggleFavoriteArticle,
  updateReadingProgress,
  validateLibraryStateSnapshot
} from "./readingState";

describe("local library state", () => {
  it("falls back safely when stored JSON is missing or corrupt", () => {
    expect(parseLibraryState(null)).toEqual(createEmptyLibraryState());
    expect(parseLibraryState("not-json")).toEqual(createEmptyLibraryState());
    expect(parseLibraryState('{"version":99}')).toEqual(
      createEmptyLibraryState()
    );
  });

  it("migrates v1 progress and favorites without losing reading data", () => {
    const migrated = parseLibraryState(
      JSON.stringify({
        version: 1,
        favoriteArticleIds: ["article-a", "article-a", 42],
        lastOpenedArticleId: "article-a",
        progressByArticle: {
          "article-a": {
            articleId: "article-a",
            sentenceId: "s2",
            progressPercent: 50,
            updatedAt: 123
          },
          "article-b": {
            articleId: "wrong-id",
            sentenceId: "s1",
            progressPercent: 150,
            updatedAt: 456
          }
        }
      })
    );

    expect(migrated.version).toBe(2);
    expect(migrated.favoriteArticleIds).toEqual(["article-a"]);
    expect(migrated.lastOpenedArticleId).toBe("article-a");
    expect(migrated.progressByArticle).toEqual({
      "article-a": {
        articleId: "article-a",
        sentenceId: "s2",
        progressPercent: 50,
        updatedAt: 123
      }
    });
    expect(migrated.historyByArticle["article-a"]).toEqual({
      articleId: "article-a",
      firstOpenedAt: 123,
      lastOpenedAt: 123,
      openCount: 1,
      completedAt: null
    });
  });

  it("records open count and toggles favorites without duplicating ids", () => {
    const firstOpen = markArticleOpened(
      createEmptyLibraryState(),
      "article-a",
      100
    );
    const secondOpen = markArticleOpened(firstOpen, "article-a", 200);
    const favorite = toggleFavoriteArticle(secondOpen, "article-a");
    const removed = toggleFavoriteArticle(favorite, "article-a");

    expect(secondOpen.lastOpenedArticleId).toBe("article-a");
    expect(secondOpen.historyByArticle["article-a"]).toEqual({
      articleId: "article-a",
      firstOpenedAt: 100,
      lastOpenedAt: 200,
      openCount: 2,
      completedAt: null
    });
    expect(favorite.favoriteArticleIds).toEqual(["article-a"]);
    expect(removed.favoriteArticleIds).toEqual([]);
  });

  it("records a sentence anchor, clamps percentage, and marks completion", () => {
    const progress = {
      articleId: "article-a",
      sentenceId: "s4",
      progressPercent: 101.4,
      updatedAt: 456
    };
    const updated = updateReadingProgress(createEmptyLibraryState(), progress);
    const duplicate = updateReadingProgress(updated, {
      ...progress,
      progressPercent: 100
    });

    expect(updated.lastOpenedArticleId).toBe("article-a");
    expect(updated.progressByArticle["article-a"]).toEqual({
      ...progress,
      progressPercent: 100
    });
    expect(updated.historyByArticle["article-a"]?.completedAt).toBe(456);
    expect(duplicate).toBe(updated);
  });

  it("can complete an article explicitly and reset only its progress", () => {
    const opened = markArticleOpened(
      createEmptyLibraryState(),
      "article-a",
      100
    );
    const inProgress = updateReadingProgress(opened, {
      articleId: "article-a",
      sentenceId: "s2",
      progressPercent: 50,
      updatedAt: 200
    });
    const completed = markArticleCompleted(
      inProgress,
      "article-a",
      "s4",
      300
    );
    const reset = resetArticleProgress(completed, "article-a");

    expect(completed.progressByArticle["article-a"]?.progressPercent).toBe(100);
    expect(completed.historyByArticle["article-a"]?.completedAt).toBe(300);
    expect(reset.progressByArticle["article-a"]).toBeUndefined();
    expect(reset.historyByArticle["article-a"]?.completedAt).toBeNull();
    expect(reset.historyByArticle["article-a"]?.openCount).toBe(1);
    expect(reset.lastOpenedArticleId).toBeNull();
  });

  it("loads a legacy storage key and persists the migrated v2 state", () => {
    const legacy = JSON.stringify({
      version: 1,
      favoriteArticleIds: ["article-a"],
      progressByArticle: {},
      lastOpenedArticleId: null
    });
    let current: string | null = null;
    const storage = {
      getItem: (key: string) => {
        if (key === LIBRARY_STATE_STORAGE_KEY) return current;
        return key === LEGACY_LIBRARY_STATE_STORAGE_KEY ? legacy : null;
      },
      setItem: (key: string, value: string) => {
        if (key === LIBRARY_STATE_STORAGE_KEY) current = value;
      }
    };

    const migrated = loadLibraryState(storage);
    expect(migrated.version).toBe(2);
    expect(migrated.favoriteArticleIds).toEqual(["article-a"]);
    expect(persistLibraryState(storage, migrated)).toBe(true);
    expect(current).not.toBeNull();
    expect(loadLibraryState(storage)).toEqual(migrated);
  });

  it("keeps the previous valid state and recovers when the main record is corrupt", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value)
    };
    const first = toggleFavoriteArticle(
      createEmptyLibraryState(),
      "article-a"
    );
    const second = toggleFavoriteArticle(first, "article-b");

    expect(persistLibraryState(storage, first)).toBe(true);
    expect(persistLibraryState(storage, second)).toBe(true);
    expect(
      parseLibraryState(values.get(LIBRARY_STATE_BACKUP_STORAGE_KEY) ?? null)
    ).toEqual(first);

    values.set(LIBRARY_STATE_STORAGE_KEY, "corrupt-json");
    expect(loadLibraryState(storage)).toEqual(first);
  });

  it("keeps the app usable when browser storage is unavailable", () => {
    expect(
      loadLibraryState({
        getItem: () => {
          throw new Error("storage denied");
        }
      })
    ).toEqual(createEmptyLibraryState());
    expect(
      persistLibraryState(
        {
          getItem: () => null,
          setItem: () => {
            throw new Error("storage denied");
          }
        },
        createEmptyLibraryState()
      )
    ).toBe(false);
  });

  it("validates external snapshots strictly instead of repairing bad fields", () => {
    const valid = markArticleOpened(
      toggleFavoriteArticle(createEmptyLibraryState(), "article-a"),
      "article-a",
      100
    );

    expect(validateLibraryStateSnapshot(valid)).toEqual(valid);
    expect(
      validateLibraryStateSnapshot({
        ...valid,
        favoriteArticleIds: ["article-a", "article-a"]
      })
    ).toBeNull();
    expect(
      validateLibraryStateSnapshot({
        ...valid,
        historyByArticle: {
          ...valid.historyByArticle,
          "article-b": {
            articleId: "wrong-id",
            firstOpenedAt: 100,
            lastOpenedAt: 100,
            openCount: 1,
            completedAt: null
          }
        }
      })
    ).toBeNull();
    expect(
      validateLibraryStateSnapshot({ ...valid, unexpected: true })
    ).toBeNull();
    expect(
      validateLibraryStateSnapshot({
        ...valid,
        progressByArticle: {
          "article-b": {
            articleId: "article-b",
            sentenceId: "s1",
            progressPercent: 25,
            updatedAt: 200
          }
        }
      })
    ).toBeNull();
    expect(
      validateLibraryStateSnapshot({
        ...valid,
        favoriteArticleIds: ["__proto__"]
      })
    ).toBeNull();
    expect(
      validateLibraryStateSnapshot({
        ...valid,
        historyByArticle: {
          "article-a": {
            ...valid.historyByArticle["article-a"],
            lastOpenedAt: 1e100
          }
        }
      })
    ).toBeNull();
  });

  it("derives stable sentence anchors and percentages from authored content", () => {
    const article = builtInLibrary[0];
    if (!article) throw new Error("Expected a built-in article");

    const sentenceIds = getArticleSentenceIds(article);

    expect(sentenceIds).toEqual(["s1", "s2", "s3", "s4"]);
    expect(getSentenceProgressPercent(sentenceIds, "s1")).toBe(25);
    expect(getSentenceProgressPercent(sentenceIds, "s3")).toBe(75);
    expect(getSentenceProgressPercent(sentenceIds, "missing")).toBe(0);
  });
});

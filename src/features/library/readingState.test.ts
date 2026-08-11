import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  LIBRARY_STATE_STORAGE_KEY,
  createEmptyLibraryState,
  getArticleSentenceIds,
  getSentenceProgressPercent,
  loadLibraryState,
  markArticleOpened,
  parseLibraryState,
  persistLibraryState,
  toggleFavoriteArticle,
  updateReadingProgress
} from "./readingState";

describe("local library state", () => {
  it("falls back safely when stored JSON is missing or corrupt", () => {
    expect(parseLibraryState(null)).toEqual(createEmptyLibraryState());
    expect(parseLibraryState("not-json")).toEqual(createEmptyLibraryState());
    expect(parseLibraryState('{"version":2}')).toEqual(
      createEmptyLibraryState()
    );
  });

  it("keeps valid records and drops malformed stored values", () => {
    const parsed = parseLibraryState(
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

    expect(parsed.favoriteArticleIds).toEqual(["article-a"]);
    expect(parsed.lastOpenedArticleId).toBe("article-a");
    expect(parsed.progressByArticle).toEqual({
      "article-a": {
        articleId: "article-a",
        sentenceId: "s2",
        progressPercent: 50,
        updatedAt: 123
      }
    });
  });

  it("opens and toggles favorite articles without duplicating ids", () => {
    const opened = markArticleOpened(createEmptyLibraryState(), "article-a");
    const favorite = toggleFavoriteArticle(opened, "article-a");
    const removed = toggleFavoriteArticle(favorite, "article-a");

    expect(opened.lastOpenedArticleId).toBe("article-a");
    expect(favorite.favoriteArticleIds).toEqual(["article-a"]);
    expect(removed.favoriteArticleIds).toEqual([]);
  });

  it("records a sentence anchor, clamps percentage, and ignores duplicates", () => {
    const progress = {
      articleId: "article-a",
      sentenceId: "s4",
      progressPercent: 101.4,
      updatedAt: 456
    };
    const updated = updateReadingProgress(createEmptyLibraryState(), progress);
    const duplicate = updateReadingProgress(updated, {
      ...progress,
      progressPercent: 100,
      updatedAt: 999
    });

    expect(updated.lastOpenedArticleId).toBe("article-a");
    expect(updated.progressByArticle["article-a"]).toEqual({
      ...progress,
      progressPercent: 100
    });
    expect(duplicate).toBe(updated);
  });

  it("loads and persists through a small storage adapter", () => {
    let serialized: string | null = null;
    const storage = {
      getItem: (key: string) =>
        key === LIBRARY_STATE_STORAGE_KEY ? serialized : null,
      setItem: (key: string, value: string) => {
        if (key === LIBRARY_STATE_STORAGE_KEY) serialized = value;
      }
    };
    const state = toggleFavoriteArticle(
      createEmptyLibraryState(),
      "article-a"
    );

    expect(persistLibraryState(storage, state)).toBe(true);
    expect(loadLibraryState(storage)).toEqual(state);
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
          setItem: () => {
            throw new Error("storage denied");
          }
        },
        createEmptyLibraryState()
      )
    ).toBe(false);
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

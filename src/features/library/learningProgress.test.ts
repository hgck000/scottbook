import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  createEmptyLibraryState,
  markArticleCompleted,
  markArticleOpened,
  updateReadingProgress
} from "./readingState";
import { getLearningProgressOverview } from "./learningProgress";

function createMixedProgress() {
  const hsk1 = builtInLibrary.find((article) => article.level === "HSK 1");
  const hsk2 = builtInLibrary.find((article) => article.level === "HSK 2");
  if (!hsk1 || !hsk2) throw new Error("pilot library fixture is incomplete");

  const openedHsk1 = markArticleOpened(
    createEmptyLibraryState(),
    hsk1.id,
    100
  );
  const readingHsk1 = updateReadingProgress(openedHsk1, {
    articleId: hsk1.id,
    sentenceId: hsk1.paragraphs[0]?.sentences[1]?.id ?? "s2",
    progressPercent: 50,
    updatedAt: 120
  });
  const openedHsk2 = markArticleOpened(readingHsk1, hsk2.id, 200);
  const completedHsk2 = markArticleCompleted(
    openedHsk2,
    hsk2.id,
    hsk2.paragraphs.at(-1)?.sentences.at(-1)?.id ?? "s4",
    220
  );

  return { state: completedHsk2, hsk1, hsk2 };
}

describe("local learning progress overview", () => {
  it("derives honest library and HSK progress from existing reading data", () => {
    const { state } = createMixedProgress();
    const overview = getLearningProgressOverview(builtInLibrary, state);

    expect(overview).toMatchObject({
      total: 105,
      completed: 1,
      inProgress: 1,
      unread: 103,
      progressPercent: 1
    });
    expect(overview.byLevel).toEqual([
      {
        level: "HSK 1",
        total: 39,
        completed: 0,
        inProgress: 1,
        unread: 38,
        progressPercent: 1
      },
      {
        level: "HSK 2",
        total: 24,
        completed: 1,
        inProgress: 0,
        unread: 23,
        progressPercent: 4
      },
      {
        level: "HSK 3",
        total: 24,
        completed: 0,
        inProgress: 0,
        unread: 24,
        progressPercent: 0
      },
      {
        level: "HSK 4",
        total: 9,
        completed: 0,
        inProgress: 0,
        unread: 9,
        progressPercent: 0
      },
      {
        level: "HSK 5",
        total: 9,
        completed: 0,
        inProgress: 0,
        unread: 9,
        progressPercent: 0
      }
    ]);
  });

  it("continues the most recent unfinished article, not a completed last open", () => {
    const { state, hsk1 } = createMixedProgress();

    expect(
      getLearningProgressOverview(builtInLibrary, state).continueArticleId
    ).toBe(hsk1.id);
  });

  it("returns a stable empty overview for an empty content collection", () => {
    expect(
      getLearningProgressOverview([], createEmptyLibraryState())
    ).toEqual({
      total: 0,
      completed: 0,
      inProgress: 0,
      unread: 0,
      progressPercent: 0,
      continueArticleId: null,
      byLevel: [
        { level: "HSK 1", total: 0, completed: 0, inProgress: 0, unread: 0, progressPercent: 0 },
        { level: "HSK 2", total: 0, completed: 0, inProgress: 0, unread: 0, progressPercent: 0 },
        { level: "HSK 3", total: 0, completed: 0, inProgress: 0, unread: 0, progressPercent: 0 },
        { level: "HSK 4", total: 0, completed: 0, inProgress: 0, unread: 0, progressPercent: 0 },
        { level: "HSK 5", total: 0, completed: 0, inProgress: 0, unread: 0, progressPercent: 0 }
      ]
    });
  });
});

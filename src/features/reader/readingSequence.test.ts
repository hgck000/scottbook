import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  createEmptyLibraryState,
  markArticleCompleted,
  markArticleOpened
} from "../library/readingState";
import { getNextReadingChoice } from "./readingSequence";

function completeArticle(
  articleId: string,
  state = createEmptyLibraryState(),
  timestamp = 100
) {
  const opened = markArticleOpened(state, articleId, timestamp);
  return markArticleCompleted(opened, articleId, "s4", timestamp + 1);
}

describe("offline reading sequence", () => {
  it("offers the next new article in stable authored order", () => {
    const choice = getNextReadingChoice(
      builtInLibrary,
      "hsk1-my-morning",
      createEmptyLibraryState()
    );

    expect(choice?.article.id).toBe("hsk1-my-family");
    expect(choice?.reason).toBe("new");
  });

  it("skips completed articles and recognizes saved unfinished reading", () => {
    const completedFamily = completeArticle("hsk1-my-family");
    const openedFriend = markArticleOpened(
      completedFamily,
      "hsk1-school-friend",
      200
    );
    const choice = getNextReadingChoice(
      builtInLibrary,
      "hsk1-my-morning",
      openedFriend
    );

    expect(choice?.article.id).toBe("hsk1-school-friend");
    expect(choice?.reason).toBe("in-progress");
  });

  it("wraps through the offline catalog to find an unfinished article", () => {
    const choice = getNextReadingChoice(
      builtInLibrary,
      builtInLibrary.at(-1)?.id ?? "missing",
      createEmptyLibraryState()
    );

    expect(choice?.article.id).toBe("hsk1-my-morning");
    expect(choice?.reason).toBe("new");
  });

  it("uses the next authored article as a reread only when the library is complete", () => {
    const state = builtInLibrary.reduce(
      (current, article, index) =>
        completeArticle(article.id, current, (index + 1) * 100),
      createEmptyLibraryState()
    );
    const choice = getNextReadingChoice(
      builtInLibrary,
      "hsk1-my-morning",
      state
    );

    expect(choice?.article.id).toBe("hsk1-my-family");
    expect(choice?.reason).toBe("revisit");
  });

  it("does not claim a full-library reread before the current article is complete", () => {
    const state = builtInLibrary.slice(1).reduce(
      (current, article, index) =>
        completeArticle(article.id, current, (index + 1) * 100),
      createEmptyLibraryState()
    );

    expect(
      getNextReadingChoice(builtInLibrary, "hsk1-my-morning", state)
    ).toBeNull();
  });

  it("returns no choice for a missing current article or one-item catalog", () => {
    expect(
      getNextReadingChoice(
        builtInLibrary,
        "missing",
        createEmptyLibraryState()
      )
    ).toBeNull();
    expect(
      getNextReadingChoice(
        builtInLibrary.slice(0, 1),
        "hsk1-my-morning",
        createEmptyLibraryState()
      )
    ).toBeNull();
  });
});

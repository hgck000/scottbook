import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { LIBRARY_STATE_STORAGE_KEY } from "./features/library/readingState";

function installWindow(hash: string, libraryState?: unknown) {
  const values = new Map<string, string>();
  if (libraryState) {
    values.set(LIBRARY_STATE_STORAGE_KEY, JSON.stringify(libraryState));
  }

  vi.stubGlobal("window", {
    location: { hash },
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value)
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ScottBook routes", () => {
  it("renders the reference library by default", () => {
    installWindow("");

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Thư viện tham khảo");
    expect(markup).toContain("Bắt đầu với một đoạn ngắn");
    expect(markup).toContain('href="#/review"');
  });

  it("renders local history and completion status on the review route", () => {
    installWindow("#/review", {
      version: 2,
      favoriteArticleIds: [],
      lastOpenedArticleId: "hsk1-my-morning",
      progressByArticle: {
        "hsk1-my-morning": {
          articleId: "hsk1-my-morning",
          sentenceId: "s4",
          progressPercent: 100,
          updatedAt: 200
        }
      },
      historyByArticle: {
        "hsk1-my-morning": {
          articleId: "hsk1-my-morning",
          firstOpenedAt: 100,
          lastOpenedAt: 200,
          openCount: 2,
          completedAt: 200
        }
      }
    });

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Lịch sử đọc gần đây");
    expect(markup).toContain("Buổi sáng của tôi");
    expect(markup).toContain("Đã hoàn thành");
    expect(markup).toContain("Đặt lại");
  });
});

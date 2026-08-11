import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { LIBRARY_STATE_STORAGE_KEY } from "./features/library/readingState";
import { getInstallCopy } from "./features/pwa/installGuidance";

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
    expect(markup).toContain("Bỏ qua đến nội dung chính");
    expect(markup).toContain('id="main-content"');
    expect(markup).toContain('tabindex="-1"');
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
    expect(markup).toContain("Chọn bản sao JSON");
    expect(markup).toContain("không phải nhập sách TXT/EPUB");
    expect(markup).toContain("tối đa 2 MB");
    expect(markup).toContain('accept="application/json,.json"');
    expect(markup).toContain("Dung lượng và vùng cache tách biệt");
    expect(markup).toContain("Xóa cache dịch");
    expect(markup).toContain("Tải chẩn đoán local");
    expect(markup).toContain("không có nội dung bài đọc");
    expect(markup).toContain("import vẫn đang khóa");
  });

  it("renders a clear recovery screen for an unavailable article", () => {
    installWindow("#/read/not-in-the-built-in-library");

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Không tìm thấy bài đọc");
    expect(markup).toContain("Thư viện dựng sẵn vẫn còn nguyên");
    expect(markup).toContain("Về thư viện");
  });
});

describe("PWA install guidance", () => {
  it("uses platform-specific instructions without promising an APK", () => {
    expect(getInstallCopy("ios").instruction).toContain(
      "Thêm vào Màn hình chính"
    );
    expect(getInstallCopy("macos").instruction).toContain("Thêm vào Dock");
    expect(getInstallCopy("native").title).toContain("Cài ScottBook");
    expect(getInstallCopy("browser").instruction).toContain(
      "Cài đặt ứng dụng"
    );
  });
});

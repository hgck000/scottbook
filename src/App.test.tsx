import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { LIBRARY_STATE_STORAGE_KEY } from "./features/library/readingState";
import { getInstallCopy } from "./features/pwa/installGuidance";
import {
  ASSISTANCE_HISTORY_STORAGE_KEY,
  createEmptyAssistanceHistory,
  recordAssistance
} from "./features/review/assistanceHistory";

function installWindow(
  hash: string,
  libraryState?: unknown,
  assistanceHistory?: unknown
) {
  const values = new Map<string, string>();
  if (libraryState) {
    values.set(LIBRARY_STATE_STORAGE_KEY, JSON.stringify(libraryState));
  }
  if (assistanceHistory) {
    values.set(
      ASSISTANCE_HISTORY_STORAGE_KEY,
      JSON.stringify(assistanceHistory)
    );
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

  it("renders distinct pinyin and meaning review evidence", () => {
    const pinyin = recordAssistance(createEmptyAssistanceHistory(), {
      articleId: "hsk1-my-morning",
      sentenceId: "s1",
      sentenceText: "早上六点，我起床。",
      sentenceTranslation: "Sáu giờ sáng, tôi thức dậy.",
      hanzi: "早上",
      pinyin: "zǎoshang",
      meaning: "buổi sáng",
      scope: "word",
      level: "pinyin",
      occurredAt: 100
    });
    const meaning = recordAssistance(pinyin, {
      articleId: "hsk1-my-morning",
      sentenceId: "s2",
      sentenceText: "我学习中文。",
      sentenceTranslation: "Tôi học tiếng Trung.",
      hanzi: "学习",
      pinyin: "xuéxí",
      meaning: "học tập",
      scope: "word",
      level: "meaning",
      occurredAt: 200
    });
    installWindow("#/review", undefined, meaning);

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Chữ, từ và câu từng cần trợ giúp");
    expect(markup).toContain("Cần cách đọc");
    expect(markup).toContain("Chưa hiểu nghĩa");
    expect(markup).toContain("zǎoshang");
    expect(markup).toContain("Ghi lịch sử trợ giúp");
    expect(markup).toContain("Xóa 早上 khỏi lịch sử trợ giúp");
  });

  it("keeps a screen-reader name on the compact mobile back button", () => {
    installWindow("#/read/hsk1-my-morning");

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain('class="back-button"');
    expect(markup).toContain('aria-label="Về thư viện"');
    expect(markup).toContain("Phạm vi trợ giúp");
    expect(markup).toContain('aria-label="Chữ (字)"');
    expect(markup).toContain('aria-label="Từ/cụm (词)"');
    expect(markup).toContain('aria-label="Câu (句)"');
    expect(markup).toContain('aria-label="Mở cài đặt đọc"');
    expect(markup).toContain('data-reader-font="serif"');
    expect(markup).toContain('data-reader-line-height="comfortable"');
    expect(markup).toContain('data-reader-content-width="balanced"');
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

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
    expect(markup).toContain('href="#/discover"');
    expect(markup).toContain("Bỏ qua đến nội dung chính");
    expect(markup).toContain('id="main-content"');
    expect(markup).toContain('tabindex="-1"');
    expect(markup).toContain('aria-label="Tìm trong thư viện offline"');
    expect(markup).toContain('aria-label="Lọc theo cấp độ HSK"');
    expect(markup).toContain('aria-label="Lọc theo trạng thái đọc"');
    expect(markup).toContain("<strong>36</strong> bài phù hợp");
    expect(markup).toContain("Nhập Paste / TXT / EPUB");
  });

  it("renders the guarded Paste/TXT/EPUB import wizard", () => {
    installWindow("#/import");

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Đưa bài đọc riêng vào ScottBook");
    expect(markup).toContain("Dán văn bản");
    expect(markup).toContain("Chọn TXT");
    expect(markup).toContain("Chọn EPUB");
    expect(markup).toContain("Chưa có gì được lưu trước bước xác nhận");
    expect(markup).toContain("CVDICT (CC BY-SA 4.0)");
  });

  it("filters the offline discover catalog without touching reading history", () => {
    installWindow("#/discover");

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Khám phá thư viện");
    expect(markup).toContain("Chọn nhịp đọc");
    expect(markup).toContain("360</strong><span>Câu đã chú giải");
    expect(markup).toContain('aria-label="Lọc Khám phá theo cấp độ HSK"');
    expect(markup).toContain('aria-label="Lọc Khám phá theo chủ đề"');
    expect(markup).toContain('aria-label="Lọc Khám phá theo độ dài bài đọc"');
    expect(markup).toContain("Xem thông tin Đi thư viện");
    expect(markup).toContain("Chạm vào bài để xem thông tin trước khi đọc");
  });

  it("renders an article detail route before reading starts", () => {
    installWindow("#/article/hsk2-library-visit");

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Thông tin bài đọc");
    expect(markup).toContain("去图书馆");
    expect(markup).toContain("Qù tú shū guǎn");
    expect(markup).toContain("Đọc ngay Đi thư viện");
    expect(markup).toContain("Cụm đã chú giải");
    expect(markup).toContain("Mở trang này không thay đổi tiến độ");
    expect(markup).toContain("Chưa bắt đầu");
    expect(markup).toContain("Về Khám phá");
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
    expect(markup).toContain("TXT và EPUB được nhập ở Thư viện");
    expect(markup).toContain("tối đa 32 MB");
    expect(markup).toContain('accept="application/json,.json"');
    expect(markup).toContain("Dung lượng và vùng cache tách biệt");
    expect(markup).toContain("Xóa cache dịch");
    expect(markup).toContain("Tải chẩn đoán local");
    expect(markup).toContain("không có nội dung bài đọc");
    expect(markup).toContain("sách tự nhập");
    expect(markup).toContain("Chưa có dấu vết để so sánh");
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

    expect(markup).toContain("Chữ và từ/cụm từng cần trợ giúp");
    expect(markup).not.toContain('>Câu</button>');
    expect(markup).toContain("Cần cách đọc");
    expect(markup).toContain("Chưa hiểu nghĩa");
    expect(markup).toContain("zǎoshang");
    expect(markup).toContain("Ghi lịch sử trợ giúp");
    expect(markup).toContain("Xóa 早上 khỏi lịch sử trợ giúp");
    expect(markup).toContain("Mở đúng câu có 早上");
    expect(markup).toContain("Mở đúng câu");
    expect(markup).toContain('href="#/review/practice"');
    expect(markup).toContain("Luyện nhanh · 2 mục");
    expect(markup).toContain("Bài nào từng cần trợ giúp nhiều?");
    expect(markup).toContain(
      'aria-label="Dấu vết trợ giúp bài Buổi sáng của tôi"'
    );
    expect(markup).toContain(">2</strong> lượt mở");
    expect(markup).toContain(">2</strong> mục đang ôn");
    expect(markup).toContain('aria-label="Đọc lại Buổi sáng của tôi"');
  });

  it("starts quick review with Hanzi before revealing authored help", () => {
    const history = recordAssistance(createEmptyAssistanceHistory(), {
      articleId: "hsk1-my-morning",
      sentenceId: "s1",
      sentenceText: "早上六点，我起床。",
      sentenceTranslation: "Sáu giờ sáng, tôi thức dậy.",
      hanzi: "早上",
      pinyin: "zǎoshang",
      meaning: "buổi sáng",
      scope: "word",
      level: "meaning",
      occurredAt: 100
    });
    installWindow("#/review/practice", undefined, history);

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Luyện nhanh những chỗ từng vấp");
    expect(markup).toContain("早上");
    expect(markup).toContain("Hiện pinyin");
    expect(markup).not.toContain("zǎoshang");
    expect(markup).not.toContain("buổi sáng");
  });

  it("renders an exact Review context as the highlighted Reader target", () => {
    installWindow("#/read/hsk1-my-morning/context/s4");

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Đã mở đúng câu từ Ôn lại");
    expect(markup).toContain('aria-label="Về Ôn lại"');
    expect(markup).toContain('data-sentence-id="s4"');
    expect(markup).toContain('data-context-target="true"');
    expect(markup).toContain('class="sentence context-target"');
  });

  it("renders a cross-article vocabulary context with a safe return route", () => {
    installWindow(
      "#/read/hsk2-weekend-plan/context/s1/from-vocabulary/hsk1-my-morning"
    );

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Đã mở ngữ cảnh từ Từ trong bài");
    expect(markup).toContain('aria-label="Về bài trước"');
    expect(markup).toContain('data-sentence-id="s1"');
    expect(markup).toContain('data-vocabulary-target="true"');
    expect(markup).toContain('class="sentence context-target"');
    expect(markup).not.toContain("Đã mở đúng câu từ Ôn lại");
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
    expect(markup).toContain('aria-label="Mở từ trong bài"');
    expect(markup).toContain('aria-controls="reader-vocabulary"');
    expect(markup).toContain('data-reader-font="serif"');
    expect(markup).toContain('data-reader-line-height="comfortable"');
    expect(markup).toContain('data-reader-content-width="balanced"');
  });

  it("offers the next unfinished offline article at the end of Reader", () => {
    installWindow("#/read/hsk1-my-morning", {
      version: 2,
      favoriteArticleIds: [],
      lastOpenedArticleId: "hsk1-my-family",
      progressByArticle: {},
      historyByArticle: {
        "hsk1-my-family": {
          articleId: "hsk1-my-family",
          firstOpenedAt: 100,
          lastOpenedAt: 200,
          openCount: 2,
          completedAt: null
        }
      }
    });

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Tiếp tục một bài còn dang dở");
    expect(markup).toContain('id="reader-next-heading"');
    expect(markup).toContain("我的家");
    expect(markup).toContain("Wǒ de jiā");
    expect(markup).toContain("Gia đình tôi");
    expect(markup).toContain(
      'aria-label="Đọc bài tiếp theo: Gia đình tôi"'
    );
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

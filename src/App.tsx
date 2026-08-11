import { useEffect, useMemo, useState } from "react";
import { builtInLibrary } from "./content/builtInLibrary";
import type {
  AnnotatedSentence,
  BuiltInArticle,
  WordToken
} from "./content/types";
import {
  advanceAssistance,
  type AssistanceSelection
} from "./features/reader/assistance";

type Theme = "paper" | "night";

type Route =
  | { name: "library" }
  | { name: "reader"; articleId: string };

function parseRoute(): Route {
  const match = window.location.hash.match(/^#\/read\/(.+)$/);
  return match?.[1]
    ? { name: "reader", articleId: decodeURIComponent(match[1]) }
    : { name: "library" };
}

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return initial;

    try {
      return JSON.parse(stored) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function BookIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 9.5c6.1-2.1 11.4-1.3 16 2.4v26.6c-4.6-3.7-9.9-4.5-16-2.4V9.5Z" />
      <path d="M40 9.5c-6.1-2.1-11.4-1.3-16 2.4v26.6c4.6-3.7 9.9-4.5 16-2.4V9.5Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function App() {
  const [route, setRoute] = useState<Route>(parseRoute);
  const [theme, setTheme] = useStoredState<Theme>("scottbook.theme", "paper");
  const [fontSize, setFontSize] = useStoredState<number>(
    "scottbook.readerFontSize",
    25
  );

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const openArticle = (articleId: string) => {
    window.location.hash = `/read/${encodeURIComponent(articleId)}`;
  };

  const goHome = () => {
    window.location.hash = "/";
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "paper" ? "night" : "paper"));
  };

  let content;
  if (route.name === "reader") {
    const article = builtInLibrary.find((item) => item.id === route.articleId);
    content = article ? (
      <ReaderScreen
        article={article}
        fontSize={fontSize}
        setFontSize={setFontSize}
        theme={theme}
        toggleTheme={toggleTheme}
        goHome={goHome}
      />
    ) : (
      <NotFound goHome={goHome} />
    );
  } else {
    content = (
      <LibraryScreen
        theme={theme}
        toggleTheme={toggleTheme}
        openArticle={openArticle}
      />
    );
  }

  return <div data-theme={theme}>{content}</div>;
}

function Brand() {
  return (
    <a className="brand" href="#/" aria-label="ScottBook — về thư viện">
      <span className="brand-icon">
        <BookIcon />
      </span>
      <span>ScottBook</span>
    </a>
  );
}

function LibraryScreen({
  theme,
  toggleTheme,
  openArticle
}: {
  theme: Theme;
  toggleTheme: () => void;
  openArticle: (articleId: string) => void;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label="Điều hướng chính">
          <a className="nav-item active" href="#/">
            <span aria-hidden="true">▤</span>
            Thư viện
          </a>
          <button className="nav-item" type="button" disabled>
            <span aria-hidden="true">◎</span>
            Ôn lại
            <small>Sau</small>
          </button>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          <strong>Hoàn toàn offline</strong>
          <p>Ba bài mẫu đã có sẵn pinyin và nghĩa tiếng Việt.</p>
        </div>
      </aside>

      <main className="library-page">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <p className="eyebrow">Thư viện tham khảo</p>
          <button
            className="icon-button theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "paper" ? "Bật giao diện tối" : "Bật giao diện sáng"}
          >
            {theme === "paper" ? "☾" : "☀"}
          </button>
        </header>

        <section className="hero">
          <div>
            <span className="hero-stamp">离线阅读 · Đọc ngoại tuyến</span>
            <h1>Đừng dịch vội.<br />Hãy hiểu trước.</h1>
            <p>
              Chạm một lần để xem pinyin. Chạm thêm lần nữa khi bạn thật sự
              cần nghĩa và bản dịch câu.
            </p>
          </div>
          <div className="hero-glyph" aria-hidden="true">
            <span>读</span>
            <small>dú · đọc</small>
          </div>
        </section>

        <section className="library-section" aria-labelledby="reference-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nội dung dựng sẵn</p>
              <h2 id="reference-heading">Bắt đầu với một đoạn ngắn</h2>
            </div>
            <span className="offline-pill">Không cần mạng</span>
          </div>

          <div className="book-grid">
            {builtInLibrary.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
                onOpen={() => openArticle(article.id)}
              />
            ))}
          </div>
        </section>

        <section className="import-note" aria-labelledby="import-heading">
          <div className="import-mark" aria-hidden="true">＋</div>
          <div>
            <p className="eyebrow">Import nội dung riêng</p>
            <h2 id="import-heading">Chưa vội chọn một cách làm nửa vời.</h2>
            <p>
              ScottBook sẽ chỉ thêm import sau khi cách tách từ, tạo pinyin và
              dịch nội dung ngoài đủ chính xác để không làm hỏng trải nghiệm học.
            </p>
          </div>
          <span className="research-pill">Đang nghiên cứu</span>
        </section>
      </main>
    </div>
  );
}

function ArticleCard({
  article,
  index,
  onOpen
}: {
  article: BuiltInArticle;
  index: number;
  onOpen: () => void;
}) {
  const wordCount = article.paragraphs.reduce(
    (total, paragraph) =>
      total +
      paragraph.sentences.reduce(
        (sentenceTotal, sentence) =>
          sentenceTotal + sentence.tokens.filter((token) => token.kind === "word").length,
        0
      ),
    0
  );

  return (
    <button
      className={`article-card accent-${article.accent}`}
      type="button"
      onClick={onOpen}
      style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
    >
      <span className="card-topline">
        <span className="level-badge">{article.level}</span>
        <span>{article.estimatedMinutes} phút</span>
      </span>
      <span className="card-glyph" aria-hidden="true">{article.title.slice(0, 1)}</span>
      <span className="article-title">{article.title}</span>
      <span className="article-pinyin">{article.titlePinyin}</span>
      <span className="article-translation">{article.titleTranslation}</span>
      <span className="article-summary">{article.summary}</span>
      <span className="card-footer">
        <span>{article.topic} · {wordCount} cụm</span>
        <span className="card-arrow"><ChevronIcon /></span>
      </span>
    </button>
  );
}

function ReaderScreen({
  article,
  fontSize,
  setFontSize,
  theme,
  toggleTheme,
  goHome
}: {
  article: BuiltInArticle;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  theme: Theme;
  toggleTheme: () => void;
  goHome: () => void;
}) {
  const [selection, setSelection] = useState<AssistanceSelection | null>(null);

  const selectedContext = useMemo(() => {
    if (!selection) return null;

    for (const paragraph of article.paragraphs) {
      for (const sentence of paragraph.sentences) {
        const token = sentence.tokens.find(
          (candidate) =>
            candidate.kind === "word" && `${sentence.id}:${candidate.id}` === selection.key
        );
        if (token?.kind === "word") {
          return { sentence, token };
        }
      }
    }

    return null;
  }, [article, selection]);

  const chooseToken = (sentence: AnnotatedSentence, token: WordToken) => {
    const key = `${sentence.id}:${token.id}`;
    setSelection((current) => advanceAssistance(current, key));
  };

  const clampFontSize = (next: number) => Math.min(38, Math.max(18, next));

  return (
    <div className="reader-shell">
      <header className="reader-toolbar">
        <button className="back-button" type="button" onClick={goHome}>
          <span aria-hidden="true">←</span>
          <span>Thư viện</span>
        </button>
        <div className="reader-title-small">
          <strong>{article.title}</strong>
          <span>{article.level}</span>
        </div>
        <div className="reader-actions">
          <button
            className="text-control"
            type="button"
            onClick={() => setFontSize((size) => clampFontSize(size - 2))}
            aria-label="Giảm cỡ chữ"
          >
            A−
          </button>
          <span className="font-size-value" aria-label={`Cỡ chữ ${fontSize}`}>
            {fontSize}
          </span>
          <button
            className="text-control"
            type="button"
            onClick={() => setFontSize((size) => clampFontSize(size + 2))}
            aria-label="Tăng cỡ chữ"
          >
            A+
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "paper" ? "Bật giao diện tối" : "Bật giao diện sáng"}
          >
            {theme === "paper" ? "☾" : "☀"}
          </button>
        </div>
      </header>

      <main className="reader-page">
        <article className="reader-article" style={{ "--reader-font-size": `${fontSize}px` } as React.CSSProperties}>
          <header className="article-header">
            <span className="reader-level">{article.level} · {article.topic}</span>
            <h1>{article.title}</h1>
            <p className="title-pinyin">{article.titlePinyin}</p>
            <p className="title-translation">{article.titleTranslation}</p>
            <div className="reader-instruction">
              <span className="tap-demo">按</span>
              <p>
                <strong>Chạm vào một cụm từ.</strong><br />
                Lần một hiện pinyin · lần hai hiện nghĩa · lần ba đóng.
              </p>
            </div>
          </header>

          <div className="article-body">
            {article.paragraphs.map((paragraph) => (
              <p key={paragraph.id}>
                {paragraph.sentences.map((sentence) => (
                  <SentenceLine
                    key={sentence.id}
                    sentence={sentence}
                    selection={selection}
                    chooseToken={chooseToken}
                  />
                ))}
              </p>
            ))}
          </div>

          <footer className="article-end">
            <span>完</span>
            <p>Hết bài · mọi chú thích của bài này đã nằm sẵn trên thiết bị.</p>
          </footer>
        </article>
      </main>

      {selection && selectedContext ? (
        <AssistancePanel
          level={selection.level}
          sentence={selectedContext.sentence}
          token={selectedContext.token}
          close={() => setSelection(null)}
        />
      ) : null}
    </div>
  );
}

function SentenceLine({
  sentence,
  selection,
  chooseToken
}: {
  sentence: AnnotatedSentence;
  selection: AssistanceSelection | null;
  chooseToken: (sentence: AnnotatedSentence, token: WordToken) => void;
}) {
  return (
    <span className="sentence" data-sentence-id={sentence.id}>
      {sentence.tokens.map((token) => {
        if (token.kind === "punctuation") {
          return <span key={token.id}>{token.hanzi}</span>;
        }

        const key = `${sentence.id}:${token.id}`;
        const isSelected = selection?.key === key;
        return (
          <button
            key={token.id}
            className={`word-token${isSelected ? " selected" : ""}`}
            type="button"
            onClick={() => chooseToken(sentence, token)}
            aria-label={`${token.hanzi}; chạm để xem trợ giúp`}
            aria-pressed={isSelected}
          >
            {token.hanzi}
          </button>
        );
      })}
    </span>
  );
}

function AssistancePanel({
  level,
  sentence,
  token,
  close
}: {
  level: 1 | 2;
  sentence: AnnotatedSentence;
  token: WordToken;
  close: () => void;
}) {
  const sentenceText = sentence.tokens.map((item) => item.hanzi).join("");

  return (
    <aside className="assist-panel" aria-live="polite" aria-label="Trợ giúp đọc">
      <div className="assist-handle" aria-hidden="true" />
      <div className="assist-word">
        <span className="assist-hanzi">{token.hanzi}</span>
        <div>
          <p className="assist-label">Pinyin</p>
          <strong className="assist-pinyin">{token.pinyin}</strong>
        </div>
      </div>

      {level === 1 ? (
        <p className="assist-hint">Chạm lại cụm đang chọn để mở nghĩa.</p>
      ) : (
        <div className="assist-details">
          <div>
            <p className="assist-label">Nghĩa trong ngữ cảnh</p>
            <strong className="assist-meaning">{token.meaning}</strong>
          </div>
          <div className="sentence-translation">
            <p lang="zh-Hans">{sentenceText}</p>
            <strong>{sentence.translation}</strong>
          </div>
        </div>
      )}

      <button className="assist-close" type="button" onClick={close} aria-label="Đóng trợ giúp">
        ×
      </button>
    </aside>
  );
}

function NotFound({ goHome }: { goHome: () => void }) {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Không tìm thấy bài đọc.</h1>
      <button type="button" onClick={goHome}>Về thư viện</button>
    </main>
  );
}

export default App;

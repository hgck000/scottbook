import { useEffect, useMemo, useRef, useState } from "react";
import type { ReaderTheme } from "../preferences/readerPreferences";
import { NATIVE_BACK_EVENT } from "../native/androidBackNavigation";
import { analyzeImportedBook } from "./importAnalysis";
import {
  createImportedBookId,
  decodeUtf8TxtFile,
  getImportValidationError,
  MAX_IMPORT_CHARACTERS,
  normalizeImportedText,
  type ImportAnalysisProgress,
  type ImportedBook,
  type ImportSourceType
} from "./importedBook";

type ImportStage = "source" | "preview" | "analyzing" | "saving" | "error";

export function ImportScreen({
  theme,
  toggleTheme,
  storageReady,
  close,
  saveBook
}: {
  theme: ReaderTheme;
  toggleTheme: () => void;
  storageReady: boolean;
  close: () => void;
  saveBook: (book: ImportedBook) => Promise<boolean>;
}) {
  const [sourceType, setSourceType] = useState<ImportSourceType>("paste");
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [stage, setStage] = useState<ImportStage>("source");
  const [message, setMessage] = useState(
    "Dán văn bản hoặc chọn TXT UTF-8. Chưa có gì được lưu trước bước xác nhận."
  );
  const [progress, setProgress] = useState<ImportAnalysisProgress>({
    percent: 0,
    message: "Chưa bắt đầu"
  });
  const abortRef = useRef<AbortController | null>(null);
  const normalized = useMemo(() => normalizeImportedText(sourceText), [sourceText]);
  const validationError = getImportValidationError(normalized);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const handleNativeBack = (event: Event) => {
      if (stage !== "analyzing" && stage !== "saving") return;
      event.preventDefault();
      abortRef.current?.abort();
      setStage("preview");
      setMessage("Đã hủy phân tích; chưa có sách nào được lưu.");
    };
    window.addEventListener(NATIVE_BACK_EVENT, handleNativeBack);
    return () => window.removeEventListener(NATIVE_BACK_EVENT, handleNativeBack);
  }, [stage]);

  const chooseSource = (next: ImportSourceType) => {
    if (stage === "analyzing" || stage === "saving") return;
    setSourceType(next);
    setSourceName(null);
    setSourceText("");
    setStage("source");
    setMessage(
      next === "txt"
        ? "Chọn TXT UTF-8 tối đa 512 KB. BOM UTF-8 được chấp nhận."
        : "Dán văn bản tiếng Trung; xuống dòng trống sẽ được giữ thành đoạn."
    );
  };

  const selectTxt = async (file: File | undefined) => {
    if (!file) return;
    try {
      const decoded = await decodeUtf8TxtFile(file);
      setSourceText(decoded);
      setSourceName(file.name);
      if (!title.trim()) setTitle(file.name.replace(/\.txt$/iu, ""));
      setStage("source");
      setMessage(`Đã đọc ${file.name}. Hãy kiểm tra tiêu đề rồi xem trước.`);
    } catch (error) {
      setSourceText("");
      setSourceName(null);
      setStage("error");
      setMessage(error instanceof Error ? error.message : "Không đọc được file TXT.");
    }
  };

  const showPreview = () => {
    const safeTitle = title.trim();
    if (!storageReady) {
      setStage("error");
      setMessage("IndexedDB chưa sẵn sàng; không thể lưu sách an toàn lúc này.");
      return;
    }
    if (!safeTitle) {
      setStage("error");
      setMessage("Hãy nhập tiêu đề trước khi xem trước.");
      return;
    }
    if (safeTitle.length > 200 || author.trim().length > 200) {
      setStage("error");
      setMessage("Tiêu đề và tác giả không được dài quá 200 ký tự.");
      return;
    }
    if (validationError) {
      setStage("error");
      setMessage(validationError);
      return;
    }
    setStage("preview");
    setMessage("Đây là nội dung sau khi chuẩn hóa. Phân tích chỉ bắt đầu khi bạn xác nhận.");
  };

  const startAnalysis = async () => {
    if (validationError || !title.trim() || !storageReady) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setStage("analyzing");
    setProgress({ percent: 1, message: "Đang khởi động worker offline…" });
    try {
      const book = await analyzeImportedBook(
        {
          id: createImportedBookId(),
          title: title.trim(),
          author: author.trim() || null,
          sourceType,
          sourceName,
          normalized,
          createdAt: Date.now()
        },
        { signal: controller.signal, onProgress: setProgress }
      );
      setStage("saving");
      setProgress({ percent: 98, message: "Đang lưu sách bằng transaction IndexedDB…" });
      const saved = await saveBook(book);
      if (!saved) throw new Error("IndexedDB từ chối transaction; chưa có sách nào được lưu.");
      setProgress({ percent: 100, message: "Đã lưu xong." });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStage("preview");
        setMessage("Đã hủy phân tích; chưa có sách nào được lưu.");
      } else {
        setStage("error");
        setMessage(error instanceof Error ? error.message : "Import thất bại; chưa có sách nào được lưu.");
      }
    } finally {
      abortRef.current = null;
    }
  };

  const busy = stage === "analyzing" || stage === "saving";
  return (
    <div className="import-shell">
      <header className="import-toolbar">
        <button type="button" className="back-button" onClick={close} disabled={stage === "saving"}>
          <span aria-hidden="true">←</span><span>Thư viện</span>
        </button>
        <strong>Nhập văn bản offline</strong>
        <button
          className="icon-button"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "paper" ? "Bật giao diện tối" : "Bật giao diện sáng"}
        >
          {theme === "paper" ? "☾" : "☀"}
        </button>
      </header>

      <main id="main-content" className="import-page" tabIndex={-1}>
        <header className="import-heading">
          <p className="eyebrow">Paste / TXT · không gửi dữ liệu</p>
          <h1>Đưa bài đọc riêng vào ScottBook</h1>
          <p>
            Pinyin và nghĩa từ/cụm được tạo tự động trên thiết bị. Kết quả có thể sai;
            bản dịch cả câu không được bịa từ nghĩa rời rạc.
          </p>
        </header>

        <section className="import-card" aria-labelledby="import-source-heading">
          <div className="import-steps" aria-label="Tiến trình import">
            <span className={stage === "source" || stage === "error" ? "active" : "done"}>1 · Nguồn</span>
            <span className={stage === "preview" ? "active" : busy ? "done" : ""}>2 · Xem trước</span>
            <span className={busy ? "active" : ""}>3 · Phân tích</span>
          </div>

          <div className="import-source-tabs" role="group" aria-label="Chọn nguồn văn bản">
            <button type="button" className={sourceType === "paste" ? "active" : ""} onClick={() => chooseSource("paste")} disabled={busy}>Dán văn bản</button>
            <button type="button" className={sourceType === "txt" ? "active" : ""} onClick={() => chooseSource("txt")} disabled={busy}>Chọn TXT</button>
          </div>

          <div className="import-metadata-grid">
            <label>
              <span>Tiêu đề *</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} disabled={busy} placeholder="Ví dụ: Một ngày ở Bắc Kinh" />
            </label>
            <label>
              <span>Tác giả <small>(không bắt buộc)</small></span>
              <input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={200} disabled={busy} placeholder="Tên tác giả hoặc nguồn" />
            </label>
          </div>

          {sourceType === "paste" ? (
            <label className="import-textarea">
              <span id="import-source-heading">Nội dung tiếng Trung</span>
              <textarea value={sourceText} onChange={(event) => { setSourceText(event.target.value); if (stage === "error") setStage("source"); }} disabled={busy} rows={14} placeholder="Dán nội dung vào đây…" />
            </label>
          ) : (
            <label className="import-file-drop" id="import-source-heading">
              <input type="file" accept="text/plain,.txt" disabled={busy} onChange={(event) => void selectTxt(event.target.files?.[0])} />
              <span aria-hidden="true">TXT</span>
              <strong>{sourceName ?? "Chọn file TXT UTF-8"}</strong>
              <small>Tối đa 512 KB · không nhận UTF-16 hoặc file nhị phân</small>
            </label>
          )}

          <div className="import-source-summary">
            <span>{normalized.characterCount.toLocaleString("vi-VN")} / {MAX_IMPORT_CHARACTERS.toLocaleString("vi-VN")} ký tự</span>
            <span>{normalized.paragraphs.length} đoạn sau chuẩn hóa</span>
          </div>

          {stage === "preview" || busy ? (
            <section className="import-preview" aria-labelledby="import-preview-heading">
              <div>
                <p className="eyebrow">Xem trước sau chuẩn hóa</p>
                <h2 id="import-preview-heading">{title.trim()}</h2>
                {author.trim() ? <p>Tác giả: {author.trim()}</p> : null}
              </div>
              <div className="import-preview-body" lang="zh-Hans">
                {normalized.paragraphs.slice(0, 6).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {normalized.paragraphs.length > 6 ? <small>… và {normalized.paragraphs.length - 6} đoạn khác</small> : null}
              </div>
            </section>
          ) : null}

          {busy ? (
            <div className="import-progress" role="status" aria-live="polite">
              <div role="progressbar" aria-label="Tiến độ phân tích offline" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
                <span style={{ width: `${progress.percent}%` }} />
              </div>
              <strong>{progress.percent}%</strong>
              <p>{progress.message}</p>
            </div>
          ) : null}

          <p className={`import-feedback${stage === "error" ? " error" : ""}`} role="status" aria-live="polite">{message}</p>
          <div className="import-actions">
            {stage === "preview" ? <button type="button" onClick={() => setStage("source")}>Sửa nội dung</button> : null}
            {busy ? (
              <button type="button" onClick={() => abortRef.current?.abort()} disabled={stage === "saving"}>Hủy phân tích</button>
            ) : stage === "preview" ? (
              <button type="button" className="import-primary" onClick={() => void startAnalysis()}>Phân tích và lưu offline</button>
            ) : (
              <button type="button" className="import-primary" onClick={showPreview}>Xem trước</button>
            )}
          </div>
        </section>

        <p className="import-license-note">
          Nghĩa Việt tự động: CVDICT (CC BY-SA 4.0) · pinyin: pinyin-pro (MIT).
        </p>
      </main>
    </div>
  );
}

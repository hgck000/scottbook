import {
  validateImportedBook,
  type ImportAnalysisProgress,
  type ImportDraft,
  type ImportedBook
} from "./importedBook";

type WorkerResponse =
  | ({ type: "progress"; requestId: string } & ImportAnalysisProgress)
  | { type: "complete"; requestId: string; book: unknown }
  | { type: "error"; requestId: string; message: string };

function abortError(): DOMException {
  return new DOMException("Đã hủy phân tích; chưa có sách nào được lưu.", "AbortError");
}

export function analyzeImportedBook(
  draft: ImportDraft,
  options: {
    signal?: AbortSignal;
    onProgress?: (progress: ImportAnalysisProgress) => void;
    dictionaryUrl?: string;
  } = {}
): Promise<ImportedBook> {
  if (options.signal?.aborted) return Promise.reject(abortError());
  const requestId = `${draft.id}:${Date.now()}`;
  const analysisWorker = new Worker(
    new URL("./importAnalysis.worker.ts", import.meta.url),
    { type: "module", name: "scottbook-import-analysis" }
  );
  const dictionaryUrl = options.dictionaryUrl ??
    new URL("cvdict-v1.u8.gz", document.baseURI).href;

  return new Promise((resolve, reject) => {
    const finish = () => {
      options.signal?.removeEventListener("abort", cancel);
      analysisWorker.terminate();
    };
    const cancel = () => {
      finish();
      reject(abortError());
    };
    options.signal?.addEventListener("abort", cancel, { once: true });
    analysisWorker.addEventListener("error", () => {
      finish();
      reject(new Error("Worker phân tích offline không khởi động được."));
    });
    analysisWorker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.requestId !== requestId) return;
      if (message.type === "progress") {
        options.onProgress?.({ percent: message.percent, message: message.message });
        return;
      }
      if (message.type === "error") {
        finish();
        reject(new Error(message.message));
        return;
      }
      const validated = validateImportedBook(message.book);
      finish();
      if (!validated.ok) {
        reject(new Error(`Kết quả phân tích không hợp lệ: ${validated.message}`));
        return;
      }
      resolve(validated.book);
    });
    analysisWorker.postMessage({
      type: "analyze",
      requestId,
      dictionaryUrl,
      draft
    });
  });
}

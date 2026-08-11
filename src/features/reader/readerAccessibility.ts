import type { AssistanceSelection } from "./assistance";
import {
  getAssistanceScopeLabel,
  type ReaderAssistanceUnit
} from "./readerScope";

export function getNextReaderTokenIndex(
  currentIndex: number,
  tokenCount: number,
  key: string
): number {
  if (tokenCount <= 0 || currentIndex < 0 || currentIndex >= tokenCount) {
    return currentIndex;
  }
  if (key === "ArrowRight") {
    return Math.min(currentIndex + 1, tokenCount - 1);
  }
  if (key === "ArrowLeft") return Math.max(currentIndex - 1, 0);
  if (key === "Home") return 0;
  if (key === "End") return tokenCount - 1;
  return currentIndex;
}

export function getReaderTokenLabel(
  token: ReaderAssistanceUnit,
  selection: AssistanceSelection | null,
  key: string
): string {
  const scopeLabel = getAssistanceScopeLabel(token.scope);
  if (selection?.key !== key) {
    return `${scopeLabel} ${token.hanzi}; mở pinyin`;
  }
  return selection.level === 1
    ? `${scopeLabel} ${token.hanzi}; pinyin ${token.pinyin}; ${
        token.scope === "sentence"
          ? "mở bản dịch câu"
          : "mở nghĩa trong ngữ cảnh"
      }`
    : `${scopeLabel} ${token.hanzi}; ${
        token.scope === "sentence" ? "bản dịch" : "nghĩa"
      } ${token.meaning}; đóng trợ giúp`;
}

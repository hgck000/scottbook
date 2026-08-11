import type { WordToken } from "../../content/types";
import type { AssistanceSelection } from "./assistance";

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
  token: WordToken,
  selection: AssistanceSelection | null,
  key: string
): string {
  if (selection?.key !== key) {
    return `${token.hanzi}; mở pinyin`;
  }
  return selection.level === 1
    ? `${token.hanzi}; pinyin ${token.pinyin}; mở nghĩa trong ngữ cảnh`
    : `${token.hanzi}; nghĩa ${token.meaning}; đóng trợ giúp`;
}

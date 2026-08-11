import {
  isReaderAssistanceScope,
  type ReaderAssistanceScope
} from "../reader/readerScope";

export const READER_THEME_STORAGE_KEY = "scottbook.theme";
export const READER_FONT_SIZE_STORAGE_KEY = "scottbook.readerFontSize";
export const READER_ASSISTANCE_SCOPE_STORAGE_KEY =
  "scottbook.readerAssistanceScope";
export const MIN_READER_FONT_SIZE = 18;
export const MAX_READER_FONT_SIZE = 38;

export type ReaderTheme = "paper" | "night";

export type ReaderPreferences = {
  theme: ReaderTheme;
  fontSize: number;
  assistanceScope: ReaderAssistanceScope;
};

export function isReaderTheme(value: unknown): value is ReaderTheme {
  return value === "paper" || value === "night";
}

export function isReaderFontSize(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_READER_FONT_SIZE &&
    value <= MAX_READER_FONT_SIZE
  );
}

export function isReaderPreferences(
  value: unknown
): value is ReaderPreferences {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    Object.keys(candidate).length === 3 &&
    Object.hasOwn(candidate, "theme") &&
    Object.hasOwn(candidate, "fontSize") &&
    Object.hasOwn(candidate, "assistanceScope") &&
    isReaderTheme(candidate.theme) &&
    isReaderFontSize(candidate.fontSize) &&
    isReaderAssistanceScope(candidate.assistanceScope)
  );
}

export function validateReaderPreferences(
  value: unknown
): ReaderPreferences | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const hasAssistanceScope = Object.hasOwn(candidate, "assistanceScope");
  if (
    Object.keys(candidate).length !== (hasAssistanceScope ? 3 : 2) ||
    !Object.hasOwn(candidate, "theme") ||
    !Object.hasOwn(candidate, "fontSize") ||
    !isReaderTheme(candidate.theme) ||
    !isReaderFontSize(candidate.fontSize) ||
    (hasAssistanceScope &&
      !isReaderAssistanceScope(candidate.assistanceScope))
  ) {
    return null;
  }

  return {
    theme: candidate.theme,
    fontSize: candidate.fontSize,
    assistanceScope: hasAssistanceScope
      ? (candidate.assistanceScope as ReaderAssistanceScope)
      : "word"
  };
}

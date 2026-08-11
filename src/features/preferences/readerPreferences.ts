import {
  isReaderAssistanceScope,
  type ReaderAssistanceScope
} from "../reader/readerScope";

export const READER_THEME_STORAGE_KEY = "scottbook.theme";
export const READER_FONT_SIZE_STORAGE_KEY = "scottbook.readerFontSize";
export const READER_ASSISTANCE_SCOPE_STORAGE_KEY =
  "scottbook.readerAssistanceScope";
export const READER_FONT_FAMILY_STORAGE_KEY = "scottbook.readerFontFamily";
export const READER_LINE_HEIGHT_STORAGE_KEY = "scottbook.readerLineHeight";
export const READER_CONTENT_WIDTH_STORAGE_KEY = "scottbook.readerContentWidth";
export const MIN_READER_FONT_SIZE = 18;
export const MAX_READER_FONT_SIZE = 38;

export type ReaderTheme = "paper" | "night" | "oled";
export type ReaderFontFamily = "serif" | "sans";
export type ReaderLineHeight = "compact" | "comfortable" | "airy";
export type ReaderContentWidth = "narrow" | "balanced" | "wide";

export type ReaderPreferences = {
  theme: ReaderTheme;
  fontSize: number;
  assistanceScope: ReaderAssistanceScope;
  fontFamily: ReaderFontFamily;
  lineHeight: ReaderLineHeight;
  contentWidth: ReaderContentWidth;
};

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  theme: "paper",
  fontSize: 25,
  assistanceScope: "word",
  fontFamily: "serif",
  lineHeight: "comfortable",
  contentWidth: "balanced"
};

export const READER_LINE_HEIGHT_VALUES: Record<ReaderLineHeight, number> = {
  compact: 1.65,
  comfortable: 2.05,
  airy: 2.35
};

export const READER_CONTENT_WIDTH_VALUES: Record<ReaderContentWidth, number> = {
  narrow: 620,
  balanced: 760,
  wide: 920
};

export function isReaderTheme(value: unknown): value is ReaderTheme {
  return value === "paper" || value === "night" || value === "oled";
}

export function isReaderFontSize(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_READER_FONT_SIZE &&
    value <= MAX_READER_FONT_SIZE
  );
}

export function isReaderFontFamily(
  value: unknown
): value is ReaderFontFamily {
  return value === "serif" || value === "sans";
}

export function isReaderLineHeight(
  value: unknown
): value is ReaderLineHeight {
  return (
    value === "compact" || value === "comfortable" || value === "airy"
  );
}

export function isReaderContentWidth(
  value: unknown
): value is ReaderContentWidth {
  return value === "narrow" || value === "balanced" || value === "wide";
}

export function isReaderPreferences(
  value: unknown
): value is ReaderPreferences {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    Object.keys(candidate).length === 6 &&
    Object.hasOwn(candidate, "theme") &&
    Object.hasOwn(candidate, "fontSize") &&
    Object.hasOwn(candidate, "assistanceScope") &&
    Object.hasOwn(candidate, "fontFamily") &&
    Object.hasOwn(candidate, "lineHeight") &&
    Object.hasOwn(candidate, "contentWidth") &&
    isReaderTheme(candidate.theme) &&
    isReaderFontSize(candidate.fontSize) &&
    isReaderAssistanceScope(candidate.assistanceScope) &&
    isReaderFontFamily(candidate.fontFamily) &&
    isReaderLineHeight(candidate.lineHeight) &&
    isReaderContentWidth(candidate.contentWidth)
  );
}

export function validateReaderPreferences(
  value: unknown
): ReaderPreferences | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const allowedKeys = new Set([
    "theme",
    "fontSize",
    "assistanceScope",
    "fontFamily",
    "lineHeight",
    "contentWidth"
  ]);
  if (Object.keys(candidate).some((key) => !allowedKeys.has(key))) return null;

  if (
    !Object.hasOwn(candidate, "theme") ||
    !Object.hasOwn(candidate, "fontSize") ||
    !isReaderTheme(candidate.theme) ||
    !isReaderFontSize(candidate.fontSize) ||
    (Object.hasOwn(candidate, "assistanceScope") &&
      !isReaderAssistanceScope(candidate.assistanceScope)) ||
    (Object.hasOwn(candidate, "fontFamily") &&
      !isReaderFontFamily(candidate.fontFamily)) ||
    (Object.hasOwn(candidate, "lineHeight") &&
      !isReaderLineHeight(candidate.lineHeight)) ||
    (Object.hasOwn(candidate, "contentWidth") &&
      !isReaderContentWidth(candidate.contentWidth))
  ) {
    return null;
  }

  return {
    theme: candidate.theme,
    fontSize: candidate.fontSize,
    assistanceScope: Object.hasOwn(candidate, "assistanceScope")
      ? (candidate.assistanceScope as ReaderAssistanceScope)
      : DEFAULT_READER_PREFERENCES.assistanceScope,
    fontFamily: Object.hasOwn(candidate, "fontFamily")
      ? (candidate.fontFamily as ReaderFontFamily)
      : DEFAULT_READER_PREFERENCES.fontFamily,
    lineHeight: Object.hasOwn(candidate, "lineHeight")
      ? (candidate.lineHeight as ReaderLineHeight)
      : DEFAULT_READER_PREFERENCES.lineHeight,
    contentWidth: Object.hasOwn(candidate, "contentWidth")
      ? (candidate.contentWidth as ReaderContentWidth)
      : DEFAULT_READER_PREFERENCES.contentWidth
  };
}

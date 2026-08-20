import type {
  AnnotatedParagraph,
  AnnotatedSentence,
  AnnotatedToken,
  CharacterAnnotation,
  ReaderArticle,
  WordToken
} from "../../content/types";
import type { LibraryState } from "../library/readingState";
import type { AssistanceHistoryState } from "../review/assistanceHistory";

export const IMPORTED_BOOK_SCHEMA_VERSION = 2;
export const IMPORT_ANALYSIS_ENGINE_VERSION = "pinyin-pro-3.28.0+cvdict-c379d90";
export const MAX_IMPORT_FILE_BYTES = 512 * 1024;
export const MAX_IMPORT_CHARACTERS = 120_000;
export const MAX_IMPORTED_BOOKS_IN_BACKUP = 100;

export type ImportSourceType = "paste" | "txt" | "epub";

export type ImportedBookTocEntry = {
  id: string;
  title: string;
  paragraphId: string;
};

export type ImportedBook = ReaderArticle & {
  kind: "imported";
  schemaVersion: typeof IMPORTED_BOOK_SCHEMA_VERSION;
  sourceType: ImportSourceType;
  sourceName: string | null;
  author: string | null;
  createdAt: number;
  updatedAt: number;
  characterCount: number;
  chapterCount: number;
  tableOfContents: ImportedBookTocEntry[];
  annotationSource: "automatic-offline";
  analysisEngineVersion: typeof IMPORT_ANALYSIS_ENGINE_VERSION;
  level: "Tự nhập";
  topic: "Phân tích tự động";
};

export type NormalizedImport = {
  text: string;
  paragraphs: string[];
  characterCount: number;
  chapters: NormalizedImportChapter[];
};

export type NormalizedImportChapter = {
  title: string;
  paragraphIndex: number;
};

export type ImportDraft = {
  id: string;
  title: string;
  author: string | null;
  sourceType: ImportSourceType;
  sourceName: string | null;
  normalized: NormalizedImport;
  createdAt: number;
};

export type ImportAnalysisProgress = {
  percent: number;
  message: string;
};

export type ImportedBookValidationResult =
  | { ok: true; book: ImportedBook }
  | { ok: false; message: string };

export function isImportedBook(article: ReaderArticle): article is ImportedBook {
  return "kind" in article && article.kind === "imported";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function isSafeText(value: unknown, maxLength: number, allowEmpty = false): value is string {
  return (
    typeof value === "string" &&
    (allowEmpty || value.length > 0) &&
    value.length <= maxLength &&
    !value.includes("\u0000")
  );
}

function isTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 8_640_000_000_000_000
  );
}

function validateCharacter(value: unknown): CharacterAnnotation | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["hanzi", "pinyin", "meaning"])) {
    return null;
  }
  return isSafeText(value.hanzi, 8) &&
    isSafeText(value.pinyin, 128, true) &&
    isSafeText(value.meaning, 2_000)
    ? { hanzi: value.hanzi, pinyin: value.pinyin, meaning: value.meaning }
    : null;
}

function validateToken(value: unknown): AnnotatedToken | null {
  if (!isRecord(value) || !isSafeText(value.id, 200)) return null;
  if (value.kind === "punctuation") {
    return hasOnlyKeys(value, ["id", "kind", "hanzi"]) && isSafeText(value.hanzi, 2_000)
      ? { id: value.id, kind: "punctuation", hanzi: value.hanzi }
      : null;
  }
  if (
    value.kind !== "word" ||
    !hasOnlyKeys(value, ["id", "kind", "hanzi", "pinyin", "meaning", "characters"]) ||
    !isSafeText(value.hanzi, 64) ||
    !isSafeText(value.pinyin, 512) ||
    !isSafeText(value.meaning, 2_000) ||
    !Array.isArray(value.characters) ||
    value.characters.length === 0 ||
    value.characters.length > 64
  ) {
    return null;
  }
  const characters = value.characters.map(validateCharacter);
  if (characters.some((item) => item === null)) return null;
  return {
    id: value.id,
    kind: "word",
    hanzi: value.hanzi,
    pinyin: value.pinyin,
    meaning: value.meaning,
    characters: characters as CharacterAnnotation[]
  } satisfies WordToken;
}

function validateSentence(value: unknown): AnnotatedSentence | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["id", "translation", "translationStatus", "tokens"]) ||
    !isSafeText(value.id, 200) ||
    !isSafeText(value.translation, 2_000) ||
    value.translationStatus !== "unavailable-offline" ||
    !Array.isArray(value.tokens) ||
    value.tokens.length === 0 ||
    value.tokens.length > 2_000
  ) {
    return null;
  }
  const tokens = value.tokens.map(validateToken);
  if (tokens.some((token) => token === null)) return null;
  return {
    id: value.id,
    translation: value.translation,
    translationStatus: "unavailable-offline",
    tokens: tokens as AnnotatedToken[]
  };
}

function validateParagraph(value: unknown): AnnotatedParagraph | null {
  const plainKeys = ["id", "sentences"] as const;
  const sectionKeys = [
    "id",
    "sectionTitle",
    "sectionTitlePinyin",
    "sectionTitleTranslation",
    "sentences"
  ] as const;
  if (
    !isRecord(value) ||
    (!hasOnlyKeys(value, plainKeys) && !hasOnlyKeys(value, sectionKeys)) ||
    !isSafeText(value.id, 200) ||
    !Array.isArray(value.sentences) ||
    value.sentences.length === 0 ||
    value.sentences.length > 2_000
  ) {
    return null;
  }
  const sentences = value.sentences.map(validateSentence);
  if (sentences.some((sentence) => sentence === null)) return null;
  if (Object.hasOwn(value, "sectionTitle")) {
    if (
      !isSafeText(value.sectionTitle, 200) ||
      !isSafeText(value.sectionTitlePinyin, 1_000, true) ||
      !isSafeText(value.sectionTitleTranslation, 300, true)
    ) {
      return null;
    }
    return {
      id: value.id,
      sectionTitle: value.sectionTitle,
      sectionTitlePinyin: value.sectionTitlePinyin,
      sectionTitleTranslation: value.sectionTitleTranslation,
      sentences: sentences as AnnotatedSentence[]
    };
  }
  return { id: value.id, sentences: sentences as AnnotatedSentence[] };
}

function validateTocEntry(value: unknown): ImportedBookTocEntry | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["id", "title", "paragraphId"]) ||
    !isSafeText(value.id, 200) ||
    !isSafeText(value.title, 200) ||
    !isSafeText(value.paragraphId, 200)
  ) {
    return null;
  }
  return { id: value.id, title: value.title, paragraphId: value.paragraphId };
}

export function validateImportedBook(value: unknown): ImportedBookValidationResult {
  if (!isRecord(value)) return { ok: false, message: "Record sách không phải object." };
  const legacyKeys = [
    "id", "kind", "schemaVersion", "sourceType", "sourceName", "author",
    "createdAt", "updatedAt", "characterCount", "annotationSource",
    "analysisEngineVersion", "title", "titlePinyin", "titleTranslation",
    "summary", "level", "topic", "estimatedMinutes", "accent", "paragraphs"
  ] as const;
  const currentKeys = [
    ...legacyKeys,
    "chapterCount",
    "tableOfContents"
  ] as const;
  const legacy = value.schemaVersion === 1;
  if (
    (legacy && !hasOnlyKeys(value, legacyKeys)) ||
    (!legacy && !hasOnlyKeys(value, currentKeys))
  ) {
    return { ok: false, message: "Record sách có trường lạ hoặc thiếu trường." };
  }
  if (
    !isSafeText(value.id, 200) || !value.id.startsWith("imported:") ||
    value.kind !== "imported" || (!legacy && value.schemaVersion !== IMPORTED_BOOK_SCHEMA_VERSION) ||
    (legacy
      ? value.sourceType !== "paste" && value.sourceType !== "txt"
      : value.sourceType !== "paste" && value.sourceType !== "txt" &&
        value.sourceType !== "epub") ||
    !(value.sourceName === null || isSafeText(value.sourceName, 255)) ||
    !(value.author === null || isSafeText(value.author, 200)) ||
    !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt) ||
    typeof value.characterCount !== "number" || !Number.isSafeInteger(value.characterCount) ||
    value.characterCount <= 0 || value.characterCount > MAX_IMPORT_CHARACTERS ||
    value.annotationSource !== "automatic-offline" ||
    value.analysisEngineVersion !== IMPORT_ANALYSIS_ENGINE_VERSION ||
    !isSafeText(value.title, 200) || !isSafeText(value.titlePinyin, 1_000, true) ||
    !isSafeText(value.titleTranslation, 300) || !isSafeText(value.summary, 1_000) ||
    value.level !== "Tự nhập" || value.topic !== "Phân tích tự động" ||
    typeof value.estimatedMinutes !== "number" || !Number.isInteger(value.estimatedMinutes) ||
    value.estimatedMinutes < 1 || value.estimatedMinutes > 600 ||
    !["jade", "amber", "coral"].includes(value.accent as string) ||
    !Array.isArray(value.paragraphs) || value.paragraphs.length === 0 ||
    value.paragraphs.length > 5_000
  ) {
    return { ok: false, message: "Metadata sách tự nhập không hợp lệ." };
  }
  const paragraphs = value.paragraphs.map(validateParagraph);
  if (paragraphs.some((paragraph) => paragraph === null)) {
    return { ok: false, message: "Nội dung chú thích của sách tự nhập bị hỏng." };
  }
  if (legacy) {
    return {
      ok: true,
      book: {
        ...value,
        schemaVersion: IMPORTED_BOOK_SCHEMA_VERSION,
        chapterCount: 1,
        tableOfContents: [],
        paragraphs
      } as unknown as ImportedBook
    };
  }
  if (
    typeof value.chapterCount !== "number" ||
    !Number.isSafeInteger(value.chapterCount) ||
    value.chapterCount < 1 ||
    value.chapterCount > 500 ||
    !Array.isArray(value.tableOfContents) ||
    value.tableOfContents.length > 500
  ) {
    return { ok: false, message: "Thông tin chương của sách tự nhập không hợp lệ." };
  }
  const tableOfContents = value.tableOfContents.map(validateTocEntry);
  const paragraphIds = new Set((paragraphs as AnnotatedParagraph[]).map((item) => item.id));
  const tocIds = new Set<string>();
  let invalidToc = false;
  for (const entry of tableOfContents) {
    if (
      !entry ||
      tocIds.has(entry.id) ||
      !paragraphIds.has(entry.paragraphId)
    ) {
      invalidToc = true;
      break;
    }
    tocIds.add(entry.id);
  }
  if (
    invalidToc ||
    (value.sourceType === "epub" &&
      (tableOfContents.length === 0 || tableOfContents.length !== value.chapterCount)) ||
    (value.sourceType !== "epub" &&
      (tableOfContents.length > 0 || value.chapterCount !== 1))
  ) {
    return { ok: false, message: "Mục lục sách tự nhập không hợp lệ." };
  }
  return {
    ok: true,
    book: {
      ...value,
      paragraphs,
      tableOfContents: tableOfContents as ImportedBookTocEntry[]
    } as unknown as ImportedBook
  };
}

function joinWrappedLines(lines: string[]): string {
  return lines.reduce((joined, line) => {
    if (!joined) return line;
    const needsSpace = /[\p{Script=Latin}\p{N}]$/u.test(joined) &&
      /^[\p{Script=Latin}\p{N}]/u.test(line);
    return `${joined}${needsSpace ? " " : ""}${line}`;
  }, "");
}

export function normalizeImportedText(input: string): NormalizedImport {
  const normalizedNewlines = input
    .replace(/^\uFEFF/u, "")
    .replace(/\r\n?/gu, "\n")
    .normalize("NFC")
    .replace(/[\u00A0\u2007\u202F]/gu, " ");
  const blocks = normalizedNewlines.split(/\n\s*\n+/u);
  const paragraphs = blocks
    .map((block) =>
      joinWrappedLines(
        block
          .split("\n")
          .map((line) => line.replace(/[\t ]+/gu, " ").trim())
          .filter(Boolean)
      )
    )
    .filter(Boolean);
  const text = paragraphs.join("\n\n");
  return {
    text,
    paragraphs,
    characterCount: Array.from(text).length,
    chapters: []
  };
}

export function getImportValidationError(normalized: NormalizedImport): string | null {
  if (normalized.characterCount === 0) return "Văn bản đang trống.";
  if (normalized.characterCount > MAX_IMPORT_CHARACTERS) {
    return `Văn bản vượt giới hạn ${MAX_IMPORT_CHARACTERS.toLocaleString("vi-VN")} ký tự.`;
  }
  if (!/\p{Script=Han}/u.test(normalized.text)) {
    return "Chưa tìm thấy chữ Hán để tạo pinyin và nghĩa offline.";
  }
  return null;
}

export async function decodeUtf8TxtFile(file: File): Promise<string> {
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error("File TXT vượt giới hạn 512 KB.");
  }
  if (!file.name.toLocaleLowerCase("vi-VN").endsWith(".txt")) {
    throw new Error("Chỉ nhận file có đuôi .txt.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (
    (bytes[0] === 0xff && bytes[1] === 0xfe) ||
    (bytes[0] === 0xfe && bytes[1] === 0xff)
  ) {
    throw new Error("TXT UTF-16 chưa được hỗ trợ. Hãy lưu lại file dưới dạng UTF-8.");
  }
  const offset = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(offset));
    if (text.includes("\u0000")) throw new Error("binary");
    return text;
  } catch {
    throw new Error("File không phải TXT UTF-8 hợp lệ.");
  }
}

export function createImportedBookId(): string {
  const randomId = globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `imported:${randomId}`;
}

export function removeImportedBookReferences<T extends {
  libraryState: LibraryState;
  assistanceHistory: AssistanceHistoryState;
}>(data: T, bookId: string): T {
  const progressByArticle = { ...data.libraryState.progressByArticle };
  const historyByArticle = { ...data.libraryState.historyByArticle };
  delete progressByArticle[bookId];
  delete historyByArticle[bookId];
  const items = Object.fromEntries(
    Object.entries(data.assistanceHistory.items).flatMap(([id, item]) => {
      const contexts = item.contexts.filter((context) => context.articleId !== bookId);
      return contexts.length > 0 ? [[id, { ...item, contexts }]] : [];
    })
  );
  return {
    ...data,
    libraryState: {
      ...data.libraryState,
      favoriteArticleIds: data.libraryState.favoriteArticleIds.filter((id) => id !== bookId),
      progressByArticle,
      historyByArticle,
      lastOpenedArticleId:
        data.libraryState.lastOpenedArticleId === bookId
          ? null
          : data.libraryState.lastOpenedArticleId
    },
    assistanceHistory: { ...data.assistanceHistory, items }
  };
}

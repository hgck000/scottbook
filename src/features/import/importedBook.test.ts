import { describe, expect, it } from "vitest";
import { createEmptyLibraryState } from "../library/readingState";
import { createEmptyAssistanceHistory } from "../review/assistanceHistory";
import {
  IMPORT_ANALYSIS_ENGINE_VERSION,
  decodeUtf8TxtFile,
  getImportValidationError,
  normalizeImportedText,
  removeImportedBookReferences,
  validateImportedBook,
  type ImportedBook
} from "./importedBook";

export function createImportedBookFixture(id = "imported:fixture"): ImportedBook {
  return {
    id,
    kind: "imported",
    schemaVersion: 2,
    sourceType: "paste",
    sourceName: null,
    author: null,
    createdAt: 1,
    updatedAt: 1,
    characterCount: 4,
    chapterCount: 1,
    tableOfContents: [],
    annotationSource: "automatic-offline",
    analysisEngineVersion: IMPORT_ANALYSIS_ENGINE_VERSION,
    title: "Bài riêng",
    titlePinyin: "",
    titleTranslation: "Văn bản tự nhập",
    summary: "Phân tích tự động offline.",
    level: "Tự nhập",
    topic: "Phân tích tự động",
    estimatedMinutes: 1,
    accent: "jade",
    paragraphs: [
      {
        id: `${id}-p0`,
        sentences: [
          {
            id: `${id}-p0-s0`,
            translation: "Chưa có bản dịch câu trong chế độ phân tích offline.",
            translationStatus: "unavailable-offline",
            tokens: [
              {
                id: `${id}-p0-s0-t0`,
                kind: "word",
                hanzi: "学习",
                pinyin: "xué xí",
                meaning: "học tập",
                characters: [
                  { hanzi: "学", pinyin: "xué", meaning: "học" },
                  { hanzi: "习", pinyin: "xí", meaning: "ôn tập" }
                ]
              },
              { id: `${id}-p0-s0-t1`, kind: "punctuation", hanzi: "。" }
            ]
          }
        ]
      }
    ]
  };
}

describe("local text import", () => {
  it("normalizes BOM, Windows newlines, spaces, and blank paragraphs", () => {
    const normalized = normalizeImportedText(
      "\uFEFF  我  喜欢学习。\r\n这是 wrapped line。\r\n\r\n\r\n第二段 😊。  "
    );
    expect(normalized.paragraphs).toEqual([
      "我 喜欢学习。这是 wrapped line。",
      "第二段 😊。"
    ]);
    expect(normalized.text).toContain("\n\n");
    expect(getImportValidationError(normalized)).toBeNull();
  });

  it("accepts UTF-8 BOM and rejects UTF-16 TXT", async () => {
    const utf8 = new File(
      [new Uint8Array([0xef, 0xbb, 0xbf]), "你好。"],
      "lesson.txt",
      { type: "text/plain" }
    );
    await expect(decodeUtf8TxtFile(utf8)).resolves.toBe("你好。");
    const utf16 = new File(
      [new Uint8Array([0xff, 0xfe, 0x60, 0x4f])],
      "lesson.txt"
    );
    await expect(decodeUtf8TxtFile(utf16)).rejects.toThrow("UTF-16");
  });

  it("strictly validates stored annotations", () => {
    const book = createImportedBookFixture();
    expect(validateImportedBook(book)).toEqual({ ok: true, book });
    expect(validateImportedBook({ ...book, unexpected: true })).toMatchObject({
      ok: false
    });
  });

  it("migrates schema v1 text books without losing annotations", () => {
    const current = createImportedBookFixture();
    const { chapterCount, tableOfContents, ...legacy } = current;
    expect(chapterCount).toBe(1);
    expect(tableOfContents).toEqual([]);

    expect(validateImportedBook({ ...legacy, schemaVersion: 1 })).toMatchObject({
      ok: true,
      book: { schemaVersion: 2, chapterCount: 1, tableOfContents: [] }
    });
  });

  it("validates EPUB chapter navigation against stored paragraphs", () => {
    const current = createImportedBookFixture();
    const paragraph = current.paragraphs[0];
    if (!paragraph) throw new Error("imported fixture paragraph expected");
    const epub = {
      ...current,
      sourceType: "epub",
      sourceName: "lesson.epub",
      chapterCount: 1,
      tableOfContents: [{
        id: `${current.id}-toc-0`,
        title: "第一课",
        paragraphId: paragraph.id
      }],
      paragraphs: [{
        ...paragraph,
        sectionTitle: "第一课",
        sectionTitlePinyin: "dì yī kè",
        sectionTitleTranslation: ""
      }]
    };

    expect(validateImportedBook(epub)).toMatchObject({ ok: true });
    expect(validateImportedBook({
      ...epub,
      tableOfContents: [{ ...epub.tableOfContents[0], paragraphId: "missing" }]
    })).toMatchObject({ ok: false });
  });

  it("removes only deleted-book progress and assistance contexts", () => {
    const libraryState = createEmptyLibraryState();
    libraryState.favoriteArticleIds = ["imported:fixture", "morning-routine"];
    libraryState.lastOpenedArticleId = "imported:fixture";
    libraryState.historyByArticle["imported:fixture"] = {
      articleId: "imported:fixture",
      firstOpenedAt: 1,
      lastOpenedAt: 1,
      openCount: 1,
      completedAt: null
    };
    const assistanceHistory = createEmptyAssistanceHistory();
    assistanceHistory.items.word = {
      id: "word",
      scope: "word",
      hanzi: "学习",
      pinyin: "xué xí",
      meaning: "học tập",
      pinyinCount: 2,
      meaningCount: 1,
      firstSeenAt: 1,
      lastSeenAt: 2,
      knownAt: null,
      pinned: false,
      contexts: [
        {
          id: "imported",
          articleId: "imported:fixture",
          sentenceId: "s1",
          sentenceText: "学习。",
          sentenceTranslation: "offline",
          seenCount: 1,
          lastSeenAt: 1
        },
        {
          id: "built-in",
          articleId: "morning-routine",
          sentenceId: "s2",
          sentenceText: "我学习。",
          sentenceTranslation: "Tôi học.",
          seenCount: 1,
          lastSeenAt: 2
        }
      ]
    };

    const next = removeImportedBookReferences(
      { libraryState, assistanceHistory },
      "imported:fixture"
    );
    expect(next.libraryState.favoriteArticleIds).toEqual(["morning-routine"]);
    expect(next.libraryState.lastOpenedArticleId).toBeNull();
    expect(next.libraryState.historyByArticle["imported:fixture"]).toBeUndefined();
    expect(next.assistanceHistory.items.word?.contexts).toHaveLength(1);
    expect(next.assistanceHistory.items.word?.contexts[0]?.articleId).toBe("morning-routine");
  });
});

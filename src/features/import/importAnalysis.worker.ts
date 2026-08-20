/// <reference lib="webworker" />

import { gunzipSync, strFromU8 } from "fflate";
import { OutputFormat, pinyin, segment } from "pinyin-pro";
import type {
  AnnotatedParagraph,
  AnnotatedSentence,
  AnnotatedToken,
  CharacterAnnotation,
  PunctuationToken,
  WordToken
} from "../../content/types";
import {
  IMPORT_ANALYSIS_ENGINE_VERSION,
  IMPORTED_BOOK_SCHEMA_VERSION,
  type ImportDraft,
  type ImportedBook
} from "./importedBook";

type AnalyzeMessage = {
  type: "analyze";
  requestId: string;
  dictionaryUrl: string;
  draft: ImportDraft;
};

type DictionaryEntry = {
  meaning: string;
};

const worker = self as DedicatedWorkerGlobalScope;
const NO_SENTENCE_TRANSLATION = "Chưa có bản dịch câu trong chế độ phân tích offline.";
const NO_WORD_MEANING = "Chưa có nghĩa tiếng Việt trong từ điển offline.";

function report(requestId: string, percent: number, message: string): void {
  worker.postMessage({ type: "progress", requestId, percent, message });
}

function cleanDefinition(value: string): string {
  return value
    .replace(/\s+/gu, " ")
    .replace(/^\s+|\s+$/gu, "")
    .slice(0, 600);
}

function parseDictionary(serialized: string, requestId: string): Map<string, DictionaryEntry> {
  const dictionary = new Map<string, DictionaryEntry>();
  const lines = serialized.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^\S+\s+(\S+)\s+\[[^\]]*\]\s+\/(.*)\/$/u);
    if (!match?.[1] || !match[2]) continue;
    const meanings = match[2]
      .split("/")
      .map(cleanDefinition)
      .filter(Boolean)
      .slice(0, 3);
    if (meanings.length === 0) continue;
    const nextMeaning = meanings.join("; ");
    const existing = dictionary.get(match[1]);
    dictionary.set(match[1], {
      meaning: existing && existing.meaning !== nextMeaning
        ? `${existing.meaning}; ${nextMeaning}`.slice(0, 1_200)
        : nextMeaning
    });
    if (index > 0 && index % 20_000 === 0) {
      report(requestId, 25 + Math.round((index / lines.length) * 25), "Đang lập chỉ mục nghĩa Việt offline…");
    }
  }
  return dictionary;
}

async function loadDictionary(url: string, requestId: string): Promise<Map<string, DictionaryEntry>> {
  report(requestId, 5, "Đang mở từ điển offline…");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Không mở được dữ liệu CVDICT đã đóng gói trong app.");
  const compressed = new Uint8Array(await response.arrayBuffer());
  report(requestId, 16, "Đang giải nén từ điển trên thiết bị…");
  const serialized = strFromU8(gunzipSync(compressed));
  report(requestId, 25, "Đang lập chỉ mục nghĩa Việt offline…");
  return parseDictionary(serialized, requestId);
}

function splitLongSentence(value: string, maximum = 260): string[] {
  const characters = Array.from(value);
  if (characters.length <= maximum) return [value];
  const chunks: string[] = [];
  let start = 0;
  while (start < characters.length) {
    let end = Math.min(start + maximum, characters.length);
    if (end < characters.length) {
      const preferred = characters
        .slice(start, end)
        .map((character, index) => ({ character, index }))
        .reverse()
        .find(({ character }) => /[，、：,:]/u.test(character));
      if (preferred && preferred.index > maximum / 2) end = start + preferred.index + 1;
    }
    chunks.push(characters.slice(start, end).join(""));
    start = end;
  }
  return chunks;
}

export function splitParagraphIntoSentences(paragraph: string): string[] {
  const sentences: string[] = [];
  let current = "";
  for (const character of paragraph) {
    current += character;
    if (/[。！？!?；;]/u.test(character)) {
      sentences.push(...splitLongSentence(current));
      current = "";
    }
  }
  if (current) sentences.push(...splitLongSentence(current));
  return sentences.filter(Boolean);
}

function getPinyinByCharacter(hanzi: string): string[] {
  return pinyin(hanzi, {
    type: "array",
    toneType: "symbol",
    nonZh: "consecutive"
  });
}

function getMeaning(dictionary: Map<string, DictionaryEntry>, hanzi: string): string {
  const exact = dictionary.get(hanzi)?.meaning;
  if (exact) return exact;
  const characterMeanings = Array.from(hanzi)
    .map((character) => {
      const meaning = dictionary.get(character)?.meaning;
      return meaning ? `${character}: ${meaning}` : null;
    })
    .filter((value): value is string => value !== null);
  return characterMeanings.length > 0 ? characterMeanings.join("; ") : NO_WORD_MEANING;
}

function createWordToken(
  origin: string,
  tokenId: string,
  dictionary: Map<string, DictionaryEntry>
): WordToken {
  const pinyinByCharacter = getPinyinByCharacter(origin);
  const characters: CharacterAnnotation[] = Array.from(origin).map((hanzi, index) => ({
    hanzi,
    pinyin: pinyinByCharacter[index] ?? "",
    meaning: dictionary.get(hanzi)?.meaning ?? NO_WORD_MEANING
  }));
  return {
    id: tokenId,
    kind: "word",
    hanzi: origin,
    pinyin: pinyinByCharacter.join(" "),
    meaning: getMeaning(dictionary, origin),
    characters
  };
}

function annotateSentence(
  text: string,
  sentenceId: string,
  dictionary: Map<string, DictionaryEntry>
): AnnotatedSentence {
  const rawSegments = segment(text, { format: OutputFormat.AllSegment });
  const tokens: AnnotatedToken[] = [];
  let punctuation = "";
  let tokenIndex = 0;
  const flushPunctuation = () => {
    if (!punctuation) return;
    tokens.push({
      id: `${sentenceId}-t${tokenIndex++}`,
      kind: "punctuation",
      hanzi: punctuation
    } satisfies PunctuationToken);
    punctuation = "";
  };
  for (const item of rawSegments) {
    if (/^\p{Script=Han}+$/u.test(item.origin)) {
      flushPunctuation();
      tokens.push(createWordToken(item.origin, `${sentenceId}-t${tokenIndex++}`, dictionary));
    } else {
      punctuation += item.origin;
    }
  }
  flushPunctuation();
  return {
    id: sentenceId,
    translation: NO_SENTENCE_TRANSLATION,
    translationStatus: "unavailable-offline",
    tokens
  };
}

function buildBook(draft: ImportDraft, dictionary: Map<string, DictionaryEntry>, requestId: string): ImportedBook {
  const paragraphs: AnnotatedParagraph[] = [];
  const tableOfContents: ImportedBook["tableOfContents"] = [];
  const chaptersByParagraph = new Map(
    draft.normalized.chapters.map((chapter) => [chapter.paragraphIndex, chapter])
  );
  const total = draft.normalized.paragraphs.length;
  for (let paragraphIndex = 0; paragraphIndex < total; paragraphIndex += 1) {
    const paragraph = draft.normalized.paragraphs[paragraphIndex] ?? "";
    const sentences = splitParagraphIntoSentences(paragraph).map((sentence, sentenceIndex) =>
      annotateSentence(sentence, `${draft.id}-p${paragraphIndex}-s${sentenceIndex}`, dictionary)
    );
    if (sentences.length > 0) {
      const paragraphId = `${draft.id}-p${paragraphIndex}`;
      const chapter = chaptersByParagraph.get(paragraphIndex);
      const sectionTitlePinyin = chapter && /\p{Script=Han}/u.test(chapter.title)
        ? getPinyinByCharacter(chapter.title).join(" ")
        : "";
      paragraphs.push(chapter
        ? {
            id: paragraphId,
            sectionTitle: chapter.title,
            sectionTitlePinyin,
            sectionTitleTranslation: "",
            sentences
          }
        : { id: paragraphId, sentences });
      if (chapter) {
        tableOfContents.push({
          id: `${draft.id}-toc-${tableOfContents.length}`,
          title: chapter.title,
          paragraphId
        });
      }
    }
    report(
      requestId,
      55 + Math.round(((paragraphIndex + 1) / total) * 40),
      `Đang phân tích đoạn ${paragraphIndex + 1}/${total}…`
    );
  }
  const titlePinyin = /\p{Script=Han}/u.test(draft.title)
    ? getPinyinByCharacter(draft.title).join(" ")
    : "";
  return {
    id: draft.id,
    kind: "imported",
    schemaVersion: IMPORTED_BOOK_SCHEMA_VERSION,
    sourceType: draft.sourceType,
    sourceName: draft.sourceName,
    author: draft.author,
    createdAt: draft.createdAt,
    updatedAt: draft.createdAt,
    characterCount: draft.normalized.characterCount,
    chapterCount: draft.sourceType === "epub" ? tableOfContents.length : 1,
    tableOfContents,
    annotationSource: "automatic-offline",
    analysisEngineVersion: IMPORT_ANALYSIS_ENGINE_VERSION,
    title: draft.title,
    titlePinyin,
    titleTranslation: draft.author
      ? `Tác giả: ${draft.author}`
      : draft.sourceType === "epub"
        ? "EPUB tự nhập"
        : "Văn bản tự nhập",
    summary: "Pinyin và nghĩa từ/cụm được phân tích tự động bằng dữ liệu offline.",
    level: "Tự nhập",
    topic: "Phân tích tự động",
    estimatedMinutes: Math.max(1, Math.min(600, Math.ceil(draft.normalized.characterCount / 300))),
    accent: ["jade", "amber", "coral"][draft.createdAt % 3] as ImportedBook["accent"],
    paragraphs
  };
}

worker.addEventListener("message", (event: MessageEvent<AnalyzeMessage>) => {
  const message = event.data;
  if (message.type !== "analyze") return;
  void (async () => {
    const dictionary = await loadDictionary(message.dictionaryUrl, message.requestId);
    report(message.requestId, 55, "Đang tách câu, từ và tạo pinyin…");
    const book = buildBook(message.draft, dictionary, message.requestId);
    worker.postMessage({ type: "complete", requestId: message.requestId, book });
  })().catch((error: unknown) => {
    worker.postMessage({
      type: "error",
      requestId: message.requestId,
      message: error instanceof Error ? error.message : "Phân tích offline thất bại."
    });
  });
});

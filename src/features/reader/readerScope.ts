import type {
  AnnotatedSentence,
  WordToken
} from "../../content/types";
import { getHanVietReading } from "../../content/hanVietReadings";

export const READER_ASSISTANCE_SCOPES = [
  "character",
  "word",
  "sentence"
] as const;

export type ReaderAssistanceScope =
  (typeof READER_ASSISTANCE_SCOPES)[number];

export type ReaderAssistanceUnit = {
  id: string;
  scope: ReaderAssistanceScope;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hanViet?: string;
  hanVietAmbiguous?: boolean;
};

export function isReaderAssistanceScope(
  value: unknown
): value is ReaderAssistanceScope {
  return READER_ASSISTANCE_SCOPES.includes(value as ReaderAssistanceScope);
}

export function getAssistanceScopeLabel(
  scope: ReaderAssistanceScope
): string {
  if (scope === "character") return "Chữ";
  if (scope === "sentence") return "Câu";
  return "Từ/cụm";
}

export function getTokenAssistanceUnits(
  token: WordToken,
  scope: Exclude<ReaderAssistanceScope, "sentence">
): ReaderAssistanceUnit[] {
  if (scope === "word") {
    const hanViet = getHanVietReading(
      token.hanzi,
      token.characters.map((character) => character.pinyin)
    );
    return [
      {
        id: `word:${token.id}`,
        scope,
        hanzi: token.hanzi,
        pinyin: token.pinyin,
        meaning: token.meaning,
        hanViet: hanViet?.display,
        hanVietAmbiguous: hanViet?.ambiguous
      }
    ];
  }

  return token.characters.map((item, index) => {
    const hanViet = getHanVietReading(item.hanzi, [item.pinyin]);
    return {
      id: `character:${token.id}:${index}`,
      scope,
      hanzi: item.hanzi,
      pinyin: item.pinyin,
      meaning: item.meaning,
      hanViet: hanViet?.display,
      hanVietAmbiguous: hanViet?.ambiguous
    };
  });
}

export function getSentenceText(sentence: AnnotatedSentence): string {
  return sentence.tokens.map((token) => token.hanzi).join("");
}

export function getSentencePinyin(sentence: AnnotatedSentence): string {
  let pinyin = "";
  for (const token of sentence.tokens) {
    if (token.kind === "punctuation") {
      pinyin = `${pinyin.trimEnd()}${token.hanzi} `;
    } else {
      pinyin += `${token.pinyin} `;
    }
  }
  return pinyin.trim();
}

export function getSentenceAssistanceUnits(
  sentence: AnnotatedSentence,
  scope: ReaderAssistanceScope
): ReaderAssistanceUnit[] {
  if (scope === "sentence") {
    return [
      {
        id: `sentence:${sentence.id}`,
        scope,
        hanzi: getSentenceText(sentence),
        pinyin: getSentencePinyin(sentence),
        meaning: sentence.translation
      }
    ];
  }

  return sentence.tokens.flatMap((token) =>
    token.kind === "word" ? getTokenAssistanceUnits(token, scope) : []
  );
}

export function getAssistanceUnitKey(
  sentence: AnnotatedSentence,
  unit: ReaderAssistanceUnit
): string {
  return `${sentence.id}:${unit.id}`;
}

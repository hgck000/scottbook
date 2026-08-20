import {
  HAN_VIET_PINYIN_READINGS,
  HAN_VIET_READINGS
} from "./hanVietReadings.generated";

export const HAN_VIET_DATA_VERSION = "Unicode Unihan 17.0.0";

export type HanVietReading = {
  display: string;
  ambiguous: boolean;
};

// Curated reading for a common simplified form whose `yào` pronunciation is
// absent from the pinned generic Unihan row and pinyin-specific wordlist.
const HAN_VIET_PINYIN_OVERRIDES: Readonly<Record<string, string>> = {
  "钥|yao4": "dược"
};

function formatCharacterReading(reading: string): {
  display: string;
  ambiguous: boolean;
} {
  const alternatives = reading.split(/\s+/u).filter(Boolean);
  if (alternatives.length <= 1) {
    return { display: alternatives[0] ?? reading, ambiguous: false };
  }
  return {
    display: `(${alternatives.join("/")})`,
    ambiguous: true
  };
}

const PINYIN_TONE_MARKS: Readonly<Record<string, readonly [string, number]>> = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4],
  ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4],
  ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4],
  ǖ: ["u:", 1], ǘ: ["u:", 2], ǚ: ["u:", 3], ǜ: ["u:", 4],
  ü: ["u:", 5], ń: ["n", 2], ň: ["n", 3], ǹ: ["n", 4], ḿ: ["m", 2]
};

export function normalizePinyinSyllable(pinyin: string): string {
  let tone = 5;
  let normalized = "";
  for (const character of pinyin.toLocaleLowerCase("vi-VN")) {
    const marked = PINYIN_TONE_MARKS[character];
    if (marked) {
      normalized += marked[0];
      tone = marked[1];
    } else if (/[a-z:]/u.test(character)) {
      normalized += character;
    }
  }
  return normalized ? `${normalized}${tone}` : "";
}

function findReading(character: string, pinyin?: string): string | undefined {
  const normalizedPinyin = pinyin ? normalizePinyinSyllable(pinyin) : "";
  const genericReading = HAN_VIET_READINGS[character];
  const unambiguousGeneric =
    genericReading && !genericReading.includes(" ")
      ? genericReading
      : undefined;
  return (
    (normalizedPinyin
      ? HAN_VIET_PINYIN_OVERRIDES[`${character}|${normalizedPinyin}`]
      : undefined) ??
    (normalizedPinyin
      ? HAN_VIET_PINYIN_READINGS[`${character}|${normalizedPinyin}`]
      : undefined) ??
    HAN_VIET_PINYIN_READINGS[`${character}|*`] ??
    unambiguousGeneric ??
    (normalizedPinyin
      ? HAN_VIET_PINYIN_READINGS[
          `${character}|${normalizedPinyin.replace(/[1-5]$/u, "")}`
        ]
      : undefined) ??
    genericReading
  );
}

export function getHanVietReading(
  hanzi: string,
  pinyinByCharacter?: readonly string[]
): HanVietReading | null {
  const characters = Array.from(hanzi).filter((character) =>
    /\p{Script=Han}/u.test(character)
  );
  if (characters.length === 0) return null;

  let ambiguous = false;
  const readings = characters.map((character, index) => {
    const source = findReading(character, pinyinByCharacter?.[index]);
    if (!source) return null;
    const formatted = formatCharacterReading(source);
    ambiguous ||= formatted.ambiguous;
    return formatted.display;
  });

  if (readings.some((reading) => reading === null)) return null;
  return {
    display: readings.join(" "),
    ambiguous
  };
}

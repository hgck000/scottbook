import { getAuthoredCharacters } from "./characterAnnotations";

export const punctuation = (id: string, hanzi: string) =>
  ({ id, kind: "punctuation", hanzi }) as const;

export const word = (
  id: string,
  hanzi: string,
  pinyin: string,
  meaning: string
) =>
  ({
    id,
    kind: "word",
    hanzi,
    pinyin,
    meaning,
    characters: getAuthoredCharacters(hanzi, pinyin, meaning)
  }) as const;

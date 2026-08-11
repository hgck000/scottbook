export type HskLevel = "HSK 1" | "HSK 2" | "HSK 3";

export type CharacterAnnotation = {
  hanzi: string;
  pinyin: string;
  meaning: string;
};

export type WordToken = {
  id: string;
  kind: "word";
  hanzi: string;
  pinyin: string;
  meaning: string;
  characters: readonly CharacterAnnotation[];
};

export type PunctuationToken = {
  id: string;
  kind: "punctuation";
  hanzi: string;
};

export type AnnotatedToken = WordToken | PunctuationToken;

export type AnnotatedSentence = {
  id: string;
  translation: string;
  tokens: readonly AnnotatedToken[];
};

export type AnnotatedParagraph = {
  id: string;
  sentences: readonly AnnotatedSentence[];
};

export type BuiltInArticle = {
  id: string;
  title: string;
  titlePinyin: string;
  titleTranslation: string;
  summary: string;
  level: HskLevel;
  topic: "Đời sống" | "Kế hoạch" | "Học tập";
  estimatedMinutes: number;
  accent: "jade" | "amber" | "coral";
  paragraphs: readonly AnnotatedParagraph[];
};

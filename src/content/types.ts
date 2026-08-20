export type HskLevel = "HSK 1" | "HSK 2" | "HSK 3" | "HSK 4";

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
  translationStatus?: "authored" | "unavailable-offline";
  tokens: readonly AnnotatedToken[];
};

export type AnnotatedParagraph = {
  id: string;
  sectionTitle?: string;
  sectionTitlePinyin?: string;
  sectionTitleTranslation?: string;
  sentences: readonly AnnotatedSentence[];
};

export type ReaderArticle = {
  id: string;
  title: string;
  titlePinyin: string;
  titleTranslation: string;
  summary: string;
  level: string;
  topic: string;
  estimatedMinutes: number;
  accent: "jade" | "amber" | "coral" | "violet";
  paragraphs: readonly AnnotatedParagraph[];
};

export type BuiltInArticle = ReaderArticle & {
  level: HskLevel;
  topic:
    | "Đời sống"
    | "Kế hoạch"
    | "Học tập"
    | "May mặc"
    | "Công sở"
    | "Thời trang"
    | "Thiết kế";
};

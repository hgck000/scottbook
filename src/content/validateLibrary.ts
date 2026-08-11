import type { BuiltInArticle } from "./types";

export type ContentValidationIssue = {
  path: string;
  message: string;
};

export function validateBuiltInLibrary(
  articles: readonly BuiltInArticle[]
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const articleIds = new Set<string>();

  if (articles.length === 0) {
    issues.push({ path: "library", message: "must contain at least one article" });
  }

  for (const article of articles) {
    const articlePath = `article:${article.id || "<missing-id>"}`;

    if (!article.id.trim()) {
      issues.push({ path: articlePath, message: "article id is required" });
    } else if (articleIds.has(article.id)) {
      issues.push({ path: articlePath, message: "article id must be unique" });
    }
    articleIds.add(article.id);

    if (!article.title.trim()) {
      issues.push({ path: articlePath, message: "title is required" });
    }
    if (!article.titlePinyin.trim()) {
      issues.push({ path: articlePath, message: "title pinyin is required" });
    }
    if (!article.titleTranslation.trim()) {
      issues.push({ path: articlePath, message: "title translation is required" });
    }
    if (!article.summary.trim()) {
      issues.push({ path: articlePath, message: "summary is required" });
    }
    if (
      !Number.isInteger(article.estimatedMinutes) ||
      article.estimatedMinutes <= 0
    ) {
      issues.push({
        path: articlePath,
        message: "estimated minutes must be a positive integer"
      });
    }
    if (article.paragraphs.length === 0) {
      issues.push({ path: articlePath, message: "article must contain a paragraph" });
    }

    const paragraphIds = new Set<string>();
    const sentenceIds = new Set<string>();
    for (const paragraph of article.paragraphs) {
      const paragraphPath = `${articlePath}/paragraph:${paragraph.id || "<missing-id>"}`;
      if (!paragraph.id.trim()) {
        issues.push({ path: paragraphPath, message: "paragraph id is required" });
      } else if (paragraphIds.has(paragraph.id)) {
        issues.push({
          path: paragraphPath,
          message: "paragraph id must be unique in article"
        });
      }
      paragraphIds.add(paragraph.id);

      if (paragraph.sentences.length === 0) {
        issues.push({ path: paragraphPath, message: "paragraph must contain a sentence" });
      }

      for (const sentence of paragraph.sentences) {
        const sentencePath = `${paragraphPath}/sentence:${sentence.id || "<missing-id>"}`;
        if (!sentence.id.trim()) {
          issues.push({ path: sentencePath, message: "sentence id is required" });
        } else if (sentenceIds.has(sentence.id)) {
          issues.push({ path: sentencePath, message: "sentence id must be unique in article" });
        }
        sentenceIds.add(sentence.id);

        if (!sentence.translation.trim()) {
          issues.push({ path: sentencePath, message: "sentence translation is required" });
        }
        if (sentence.tokens.length === 0) {
          issues.push({ path: sentencePath, message: "sentence must contain tokens" });
        }

        const tokenIds = new Set<string>();
        let hasWord = false;
        for (const token of sentence.tokens) {
          const tokenPath = `${sentencePath}/token:${token.id || "<missing-id>"}`;
          if (!token.id.trim()) {
            issues.push({ path: tokenPath, message: "token id is required" });
          } else if (tokenIds.has(token.id)) {
            issues.push({ path: tokenPath, message: "token id must be unique in sentence" });
          }
          tokenIds.add(token.id);

          if (!token.hanzi.trim()) {
            issues.push({ path: tokenPath, message: "token text is required" });
          }

          if (token.kind === "word") {
            hasWord = true;
            if (!token.pinyin.trim()) {
              issues.push({ path: tokenPath, message: "word pinyin is required" });
            }
            if (!token.meaning.trim()) {
              issues.push({ path: tokenPath, message: "word meaning is required" });
            }

            const glyphs = Array.from(token.hanzi);
            if (token.characters.length !== glyphs.length) {
              issues.push({
                path: tokenPath,
                message: "every character requires one authored annotation"
              });
            }
            token.characters.forEach((character, index) => {
              const characterPath = `${tokenPath}/character:${index}`;
              if (character.hanzi !== glyphs[index]) {
                issues.push({
                  path: characterPath,
                  message: "character annotation must match token text order"
                });
              }
              if (!character.pinyin.trim()) {
                issues.push({
                  path: characterPath,
                  message: "character pinyin is required"
                });
              }
              if (!character.meaning.trim()) {
                issues.push({
                  path: characterPath,
                  message: "character meaning is required"
                });
              }
            });
          }
        }

        if (!hasWord) {
          issues.push({ path: sentencePath, message: "sentence must contain a word token" });
        }
      }
    }
  }

  return issues;
}

export function formatValidationIssues(issues: readonly ContentValidationIssue[]) {
  return issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n");
}

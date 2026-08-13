export type ReaderDestination = {
  articleId: string;
  contextSentenceId?: string;
  contextSource?: "review" | "vocabulary";
  returnArticleId?: string;
};

export function createReaderHash(
  articleId: string,
  contextSentenceId?: string
): string {
  const articleSegment = encodeURIComponent(articleId);
  return contextSentenceId
    ? `#/read/${articleSegment}/context/${encodeURIComponent(contextSentenceId)}`
    : `#/read/${articleSegment}`;
}

export function createVocabularyReaderHash(
  articleId: string,
  contextSentenceId: string,
  returnArticleId: string
): string {
  return `${createReaderHash(articleId, contextSentenceId)}/from-vocabulary/${encodeURIComponent(returnArticleId)}`;
}

export function parseReaderHash(hash: string): ReaderDestination | null {
  const match = hash.match(
    /^#\/read\/([^/]+?)(?:\/context\/([^/]+)(?:\/from-vocabulary\/([^/]+))?)?$/
  );
  if (!match?.[1]) return null;

  try {
    const articleId = decodeURIComponent(match[1]);
    const contextSentenceId = match[2]
      ? decodeURIComponent(match[2])
      : undefined;
    const returnArticleId = match[3]
      ? decodeURIComponent(match[3])
      : undefined;
    if (!articleId || contextSentenceId === "") return null;
    if (returnArticleId !== undefined && returnArticleId === "") return null;
    if (contextSentenceId && returnArticleId) {
      return {
        articleId,
        contextSentenceId,
        contextSource: "vocabulary",
        returnArticleId
      };
    }
    return contextSentenceId
      ? { articleId, contextSentenceId, contextSource: "review" }
      : { articleId };
  } catch {
    return null;
  }
}

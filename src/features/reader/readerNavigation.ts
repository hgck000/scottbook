export type ReaderDestination = {
  articleId: string;
  contextSentenceId?: string;
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

export function parseReaderHash(hash: string): ReaderDestination | null {
  const match = hash.match(
    /^#\/read\/([^/]+?)(?:\/context\/([^/]+))?$/
  );
  if (!match?.[1]) return null;

  try {
    const articleId = decodeURIComponent(match[1]);
    const contextSentenceId = match[2]
      ? decodeURIComponent(match[2])
      : undefined;
    if (!articleId || contextSentenceId === "") return null;
    return contextSentenceId
      ? { articleId, contextSentenceId }
      : { articleId };
  } catch {
    return null;
  }
}

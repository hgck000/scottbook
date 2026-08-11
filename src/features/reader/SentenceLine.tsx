import type { KeyboardEvent } from "react";
import type { AnnotatedSentence, WordToken } from "../../content/types";
import type { AssistanceSelection } from "./assistance";
import {
  getNextReaderTokenIndex,
  getReaderTokenLabel
} from "./readerAccessibility";

function moveReaderTokenFocus(event: KeyboardEvent<HTMLButtonElement>): void {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    return;
  }
  event.preventDefault();

  const article = event.currentTarget.closest(".reader-article");
  const tokens = Array.from(
    article?.querySelectorAll<HTMLButtonElement>("[data-reader-token]") ?? []
  );
  const currentIndex = tokens.indexOf(event.currentTarget);
  const nextIndex = getNextReaderTokenIndex(
    currentIndex,
    tokens.length,
    event.key
  );
  const nextToken = tokens[nextIndex];
  if (!nextToken || nextToken === event.currentTarget) return;

  nextToken.focus();
}

export function SentenceLine({
  sentence,
  selection,
  chooseToken
}: {
  sentence: AnnotatedSentence;
  selection: AssistanceSelection | null;
  chooseToken: (sentence: AnnotatedSentence, token: WordToken) => void;
}) {
  return (
    <span className="sentence" data-sentence-id={sentence.id}>
      {sentence.tokens.map((token) => {
        if (token.kind === "punctuation") {
          return <span key={token.id} lang="zh-Hans">{token.hanzi}</span>;
        }

        const key = `${sentence.id}:${token.id}`;
        const isSelected = selection?.key === key;
        return (
          <button
            key={token.id}
            className={`word-token${isSelected ? " selected" : ""}`}
            type="button"
            data-reader-token
            data-assistance-key={key}
            onClick={() => chooseToken(sentence, token)}
            onKeyDown={moveReaderTokenFocus}
            aria-label={getReaderTokenLabel(token, selection, key)}
            aria-controls={isSelected ? "reader-assistance" : undefined}
            aria-expanded={isSelected}
          >
            <span lang="zh-Hans">{token.hanzi}</span>
          </button>
        );
      })}
    </span>
  );
}

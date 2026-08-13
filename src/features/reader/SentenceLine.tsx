import type { KeyboardEvent } from "react";
import type { AnnotatedSentence } from "../../content/types";
import type { AssistanceSelection } from "./assistance";
import {
  getNextReaderTokenIndex,
  getReaderTokenLabel
} from "./readerAccessibility";
import {
  getAssistanceUnitKey,
  getSentenceAssistanceUnits,
  getTokenAssistanceUnits,
  type ReaderAssistanceScope,
  type ReaderAssistanceUnit
} from "./readerScope";

function moveReaderTokenFocus(event: KeyboardEvent<HTMLElement>): void {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    return;
  }
  event.preventDefault();

  const article = event.currentTarget.closest(".reader-article");
  const tokens = Array.from(
    article?.querySelectorAll<HTMLElement>("[data-reader-unit]") ?? []
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
  scope,
  selection,
  chooseUnit,
  targetSource
}: {
  sentence: AnnotatedSentence;
  scope: ReaderAssistanceScope;
  selection: AssistanceSelection | null;
  chooseUnit: (
    sentence: AnnotatedSentence,
    unit: ReaderAssistanceUnit
  ) => void;
  targetSource?: "review" | "vocabulary";
}) {
  const isTarget = targetSource !== undefined;
  const sentenceProps = {
    className: `sentence${isTarget ? " context-target" : ""}`,
    "data-sentence-id": sentence.id,
    "data-context-target": targetSource === "review" ? "true" : undefined,
    "data-vocabulary-target":
      targetSource === "vocabulary" ? "true" : undefined,
    tabIndex: isTarget ? -1 : undefined
  } as const;

  const renderUnit = (unit: ReaderAssistanceUnit, content?: string) => {
    const key = getAssistanceUnitKey(sentence, unit);
    const isSelected = selection?.key === key;
    return (
      <button
        key={unit.id}
        className={`word-token scope-${unit.scope}${isSelected ? " selected" : ""}`}
        type="button"
        data-reader-token
        data-reader-unit
        data-assistance-key={key}
        data-assistance-scope={unit.scope}
        onClick={() => chooseUnit(sentence, unit)}
        onKeyDown={moveReaderTokenFocus}
        aria-label={getReaderTokenLabel(unit, selection, key)}
        aria-controls={isSelected ? "reader-assistance" : undefined}
        aria-expanded={isSelected}
      >
        <span lang="zh-Hans">{content ?? unit.hanzi}</span>
      </button>
    );
  };

  if (scope === "sentence") {
    const unit = getSentenceAssistanceUnits(sentence, scope)[0];
    if (!unit) return null;
    const key = getAssistanceUnitKey(sentence, unit);
    const isSelected = selection?.key === key;
    return (
      <span {...sentenceProps}>
        <span
          className={`word-token scope-sentence${isSelected ? " selected" : ""}`}
          role="button"
          tabIndex={0}
          data-reader-token
          data-reader-unit
          data-assistance-key={key}
          data-assistance-scope={unit.scope}
          onClick={() => chooseUnit(sentence, unit)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              chooseUnit(sentence, unit);
              return;
            }
            moveReaderTokenFocus(event);
          }}
          aria-label={getReaderTokenLabel(unit, selection, key)}
          aria-controls={isSelected ? "reader-assistance" : undefined}
          aria-expanded={isSelected}
        >
          <span lang="zh-Hans">{unit.hanzi}</span>
        </span>
      </span>
    );
  }

  return (
    <span {...sentenceProps}>
      {sentence.tokens.map((token) => {
        if (token.kind === "punctuation") {
          return <span key={token.id} lang="zh-Hans">{token.hanzi}</span>;
        }

        return getTokenAssistanceUnits(token, scope).map((unit) =>
          renderUnit(unit)
        );
      })}
    </span>
  );
}

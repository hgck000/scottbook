export const ASSISTANCE_HISTORY_STORAGE_KEY =
  "scottbook.assistanceHistory.v1";
export const ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY =
  "scottbook.assistanceHistory.backup.v1";

const MAX_CONTEXTS_PER_ITEM = 8;
const MAX_TEXT_LENGTH = 2_000;

export type AssistanceLevel = "pinyin" | "meaning";

export type AssistanceContext = {
  id: string;
  articleId: string;
  sentenceId: string;
  sentenceText: string;
  sentenceTranslation: string;
  seenCount: number;
  lastSeenAt: number;
};

export type AssistanceReviewItem = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  pinyinCount: number;
  meaningCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
  knownAt: number | null;
  pinned: boolean;
  contexts: AssistanceContext[];
};

export type AssistanceHistoryState = {
  version: 1;
  recordingEnabled: boolean;
  items: Record<string, AssistanceReviewItem>;
};

export type RecordAssistanceInput = {
  articleId: string;
  sentenceId: string;
  sentenceText: string;
  sentenceTranslation: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  level: AssistanceLevel;
  occurredAt: number;
};

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "getItem" | "setItem">;

export function createEmptyAssistanceHistory(): AssistanceHistoryState {
  return { version: 1, recordingEnabled: true, items: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[]
): boolean {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}

function isTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 8_640_000_000_000_000
  );
}

function isCount(value: unknown, minimum = 0): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= minimum
  );
}

function isSafeText(value: unknown, maximum = MAX_TEXT_LENGTH): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximum
  );
}

function isIdentifier(value: unknown): value is string {
  return (
    isSafeText(value, MAX_TEXT_LENGTH) &&
    value !== "__proto__" &&
    value !== "prototype" &&
    value !== "constructor"
  );
}

export function getAssistanceItemId(input: {
  hanzi: string;
  pinyin: string;
  meaning: string;
}): string {
  return JSON.stringify([input.hanzi, input.pinyin, input.meaning]);
}

function getContextId(articleId: string, sentenceId: string): string {
  return JSON.stringify([articleId, sentenceId]);
}

function validateContext(value: unknown): AssistanceContext | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, [
      "id",
      "articleId",
      "sentenceId",
      "sentenceText",
      "sentenceTranslation",
      "seenCount",
      "lastSeenAt"
    ]) ||
    !isIdentifier(value.id) ||
    !isIdentifier(value.articleId) ||
    !isIdentifier(value.sentenceId) ||
    value.id !== getContextId(value.articleId, value.sentenceId) ||
    !isSafeText(value.sentenceText) ||
    !isSafeText(value.sentenceTranslation) ||
    !isCount(value.seenCount, 1) ||
    !isTimestamp(value.lastSeenAt)
  ) {
    return null;
  }

  return {
    id: value.id,
    articleId: value.articleId,
    sentenceId: value.sentenceId,
    sentenceText: value.sentenceText,
    sentenceTranslation: value.sentenceTranslation,
    seenCount: value.seenCount,
    lastSeenAt: value.lastSeenAt
  };
}

function validateItem(key: string, value: unknown): AssistanceReviewItem | null {
  if (
    !isIdentifier(key) ||
    !isRecord(value) ||
    !hasOnlyKeys(value, [
      "id",
      "hanzi",
      "pinyin",
      "meaning",
      "pinyinCount",
      "meaningCount",
      "firstSeenAt",
      "lastSeenAt",
      "knownAt",
      "pinned",
      "contexts"
    ]) ||
    value.id !== key ||
    !isSafeText(value.hanzi, 128) ||
    !isSafeText(value.pinyin, 256) ||
    !isSafeText(value.meaning, 1_000) ||
    key !==
      getAssistanceItemId({
        hanzi: value.hanzi,
        pinyin: value.pinyin,
        meaning: value.meaning
      }) ||
    !isCount(value.pinyinCount, 1) ||
    !isCount(value.meaningCount) ||
    value.meaningCount > value.pinyinCount ||
    !isTimestamp(value.firstSeenAt) ||
    !isTimestamp(value.lastSeenAt) ||
    value.firstSeenAt > value.lastSeenAt ||
    (value.knownAt !== null && !isTimestamp(value.knownAt)) ||
    typeof value.pinned !== "boolean" ||
    !Array.isArray(value.contexts) ||
    value.contexts.length === 0 ||
    value.contexts.length > MAX_CONTEXTS_PER_ITEM
  ) {
    return null;
  }

  const contexts: AssistanceContext[] = [];
  const contextIds = new Set<string>();
  for (const candidate of value.contexts) {
    const context = validateContext(candidate);
    if (!context || contextIds.has(context.id)) return null;
    contextIds.add(context.id);
    contexts.push(context);
  }

  return {
    id: key,
    hanzi: value.hanzi,
    pinyin: value.pinyin,
    meaning: value.meaning,
    pinyinCount: value.pinyinCount,
    meaningCount: value.meaningCount,
    firstSeenAt: value.firstSeenAt,
    lastSeenAt: value.lastSeenAt,
    knownAt: value.knownAt,
    pinned: value.pinned,
    contexts
  };
}

export function validateAssistanceHistorySnapshot(
  value: unknown
): AssistanceHistoryState | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["version", "recordingEnabled", "items"]) ||
    value.version !== 1 ||
    typeof value.recordingEnabled !== "boolean" ||
    !isRecord(value.items)
  ) {
    return null;
  }

  const items: Record<string, AssistanceReviewItem> = {};
  for (const [key, candidate] of Object.entries(value.items)) {
    const item = validateItem(key, candidate);
    if (!item) return null;
    items[key] = item;
  }

  return { version: 1, recordingEnabled: value.recordingEnabled, items };
}

export function parseAssistanceHistory(
  serialized: string | null
): AssistanceHistoryState | null {
  if (serialized === null) return null;
  try {
    return validateAssistanceHistorySnapshot(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export function loadAssistanceHistory(
  storage: StorageReader
): AssistanceHistoryState {
  try {
    return (
      parseAssistanceHistory(storage.getItem(ASSISTANCE_HISTORY_STORAGE_KEY)) ??
      parseAssistanceHistory(
        storage.getItem(ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY)
      ) ??
      createEmptyAssistanceHistory()
    );
  } catch {
    return createEmptyAssistanceHistory();
  }
}

export function persistAssistanceHistory(
  storage: StorageWriter,
  state: AssistanceHistoryState
): boolean {
  const safeState = validateAssistanceHistorySnapshot(state);
  if (!safeState) return false;

  try {
    const current = storage.getItem(ASSISTANCE_HISTORY_STORAGE_KEY);
    if (current && parseAssistanceHistory(current)) {
      try {
        storage.setItem(ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY, current);
      } catch {
        // A valid primary record remains more useful than a stale safety copy.
      }
    }
    storage.setItem(ASSISTANCE_HISTORY_STORAGE_KEY, JSON.stringify(safeState));
    return true;
  } catch {
    return false;
  }
}

function increment(value: number): number {
  return value < Number.MAX_SAFE_INTEGER ? value + 1 : value;
}

export function recordAssistance(
  state: AssistanceHistoryState,
  input: RecordAssistanceInput
): AssistanceHistoryState {
  if (!state.recordingEnabled || !isTimestamp(input.occurredAt)) return state;
  if (
    !isIdentifier(input.articleId) ||
    !isIdentifier(input.sentenceId) ||
    !isSafeText(input.sentenceText) ||
    !isSafeText(input.sentenceTranslation) ||
    !isSafeText(input.hanzi, 128) ||
    !isSafeText(input.pinyin, 256) ||
    !isSafeText(input.meaning, 1_000)
  ) {
    return state;
  }

  const id = getAssistanceItemId(input);
  const contextId = getContextId(input.articleId, input.sentenceId);
  if (!isIdentifier(id) || !isIdentifier(contextId)) return state;
  const existing = state.items[id];
  const existingContext = existing?.contexts.find(
    (context) => context.id === contextId
  );
  const context: AssistanceContext = existingContext
    ? {
        ...existingContext,
        sentenceText: input.sentenceText,
        sentenceTranslation: input.sentenceTranslation,
        seenCount: increment(existingContext.seenCount),
        lastSeenAt: Math.max(existingContext.lastSeenAt, input.occurredAt)
      }
    : {
        id: contextId,
        articleId: input.articleId,
        sentenceId: input.sentenceId,
        sentenceText: input.sentenceText,
        sentenceTranslation: input.sentenceTranslation,
        seenCount: 1,
        lastSeenAt: input.occurredAt
      };
  const contexts = [
    ...(existing?.contexts.filter((candidate) => candidate.id !== contextId) ?? []),
    context
  ]
    .sort((left, right) => right.lastSeenAt - left.lastSeenAt)
    .slice(0, MAX_CONTEXTS_PER_ITEM);

  const nextItem: AssistanceReviewItem = existing
    ? {
        ...existing,
        pinyinCount:
          input.level === "pinyin"
            ? increment(existing.pinyinCount)
            : existing.pinyinCount,
        meaningCount:
          input.level === "meaning"
            ? increment(existing.meaningCount)
            : existing.meaningCount,
        lastSeenAt: Math.max(existing.lastSeenAt, input.occurredAt),
        knownAt: null,
        contexts
      }
    : {
        id,
        hanzi: input.hanzi,
        pinyin: input.pinyin,
        meaning: input.meaning,
        pinyinCount: 1,
        meaningCount: input.level === "meaning" ? 1 : 0,
        firstSeenAt: input.occurredAt,
        lastSeenAt: input.occurredAt,
        knownAt: null,
        pinned: false,
        contexts
      };

  return { ...state, items: { ...state.items, [id]: nextItem } };
}

export function setAssistanceRecording(
  state: AssistanceHistoryState,
  enabled: boolean
): AssistanceHistoryState {
  return state.recordingEnabled === enabled
    ? state
    : { ...state, recordingEnabled: enabled };
}

export function toggleAssistancePinned(
  state: AssistanceHistoryState,
  itemId: string
): AssistanceHistoryState {
  const item = state.items[itemId];
  if (!item) return state;
  return {
    ...state,
    items: { ...state.items, [itemId]: { ...item, pinned: !item.pinned } }
  };
}

export function markAssistanceKnown(
  state: AssistanceHistoryState,
  itemId: string,
  knownAt: number | null
): AssistanceHistoryState {
  const item = state.items[itemId];
  if (!item || (knownAt !== null && !isTimestamp(knownAt))) return state;
  return {
    ...state,
    items: { ...state.items, [itemId]: { ...item, knownAt } }
  };
}

export function deleteAssistanceItem(
  state: AssistanceHistoryState,
  itemId: string
): AssistanceHistoryState {
  if (!state.items[itemId]) return state;
  const items = { ...state.items };
  delete items[itemId];
  return { ...state, items };
}

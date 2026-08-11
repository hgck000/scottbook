export type AssistanceSelection = {
  key: string;
  level: 1 | 2;
};

export function advanceAssistance(
  current: AssistanceSelection | null,
  key: string
): AssistanceSelection | null {
  if (!current || current.key !== key) {
    return { key, level: 1 };
  }

  if (current.level === 1) {
    return { key, level: 2 };
  }

  return null;
}

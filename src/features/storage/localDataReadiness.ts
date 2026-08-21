export type LocalDataPhase = "checking" | "ready" | "fallback";

export function shouldWaitForLocalData(
  phase: LocalDataPhase,
  indexedDbSupported: boolean
): boolean {
  return phase === "checking" && indexedDbSupported;
}

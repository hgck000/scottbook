export type ImportNavigationStage =
  | "source"
  | "preview"
  | "analyzing"
  | "saving"
  | "error";

export type ImportNativeBackAction =
  | "continue-navigation"
  | "cancel-analysis"
  | "block-save";

export function getImportNativeBackAction(
  stage: ImportNavigationStage
): ImportNativeBackAction {
  if (stage === "analyzing") return "cancel-analysis";
  if (stage === "saving") return "block-save";
  return "continue-navigation";
}

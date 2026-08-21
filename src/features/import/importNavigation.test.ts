import { describe, expect, it } from "vitest";
import { getImportNativeBackAction } from "./importNavigation";

describe("import native Back policy", () => {
  it("cancels only the analysis phase", () => {
    expect(getImportNativeBackAction("analyzing")).toBe("cancel-analysis");
  });

  it("blocks navigation while the imported book transaction is committing", () => {
    expect(getImportNativeBackAction("saving")).toBe("block-save");
  });

  it.each(["source", "preview", "error"] as const)(
    "lets the app handle Back normally from %s",
    (stage) => {
      expect(getImportNativeBackAction(stage)).toBe("continue-navigation");
    }
  );
});

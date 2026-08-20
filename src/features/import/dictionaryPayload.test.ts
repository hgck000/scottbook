import { gzipSync, strToU8 } from "fflate";
import { describe, expect, it } from "vitest";
import { decodeDictionaryPayload } from "./dictionaryPayload";

const fixture = "# CVDICT\n傳 传 [chuan2] /truyền; truyền lại/\n";

describe("offline dictionary payload", () => {
  it("opens the packaged gzip bytes", () => {
    expect(decodeDictionaryPayload(gzipSync(strToU8(fixture)))).toBe(fixture);
  });

  it("accepts bytes already decompressed by the browser or web server", () => {
    expect(decodeDictionaryPayload(strToU8(fixture))).toBe(fixture);
  });

  it("still rejects a corrupt payload that claims to be gzip", () => {
    expect(() => decodeDictionaryPayload(Uint8Array.of(0x1f, 0x8b, 0x08)))
      .toThrow();
  });
});

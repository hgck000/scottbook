import { gunzipSync, strFromU8 } from "fflate";

const GZIP_MAGIC_FIRST = 0x1f;
const GZIP_MAGIC_SECOND = 0x8b;

export function decodeDictionaryPayload(payload: Uint8Array): string {
  const bytes = payload[0] === GZIP_MAGIC_FIRST && payload[1] === GZIP_MAGIC_SECOND
    ? gunzipSync(payload)
    : payload;
  return strFromU8(bytes).replace(/^\uFEFF/u, "");
}

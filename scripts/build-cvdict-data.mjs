import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const EXPECTED_SOURCE_SHA256 =
  "4dde4b204193efa9c192d7f7daeab1bb579c8ccd7c41ed90d1b6caee22ba0948";
const EXPECTED_OUTPUT_SHA256 =
  "9c87a201ca6be7985a500b715666e4553d614f4f08e8d3d29e73665d7eb3ed85";
const sourcePath = process.argv[2];
const outputPath = process.argv[3] ?? "public/cvdict-v1.u8.gz";

if (!sourcePath) {
  throw new Error(
    "Usage: node scripts/build-cvdict-data.mjs <CVDICT.u8> [public/cvdict-v1.u8.gz]"
  );
}

const source = await readFile(sourcePath);
const checksum = createHash("sha256").update(source).digest("hex");
if (checksum !== EXPECTED_SOURCE_SHA256) {
  throw new Error(`Unexpected CVDICT.u8 checksum: ${checksum}`);
}

const compressed = gzipSync(source, { level: 9, mtime: 0 });
const outputChecksum = createHash("sha256").update(compressed).digest("hex");
if (outputChecksum !== EXPECTED_OUTPUT_SHA256) {
  throw new Error(`Unexpected compressed CVDICT checksum: ${outputChecksum}`);
}
await writeFile(outputPath, compressed);
console.log(
  JSON.stringify({
    sourceBytes: source.byteLength,
    outputBytes: compressed.byteLength,
    sourceSha256: checksum,
    outputSha256: outputChecksum
  })
);

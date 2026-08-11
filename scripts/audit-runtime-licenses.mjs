import { readFileSync } from "node:fs";

const lockfile = JSON.parse(readFileSync("package-lock.json", "utf8"));
const allowedLicenses = new Set([
  "0BSD",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "MIT"
]);
const violations = [];
let runtimePackageCount = 0;

for (const [path, metadata] of Object.entries(lockfile.packages ?? {})) {
  if (!path.startsWith("node_modules/") || metadata.dev || metadata.link) {
    continue;
  }
  runtimePackageCount += 1;
  const license = metadata.license;
  if (typeof license !== "string" || !allowedLicenses.has(license)) {
    violations.push(`${path}: ${license ?? "missing license"}`);
  }
}

if (runtimePackageCount === 0) {
  throw new Error("No runtime packages were found in package-lock.json");
}
if (violations.length > 0) {
  throw new Error(`Runtime license review required:\n${violations.join("\n")}`);
}

console.log(
  `Runtime license audit passed for ${runtimePackageCount} packages.`
);

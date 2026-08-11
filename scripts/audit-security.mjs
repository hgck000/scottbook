import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const indexHtml = readFileSync("index.html", "utf8");
const cspMatch = indexHtml.match(
  /http-equiv="Content-Security-Policy"[\s\S]*?content="([^"]+)"/
);
if (!cspMatch?.[1]) {
  throw new Error("index.html is missing a Content-Security-Policy");
}

const policy = cspMatch[1];
const requiredDirectives = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "script-src 'self'",
  "form-action 'none'"
];
for (const directive of requiredDirectives) {
  if (!policy.includes(directive)) {
    throw new Error(`Content-Security-Policy is missing: ${directive}`);
  }
}
if (policy.includes("'unsafe-eval'")) {
  throw new Error("Content-Security-Policy must not allow unsafe-eval");
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (![".ts", ".tsx"].includes(extname(entry.name))) return [];
    if (entry.name.includes(".test.")) return [];
    return [path];
  });
}

const forbiddenPatterns = [
  ["dangerouslySetInnerHTML", /dangerouslySetInnerHTML/],
  ["direct innerHTML assignment", /\.innerHTML\s*=/],
  ["eval", /\beval\s*\(/],
  ["Function constructor", /new\s+Function\s*\(/]
];
const violations = [];
for (const path of sourceFiles("src")) {
  const source = readFileSync(path, "utf8");
  for (const [label, pattern] of forbiddenPatterns) {
    if (pattern.test(source)) violations.push(`${path}: ${label}`);
  }
}
if (violations.length > 0) {
  throw new Error(`Unsafe browser APIs detected:\n${violations.join("\n")}`);
}

console.log("Security policy and browser API audit passed.");

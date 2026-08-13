import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [readingsArgument, variantsArgument, pinyinWordlistArgument] =
  process.argv.slice(2);

if (!readingsArgument || !variantsArgument || !pinyinWordlistArgument) {
  throw new Error(
    "Usage: node scripts/build-han-viet-data.mjs <Unihan_Readings.txt> <Unihan_Variants.txt> <hanviet.csv>"
  );
}

const readingsPath = resolve(readingsArgument);
const variantsPath = resolve(variantsArgument);
const pinyinWordlistPath = resolve(pinyinWordlistArgument);
const outputPath = resolve("src/content/hanVietReadings.generated.ts");
const readings = new Map();
const pinyinReadings = new Map();

function characterFromCodePoint(value) {
  return String.fromCodePoint(Number.parseInt(value.slice(2), 16));
}

for (const line of readFileSync(readingsPath, "utf8").split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const [codePoint, property, value] = line.split("\t");
  if (property !== "kVietnamese" || !codePoint || !value) continue;
  readings.set(characterFromCodePoint(codePoint), value.trim());
}

const variantLinks = [];
for (const line of readFileSync(variantsPath, "utf8").split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const [sourceCodePoint, property, value] = line.split("\t");
  if (
    !sourceCodePoint ||
    !value ||
    !["kSimplifiedVariant", "kTraditionalVariant"].includes(property)
  ) {
    continue;
  }

  const source = characterFromCodePoint(sourceCodePoint);
  for (const rawTarget of value.split(" ")) {
    const targetCodePoint = rawTarget.match(/^U\+[0-9A-F]+/)?.[0];
    if (!targetCodePoint) continue;
    variantLinks.push([source, characterFromCodePoint(targetCodePoint)]);
  }
}

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
}

for (const line of readFileSync(pinyinWordlistPath, "utf8").split("\n")) {
  if (!line || line.startsWith("char,")) continue;
  const [character, rawReadings, pinyin] = parseCsvLine(line.trimEnd());
  if (!character || !rawReadings || !pinyin) continue;
  const values = [...rawReadings.matchAll(/'([^']+)'/gu)].map(
    (match) => match[1]
  );
  if (values.length === 0) continue;
  const key = `${character}|${pinyin}`;
  pinyinReadings.set(key, values.join(" "));
}

let propagated = true;
while (propagated) {
  propagated = false;
  for (const [left, right] of variantLinks) {
    const leftReading = readings.get(left);
    const rightReading = readings.get(right);
    if (leftReading && !rightReading) {
      readings.set(right, leftReading);
      propagated = true;
    } else if (rightReading && !leftReading) {
      readings.set(left, rightReading);
      propagated = true;
    }
  }
}

const variantsByCharacter = new Map();
for (const [left, right] of variantLinks) {
  variantsByCharacter.set(left, [
    ...(variantsByCharacter.get(left) ?? []),
    right
  ]);
  variantsByCharacter.set(right, [
    ...(variantsByCharacter.get(right) ?? []),
    left
  ]);
}

for (const [key, value] of [...pinyinReadings.entries()]) {
  const separator = key.indexOf("|");
  const source = key.slice(0, separator);
  const pinyin = key.slice(separator + 1);
  const queue = [source];
  const visited = new Set();
  while (queue.length > 0) {
    const character = queue.shift();
    if (!character || visited.has(character)) continue;
    visited.add(character);
    const variantKey = `${character}|${pinyin}`;
    const current = pinyinReadings.get(variantKey);
    if (!current) {
      pinyinReadings.set(variantKey, value);
    } else if (current !== value) {
      const merged = new Set(`${current} ${value}`.split(" ").filter(Boolean));
      pinyinReadings.set(variantKey, [...merged].join(" "));
    }
    queue.push(...(variantsByCharacter.get(character) ?? []));
  }
}

for (const [key, value] of [...pinyinReadings.entries()]) {
  const separator = key.indexOf("|");
  const character = key.slice(0, separator);
  const pinyin = key.slice(separator + 1);
  if (pinyin === "*") continue;
  const basePinyin = pinyin.replace(/[1-5]$/u, "");
  const baseKey = `${character}|${basePinyin}`;
  const current = pinyinReadings.get(baseKey);
  if (!current) {
    pinyinReadings.set(baseKey, value);
  } else if (current !== value) {
    const merged = new Set(`${current} ${value}`.split(" ").filter(Boolean));
    pinyinReadings.set(baseKey, [...merged].join(" "));
  }
}

const rows = [...readings.entries()].sort(
  ([left], [right]) => left.codePointAt(0) - right.codePointAt(0)
);
const pinyinRows = [...pinyinReadings.entries()].sort(([left], [right]) =>
  left.localeCompare(right, "zh-Hans")
);
const generated = `// Generated from Unicode 17.0.0 Unihan and the MIT Hán-Việt Pinyin wordlist.\n// Do not edit manually; use scripts/build-han-viet-data.mjs with the pinned source files.\n\nexport const HAN_VIET_READINGS: Readonly<Record<string, string>> = {\n${rows
  .map(([character, reading]) => `  ${JSON.stringify(character)}: ${JSON.stringify(reading)},`)
  .join("\n")}\n};\n\nexport const HAN_VIET_PINYIN_READINGS: Readonly<Record<string, string>> = {\n${pinyinRows
  .map(([key, reading]) => `  ${JSON.stringify(key)}: ${JSON.stringify(reading)},`)
  .join("\n")}\n};\n`;

writeFileSync(outputPath, generated, "utf8");
console.log(
  `Generated ${rows.length} character readings and ${pinyinRows.length} pinyin-specific readings at ${outputPath}.`
);

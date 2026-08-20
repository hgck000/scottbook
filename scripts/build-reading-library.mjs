import { gunzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pinyin } from "pinyin-pro";
import { hskReadingSource } from "./content/hsk-reading-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dictionaryPath = `${root}public/cvdict-v1.u8.gz`;
const outputPath = `${root}src/content/builtInLibrary.generated.ts`;
const checkOnly = process.argv.includes("--check");

const NO_MEANING = "Chưa có nghĩa tiếng Việt trong từ điển offline.";
const meaningOverrides = new Map([
  ["了", "trợ từ chỉ hành động đã hoàn thành hoặc tình trạng đã thay đổi"],
  ["吗", "trợ từ nghi vấn đặt ở cuối câu"],
  ["和", "và; cùng với"],
  ["后", "sau; phía sau; về sau"],
  ["里", "trong; bên trong"],
  ["钟", "chuông; đồng hồ; giờ"],
  ["家", "nhà; gia đình"],
  ["表", "bảng; biểu mẫu; thể hiện"],
  ["干", "làm; khô"],
  ["上", "trên; ở trên; lên"],
  ["不", "không"],
  ["喝", "uống"],
  ["话", "lời nói; lời"],
  ["贵", "đắt; quý"],
  ["红花", "hoa màu đỏ"],
  ["汉", "Hán; Trung Quốc; người Hán"],
  ["汉语课", "tiết học tiếng Trung"],
  ["汉语书", "sách tiếng Trung"],
  ["衣服店", "cửa hàng quần áo"],
  ["一个字", "một chữ"],
  ["一大碗", "một bát lớn"],
  ["一猜", "đoán thử"],
  ["一看", "vừa nhìn; nhìn một lần"],
  ["不懂", "không hiểu"],
  ["二楼", "tầng hai"],
  ["包里", "trong túi"],
  ["店里", "trong cửa hàng"],
  ["屋里", "trong nhà"],
  ["哪本", "quyển nào"],
  ["那本", "quyển đó"],
  ["这件", "việc này; món đồ này"],
  ["那一件", "món đó; chiếc đó"],
  ["这次", "lần này"],
  ["这星期", "tuần này"],
  ["这里", "ở đây; nơi này"],
  ["按错", "bấm nhầm"],
  ["连好", "kết nối đúng; kết nối xong"],
  ["最后一班", "chuyến cuối cùng"],
  ["米色", "màu be"],
  ["木桌", "bàn gỗ"],
  ["木椅", "ghế gỗ"],
  ["短文", "bài văn ngắn"],
  ["窗边", "bên cửa sổ"],
  ["纸上", "trên giấy"],
  ["写上", "viết lên"],
  ["我家", "nhà tôi"],
  ["我的", "của tôi"],
  ["王老师", "anh Vương; người hướng dẫn họ Vương"],
  ["王先生", "anh Vương; ông Vương"],
  ["小明", "Tiểu Minh"],
  ["小李", "Tiểu Lý"],
  ["小王", "Tiểu Vương"],
  ["小林", "Tiểu Lâm"],
  ["小陈", "Tiểu Trần"],
  ["小周", "Tiểu Chu"],
  ["李月", "Lý Nguyệt"],
  ["张阿姨", "cô Trương"]
]);
const accentByLevel = {
  "HSK 1": "jade",
  "HSK 2": "amber",
  "HSK 3": "coral"
};
const minutesByLevel = {
  "HSK 1": 4,
  "HSK 2": 5,
  "HSK 3": 6
};

function cleanDefinition(value) {
  return value
    .replace(/\s+/gu, " ")
    .replace(/^\s+|\s+$/gu, "")
    .replace(/^(?:LT|CL|Lượng từ):.*$/iu, "")
    .slice(0, 240);
}

function loadDictionary() {
  const dictionary = new Map();
  const serialized = gunzipSync(readFileSync(dictionaryPath)).toString("utf8");
  for (const line of serialized.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^\S+\s+(\S+)\s+\[([^\]]*)\]\s+\/(.*)\/$/u);
    if (!match?.[1] || !match[2] || !match[3]) continue;
    const meanings = match[3]
      .split("/")
      .map(cleanDefinition)
      .filter(Boolean)
      .slice(0, 2);
    if (meanings.length === 0) continue;
    const entries = dictionary.get(match[1]) ?? [];
    entries.push({
      pinyinNumbers: match[2].trim().split(/\s+/u),
      meaning: meanings.join("; ")
    });
    dictionary.set(match[1], entries);
  }
  return dictionary;
}

function normalizeNumberedPinyin(value, ignoreCase = false) {
  const normalized = ignoreCase ? value.toLocaleLowerCase() : value;
  return normalized
    .replace(/u:/gu, "v")
    .replace(/ü/gu, "v")
    .replace(/0$/u, "5");
}

function pinyinMatches(left, right) {
  return normalizeNumberedPinyin(left, true) ===
    normalizeNumberedPinyin(right, true);
}

function getPinyinData(dictionary, hanzi) {
  const symbols = pinyin(hanzi, {
    type: "array",
    toneType: "symbol",
    nonZh: "removed",
    toneSandhi: true
  });
  const lexicalNumbers = pinyin(hanzi, {
    type: "array",
    toneType: "num",
    nonZh: "removed",
    toneSandhi: true
  });
  const characters = Array.from(hanzi).filter((character) =>
    /\p{Script=Han}/u.test(character)
  );
  for (let start = 0; start < characters.length; start += 1) {
    for (let end = characters.length; end > start; end -= 1) {
      const entries = dictionary.get(characters.slice(start, end).join("")) ?? [];
      const matchingEntry = entries.find((entry) =>
        entry.pinyinNumbers.length === end - start &&
        entry.pinyinNumbers.every((syllable, index) =>
          normalizeNumberedPinyin(syllable, true).replace(/[1-5]$/u, "") ===
          normalizeNumberedPinyin(lexicalNumbers[start + index] ?? "", true)
            .replace(/[1-5]$/u, "")
        )
      );
      if (!matchingEntry) continue;
      matchingEntry.pinyinNumbers.forEach((syllable, index) => {
        if (!normalizeNumberedPinyin(syllable, true).endsWith("5")) return;
        symbols[start + index] = normalizeNumberedPinyin(syllable, true)
          .replace(/5$/u, "")
          .replace(/v/gu, "ü");
      });
      break;
    }
  }
  return { symbols, lexicalNumbers };
}

function getHeadingPinyin(dictionary, hanzi) {
  return getPinyinData(dictionary, hanzi).symbols
    .join(" ")
    .replace(/^\p{Ll}/u, (first) => first.toLocaleUpperCase());
}

function findDictionaryMeaning(dictionary, hanzi, pinyinNumbers) {
  const entries = dictionary.get(hanzi) ?? [];
  const matching = entries.filter((entry) =>
    entry.pinyinNumbers.length === pinyinNumbers.length &&
    entry.pinyinNumbers.every((syllable, index) =>
      pinyinMatches(syllable, pinyinNumbers[index] ?? "")
    )
  );
  const scored = matching
    .map((entry) => ({
      entry,
      score:
        (entry.pinyinNumbers.every(
          (syllable, index) =>
            normalizeNumberedPinyin(syllable) ===
            normalizeNumberedPinyin(pinyinNumbers[index] ?? "")
        )
          ? 1_000
          : 0) -
        (/biến thể|họ \[/iu.test(entry.meaning) ? 2_000 : 0) +
        Math.min(entry.meaning.length, 500) / 1_000
    }))
    .sort((left, right) => right.score - left.score);
  if (scored[0]) return scored[0].entry.meaning;

  return entries
    .map((entry) => ({
      entry,
      score:
        (/biến thể|họ \[/iu.test(entry.meaning) ? -2_000 : 0) +
        Math.min(entry.meaning.length, 500) / 1_000
    }))
    .sort((left, right) => right.score - left.score)[0]?.entry.meaning;
}

const vietnameseNumbers = new Map([
  ["一", "một"],
  ["二", "hai"],
  ["两", "hai"],
  ["三", "ba"],
  ["四", "bốn"],
  ["五", "năm"],
  ["六", "sáu"],
  ["七", "bảy"],
  ["八", "tám"],
  ["九", "chín"],
  ["十", "mười"]
]);

function getVietnameseNumber(hanzi) {
  if (vietnameseNumbers.has(hanzi)) return vietnameseNumbers.get(hanzi);
  const tenIndex = hanzi.indexOf("十");
  if (tenIndex === -1) return null;
  const tens = hanzi.slice(0, tenIndex);
  const units = hanzi.slice(tenIndex + 1);
  const tensMeaning = tens ? vietnameseNumbers.get(tens) : "một";
  const unitsMeaning = units ? vietnameseNumbers.get(units) : null;
  if (!tensMeaning || (units && !unitsMeaning)) return null;
  if (!tens && !units) return "mười";
  return `${tensMeaning === "một" ? "mười" : `${tensMeaning} mươi`}${
    unitsMeaning ? ` ${unitsMeaning}` : ""
  }`;
}

function getStructuredQuantityMeaning(hanzi) {
  const timeMatch = hanzi.match(/^([一二两三四五六七八九十]+)点(半)?$/u);
  if (timeMatch) {
    const number = getVietnameseNumber(timeMatch[1]);
    if (number) return `${number} giờ${timeMatch[2] ? " rưỡi" : ""}`;
  }

  const unitMatch = hanzi.match(
    /^([一二两三四五六七八九十]+)(分钟|个月|个人|本书|天|个|件|位|双|张|本|把|杯|份|段|篇|部|种|次|号)$/u
  );
  if (unitMatch) {
    const number = getVietnameseNumber(unitMatch[1]);
    const unit = {
      "分钟": "phút",
      "个月": "tháng",
      "个人": "người",
      "本书": "quyển sách",
      "天": "ngày",
      "个": "cái; lượng từ phổ thông",
      "件": "món; lượng từ cho quần áo hoặc sự việc",
      "位": "người; cách đếm lịch sự",
      "双": "đôi",
      "张": "tờ; chiếc có mặt phẳng",
      "本": "quyển",
      "把": "chiếc; đồ vật có tay cầm",
      "杯": "cốc",
      "份": "phần; bản",
      "段": "đoạn",
      "篇": "bài",
      "部": "bộ; chiếc máy",
      "种": "loại",
      "次": "lần",
      "号": "số; cỡ"
    }[unitMatch[2]];
    if (number && unit) return `${number} ${unit}`;
  }

  const ordinalMatch = hanzi.match(
    /^第([一二两三四五六七八九十]+)(天|页|件|张|周|星期|次)$/u
  );
  if (ordinalMatch) {
    const number = getVietnameseNumber(ordinalMatch[1]);
    const unit = {
      "天": "ngày",
      "页": "trang",
      "件": "món",
      "张": "tờ",
      "周": "tuần",
      "星期": "tuần",
      "次": "lần"
    }[ordinalMatch[2]];
    if (number && unit) {
      if (number === "một") return `${unit} đầu tiên`;
      return `${unit} thứ ${number}`;
    }
  }

  return null;
}

function getMeaning(dictionary, hanzi, pinyinNumbers) {
  const override = meaningOverrides.get(hanzi);
  if (override) return override;
  const structuredQuantity = getStructuredQuantityMeaning(hanzi);
  if (structuredQuantity) return structuredQuantity;

  const exact = findDictionaryMeaning(dictionary, hanzi, pinyinNumbers);
  if (exact) return exact;

  const characters = Array.from(hanzi);
  const best = Array.from({ length: characters.length + 1 }, () => null);
  best[characters.length] = { score: 0, meanings: [] };
  for (let start = characters.length - 1; start >= 0; start -= 1) {
    for (let end = characters.length; end > start; end -= 1) {
      const tail = best[end];
      if (!tail) continue;
      const piece = characters.slice(start, end).join("");
      const pieceOverride = meaningOverrides.get(piece);
      const pieceMeaning = pieceOverride ?? findDictionaryMeaning(
        dictionary,
        piece,
        pinyinNumbers.slice(start, end)
      );
      if (!pieceMeaning) continue;
      const length = end - start;
      const candidate = {
        score: tail.score + length * length,
        meanings: [pieceMeaning, ...tail.meanings]
      };
      if (!best[start] || candidate.score > best[start].score) {
        best[start] = candidate;
      }
    }
  }
  if (best[0]) return best[0].meanings.join("; ");
  return NO_MEANING;
}

function createToken(dictionary, origin, id, pinyinData) {
  if (!/\p{Script=Han}/u.test(origin)) {
    return { id, kind: "punctuation", hanzi: origin };
  }
  const pinyinByCharacter = pinyinData.symbols;
  return {
    id,
    kind: "word",
    hanzi: origin,
    pinyin: pinyinByCharacter.join(" "),
    meaning: getMeaning(dictionary, origin, pinyinData.lexicalNumbers),
    characters: Array.from(origin).map((hanzi, index) => ({
      hanzi,
      pinyin: pinyinByCharacter[index] ?? "",
      meaning: getMeaning(
        dictionary,
        hanzi,
        [pinyinData.lexicalNumbers[index]]
      )
    }))
  };
}

function annotateArticle(dictionary, source) {
  return {
    id: source.id,
    title: source.title,
    titlePinyin: getHeadingPinyin(dictionary, source.title),
    titleTranslation: source.titleTranslation,
    summary: source.summary,
    level: source.level,
    topic: source.topic,
    estimatedMinutes: minutesByLevel[source.level],
    accent: accentByLevel[source.level],
    paragraphs: source.sections.map((sourceSection, paragraphIndex) => ({
      id: `p${paragraphIndex + 1}`,
      sectionTitle: sourceSection.title,
      sectionTitlePinyin: getHeadingPinyin(dictionary, sourceSection.title),
      sectionTitleTranslation: sourceSection.titleTranslation,
      sentences: sourceSection.sentences.map((sourceSentence, sentenceIndex) => {
        const sentenceId = `s${paragraphIndex * 5 + sentenceIndex + 1}`;
        const origins = sourceSentence.zh.trim().split(/\s+/u);
        const sentencePinyin = getPinyinData(dictionary, origins.join(""));
        let characterOffset = 0;
        return {
          id: sentenceId,
          translation: sourceSentence.vi,
          tokens: origins.map((token, tokenIndex) => {
            const characterCount = Array.from(token).filter((character) =>
              /\p{Script=Han}/u.test(character)
            ).length;
            const tokenPinyin = {
              symbols: sentencePinyin.symbols.slice(
                characterOffset,
                characterOffset + characterCount
              ),
              lexicalNumbers: sentencePinyin.lexicalNumbers.slice(
                characterOffset,
                characterOffset + characterCount
              )
            };
            characterOffset += characterCount;
            return createToken(
              dictionary,
              token,
              `${sentenceId}-t${tokenIndex + 1}`,
              tokenPinyin
            );
          })
        };
      })
    }))
  };
}

const dictionary = loadDictionary();
const library = hskReadingSource.map((source) => annotateArticle(dictionary, source));
const missingMeanings = library.flatMap((article) =>
  article.paragraphs.flatMap((paragraph) =>
    paragraph.sentences.flatMap((sentence) =>
      sentence.tokens.filter(
        (token) => token.kind === "word" &&
          (token.meaning === NO_MEANING || token.characters.some((item) => item.meaning === NO_MEANING))
      ).map((token) => `${article.id}/${sentence.id}:${token.hanzi}`)
    )
  )
);
if (missingMeanings.length > 0) {
  throw new Error(`Missing offline meanings:\n${missingMeanings.join("\n")}`);
}

const serializedLibrary = JSON.stringify(library);
const output = `/* This file is generated by scripts/build-reading-library.mjs. */\n` +
  `import type { BuiltInArticle } from "./types";\n\n` +
  `const serializedLibrary = ${JSON.stringify(serializedLibrary)};\n\n` +
  `export const builtInLibrary = JSON.parse(serializedLibrary) as readonly BuiltInArticle[];\n`;

if (checkOnly) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== output) {
    throw new Error("Generated reading library is stale. Run npm run data:library.");
  }
  console.log(`Reading library verified: ${library.length} articles, no missing annotations.`);
} else {
  writeFileSync(outputPath, output);
  console.log(`Wrote ${library.length} annotated articles to ${outputPath}.`);
}

import { describe, expect, it } from "vitest";
import { builtInLibrary } from "./builtInLibrary";
import type { BuiltInArticle } from "./types";
import { formatValidationIssues, validateBuiltInLibrary } from "./validateLibrary";

describe("built-in ScottBook library", () => {
  it("ships the graded library and long HSK 1–3 stories", () => {
    expect(builtInLibrary).toHaveLength(105);
    const accentByLevel = {
      "HSK 1": "jade",
      "HSK 2": "amber",
      "HSK 3": "coral",
      "HSK 4": "violet",
      "HSK 5": "azure"
    } as const;
    const expectedCounts = {
      "HSK 1": 39,
      "HSK 2": 24,
      "HSK 3": 24,
      "HSK 4": 9,
      "HSK 5": 9
    } as const;
    for (const level of ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5"] as const) {
      const levelArticles = builtInLibrary.filter((article) => article.level === level);
      expect(levelArticles).toHaveLength(expectedCounts[level]);
      expect(levelArticles.every((article) => article.accent === accentByLevel[level])).toBe(true);
      expect(
        levelArticles.filter((article) =>
          ["May mặc", "Công sở", "Thời trang", "Thiết kế"].includes(article.topic)
        ).length
      ).toBeGreaterThanOrEqual(3);
    }
    const longStories = builtInLibrary.filter((article) =>
      /^hsk[123]-story-/u.test(article.id)
    );
    expect(longStories).toHaveLength(60);
    expect(
      Object.fromEntries(
        ["HSK 1", "HSK 2", "HSK 3"].map((level) => [
          level,
          longStories.filter((article) => article.level === level).length
        ])
      )
    ).toEqual({ "HSK 1": 30, "HSK 2": 15, "HSK 3": 15 });
    expect(
      longStories.filter((article) =>
        article.level === "HSK 1" &&
        ["May mặc", "Công sở", "Thời trang", "Thiết kế"].includes(article.topic)
      )
    ).toHaveLength(15);
    for (const article of longStories) {
      expect(article.estimatedMinutes).toBe(20);
      expect(article.paragraphs).toHaveLength(5);
      expect(article.paragraphs.every((paragraph) => paragraph.sentences.length === 14)).toBe(true);
      expect(article.paragraphs.flatMap((paragraph) => paragraph.sentences)).toHaveLength(70);
      const sentenceTexts = article.paragraphs
        .flatMap((paragraph) => paragraph.sentences)
        .map((sentence) => sentence.tokens.map((token) => token.hanzi).join(""));
      expect(new Set(sentenceTexts).size).toBe(70);
    }

    for (const article of builtInLibrary.filter(
      (candidate) => !/^hsk[123]-story-/u.test(candidate.id)
    )) {
      expect(article.paragraphs).toHaveLength(2);
      const sentenceCount = article.paragraphs.reduce(
        (count, paragraph) => count + paragraph.sentences.length,
        0
      );
      expect(sentenceCount).toBe(10);
      expect(
        article.paragraphs.every((paragraph) =>
          Boolean(
            paragraph.sectionTitle &&
              paragraph.sectionTitlePinyin &&
              paragraph.sectionTitleTranslation
          )
        )
      ).toBe(true);
    }
    expect(
      longStories.every((article) =>
        article.paragraphs.every((paragraph) =>
          Boolean(
            paragraph.sectionTitle &&
              paragraph.sectionTitlePinyin &&
              paragraph.sectionTitleTranslation
          )
        )
      )
    ).toBe(true);
  });

  it("contains no missing character, word, or sentence annotations", () => {
    const issues = validateBuiltInLibrary(builtInLibrary);
    expect(formatValidationIssues(issues)).toBe("");
  });

  it("contains only authored annotations and no remote content URL", () => {
    const serialized = JSON.stringify(builtInLibrary);
    expect(serialized).not.toMatch(/https?:\/\//);
    expect(serialized).not.toMatch(/apiKey|provider|endpoint/i);
  });

  it("keeps contextual pinyin and concise meanings in the generated pack", () => {
    const wordTokens = builtInLibrary.flatMap((article) =>
      article.paragraphs.flatMap((paragraph) =>
        paragraph.sentences.flatMap((sentence) =>
          sentence.tokens.filter((token) => token.kind === "word")
        )
      )
    );

    expect(
      wordTokens
        .filter((token) => token.hanzi === "了")
        .every((token) => token.pinyin === "le")
    ).toBe(true);
    expect(
      wordTokens.find((token) => token.hanzi === "十分钟")
    ).toMatchObject({ pinyin: "shí fēn zhōng", meaning: "mười phút" });
    expect(
      wordTokens.find((token) => token.hanzi === "汉语课")
    ).toMatchObject({ pinyin: "hàn yǔ kè", meaning: "tiết học tiếng Trung" });
    expect(builtInLibrary[0]?.titlePinyin).toBe("Wǒ de zǎo shang");

    const hsk4Tokens = builtInLibrary
      .filter((article) => article.level === "HSK 4")
      .flatMap((article) => article.paragraphs)
      .flatMap((paragraph) => paragraph.sentences)
      .flatMap((sentence) => sentence.tokens)
      .filter((token) => token.kind === "word");
    expect(
      hsk4Tokens.filter((token) => token.hanzi === "地")
        .every((token) => token.pinyin === "de")
    ).toBe(true);
    expect(hsk4Tokens.find((token) => token.hanzi === "制服"))
      .toMatchObject({ meaning: "đồng phục" });
    expect(hsk4Tokens.find((token) => token.hanzi === "被"))
      .toMatchObject({ meaning: "bị; được; giới từ đánh dấu câu bị động" });
    expect(hsk4Tokens.find((token) => token.hanzi === "东西"))
      .toMatchObject({ meaning: "đồ vật; thứ; đồ đạc" });

    const hsk5Tokens = builtInLibrary
      .filter((article) => article.level === "HSK 5")
      .flatMap((article) => article.paragraphs)
      .flatMap((paragraph) => paragraph.sentences)
      .flatMap((sentence) => sentence.tokens)
      .filter((token) => token.kind === "word");
    expect(
      hsk5Tokens.filter((token) => token.hanzi === "只")
        .every((token) => token.pinyin === "zhǐ" && token.meaning === "chỉ; chỉ có")
    ).toBe(true);
    expect(hsk5Tokens.find((token) => token.hanzi === "完成得"))
      .toMatchObject({ pinyin: "wán chéng de" });
    expect(hsk5Tokens.find((token) => token.hanzi === "生意"))
      .toMatchObject({ meaning: "việc kinh doanh; buôn bán" });
    expect(hsk5Tokens.find((token) => token.hanzi === "大树"))
      .toMatchObject({ meaning: "cây lớn; cây to" });

    const longStoryTokens = builtInLibrary
      .filter((article) => article.id.startsWith("hsk1-story-"))
      .flatMap((article) => article.paragraphs)
      .flatMap((paragraph) => paragraph.sentences)
      .flatMap((sentence) => sentence.tokens)
      .filter((token) => token.kind === "word");
    for (const [hanzi, expectedPinyin] of [
      ["得", "de"],
      ["做得", "zuò de"],
      ["画得", "huà de"],
      ["放得", "fàng de"],
      ["过得", "guò de"],
      ["画着", "huà zhe"],
      ["数了", "shǔ le"]
    ] as const) {
      const matches = longStoryTokens.filter((token) => token.hanzi === hanzi);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.every((token) => token.pinyin === expectedPinyin)).toBe(true);
    }
    for (const [hanzi, meaning] of [
      ["一只", "một con; lượng từ cho động vật"],
      ["带着", "mang theo; cầm theo; đang mang"],
      ["穿着", "đang mặc; mặc trên người"],
      ["工作本", "sổ công việc"],
      ["第一行", "dòng đầu tiên"],
      ["地方", "nơi; chỗ; khu vực"],
      ["有了", "đã có; có thêm"],
      ["小云", "Tiểu Vân"]
    ] as const) {
      expect(longStoryTokens.find((token) => token.hanzi === hanzi))
        .toMatchObject({ meaning });
    }
  });

  it("filters dictionary noise and locks reviewed contextual readings", () => {
    const wordTokens = builtInLibrary
      .flatMap((article) => article.paragraphs)
      .flatMap((paragraph) => paragraph.sentences)
      .flatMap((sentence) => sentence.tokens)
      .filter((token) => token.kind === "word");
    const forbiddenMeaningNoise =
      /biến thể|họ \[|Đài Loan|nghĩa bóng|phương ngữ|tiếng lóng|Hồng Kông|phản động|chống cộng sản|khiêu dâm|cần sa|vết cắn|~|cũng đọc là/iu;

    expect(
      wordTokens.filter((token) => forbiddenMeaningNoise.test(token.meaning))
    ).toEqual([]);

    for (const [hanzi, pinyin, meaning] of [
      ["故事", "gù shi", "câu chuyện; truyện"],
      ["告诉", "gào su", "nói cho biết; thông báo"],
      ["知道", "zhī dao", "biết; hiểu rõ"],
      ["一个", "yí gè", "một cái; lượng từ phổ thông"],
      ["一起", "yì qǐ", "cùng nhau"],
      ["东西", "dōng xi", "đồ vật; thứ; đồ đạc"],
      ["调查", "diào chá", undefined],
      ["认为", "rèn wéi", undefined],
      ["三种", "sān zhǒng", undefined],
      ["林阿姨", "lín ā yí", "cô Lâm"],
      ["陈老师", "chén lǎo shī", "giáo viên Trần"]
    ] as const) {
      const matches = wordTokens.filter((token) => token.hanzi === hanzi);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.every((token) => token.pinyin === pinyin)).toBe(true);
      if (meaning) {
        expect(matches.every((token) => token.meaning === meaning)).toBe(true);
      }
    }

    const longStorySentences = builtInLibrary
      .filter((article) => article.id.startsWith("hsk1-story-"))
      .flatMap((article) => article.paragraphs)
      .flatMap((paragraph) => paragraph.sentences)
      .map((sentence) => sentence.tokens.map((token) => token.hanzi).join(""));
    expect(longStorySentences.join("\n")).not.toMatch(
      /一起一起|站边|服务桌上|越来越小|没有右边的手/u
    );
  });

  it("rejects a word when even one character annotation is missing", () => {
    const incompleteArticle = structuredClone(
      builtInLibrary[0]
    ) as BuiltInArticle;
    const firstWord = incompleteArticle.paragraphs[0]?.sentences[0]?.tokens.find(
      (token) => token.kind === "word" && token.characters.length > 1
    );
    if (!firstWord || firstWord.kind !== "word") {
      throw new Error("multi-character fixture expected");
    }
    firstWord.characters = firstWord.characters.slice(1);

    expect(validateBuiltInLibrary([incompleteArticle])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "every character requires one authored annotation"
        })
      ])
    );
  });

  it("rejects incomplete metadata and duplicate paragraph ids", () => {
    const malformedArticle = structuredClone(
      builtInLibrary[0]
    ) as BuiltInArticle;
    malformedArticle.summary = "";
    malformedArticle.estimatedMinutes = 0;
    malformedArticle.paragraphs[1]!.id = malformedArticle.paragraphs[0]!.id;
    malformedArticle.paragraphs[0]!.sectionTitle = "";

    expect(validateBuiltInLibrary([malformedArticle])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "summary is required" }),
        expect.objectContaining({ message: "section title is required" }),
        expect.objectContaining({
          message: "estimated minutes must be a positive integer"
        }),
        expect.objectContaining({
          message: "paragraph id must be unique in article"
        })
      ])
    );
  });
});

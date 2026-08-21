import { gunzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync, strToU8 } from "fflate";
import { pinyin } from "pinyin-pro";
import { hskReadingSource } from "./content/hsk-reading-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dictionaryPath = `${root}public/cvdict-v1.u8.gz`;
const outputPath = `${root}src/content/builtInLibrary.generated.ts`;
const checkOnly = process.argv.includes("--check");

const NO_MEANING = "Chưa có nghĩa tiếng Việt trong từ điển offline.";
const meaningOverrides = new Map([
  ["的", "trợ từ sở hữu hoặc nối định ngữ với danh từ"],
  ["在", "ở; tại; đang"],
  ["他", "anh ấy; ông ấy"],
  ["她", "cô ấy; bà ấy"],
  ["也", "cũng"],
  ["很", "rất; khá"],
  ["都", "đều; tất cả"],
  ["有", "có"],
  ["是", "là; đúng"],
  ["工作", "công việc; làm việc"],
  ["很多", "nhiều; rất nhiều"],
  ["中间", "ở giữa; chính giữa"],
  ["原来", "hóa ra; ban đầu; trước đây"],
  ["一点", "một chút; một ít"],
  ["故事", "câu chuyện; truyện"],
  ["告诉", "nói cho biết; thông báo"],
  ["知道", "biết; hiểu rõ"],
  ["看起来", "trông có vẻ; nhìn có vẻ"],
  ["后面", "phía sau; đằng sau"],
  ["奶奶", "bà nội; bà"],
  ["妹妹", "em gái"],
  ["爸爸", "bố; ba"],
  ["办公室", "văn phòng"],
  ["白色", "màu trắng"],
  ["画了", "đã vẽ"],
  ["第一个", "đầu tiên; thứ nhất"],
  ["第二个", "thứ hai"],
  ["第三个", "thứ ba"],
  ["每个", "mỗi; từng"],
  ["做的", "do ... làm; được làm"],
  ["新的", "mới"],
  ["林阿姨", "cô Lâm"],
  ["阿文", "A Văn"],
  ["黄色", "màu vàng"],
  ["水里", "trong nước"],
  ["村口", "đầu làng; lối vào làng"],
  ["家门口", "trước cửa nhà"],
  ["白纸", "giấy trắng"],
  ["彩纸", "giấy màu"],
  ["大纸", "tờ giấy lớn"],
  ["纸桥", "cầu giấy"],
  ["纸衣服", "quần áo bằng giấy"],
  ["蓝纸", "giấy màu xanh"],
  ["红纸", "giấy màu đỏ"],
  ["黄纸", "giấy màu vàng"],
  ["大白纸", "tờ giấy trắng lớn"],
  ["白纸星星", "ngôi sao bằng giấy trắng"],
  ["拿纸", "cầm giấy; lấy giấy"],
  ["新纸", "giấy mới"],
  ["纸架", "giá đựng giấy"],
  ["欢迎纸", "tờ giấy chào mừng"],
  ["小纸房子", "ngôi nhà nhỏ bằng giấy"],
  ["乱纸", "giấy để lộn xộn"],
  ["纸的", "bằng giấy"],
  ["这颗", "viên này; hạt này"],
  ["那颗", "viên đó; hạt đó"],
  ["每颗", "mỗi viên; mỗi hạt"],
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
  ["咖啡店", "quán cà phê"],
  ["咖", "âm tiết dùng trong từ cà phê"],
  ["啡", "âm tiết dùng trong từ cà phê"],
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
  ["王老师", "giáo viên Vương"],
  ["王先生", "anh Vương; ông Vương"],
  ["小明", "Tiểu Minh"],
  ["小李", "Tiểu Lý"],
  ["小王", "Tiểu Vương"],
  ["小林", "Tiểu Lâm"],
  ["小陈", "Tiểu Trần"],
  ["小周", "Tiểu Chu"],
  ["小云", "Tiểu Vân"],
  ["小花", "Tiểu Hoa"],
  ["小光", "Tiểu Quang"],
  ["小玲", "Tiểu Linh"],
  ["小海", "Tiểu Hải"],
  ["小青", "Tiểu Thanh"],
  ["小东", "Tiểu Đông"],
  ["小文", "Tiểu Văn"],
  ["小山", "Tiểu Sơn"],
  ["小河", "Tiểu Hà"],
  ["小月", "Tiểu Nguyệt"],
  ["小兰", "Tiểu Lan"],
  ["小白", "Tiểu Bạch"],
  ["小星", "Tiểu Tinh"],
  ["小红", "Tiểu Hồng"],
  ["小美", "Tiểu Mỹ"],
  ["小雨", "Tiểu Vũ"],
  ["小安", "Tiểu An"],
  ["李月", "Lý Nguyệt"],
  ["张阿姨", "cô Trương"],
  ["陈老师", "giáo viên Trần"],
  ["李爷爷", "ông Lý"],
  ["李叔叔", "chú Lý"],
  ["王阿姨", "cô Vương"],
  ["周姐姐", "chị Châu"],
  ["李姐", "chị Lý"],
  ["陈叔叔", "chú Trần"],
  ["王叔叔", "chú Vương"],
  ["张经理", "quản lý Trương"],
  ["李阿姨", "cô Lý"],
  ["王经理", "quản lý Vương"],
  ["刘阿姨", "cô Lưu"],
  ["老爷爷", "cụ ông"],
  ["林然", "Lâm Nhiên"],
  ["陈晨", "Trần Thần"],
  ["一起", "cùng nhau"],
  ["喝水", "uống nước"],
  ["准备了", "đã chuẩn bị"],
  ["看着", "đang nhìn; nhìn"],
  ["到了", "đã đến; khi đến"],
  ["来了", "đã đến"],
  ["还是", "vẫn; hay là; hoặc"],
  ["阿姨", "cô; dì"],
  ["地", "trợ từ nối trạng từ với động từ"],
  ["被", "bị; được; giới từ đánh dấu câu bị động"],
  ["东西", "đồ vật; thứ; đồ đạc"],
  ["活动", "hoạt động; sự kiện"],
  ["制服", "đồng phục"],
  ["样衣", "quần áo mẫu; mẫu thử"],
  ["错题本", "sổ ghi và phân tích câu làm sai"],
  ["只", "chỉ; chỉ có"],
  ["一只", "một con; lượng từ cho động vật"],
  ["太", "quá; rất"],
  ["把", "giới từ đưa tân ngữ lên trước động từ; cầm; nắm"],
  ["大家", "mọi người"],
  ["地方", "nơi; chỗ; khu vực"],
  ["空地方", "chỗ trống; khoảng trống"],
  ["大地方", "nơi rộng; khoảng lớn"],
  ["小地方", "chỗ nhỏ; nơi nhỏ"],
  ["好地方", "nơi tốt; chỗ phù hợp"],
  ["有了", "đã có; có thêm"],
  ["带着", "mang theo; cầm theo; đang mang"],
  ["穿着", "đang mặc; mặc trên người"],
  ["放在", "đặt ở; để tại"],
  ["做好", "làm xong; làm tốt"],
  ["做得", "làm được; làm đến mức"],
  ["画得", "vẽ được; vẽ đến mức"],
  ["放得", "đặt ở mức; để ở mức"],
  ["过得", "trôi qua; trải qua"],
  ["得", "trợ từ nối động từ hoặc tính từ với bổ ngữ mức độ"],
  ["画着", "đang vẽ; có hình vẽ"],
  ["数了", "đã đếm"],
  ["工作本", "sổ công việc"],
  ["一行", "một dòng; một hàng"],
  ["第一行", "dòng đầu tiên"],
  ["最后一行", "dòng cuối cùng"],
  ["地址纸", "tờ ghi địa chỉ"],
  ["音乐箱", "thùng thiết bị âm thanh"],
  ["长木条", "thanh gỗ dài"],
  ["长架子", "giá dài"],
  ["第一份", "phần đầu tiên; bản đầu tiên"],
  ["小草莓", "quả dâu tây nhỏ"],
  ["找了一下午", "đã tìm suốt buổi chiều"],
  ["当", "khi; lúc; vào lúc"],
  ["表演", "biểu diễn; trình diễn; đóng vai"],
  ["代价", "cái giá phải trả; chi phí"],
  ["大树", "cây lớn; cây to"],
  ["假设", "giả thiết; giả định"],
  ["针对性", "tính nhắm đúng mục tiêu; tính sát vấn đề"],
  ["生意", "việc kinh doanh; buôn bán"]
]);
const tokenPinyinOverrides = new Map([
  ["一个", ["yí", "gè"]],
  ["一起", ["yì", "qǐ"]],
  ["看", ["kàn"]],
  ["上", ["shàng"]],
  ["是", ["shì"]],
  ["东西", ["dōng", "xi"]],
  ["开始", ["kāi", "shǐ"]],
  ["一边", ["yì", "biān"]],
  ["一站", ["yí", "zhàn"]],
  ["发现", ["fā", "xiàn"]],
  ["第二个", ["dì", "èr", "gè"]],
  ["来到", ["lái", "dào"]],
  ["第一次", ["dì", "yī", "cì"]],
  ["不是", ["bú", "shì"]],
  ["不能", ["bù", "néng"]],
  ["星期一", ["xīng", "qī", "yī"]],
  ["不要", ["bú", "yào"]],
  ["一步", ["yí", "bù"]],
  ["一层", ["yì", "céng"]],
  ["认为", ["rèn", "wéi"]],
  ["三种", ["sān", "zhǒng"]],
  ["调查", ["diào", "chá"]],
  ["故事", ["gù", "shi"]],
  ["告诉", ["gào", "su"]],
  ["知道", ["zhī", "dao"]],
  ["地", ["de"]],
  ["只", ["zhǐ"]],
  ["得", ["de"]],
  ["做得", ["zuò", "de"]],
  ["画得", ["huà", "de"]],
  ["放得", ["fàng", "de"]],
  ["过得", ["guò", "de"]],
  ["画着", ["huà", "zhe"]],
  ["数了", ["shǔ", "le"]],
  ["完成得", ["wán", "chéng", "de"]],
  ["保存得", ["bǎo", "cún", "de"]],
  ["说得", ["shuō", "de"]],
  ["问得", ["wèn", "de"]],
  ["写得", ["xiě", "de"]]
]);
const accentByLevel = {
  "HSK 1": "jade",
  "HSK 2": "amber",
  "HSK 3": "coral",
  "HSK 4": "violet",
  "HSK 5": "azure"
};
const minutesByLevel = {
  "HSK 1": 4,
  "HSK 2": 5,
  "HSK 3": 6,
  "HSK 4": 7,
  "HSK 5": 8
};

function cleanDefinition(value) {
  if (
    /^\s*(?:\((?:nghĩa bóng|phương ngữ|tiếng lóng|Đài Loan|Hồng Kông)[^)]*\)|(?:nghĩa bóng|phương ngữ|tiếng lóng|Đài Loan|Hồng Kông)\s*:)/iu.test(value) ||
    /^\s*(?:thị trấn|trấn|huyện)[^;]*(?:Đài Loan|Đài Nam|Bình Đông|Nam Đầu)/iu.test(value) ||
    /^(?:phản động|chống cộng sản|khiêu dâm|cần sa|vết cắn yêu|trốn)$/iu.test(value.trim())
  ) {
    return "";
  }

  return value
    .replace(/\([^()]*\)/gu, "")
    .replace(/\[[^\]]*\]/gu, "")
    .replace(/\s+/gu, " ")
    .replace(/^\s+|\s+$/gu, "")
    .replace(/^(?:LT|CL|Lượng từ):.*$/iu, "")
    .replace(/;?\s*cũng đọc là.*$/iu, "")
    .replace(/;\s*~[^;]*/gu, "")
    .replace(/\s*[;,]\s*(?:v\.v\.|vv\.)$/iu, "")
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
    /^([一二两三四五六七八九十]+)(分钟|个月|个人|本书|天|个|件|位|双|张|本|把|杯|份|段|篇|部|种|次|号|颗|棵|辆|块|岁|圈|条|层|根|盆|箱|片)$/u
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
      "号": "số; cỡ",
      "颗": "viên; hạt",
      "棵": "cây",
      "辆": "chiếc xe",
      "块": "miếng",
      "岁": "tuổi",
      "圈": "vòng",
      "条": "chiếc; dải; vật dài",
      "层": "tầng; lớp",
      "根": "thanh; sợi",
      "盆": "chậu",
      "箱": "thùng",
      "片": "mảnh; chiếc"
    }[unitMatch[2]];
    if (number && unit) return `${number} ${unit}`;
  }

  const ordinalMatch = hanzi.match(
    /^第([一二两三四五六七八九十]+)(天|页|件|张|周|星期|次|颗|个)$/u
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
      "次": "lần",
      "颗": "viên",
      "个": "mục"
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
  const pinyinByCharacter = tokenPinyinOverrides.get(origin) ?? pinyinData.symbols;
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
  const sectionOffsets = [];
  let sentenceOffset = 0;
  for (const sourceSection of source.sections) {
    sectionOffsets.push(sentenceOffset);
    sentenceOffset += sourceSection.sentences.length;
  }

  return {
    id: source.id,
    title: source.title,
    titlePinyin: getHeadingPinyin(dictionary, source.title),
    titleTranslation: source.titleTranslation,
    summary: source.summary,
    level: source.level,
    topic: source.topic,
    estimatedMinutes: source.estimatedMinutes ?? minutesByLevel[source.level],
    accent: accentByLevel[source.level],
    paragraphs: source.sections.map((sourceSection, paragraphIndex) => ({
      id: `p${paragraphIndex + 1}`,
      sectionTitle: sourceSection.title,
      sectionTitlePinyin: getHeadingPinyin(dictionary, sourceSection.title),
      sectionTitleTranslation: sourceSection.titleTranslation,
      sentences: sourceSection.sentences.map((sourceSentence, sentenceIndex) => {
        const sentenceId = `s${sectionOffsets[paragraphIndex] + sentenceIndex + 1}`;
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

function packLibraryStrings(value, strings, stringIndexes) {
  if (typeof value === "string") {
    let index = stringIndexes.get(value);
    if (index === undefined) {
      index = strings.length;
      strings.push(value);
      stringIndexes.set(value, index);
    }
    return -(index + 1);
  }
  if (typeof value === "number" && value < 0) {
    throw new Error("Library numbers must be non-negative before string packing.");
  }
  if (Array.isArray(value)) {
    return value.map((item) => packLibraryStrings(item, strings, stringIndexes));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        packLibraryStrings(item, strings, stringIndexes)
      ])
    );
  }
  return value;
}

const strings = [];
const packedLibrary = packLibraryStrings(library, strings, new Map());
const serializedLibrary = JSON.stringify({ strings, library: packedLibrary });
const compressedLibrary = Buffer.from(
  gzipSync(strToU8(serializedLibrary), { level: 9, mtime: 0 })
).toString("base64");
const output = `/* This file is generated by scripts/build-reading-library.mjs. */\n` +
  `import { gunzipSync, strFromU8 } from "fflate";\n` +
  `import type { BuiltInArticle } from "./types";\n\n` +
  `type PackedLibrary = { strings: string[]; library: unknown };\n\n` +
  `function restorePackedStrings(value: unknown, strings: readonly string[]): unknown {\n` +
  `  if (typeof value === "number" && value < 0) return strings[-value - 1];\n` +
  `  if (Array.isArray(value)) {\n` +
  `    for (let index = 0; index < value.length; index += 1) {\n` +
  `      value[index] = restorePackedStrings(value[index], strings);\n` +
  `    }\n` +
  `    return value;\n` +
  `  }\n` +
  `  if (value && typeof value === "object") {\n` +
  `    const record = value as Record<string, unknown>;\n` +
  `    for (const key of Object.keys(record)) {\n` +
  `      record[key] = restorePackedStrings(record[key], strings);\n` +
  `    }\n` +
  `  }\n` +
  `  return value;\n` +
  `}\n\n` +
  `const compressedLibrary = ${JSON.stringify(compressedLibrary)};\n` +
  `const compressedBytes = Uint8Array.from(atob(compressedLibrary), (character) => character.charCodeAt(0));\n\n` +
  `const packed = JSON.parse(strFromU8(gunzipSync(compressedBytes))) as PackedLibrary;\n` +
  `export const builtInLibrary = restorePackedStrings(packed.library, packed.strings) as readonly BuiltInArticle[];\n`;

if (checkOnly) {
  const current = readFileSync(outputPath, "utf8").replaceAll("\r\n", "\n");
  if (current !== output) {
    throw new Error("Generated reading library is stale. Run npm run data:library.");
  }
  console.log(`Reading library verified: ${library.length} articles, no missing annotations.`);
} else {
  writeFileSync(outputPath, output);
  console.log(`Wrote ${library.length} annotated articles to ${outputPath}.`);
}

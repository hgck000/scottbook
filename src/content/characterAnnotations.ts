import type { CharacterAnnotation } from "./types";

const character = (
  hanzi: string,
  pinyin: string,
  meaning: string
): CharacterAnnotation => ({ hanzi, pinyin, meaning });

/**
 * Contextual character readings for every multi-character token in the pilot
 * library. These are authored data, not runtime transliteration or dictionary
 * guesses. Single-character tokens already carry the same information on the
 * word itself and are normalized by getAuthoredCharacters.
 */
const multiCharacterAnnotations = {
  "一个字一个字": [
    character("一", "yí", "một"),
    character("个", "ge", "lượng từ"),
    character("字", "zì", "chữ"),
    character("一", "yí", "một"),
    character("个", "ge", "lượng từ"),
    character("字", "zì", "chữ")
  ],
  "一起": [
    character("一", "yì", "cùng"),
    character("起", "qǐ", "trong 一起: cùng nhau")
  ],
  "七点半": [
    character("七", "qī", "bảy"),
    character("点", "diǎn", "giờ"),
    character("半", "bàn", "rưỡi, một nửa")
  ],
  "下午": [
    character("下", "xià", "sau, dưới"),
    character("午", "wǔ", "buổi trưa")
  ],
  "不认识的词": [
    character("不", "bù", "không"),
    character("认", "rèn", "nhận, nhận ra"),
    character("识", "shi", "biết, nhận biết"),
    character("的", "de", "trợ từ bổ nghĩa"),
    character("词", "cí", "từ")
  ],
  "中午": [
    character("中", "zhōng", "giữa"),
    character("午", "wǔ", "buổi trưa")
  ],
  "今天": [
    character("今", "jīn", "nay, hiện tại"),
    character("天", "tiān", "ngày")
  ],
  "以前": [
    character("以", "yǐ", "từ, lấy mốc"),
    character("前", "qián", "trước")
  ],
  "以后": [
    character("以", "yǐ", "từ, lấy mốc"),
    character("后", "hòu", "sau")
  ],
  "但是": [
    character("但", "dàn", "nhưng"),
    character("是", "shì", "là; trong 但是: nhưng")
  ],
  "公共汽车": [
    character("公", "gōng", "công cộng"),
    character("共", "gòng", "chung"),
    character("汽", "qì", "hơi, khí"),
    character("车", "chē", "xe")
  ],
  "公园": [
    character("公", "gōng", "công cộng"),
    character("园", "yuán", "vườn")
  ],
  "六点": [
    character("六", "liù", "sáu"),
    character("点", "diǎn", "giờ")
  ],
  "前后的内容": [
    character("前", "qián", "trước"),
    character("后", "hòu", "sau"),
    character("的", "de", "trợ từ bổ nghĩa"),
    character("内", "nèi", "bên trong"),
    character("容", "róng", "chứa; trong 内容: nội dung")
  ],
  "十分钟": [
    character("十", "shí", "mười"),
    character("分", "fēn", "phút"),
    character("钟", "zhōng", "đồng hồ; đơn vị phút")
  ],
  "发现": [
    character("发", "fā", "phát ra; trong 发现: phát hiện"),
    character("现", "xiàn", "xuất hiện")
  ],
  "句子的意思": [
    character("句", "jù", "câu"),
    character("子", "zi", "hậu tố danh từ"),
    character("的", "de", "trợ từ sở hữu, bổ nghĩa"),
    character("意", "yì", "ý"),
    character("思", "si", "ý nghĩ; trong 意思: ý nghĩa")
  ],
  "吃饭": [
    character("吃", "chī", "ăn"),
    character("饭", "fàn", "cơm, bữa ăn")
  ],
  "后来": [
    character("后", "hòu", "sau"),
    character("来", "lái", "đến; trong 后来: về sau")
  ],
  "喝水": [
    character("喝", "hē", "uống"),
    character("水", "shuǐ", "nước")
  ],
  "回家": [
    character("回", "huí", "trở về"),
    character("家", "jiā", "nhà")
  ],
  "复习": [
    character("复", "fù", "lặp lại"),
    character("习", "xí", "học, luyện tập")
  ],
  "天气": [
    character("天", "tiān", "trời"),
    character("气", "qì", "khí; trong 天气: thời tiết")
  ],
  "学校": [
    character("学", "xué", "học"),
    character("校", "xiào", "trường")
  ],
  "学的": [
    character("学", "xué", "học"),
    character("的", "de", "trợ từ: điều đã học")
  ],
  "容易": [
    character("容", "róng", "chứa; trong 容易: dễ"),
    character("易", "yì", "dễ")
  ],
  "常常": [
    character("常", "cháng", "thường"),
    character("常", "cháng", "thường")
  ],
  "很好": [
    character("很", "hěn", "rất"),
    character("好", "hǎo", "tốt, đẹp")
  ],
  "我们": [
    character("我", "wǒ", "tôi"),
    character("们", "men", "hậu tố số nhiều")
  ],
  "打开": [
    character("打", "dǎ", "thực hiện; trong 打开: mở"),
    character("开", "kāi", "mở")
  ],
  "拼音": [
    character("拼", "pīn", "ghép, đánh vần"),
    character("音", "yīn", "âm thanh")
  ],
  "早上": [
    character("早", "zǎo", "sớm"),
    character("上", "shang", "trong 早上: buổi sáng")
  ],
  "早饭": [
    character("早", "zǎo", "sáng, sớm"),
    character("饭", "fàn", "cơm, bữa ăn")
  ],
  "明白": [
    character("明", "míng", "rõ"),
    character("白", "bai", "trong 明白: hiểu rõ")
  ],
  "更清楚": [
    character("更", "gèng", "càng, hơn"),
    character("清", "qīng", "rõ, trong"),
    character("楚", "chu", "trong 清楚: rõ ràng")
  ],
  "有点": [
    character("有", "yǒu", "có"),
    character("点", "diǎn", "một chút")
  ],
  "朋友": [
    character("朋", "péng", "bạn, bạn bè"),
    character("友", "you", "bạn")
  ],
  "汉语": [
    character("汉", "hàn", "Hán, Trung Quốc"),
    character("语", "yǔ", "ngôn ngữ")
  ],
  "汉语文章": [
    character("汉", "hàn", "Hán, Trung Quốc"),
    character("语", "yǔ", "ngôn ngữ"),
    character("文", "wén", "văn, chữ viết"),
    character("章", "zhāng", "bài, chương")
  ],
  "汉语课": [
    character("汉", "hàn", "Hán, Trung Quốc"),
    character("语", "yǔ", "ngôn ngữ"),
    character("课", "kè", "tiết học")
  ],
  "然后": [
    character("然", "rán", "như vậy; trong 然后: sau đó"),
    character("后", "hòu", "sau")
  ],
  "猜一猜": [
    character("猜", "cāi", "đoán"),
    character("一", "yi", "một lần, thử"),
    character("猜", "cāi", "đoán")
  ],
  "的时候": [
    character("的", "de", "trợ từ"),
    character("时", "shí", "thời gian"),
    character("候", "hou", "trong 时候: lúc, khi")
  ],
  "翻译": [
    character("翻", "fān", "lật, chuyển"),
    character("译", "yì", "dịch")
  ],
  "虽然": [
    character("虽", "suī", "tuy"),
    character("然", "rán", "như vậy; trong 虽然: mặc dù")
  ],
  "解释": [
    character("解", "jiě", "giải, giải thích"),
    character("释", "shì", "giải thích")
  ],
  "记得": [
    character("记", "jì", "ghi nhớ"),
    character("得", "de", "trong 记得: nhớ")
  ],
  "说了很多话": [
    character("说", "shuō", "nói"),
    character("了", "le", "trợ từ hoàn thành"),
    character("很", "hěn", "rất"),
    character("多", "duō", "nhiều"),
    character("话", "huà", "lời nói, chuyện")
  ],
  "起床": [
    character("起", "qǐ", "dậy"),
    character("床", "chuáng", "giường")
  ],
  "这个周末": [
    character("这", "zhè", "này"),
    character("个", "ge", "lượng từ"),
    character("周", "zhōu", "tuần"),
    character("末", "mò", "cuối")
  ],
  "这样": [
    character("这", "zhè", "này"),
    character("样", "yàng", "cách, kiểu")
  ],
  "遇到": [
    character("遇", "yù", "gặp"),
    character("到", "dào", "đến; bổ ngữ kết quả")
  ],
  "高兴": [
    character("高", "gāo", "cao; trong 高兴: vui"),
    character("兴", "xìng", "hứng, tâm trạng")
  ]
} as const satisfies Record<string, readonly CharacterAnnotation[]>;

export function getAuthoredCharacters(
  hanzi: string,
  pinyin: string,
  meaning: string
): readonly CharacterAnnotation[] {
  if (Array.from(hanzi).length === 1) {
    return [character(hanzi, pinyin, meaning)];
  }
  return multiCharacterAnnotations[hanzi as keyof typeof multiCharacterAnnotations] ?? [];
}

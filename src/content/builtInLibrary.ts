import type { BuiltInArticle } from "./types";
import { getAuthoredCharacters } from "./characterAnnotations";

const punctuation = (id: string, hanzi: string) =>
  ({ id, kind: "punctuation", hanzi }) as const;

const word = (id: string, hanzi: string, pinyin: string, meaning: string) =>
  ({
    id,
    kind: "word",
    hanzi,
    pinyin,
    meaning,
    characters: getAuthoredCharacters(hanzi, pinyin, meaning)
  }) as const;

/**
 * ScottBook reference content is deliberately authored as annotated data.
 * The reader never generates pinyin or translations for these articles at
 * runtime, so the complete experience remains available offline.
 */
export const builtInLibrary = [
  {
    id: "hsk1-my-morning",
    title: "我的早上",
    titlePinyin: "Wǒ de zǎoshang",
    titleTranslation: "Buổi sáng của tôi",
    summary: "Một buổi sáng đơn giản trước giờ học tiếng Trung.",
    level: "HSK 1",
    topic: "Đời sống",
    estimatedMinutes: 2,
    accent: "jade",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation: "Sáu giờ sáng, tôi thức dậy.",
            tokens: [
              word("s1-t1", "早上", "zǎoshang", "buổi sáng"),
              word("s1-t2", "六点", "liù diǎn", "sáu giờ"),
              punctuation("s1-t3", "，"),
              word("s1-t4", "我", "wǒ", "tôi"),
              word("s1-t5", "起床", "qǐchuáng", "thức dậy"),
              punctuation("s1-t6", "。")
            ]
          },
          {
            id: "s2",
            translation: "Tôi uống nước, cũng ăn sáng.",
            tokens: [
              word("s2-t1", "我", "wǒ", "tôi"),
              word("s2-t2", "喝水", "hē shuǐ", "uống nước"),
              punctuation("s2-t3", "，"),
              word("s2-t4", "也", "yě", "cũng"),
              word("s2-t5", "吃", "chī", "ăn"),
              word("s2-t6", "早饭", "zǎofàn", "bữa sáng"),
              punctuation("s2-t7", "。")
            ]
          }
        ]
      },
      {
        id: "p2",
        sentences: [
          {
            id: "s3",
            translation: "Bảy giờ rưỡi, tôi đi đến trường.",
            tokens: [
              word("s3-t1", "七点半", "qī diǎn bàn", "bảy giờ rưỡi"),
              punctuation("s3-t2", "，"),
              word("s3-t3", "我", "wǒ", "tôi"),
              word("s3-t4", "去", "qù", "đi"),
              word("s3-t5", "学校", "xuéxiào", "trường học"),
              punctuation("s3-t6", "。")
            ]
          },
          {
            id: "s4",
            translation: "Hôm nay có tiết tiếng Trung, tôi rất vui.",
            tokens: [
              word("s4-t1", "今天", "jīntiān", "hôm nay"),
              word("s4-t2", "有", "yǒu", "có"),
              word("s4-t3", "汉语课", "hànyǔ kè", "tiết tiếng Trung"),
              punctuation("s4-t4", "，"),
              word("s4-t5", "我", "wǒ", "tôi"),
              word("s4-t6", "很", "hěn", "rất"),
              word("s4-t7", "高兴", "gāoxìng", "vui"),
              punctuation("s4-t8", "。")
            ]
          }
        ]
      }
    ]
  },
  {
    id: "hsk2-weekend-plan",
    title: "周末的计划",
    titlePinyin: "Zhōumò de jìhuà",
    titleTranslation: "Kế hoạch cuối tuần",
    summary: "Đi công viên với bạn rồi trở về ôn lại tiếng Trung.",
    level: "HSK 2",
    topic: "Kế hoạch",
    estimatedMinutes: 3,
    accent: "amber",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation:
              "Cuối tuần này thời tiết rất đẹp, tôi muốn cùng bạn đi công viên.",
            tokens: [
              word("s1-t1", "这个周末", "zhège zhōumò", "cuối tuần này"),
              word("s1-t2", "天气", "tiānqì", "thời tiết"),
              word("s1-t3", "很好", "hěn hǎo", "rất đẹp, rất tốt"),
              punctuation("s1-t4", "，"),
              word("s1-t5", "我", "wǒ", "tôi"),
              word("s1-t6", "想", "xiǎng", "muốn"),
              word("s1-t7", "和", "hé", "với"),
              word("s1-t8", "朋友", "péngyou", "bạn bè"),
              word("s1-t9", "一起", "yìqǐ", "cùng nhau"),
              word("s1-t10", "去", "qù", "đi"),
              word("s1-t11", "公园", "gōngyuán", "công viên"),
              punctuation("s1-t12", "。")
            ]
          },
          {
            id: "s2",
            translation:
              "Chúng tôi đi xe buýt trước, sau đó đi bộ mười phút.",
            tokens: [
              word("s2-t1", "我们", "wǒmen", "chúng tôi"),
              word("s2-t2", "先", "xiān", "trước tiên"),
              word("s2-t3", "坐", "zuò", "đi, ngồi phương tiện"),
              word("s2-t4", "公共汽车", "gōnggòng qìchē", "xe buýt"),
              punctuation("s2-t5", "，"),
              word("s2-t6", "然后", "ránhòu", "sau đó"),
              word("s2-t7", "走", "zǒu", "đi bộ"),
              word("s2-t8", "十分钟", "shí fēnzhōng", "mười phút"),
              punctuation("s2-t9", "。")
            ]
          }
        ]
      },
      {
        id: "p2",
        sentences: [
          {
            id: "s3",
            translation:
              "Buổi trưa chúng tôi ăn ở công viên, cũng trò chuyện rất nhiều.",
            tokens: [
              word("s3-t1", "中午", "zhōngwǔ", "buổi trưa"),
              word("s3-t2", "我们", "wǒmen", "chúng tôi"),
              word("s3-t3", "在", "zài", "ở, tại"),
              word("s3-t4", "公园", "gōngyuán", "công viên"),
              word("s3-t5", "吃饭", "chīfàn", "ăn cơm"),
              punctuation("s3-t6", "，"),
              word("s3-t7", "也", "yě", "cũng"),
              word("s3-t8", "说了很多话", "shuō le hěn duō huà", "trò chuyện rất nhiều"),
              punctuation("s3-t9", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Buổi chiều sau khi về nhà, tôi muốn ôn lại tiếng Trung đã học hôm nay.",
            tokens: [
              word("s4-t1", "下午", "xiàwǔ", "buổi chiều"),
              word("s4-t2", "回家", "huí jiā", "về nhà"),
              word("s4-t3", "以后", "yǐhòu", "sau khi"),
              punctuation("s4-t4", "，"),
              word("s4-t5", "我", "wǒ", "tôi"),
              word("s4-t6", "要", "yào", "sẽ, muốn"),
              word("s4-t7", "复习", "fùxí", "ôn tập"),
              word("s4-t8", "今天", "jīntiān", "hôm nay"),
              word("s4-t9", "学的", "xué de", "đã học"),
              word("s4-t10", "汉语", "hànyǔ", "tiếng Trung"),
              punctuation("s4-t11", "。")
            ]
          }
        ]
      }
    ]
  },
  {
    id: "hsk3-understand-first",
    title: "先理解，再翻译",
    titlePinyin: "Xiān lǐjiě, zài fānyì",
    titleTranslation: "Hiểu trước, rồi mới dịch",
    summary: "Một cách đọc không vội dịch từng chữ, phù hợp người học HSK3.",
    level: "HSK 3",
    topic: "Học tập",
    estimatedMinutes: 4,
    accent: "coral",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation:
              "Khi đọc bài tiếng Trung, trước đây tôi thường dịch từng chữ một.",
            tokens: [
              word("s1-t1", "读", "dú", "đọc"),
              word("s1-t2", "汉语文章", "hànyǔ wénzhāng", "bài văn tiếng Trung"),
              word("s1-t3", "的时候", "de shíhou", "khi, lúc"),
              punctuation("s1-t4", "，"),
              word("s1-t5", "我", "wǒ", "tôi"),
              word("s1-t6", "以前", "yǐqián", "trước đây"),
              word("s1-t7", "常常", "chángcháng", "thường xuyên"),
              word("s1-t8", "一个字一个字", "yí ge zì yí ge zì", "từng chữ một"),
              word("s1-t9", "地", "de", "trợ từ trạng ngữ"),
              word("s1-t10", "翻译", "fānyì", "dịch"),
              punctuation("s1-t11", "。")
            ]
          },
          {
            id: "s2",
            translation:
              "Sau đó tôi phát hiện rằng xem nội dung trước sau trước thì dễ hiểu ý của câu hơn.",
            tokens: [
              word("s2-t1", "后来", "hòulái", "sau đó, về sau"),
              word("s2-t2", "我", "wǒ", "tôi"),
              word("s2-t3", "发现", "fāxiàn", "phát hiện"),
              punctuation("s2-t4", "，"),
              word("s2-t5", "先", "xiān", "trước tiên"),
              word("s2-t6", "看", "kàn", "xem, đọc"),
              word("s2-t7", "前后的内容", "qiánhòu de nèiróng", "nội dung trước và sau"),
              punctuation("s2-t8", "，"),
              word("s2-t9", "更", "gèng", "càng, hơn"),
              word("s2-t10", "容易", "róngyì", "dễ"),
              word("s2-t11", "明白", "míngbai", "hiểu"),
              word("s2-t12", "句子的意思", "jùzi de yìsi", "ý của câu"),
              punctuation("s2-t13", "。")
            ]
          }
        ]
      },
      {
        id: "p2",
        sentences: [
          {
            id: "s3",
            translation:
              "Gặp từ không biết, tôi sẽ đoán thử trước rồi mới mở pinyin và phần giải thích.",
            tokens: [
              word("s3-t1", "遇到", "yùdào", "gặp phải"),
              word("s3-t2", "不认识的词", "bù rènshi de cí", "từ không biết"),
              punctuation("s3-t3", "，"),
              word("s3-t4", "我", "wǒ", "tôi"),
              word("s3-t5", "会", "huì", "sẽ"),
              word("s3-t6", "先", "xiān", "trước tiên"),
              word("s3-t7", "猜一猜", "cāi yi cāi", "đoán thử"),
              punctuation("s3-t8", "，"),
              word("s3-t9", "再", "zài", "rồi mới"),
              word("s3-t10", "打开", "dǎkāi", "mở"),
              word("s3-t11", "拼音", "pīnyīn", "pinyin, phiên âm"),
              word("s3-t12", "和", "hé", "và"),
              word("s3-t13", "解释", "jiěshì", "giải thích"),
              punctuation("s3-t14", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Làm như vậy tuy hơi chậm, nhưng tôi nhớ rõ hơn.",
            tokens: [
              word("s4-t1", "这样", "zhèyàng", "như vậy"),
              word("s4-t2", "虽然", "suīrán", "tuy, mặc dù"),
              word("s4-t3", "有点", "yǒudiǎn", "hơi, có chút"),
              word("s4-t4", "慢", "màn", "chậm"),
              punctuation("s4-t5", "，"),
              word("s4-t6", "但是", "dànshì", "nhưng"),
              word("s4-t7", "我", "wǒ", "tôi"),
              word("s4-t8", "记得", "jìde", "nhớ"),
              word("s4-t9", "更清楚", "gèng qīngchu", "rõ hơn"),
              punctuation("s4-t10", "。")
            ]
          }
        ]
      }
    ]
  }
] as const satisfies readonly BuiltInArticle[];

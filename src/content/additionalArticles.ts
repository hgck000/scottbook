import type { BuiltInArticle } from "./types";
import { punctuation, word } from "./articleTokens";

export const additionalHsk1Articles = [
  {
    id: "hsk1-my-family",
    title: "我的家",
    titlePinyin: "Wǒ de jiā",
    titleTranslation: "Gia đình tôi",
    summary: "Giới thiệu ngắn về gia đình và những việc cả nhà làm cùng nhau.",
    level: "HSK 1",
    topic: "Đời sống",
    estimatedMinutes: 2,
    accent: "amber",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation: "Nhà tôi có bốn người.",
            tokens: [
              word("s1-t1", "我家", "wǒ jiā", "nhà tôi"),
              word("s1-t2", "有", "yǒu", "có"),
              word("s1-t3", "四个人", "sì ge rén", "bốn người"),
              punctuation("s1-t4", "。")
            ]
          },
          {
            id: "s2",
            translation: "Bố và mẹ đều đi làm.",
            tokens: [
              word("s2-t1", "爸爸", "bàba", "bố"),
              word("s2-t2", "和", "hé", "và"),
              word("s2-t3", "妈妈", "māma", "mẹ"),
              word("s2-t4", "都", "dōu", "đều"),
              word("s2-t5", "工作", "gōngzuò", "làm việc"),
              punctuation("s2-t6", "。")
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
              "Anh trai thích đọc sách, còn tôi thích học tiếng Trung.",
            tokens: [
              word("s3-t1", "哥哥", "gēge", "anh trai"),
              word("s3-t2", "喜欢", "xǐhuan", "thích"),
              word("s3-t3", "看书", "kàn shū", "đọc sách"),
              punctuation("s3-t4", "，"),
              word("s3-t5", "我", "wǒ", "tôi"),
              word("s3-t6", "喜欢", "xǐhuan", "thích"),
              word("s3-t7", "学习", "xuéxí", "học tập"),
              word("s3-t8", "汉语", "hànyǔ", "tiếng Trung"),
              punctuation("s3-t9", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Buổi tối, chúng tôi cùng ăn cơm và cũng cùng trò chuyện.",
            tokens: [
              word("s4-t1", "晚上", "wǎnshang", "buổi tối"),
              punctuation("s4-t2", "，"),
              word("s4-t3", "我们", "wǒmen", "chúng tôi"),
              word("s4-t4", "一起", "yìqǐ", "cùng nhau"),
              word("s4-t5", "吃饭", "chīfàn", "ăn cơm"),
              punctuation("s4-t6", "，"),
              word("s4-t7", "也", "yě", "cũng"),
              word("s4-t8", "一起", "yìqǐ", "cùng nhau"),
              word("s4-t9", "说话", "shuōhuà", "nói chuyện"),
              punctuation("s4-t10", "。")
            ]
          }
        ]
      }
    ]
  },
  {
    id: "hsk1-school-friend",
    title: "学校里的朋友",
    titlePinyin: "Xuéxiào lǐ de péngyou",
    titleTranslation: "Người bạn ở trường",
    summary: "Hai người bạn cùng học, ăn trưa và luyện nói tiếng Trung.",
    level: "HSK 1",
    topic: "Học tập",
    estimatedMinutes: 2,
    accent: "coral",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation:
              "Tiểu Minh là bạn cùng lớp của tôi, cũng là bạn tốt của tôi.",
            tokens: [
              word("s1-t1", "小明", "Xiǎo Míng", "Tiểu Minh"),
              word("s1-t2", "是", "shì", "là"),
              word("s1-t3", "我的", "wǒ de", "của tôi"),
              word("s1-t4", "同学", "tóngxué", "bạn cùng lớp"),
              punctuation("s1-t5", "，"),
              word("s1-t6", "也", "yě", "cũng"),
              word("s1-t7", "是", "shì", "là"),
              word("s1-t8", "我的", "wǒ de", "của tôi"),
              word("s1-t9", "好朋友", "hǎo péngyou", "bạn tốt"),
              punctuation("s1-t10", "。")
            ]
          },
          {
            id: "s2",
            translation:
              "Mỗi ngày chúng tôi cùng học và cũng cùng viết chữ Hán.",
            tokens: [
              word("s2-t1", "我们", "wǒmen", "chúng tôi"),
              word("s2-t2", "每天", "měitiān", "mỗi ngày"),
              word("s2-t3", "一起", "yìqǐ", "cùng nhau"),
              word("s2-t4", "上课", "shàngkè", "lên lớp, học"),
              punctuation("s2-t5", "，"),
              word("s2-t6", "也", "yě", "cũng"),
              word("s2-t7", "一起", "yìqǐ", "cùng nhau"),
              word("s2-t8", "写", "xiě", "viết"),
              word("s2-t9", "汉字", "hànzì", "chữ Hán"),
              punctuation("s2-t10", "。")
            ]
          }
        ]
      },
      {
        id: "p2",
        sentences: [
          {
            id: "s3",
            translation: "Buổi trưa, chúng tôi ăn cơm ở trường.",
            tokens: [
              word("s3-t1", "中午", "zhōngwǔ", "buổi trưa"),
              punctuation("s3-t2", "，"),
              word("s3-t3", "我们", "wǒmen", "chúng tôi"),
              word("s3-t4", "在", "zài", "ở, tại"),
              word("s3-t5", "学校", "xuéxiào", "trường học"),
              word("s3-t6", "吃饭", "chīfàn", "ăn cơm"),
              punctuation("s3-t7", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Sau giờ học, cậu ấy thường dạy tôi nói tiếng Trung.",
            tokens: [
              word("s4-t1", "下课", "xiàkè", "tan học"),
              word("s4-t2", "以后", "yǐhòu", "sau khi"),
              punctuation("s4-t3", "，"),
              word("s4-t4", "他", "tā", "cậu ấy"),
              word("s4-t5", "常常", "chángcháng", "thường xuyên"),
              word("s4-t6", "教", "jiāo", "dạy"),
              word("s4-t7", "我", "wǒ", "tôi"),
              word("s4-t8", "说", "shuō", "nói"),
              word("s4-t9", "汉语", "hànyǔ", "tiếng Trung"),
              punctuation("s4-t10", "。")
            ]
          }
        ]
      }
    ]
  }
] as const satisfies readonly BuiltInArticle[];

export const additionalHsk2Articles = [
  {
    id: "hsk2-library-visit",
    title: "去图书馆",
    titlePinyin: "Qù túshūguǎn",
    titleTranslation: "Đi thư viện",
    summary: "Một buổi chiều đi bộ đến thư viện, tìm từ điển và mượn sách.",
    level: "HSK 2",
    topic: "Học tập",
    estimatedMinutes: 3,
    accent: "jade",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation: "Chiều nay, tôi đến thư viện mượn sách.",
            tokens: [
              word("s1-t1", "今天下午", "jīntiān xiàwǔ", "chiều nay"),
              punctuation("s1-t2", "，"),
              word("s1-t3", "我", "wǒ", "tôi"),
              word("s1-t4", "去", "qù", "đi"),
              word("s1-t5", "图书馆", "túshūguǎn", "thư viện"),
              word("s1-t6", "借书", "jiè shū", "mượn sách"),
              punctuation("s1-t7", "。")
            ]
          },
          {
            id: "s2",
            translation:
              "Thư viện rất gần trường, đi bộ chỉ mất mười phút.",
            tokens: [
              word("s2-t1", "图书馆", "túshūguǎn", "thư viện"),
              word("s2-t2", "离", "lí", "cách"),
              word("s2-t3", "学校", "xuéxiào", "trường học"),
              word("s2-t4", "很近", "hěn jìn", "rất gần"),
              punctuation("s2-t5", "，"),
              word("s2-t6", "走路", "zǒulù", "đi bộ"),
              word("s2-t7", "只要", "zhǐ yào", "chỉ cần, chỉ mất"),
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
              "Tôi tìm từ điển tiếng Trung trước, sau đó ngồi xuống đọc sách.",
            tokens: [
              word("s3-t1", "我", "wǒ", "tôi"),
              word("s3-t2", "先", "xiān", "trước tiên"),
              word("s3-t3", "找", "zhǎo", "tìm"),
              word("s3-t4", "汉语词典", "hànyǔ cídiǎn", "từ điển tiếng Trung"),
              punctuation("s3-t5", "，"),
              word("s3-t6", "然后", "ránhòu", "sau đó"),
              word("s3-t7", "坐下来", "zuò xiàlái", "ngồi xuống"),
              word("s3-t8", "看书", "kàn shū", "đọc sách"),
              punctuation("s3-t9", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Trước năm giờ, tôi mượn hai cuốn sách rồi về nhà.",
            tokens: [
              word("s4-t1", "五点", "wǔ diǎn", "năm giờ"),
              word("s4-t2", "以前", "yǐqián", "trước"),
              punctuation("s4-t3", "，"),
              word("s4-t4", "我", "wǒ", "tôi"),
              word("s4-t5", "借了", "jiè le", "đã mượn"),
              word("s4-t6", "两本书", "liǎng běn shū", "hai cuốn sách"),
              punctuation("s4-t7", "，"),
              word("s4-t8", "然后", "ránhòu", "sau đó"),
              word("s4-t9", "回家", "huí jiā", "về nhà"),
              punctuation("s4-t10", "。")
            ]
          }
        ]
      }
    ]
  },
  {
    id: "hsk2-shopping-with-mom",
    title: "和妈妈去商店",
    titlePinyin: "Hé māma qù shāngdiàn",
    titleTranslation: "Đi cửa hàng cùng mẹ",
    summary: "Một buổi mua thực phẩm và đồ dùng đơn giản cùng mẹ.",
    level: "HSK 2",
    topic: "Đời sống",
    estimatedMinutes: 3,
    accent: "coral",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation:
              "Sáng thứ Bảy, tôi cùng mẹ đến cửa hàng mua đồ.",
            tokens: [
              word("s1-t1", "星期六", "xīngqīliù", "thứ Bảy"),
              word("s1-t2", "上午", "shàngwǔ", "buổi sáng"),
              punctuation("s1-t3", "，"),
              word("s1-t4", "我", "wǒ", "tôi"),
              word("s1-t5", "和", "hé", "với"),
              word("s1-t6", "妈妈", "māma", "mẹ"),
              word("s1-t7", "去", "qù", "đi"),
              word("s1-t8", "商店", "shāngdiàn", "cửa hàng"),
              word("s1-t9", "买东西", "mǎi dōngxi", "mua đồ"),
              punctuation("s1-t10", "。")
            ]
          },
          {
            id: "s2",
            translation:
              "Trong cửa hàng có rất nhiều người, trái cây cũng rất tươi.",
            tokens: [
              word("s2-t1", "商店里", "shāngdiàn lǐ", "trong cửa hàng"),
              word("s2-t2", "人", "rén", "người"),
              word("s2-t3", "很多", "hěn duō", "rất nhiều"),
              punctuation("s2-t4", "，"),
              word("s2-t5", "水果", "shuǐguǒ", "trái cây"),
              word("s2-t6", "也", "yě", "cũng"),
              word("s2-t7", "很新鲜", "hěn xīnxiān", "rất tươi"),
              punctuation("s2-t8", "。")
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
              "Mẹ mua táo và sữa, còn tôi mua một cây bút mới.",
            tokens: [
              word("s3-t1", "妈妈", "māma", "mẹ"),
              word("s3-t2", "买了", "mǎi le", "đã mua"),
              word("s3-t3", "苹果", "píngguǒ", "táo"),
              word("s3-t4", "和", "hé", "và"),
              word("s3-t5", "牛奶", "niúnǎi", "sữa bò"),
              punctuation("s3-t6", "，"),
              word("s3-t7", "我", "wǒ", "tôi"),
              word("s3-t8", "买了", "mǎi le", "đã mua"),
              word("s3-t9", "一支新笔", "yì zhī xīn bǐ", "một cây bút mới"),
              punctuation("s3-t10", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Sau khi về nhà, chúng tôi cùng nhau làm bữa tối.",
            tokens: [
              word("s4-t1", "回家", "huí jiā", "về nhà"),
              word("s4-t2", "以后", "yǐhòu", "sau khi"),
              punctuation("s4-t3", "，"),
              word("s4-t4", "我们", "wǒmen", "chúng tôi"),
              word("s4-t5", "一起", "yìqǐ", "cùng nhau"),
              word("s4-t6", "做晚饭", "zuò wǎnfàn", "làm bữa tối"),
              punctuation("s4-t7", "。")
            ]
          }
        ]
      }
    ]
  }
] as const satisfies readonly BuiltInArticle[];

export const additionalHsk3Articles = [
  {
    id: "hsk3-daily-progress",
    title: "每天进步一点",
    titlePinyin: "Měitiān jìnbù yìdiǎn",
    titleTranslation: "Mỗi ngày tiến bộ một chút",
    summary: "Một kế hoạch học đều đặn, ưu tiên hiểu ngữ cảnh trước khi dịch.",
    level: "HSK 3",
    topic: "Học tập",
    estimatedMinutes: 4,
    accent: "jade",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation:
              "Để nâng cao trình độ tiếng Trung, tôi lập cho mình một kế hoạch học tập đơn giản.",
            tokens: [
              word("s1-t1", "为了", "wèile", "để, nhằm"),
              word("s1-t2", "提高", "tígāo", "nâng cao"),
              word("s1-t3", "汉语水平", "hànyǔ shuǐpíng", "trình độ tiếng Trung"),
              punctuation("s1-t4", "，"),
              word("s1-t5", "我", "wǒ", "tôi"),
              word("s1-t6", "给", "gěi", "cho"),
              word("s1-t7", "自己", "zìjǐ", "bản thân"),
              word("s1-t8", "做了", "zuò le", "đã lập, đã làm"),
              word("s1-t9", "一个", "yí ge", "một"),
              word("s1-t10", "简单的", "jiǎndān de", "đơn giản"),
              word("s1-t11", "学习计划", "xuéxí jìhuà", "kế hoạch học tập"),
              punctuation("s1-t12", "。")
            ]
          },
          {
            id: "s2",
            translation:
              "Mỗi sáng, tôi ôn lại những từ đã học hôm qua trước, sau đó đọc một bài văn ngắn.",
            tokens: [
              word("s2-t1", "每天早上", "měitiān zǎoshang", "mỗi buổi sáng"),
              punctuation("s2-t2", "，"),
              word("s2-t3", "我", "wǒ", "tôi"),
              word("s2-t4", "先", "xiān", "trước tiên"),
              word("s2-t5", "复习", "fùxí", "ôn tập"),
              word("s2-t6", "昨天", "zuótiān", "hôm qua"),
              word("s2-t7", "学过的", "xuéguo de", "đã từng học"),
              word("s2-t8", "词语", "cíyǔ", "từ ngữ"),
              punctuation("s2-t9", "，"),
              word("s2-t10", "然后", "ránhòu", "sau đó"),
              word("s2-t11", "读", "dú", "đọc"),
              word("s2-t12", "一篇", "yì piān", "một bài"),
              word("s2-t13", "短文章", "duǎn wénzhāng", "bài văn ngắn"),
              punctuation("s2-t14", "。")
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
              "Khi gặp câu không hiểu, tôi không dịch ngay mà xem nội dung trước sau trước.",
            tokens: [
              word("s3-t1", "遇到", "yùdào", "gặp phải"),
              word("s3-t2", "不明白的句子", "bù míngbai de jùzi", "câu không hiểu"),
              word("s3-t3", "时", "shí", "khi"),
              punctuation("s3-t4", "，"),
              word("s3-t5", "我", "wǒ", "tôi"),
              word("s3-t6", "不会", "bú huì", "sẽ không"),
              word("s3-t7", "马上", "mǎshàng", "ngay lập tức"),
              word("s3-t8", "翻译", "fānyì", "dịch"),
              punctuation("s3-t9", "，"),
              word("s3-t10", "而是", "érshì", "mà là"),
              word("s3-t11", "先", "xiān", "trước tiên"),
              word("s3-t12", "看", "kàn", "xem, đọc"),
              word("s3-t13", "前后的内容", "qiánhòu de nèiróng", "nội dung trước và sau"),
              punctuation("s3-t14", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Tuy mỗi ngày chỉ học một ít, nhưng sau khi kiên trì một tháng, tôi nhận ra mình đã tiến bộ rất nhiều.",
            tokens: [
              word("s4-t1", "虽然", "suīrán", "tuy, mặc dù"),
              word("s4-t2", "每天", "měitiān", "mỗi ngày"),
              word("s4-t3", "只", "zhǐ", "chỉ"),
              word("s4-t4", "学", "xué", "học"),
              word("s4-t5", "一点", "yìdiǎn", "một chút"),
              punctuation("s4-t6", "，"),
              word("s4-t7", "但是", "dànshì", "nhưng"),
              word("s4-t8", "坚持", "jiānchí", "kiên trì"),
              word("s4-t9", "一个月", "yí ge yuè", "một tháng"),
              word("s4-t10", "以后", "yǐhòu", "sau khi"),
              punctuation("s4-t11", "，"),
              word("s4-t12", "我", "wǒ", "tôi"),
              word("s4-t13", "发现", "fāxiàn", "phát hiện, nhận ra"),
              word("s4-t14", "自己", "zìjǐ", "bản thân"),
              word("s4-t15", "进步了", "jìnbù le", "đã tiến bộ"),
              word("s4-t16", "很多", "hěn duō", "rất nhiều"),
              punctuation("s4-t17", "。")
            ]
          }
        ]
      }
    ]
  },
  {
    id: "hsk3-keep-a-promise",
    title: "答应朋友的事",
    titlePinyin: "Dāying péngyou de shì",
    titleTranslation: "Việc đã hứa với bạn",
    summary: "Một buổi giúp bạn chuyển nhà và câu chuyện về giữ lời hứa.",
    level: "HSK 3",
    topic: "Đời sống",
    estimatedMinutes: 4,
    accent: "amber",
    paragraphs: [
      {
        id: "p1",
        sentences: [
          {
            id: "s1",
            translation:
              "Hôm qua Tiểu Vương nhờ tôi giúp cậu ấy chuyển nhà, tôi lập tức đồng ý.",
            tokens: [
              word("s1-t1", "昨天", "zuótiān", "hôm qua"),
              word("s1-t2", "小王", "Xiǎo Wáng", "Tiểu Vương"),
              word("s1-t3", "请", "qǐng", "nhờ, mời"),
              word("s1-t4", "我", "wǒ", "tôi"),
              word("s1-t5", "帮他", "bāng tā", "giúp cậu ấy"),
              word("s1-t6", "搬家", "bān jiā", "chuyển nhà"),
              punctuation("s1-t7", "，"),
              word("s1-t8", "我", "wǒ", "tôi"),
              word("s1-t9", "马上", "mǎshàng", "ngay lập tức"),
              word("s1-t10", "答应了", "dāying le", "đã đồng ý"),
              punctuation("s1-t11", "。")
            ]
          },
          {
            id: "s2",
            translation:
              "Sáng nay tôi dậy muộn, suýt chút nữa quên mất việc này.",
            tokens: [
              word("s2-t1", "今天早上", "jīntiān zǎoshang", "sáng nay"),
              word("s2-t2", "我", "wǒ", "tôi"),
              word("s2-t3", "起晚了", "qǐ wǎn le", "đã dậy muộn"),
              punctuation("s2-t4", "，"),
              word("s2-t5", "差一点", "chà yìdiǎn", "suýt chút nữa"),
              word("s2-t6", "忘记", "wàngjì", "quên"),
              word("s2-t7", "这件事", "zhè jiàn shì", "việc này"),
              punctuation("s2-t8", "。")
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
              "Khi tôi đến nhà cậu ấy, cậu ấy đã bắt đầu sắp xếp hành lý rồi.",
            tokens: [
              word("s3-t1", "我", "wǒ", "tôi"),
              word("s3-t2", "到", "dào", "đến"),
              word("s3-t3", "他家", "tā jiā", "nhà cậu ấy"),
              word("s3-t4", "的时候", "de shíhou", "khi, lúc"),
              punctuation("s3-t5", "，"),
              word("s3-t6", "他", "tā", "cậu ấy"),
              word("s3-t7", "已经", "yǐjīng", "đã"),
              word("s3-t8", "开始", "kāishǐ", "bắt đầu"),
              word("s3-t9", "整理", "zhěnglǐ", "sắp xếp"),
              word("s3-t10", "行李", "xíngli", "hành lý"),
              word("s3-t11", "了", "le", "trợ từ hoàn thành"),
              punctuation("s3-t12", "。")
            ]
          },
          {
            id: "s4",
            translation:
              "Tuy chúng tôi bận cả buổi sáng, nhưng nhìn căn nhà mới sạch sẽ, ai cũng cảm thấy rất vui.",
            tokens: [
              word("s4-t1", "虽然", "suīrán", "tuy, mặc dù"),
              word("s4-t2", "我们", "wǒmen", "chúng tôi"),
              word("s4-t3", "忙了", "máng le", "đã bận rộn"),
              word("s4-t4", "一上午", "yí shàngwǔ", "cả buổi sáng"),
              punctuation("s4-t5", "，"),
              word("s4-t6", "但是", "dànshì", "nhưng"),
              word("s4-t7", "看到", "kàndào", "nhìn thấy"),
              word("s4-t8", "干净的", "gānjìng de", "sạch sẽ"),
              word("s4-t9", "新家", "xīn jiā", "nhà mới"),
              punctuation("s4-t10", "，"),
              word("s4-t11", "大家", "dàjiā", "mọi người"),
              word("s4-t12", "都", "dōu", "đều"),
              word("s4-t13", "觉得", "juéde", "cảm thấy"),
              word("s4-t14", "很高兴", "hěn gāoxìng", "rất vui"),
              punctuation("s4-t15", "。")
            ]
          }
        ]
      }
    ]
  }
] as const satisfies readonly BuiltInArticle[];

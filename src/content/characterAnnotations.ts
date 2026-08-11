import type { CharacterAnnotation } from "./types";

const character = (
  hanzi: string,
  pinyin: string,
  meaning: string
): CharacterAnnotation => ({ hanzi, pinyin, meaning });

const expandedCharacterAnnotations = {
  // HSK 1 expansion
  "我家": [
    character("我", "wǒ", "tôi"),
    character("家", "jiā", "nhà, gia đình")
  ],
  "四个人": [
    character("四", "sì", "bốn"),
    character("个", "ge", "lượng từ thông dụng"),
    character("人", "rén", "người")
  ],
  "爸爸": [
    character("爸", "bà", "bố"),
    character("爸", "ba", "bố; âm nhẹ trong 爸爸")
  ],
  "妈妈": [
    character("妈", "mā", "mẹ"),
    character("妈", "ma", "mẹ; âm nhẹ trong 妈妈")
  ],
  "工作": [
    character("工", "gōng", "công việc"),
    character("作", "zuò", "làm; trong 工作: làm việc")
  ],
  "哥哥": [
    character("哥", "gē", "anh trai"),
    character("哥", "ge", "anh trai; âm nhẹ trong 哥哥")
  ],
  "喜欢": [
    character("喜", "xǐ", "thích, vui"),
    character("欢", "huan", "vui; trong 喜欢: thích")
  ],
  "看书": [
    character("看", "kàn", "xem, đọc"),
    character("书", "shū", "sách")
  ],
  "学习": [
    character("学", "xué", "học"),
    character("习", "xí", "luyện tập")
  ],
  "晚上": [
    character("晚", "wǎn", "muộn, tối"),
    character("上", "shang", "trong 晚上: buổi tối")
  ],
  "说话": [
    character("说", "shuō", "nói"),
    character("话", "huà", "lời nói")
  ],
  "小明": [
    character("小", "xiǎo", "nhỏ; tiền tố tên thân mật"),
    character("明", "míng", "Minh; sáng, rõ")
  ],
  "我的": [
    character("我", "wǒ", "tôi"),
    character("的", "de", "trợ từ sở hữu")
  ],
  "同学": [
    character("同", "tóng", "cùng"),
    character("学", "xué", "học; trong 同学: bạn cùng lớp")
  ],
  "好朋友": [
    character("好", "hǎo", "tốt"),
    character("朋", "péng", "bạn"),
    character("友", "you", "bạn; trong 朋友")
  ],
  "每天": [
    character("每", "měi", "mỗi"),
    character("天", "tiān", "ngày")
  ],
  "上课": [
    character("上", "shàng", "lên, tham gia"),
    character("课", "kè", "tiết học")
  ],
  "汉字": [
    character("汉", "hàn", "Hán, Trung Quốc"),
    character("字", "zì", "chữ")
  ],
  "下课": [
    character("下", "xià", "kết thúc, xuống"),
    character("课", "kè", "tiết học")
  ],

  // HSK 2 expansion
  "今天下午": [
    character("今", "jīn", "nay"),
    character("天", "tiān", "ngày"),
    character("下", "xià", "sau, dưới"),
    character("午", "wǔ", "buổi trưa")
  ],
  "图书馆": [
    character("图", "tú", "hình, bản đồ"),
    character("书", "shū", "sách"),
    character("馆", "guǎn", "quán, tòa nhà công cộng")
  ],
  "借书": [
    character("借", "jiè", "mượn"),
    character("书", "shū", "sách")
  ],
  "很近": [
    character("很", "hěn", "rất"),
    character("近", "jìn", "gần")
  ],
  "走路": [
    character("走", "zǒu", "đi bộ"),
    character("路", "lù", "đường")
  ],
  "只要": [
    character("只", "zhǐ", "chỉ"),
    character("要", "yào", "cần; trong 只要: chỉ cần")
  ],
  "汉语词典": [
    character("汉", "hàn", "Hán, Trung Quốc"),
    character("语", "yǔ", "ngôn ngữ"),
    character("词", "cí", "từ"),
    character("典", "diǎn", "sách chuẩn; trong 词典: từ điển")
  ],
  "坐下来": [
    character("坐", "zuò", "ngồi"),
    character("下", "xià", "xuống"),
    character("来", "lái", "đến; bổ ngữ hướng")
  ],
  "五点": [
    character("五", "wǔ", "năm"),
    character("点", "diǎn", "giờ")
  ],
  "借了": [
    character("借", "jiè", "mượn"),
    character("了", "le", "trợ từ hoàn thành")
  ],
  "两本书": [
    character("两", "liǎng", "hai"),
    character("本", "běn", "lượng từ cho sách"),
    character("书", "shū", "sách")
  ],
  "星期六": [
    character("星", "xīng", "sao; trong 星期: tuần"),
    character("期", "qī", "kỳ; trong 星期: tuần"),
    character("六", "liù", "sáu; thứ Bảy")
  ],
  "上午": [
    character("上", "shàng", "trước, trên"),
    character("午", "wǔ", "buổi trưa")
  ],
  "商店": [
    character("商", "shāng", "buôn bán"),
    character("店", "diàn", "cửa hàng")
  ],
  "买东西": [
    character("买", "mǎi", "mua"),
    character("东", "dōng", "trong 东西: đồ vật"),
    character("西", "xi", "trong 东西: đồ vật")
  ],
  "商店里": [
    character("商", "shāng", "buôn bán"),
    character("店", "diàn", "cửa hàng"),
    character("里", "lǐ", "bên trong")
  ],
  "很多": [
    character("很", "hěn", "rất"),
    character("多", "duō", "nhiều")
  ],
  "水果": [
    character("水", "shuǐ", "nước"),
    character("果", "guǒ", "quả, trái cây")
  ],
  "很新鲜": [
    character("很", "hěn", "rất"),
    character("新", "xīn", "mới"),
    character("鲜", "xiān", "tươi")
  ],
  "买了": [
    character("买", "mǎi", "mua"),
    character("了", "le", "trợ từ hoàn thành")
  ],
  "苹果": [
    character("苹", "píng", "trong 苹果: táo"),
    character("果", "guǒ", "quả")
  ],
  "牛奶": [
    character("牛", "niú", "bò"),
    character("奶", "nǎi", "sữa")
  ],
  "一支新笔": [
    character("一", "yì", "một"),
    character("支", "zhī", "lượng từ cho bút"),
    character("新", "xīn", "mới"),
    character("笔", "bǐ", "bút")
  ],
  "做晚饭": [
    character("做", "zuò", "làm"),
    character("晚", "wǎn", "buổi tối"),
    character("饭", "fàn", "cơm, bữa ăn")
  ],

  // HSK 3 expansion
  "为了": [
    character("为", "wèi", "vì, để"),
    character("了", "le", "trong 为了: nhằm, để")
  ],
  "提高": [
    character("提", "tí", "nâng"),
    character("高", "gāo", "cao")
  ],
  "汉语水平": [
    character("汉", "hàn", "Hán, Trung Quốc"),
    character("语", "yǔ", "ngôn ngữ"),
    character("水", "shuǐ", "mức; trong 水平: trình độ"),
    character("平", "píng", "bằng, mức")
  ],
  "自己": [
    character("自", "zì", "tự, bản thân"),
    character("己", "jǐ", "bản thân")
  ],
  "做了": [
    character("做", "zuò", "làm"),
    character("了", "le", "trợ từ hoàn thành")
  ],
  "一个": [
    character("一", "yí", "một"),
    character("个", "ge", "lượng từ thông dụng")
  ],
  "简单的": [
    character("简", "jiǎn", "đơn giản"),
    character("单", "dān", "đơn, một"),
    character("的", "de", "trợ từ bổ nghĩa")
  ],
  "学习计划": [
    character("学", "xué", "học"),
    character("习", "xí", "luyện tập"),
    character("计", "jì", "tính, kế hoạch"),
    character("划", "huà", "vạch ra; trong 计划: kế hoạch")
  ],
  "每天早上": [
    character("每", "měi", "mỗi"),
    character("天", "tiān", "ngày"),
    character("早", "zǎo", "sớm"),
    character("上", "shang", "trong 早上: buổi sáng")
  ],
  "昨天": [
    character("昨", "zuó", "hôm qua"),
    character("天", "tiān", "ngày")
  ],
  "学过的": [
    character("学", "xué", "học"),
    character("过", "guo", "trợ từ trải nghiệm"),
    character("的", "de", "trợ từ bổ nghĩa")
  ],
  "词语": [
    character("词", "cí", "từ"),
    character("语", "yǔ", "ngôn ngữ; trong 词语: từ ngữ")
  ],
  "一篇": [
    character("一", "yì", "một"),
    character("篇", "piān", "lượng từ cho bài viết")
  ],
  "短文章": [
    character("短", "duǎn", "ngắn"),
    character("文", "wén", "văn, chữ viết"),
    character("章", "zhāng", "bài, chương")
  ],
  "不明白的句子": [
    character("不", "bù", "không"),
    character("明", "míng", "rõ"),
    character("白", "bai", "trong 明白: hiểu rõ"),
    character("的", "de", "trợ từ bổ nghĩa"),
    character("句", "jù", "câu"),
    character("子", "zi", "hậu tố danh từ")
  ],
  "不会": [
    character("不", "bú", "không"),
    character("会", "huì", "sẽ, biết")
  ],
  "马上": [
    character("马", "mǎ", "ngựa; trong 马上: ngay lập tức"),
    character("上", "shàng", "trên; trong 马上: ngay")
  ],
  "而是": [
    character("而", "ér", "mà"),
    character("是", "shì", "là")
  ],
  "一点": [
    character("一", "yì", "một"),
    character("点", "diǎn", "chút, điểm")
  ],
  "坚持": [
    character("坚", "jiān", "kiên định"),
    character("持", "chí", "giữ")
  ],
  "一个月": [
    character("一", "yí", "một"),
    character("个", "ge", "lượng từ thông dụng"),
    character("月", "yuè", "tháng")
  ],
  "进步了": [
    character("进", "jìn", "tiến lên"),
    character("步", "bù", "bước"),
    character("了", "le", "trợ từ hoàn thành")
  ],
  "小王": [
    character("小", "xiǎo", "nhỏ; tiền tố tên thân mật"),
    character("王", "wáng", "Vương; họ người")
  ],
  "帮他": [
    character("帮", "bāng", "giúp"),
    character("他", "tā", "cậu ấy")
  ],
  "搬家": [
    character("搬", "bān", "di chuyển, khuân"),
    character("家", "jiā", "nhà")
  ],
  "答应了": [
    character("答", "dā", "đáp; trong 答应: đồng ý"),
    character("应", "ying", "đáp ứng; âm nhẹ trong 答应"),
    character("了", "le", "trợ từ hoàn thành")
  ],
  "今天早上": [
    character("今", "jīn", "nay"),
    character("天", "tiān", "ngày"),
    character("早", "zǎo", "sớm"),
    character("上", "shang", "trong 早上: buổi sáng")
  ],
  "起晚了": [
    character("起", "qǐ", "dậy"),
    character("晚", "wǎn", "muộn"),
    character("了", "le", "trợ từ hoàn thành")
  ],
  "差一点": [
    character("差", "chà", "thiếu, suýt"),
    character("一", "yì", "một"),
    character("点", "diǎn", "chút")
  ],
  "忘记": [
    character("忘", "wàng", "quên"),
    character("记", "jì", "ghi nhớ")
  ],
  "这件事": [
    character("这", "zhè", "này"),
    character("件", "jiàn", "lượng từ cho sự việc"),
    character("事", "shì", "việc")
  ],
  "他家": [
    character("他", "tā", "cậu ấy"),
    character("家", "jiā", "nhà")
  ],
  "已经": [
    character("已", "yǐ", "đã"),
    character("经", "jīng", "qua; trong 已经: đã")
  ],
  "开始": [
    character("开", "kāi", "mở, bắt đầu"),
    character("始", "shǐ", "bắt đầu")
  ],
  "整理": [
    character("整", "zhěng", "chỉnh, sắp xếp"),
    character("理", "lǐ", "sắp xếp, xử lý")
  ],
  "行李": [
    character("行", "xíng", "đi, di chuyển"),
    character("李", "li", "trong 行李: hành lý")
  ],
  "忙了": [
    character("忙", "máng", "bận"),
    character("了", "le", "trợ từ hoàn thành")
  ],
  "一上午": [
    character("一", "yí", "một, cả một"),
    character("上", "shàng", "trước, trên"),
    character("午", "wǔ", "buổi trưa")
  ],
  "看到": [
    character("看", "kàn", "nhìn"),
    character("到", "dào", "đến; bổ ngữ kết quả")
  ],
  "干净的": [
    character("干", "gān", "khô, sạch"),
    character("净", "jìng", "sạch"),
    character("的", "de", "trợ từ bổ nghĩa")
  ],
  "新家": [
    character("新", "xīn", "mới"),
    character("家", "jiā", "nhà")
  ],
  "大家": [
    character("大", "dà", "lớn; trong 大家: mọi người"),
    character("家", "jiā", "nhà, người; trong 大家")
  ],
  "觉得": [
    character("觉", "jué", "cảm nhận"),
    character("得", "de", "trong 觉得: cảm thấy")
  ],
  "很高兴": [
    character("很", "hěn", "rất"),
    character("高", "gāo", "cao; trong 高兴: vui"),
    character("兴", "xìng", "hứng, tâm trạng")
  ]
} as const satisfies Record<string, readonly CharacterAnnotation[]>;

/**
 * Contextual character readings for every multi-character token in the pilot
 * library. These are authored data, not runtime transliteration or dictionary
 * guesses. Single-character tokens already carry the same information on the
 * word itself and are normalized by getAuthoredCharacters.
 */
const multiCharacterAnnotations = {
  ...expandedCharacterAnnotations,
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

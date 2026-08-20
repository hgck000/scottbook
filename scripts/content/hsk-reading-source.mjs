const sentence = (zh, vi) => ({ zh, vi });

const section = (title, titleTranslation, sentences) => ({
  title,
  titleTranslation,
  sentences
});

const article = (id, title, titleTranslation, summary, level, topic, sections) => ({
  id,
  title,
  titleTranslation,
  summary,
  level,
  topic,
  sections
});

export const hskReadingSource = [
  article(
    "hsk1-my-morning",
    "我的早上",
    "Buổi sáng của tôi",
    "Từ lúc thức dậy đến khi vào lớp, một buổi sáng bình thường cũng có nhiều việc nhỏ.",
    "HSK 1",
    "Đời sống",
    [
      section("在家", "Ở nhà", [
        sentence("早上 六点 ， 我 起床 。", "Sáu giờ sáng, tôi thức dậy."),
        sentence("我 先 喝 水 ， 再 吃 早饭 。", "Tôi uống nước trước, rồi ăn sáng."),
        sentence("妈妈 问 我 ： 今天 有 汉语课 吗 ？", "Mẹ hỏi tôi: Hôm nay có tiết tiếng Trung không?"),
        sentence("我 说 ： 有 ， 我 很 喜欢 汉语课 。", "Tôi nói: Có, con rất thích tiết tiếng Trung."),
        sentence("七点 ， 我 和 妈妈 一起 出门 。", "Bảy giờ, tôi cùng mẹ ra khỏi nhà.")
      ]),
      section("到学校", "Đến trường", [
        sentence("学校 离 我家 不 远 。", "Trường học không xa nhà tôi."),
        sentence("我 坐 车 十分钟 就 到 了 。", "Tôi đi xe mười phút là đến."),
        sentence("朋友 小明 已经 在 教室 里 。", "Bạn Tiểu Minh đã ở trong lớp."),
        sentence("我们 一起 看书 ， 也 一起 写 汉字 。", "Chúng tôi cùng đọc sách và cùng viết chữ Hán."),
        sentence("老师 来 了 ， 新的 一天 开始 了 。", "Giáo viên đến, một ngày mới bắt đầu.")
      ])
    ]
  ),
  article(
    "hsk1-my-family",
    "我的家",
    "Gia đình tôi",
    "Một ngày cuối tuần của gia đình bốn người, từ bữa sáng đến buổi tối.",
    "HSK 1",
    "Đời sống",
    [
      section("家里的人", "Mọi người trong nhà", [
        sentence("我家 有 四个人 ： 爸爸 、 妈妈 、 哥哥 和 我 。", "Nhà tôi có bốn người: bố, mẹ, anh trai và tôi."),
        sentence("爸爸 在 医院 工作 ， 妈妈 是 老师 。", "Bố làm việc ở bệnh viện, mẹ là giáo viên."),
        sentence("哥哥 喜欢 看书 ， 我 喜欢 学 汉语 。", "Anh trai thích đọc sách, tôi thích học tiếng Trung."),
        sentence("星期六 ， 我们 都 不 上班 ， 也 不 上课 。", "Thứ Bảy, cả nhà đều không đi làm hay đi học."),
        sentence("早上 ， 爸爸 给 我们 做 早饭 。", "Buổi sáng, bố làm bữa sáng cho cả nhà.")
      ]),
      section("一起过周末", "Cùng nhau đón cuối tuần", [
        sentence("吃完饭 ， 妈妈 和 我 去 买 菜 。", "Ăn xong, mẹ và tôi đi mua thức ăn."),
        sentence("哥哥 在 家 看书 ， 也 听 音乐 。", "Anh ở nhà đọc sách và nghe nhạc."),
        sentence("下午 ， 我们 一起 去 公园 走走 。", "Buổi chiều, cả nhà cùng đi dạo ở công viên."),
        sentence("晚上 ， 我们 一边 吃饭 ， 一边 说话 。", "Buổi tối, chúng tôi vừa ăn vừa trò chuyện."),
        sentence("我 觉得 和 家人 在一起 很 高兴 。", "Tôi cảm thấy ở bên gia đình rất vui.")
      ])
    ]
  ),
  article(
    "hsk1-school-friend",
    "学校里的朋友",
    "Người bạn ở trường",
    "Hai người bạn mới làm quen, cùng học rồi giúp nhau tìm một quyển sách.",
    "HSK 1",
    "Học tập",
    [
      section("新同学", "Bạn học mới", [
        sentence("小明 是 我的 新 同学 。", "Tiểu Minh là bạn học mới của tôi."),
        sentence("他 坐 在 我 的 左边 。", "Cậu ấy ngồi bên trái tôi."),
        sentence("第一天 ， 他 问 我 叫 什么 名字 。", "Ngày đầu tiên, cậu ấy hỏi tôi tên gì."),
        sentence("我 也 问 他 从 哪儿 来 。", "Tôi cũng hỏi cậu ấy đến từ đâu."),
        sentence("我们 都 喜欢 汉语 ， 很快 就 成了 朋友 。", "Chúng tôi đều thích tiếng Trung nên nhanh chóng thành bạn.")
      ]),
      section("一本书", "Một quyển sách", [
        sentence("中午 ， 我 发现 我的 书 不 在 书包 里 。", "Buổi trưa, tôi phát hiện sách không ở trong cặp."),
        sentence("小明 和 我 一起 回 教室 找 。", "Tiểu Minh cùng tôi quay lại lớp tìm."),
        sentence("书 在 老师 的 桌子 上 。", "Quyển sách ở trên bàn giáo viên."),
        sentence("我 对 小明 说 ： 谢谢 你 。", "Tôi nói với Tiểu Minh: Cảm ơn bạn."),
        sentence("他 笑着 说 ： 朋友 不用 客气 。", "Cậu ấy cười nói: Bạn bè không cần khách sáo.")
      ])
    ]
  ),
  article(
    "hsk1-new-work-clothes",
    "妈妈的新工作服",
    "Bộ đồ đi làm mới của mẹ",
    "Mẹ cần một bộ đồ mới để đi làm và cả nhà cùng giúp chọn.",
    "HSK 1",
    "May mặc",
    [
      section("去买衣服", "Đi mua quần áo", [
        sentence("妈妈 明天 要 去 新 公司 工作 。", "Ngày mai mẹ sẽ đến công ty mới làm việc."),
        sentence("她 想 买 一件 新 衣服 。", "Mẹ muốn mua một bộ quần áo mới."),
        sentence("下午 ， 我 和 妈妈 去 商店 。", "Buổi chiều, tôi và mẹ đến cửa hàng."),
        sentence("商店 里 有 白 衣服 ， 也 有 蓝 衣服 。", "Trong cửa hàng có đồ màu trắng và cả đồ màu xanh."),
        sentence("妈妈 问 我 ： 什么 颜色 好看 ？", "Mẹ hỏi tôi: Màu nào đẹp?")
      ]),
      section("选好了", "Đã chọn xong", [
        sentence("我 觉得 蓝色 很 好看 。", "Tôi thấy màu xanh rất đẹp."),
        sentence("妈妈 试穿 了 蓝色 的 衣服 ， 大小 也 正好 。", "Mẹ mặc thử bộ màu xanh, kích cỡ cũng vừa."),
        sentence("这件 衣服 不 太 贵 。", "Bộ quần áo này không quá đắt."),
        sentence("妈妈 买了 它 ， 还 买了 一双 黑 鞋 。", "Mẹ mua nó và còn mua một đôi giày đen."),
        sentence("回家 后 ， 爸爸 也 说 很 好看 。", "Về nhà, bố cũng nói trông rất đẹp.")
      ])
    ]
  ),
  article(
    "hsk1-first-office-day",
    "第一次去办公室",
    "Lần đầu đến văn phòng",
    "Một sinh viên đến văn phòng làm việc lần đầu và được đồng nghiệp giúp đỡ.",
    "HSK 1",
    "Công sở",
    [
      section("早一点到", "Đến sớm một chút", [
        sentence("今天 是 我 第一天 去 办公室 工作 。", "Hôm nay là ngày đầu tiên tôi đến văn phòng làm việc."),
        sentence("我 七点 起床 ， 穿 好 衣服 。", "Tôi thức dậy lúc bảy giờ và mặc quần áo chỉnh tề."),
        sentence("八点半 ， 我 到 了 公司 。", "Tám rưỡi, tôi đến công ty."),
        sentence("办公室 里 已经 有 三个人 。", "Trong văn phòng đã có ba người."),
        sentence("王先生 告诉 我 ： 这 是 你的 桌子 。", "Anh Vương nói với tôi: Đây là bàn của bạn.")
      ]),
      section("认识大家", "Làm quen mọi người", [
        sentence("我的 电脑 在 桌子 上 。", "Máy tính của tôi ở trên bàn."),
        sentence("左边 的 人 叫 李月 。", "Người bên trái tên là Lý Nguyệt."),
        sentence("她 给 我 一杯 水 。", "Cô ấy đưa tôi một cốc nước."),
        sentence("中午 ， 大家 一起 吃饭 。", "Buổi trưa, mọi người cùng ăn cơm."),
        sentence("我 有点 累 ， 但是 很 高兴 。", "Tôi hơi mệt nhưng rất vui.")
      ])
    ]
  ),
  article(
    "hsk1-clothes-colors",
    "衣服店里的颜色",
    "Màu sắc trong cửa hàng quần áo",
    "Một cửa hàng nhỏ sắp xếp quần áo theo màu để khách dễ tìm.",
    "HSK 1",
    "Thời trang",
    [
      section("早上的商店", "Cửa hàng buổi sáng", [
        sentence("姐姐 在 一家 衣服店 工作 。", "Chị tôi làm việc ở một cửa hàng quần áo."),
        sentence("商店 不 大 ， 但是 很 漂亮 。", "Cửa hàng không lớn nhưng rất đẹp."),
        sentence("早上 ， 她 把 衣服 放 好 。", "Buổi sáng, chị sắp xếp quần áo gọn gàng."),
        sentence("白色 的 放 在 左边 ， 黑色 的 放 在 右边 。", "Đồ màu trắng đặt bên trái, đồ màu đen đặt bên phải."),
        sentence("红色 和 蓝色 的 衣服 放 在 中间 。", "Quần áo đỏ và xanh đặt ở giữa.")
      ]),
      section("一位客人", "Một vị khách", [
        sentence("十点 ， 一位 女 客人 来 了 。", "Mười giờ, một vị khách nữ đến."),
        sentence("她 想 看 一件 红色 的 衣服 。", "Cô ấy muốn xem một bộ quần áo màu đỏ."),
        sentence("姐姐 请 她 试穿 一下 。", "Chị mời cô ấy mặc thử."),
        sentence("客人 觉得 颜色 好看 ， 大小 也 可以 。", "Khách thấy màu đẹp, kích cỡ cũng ổn."),
        sentence("她 买下 衣服 ， 高兴 地 走 了 。", "Cô ấy mua bộ đồ rồi vui vẻ rời đi.")
      ])
    ]
  ),
  article(
    "hsk1-rainy-day",
    "下雨的一天",
    "Một ngày mưa",
    "Cơn mưa làm thay đổi kế hoạch nhưng lại tạo nên một buổi chiều ấm áp.",
    "HSK 1",
    "Kế hoạch",
    [
      section("不能去公园", "Không thể đi công viên", [
        sentence("今天 下午 ， 我 想 和 朋友 去 公园 。", "Chiều nay, tôi muốn đi công viên cùng bạn."),
        sentence("我们 刚 要 出门 ， 天 就 下雨 了 。", "Chúng tôi vừa định ra ngoài thì trời mưa."),
        sentence("雨 很 大 ， 路上 的 人 不 多 。", "Mưa rất lớn, trên đường không có nhiều người."),
        sentence("朋友 问 ： 我们 现在 做 什么 ？", "Bạn hỏi: Bây giờ chúng ta làm gì?"),
        sentence("我 说 ： 先 在 我家 等 一会儿 吧 。", "Tôi nói: Trước tiên hãy đợi ở nhà tôi một lúc.")
      ]),
      section("在家也很好", "Ở nhà cũng rất vui", [
        sentence("妈妈 给 我们 做了 热 茶 。", "Mẹ pha trà nóng cho chúng tôi."),
        sentence("我们 一边 喝茶 ， 一边 看 汉语书 。", "Chúng tôi vừa uống trà vừa xem sách tiếng Trung."),
        sentence("朋友 教 我 一个 新 汉字 。", "Bạn dạy tôi một chữ Hán mới."),
        sentence("五点 ， 雨 小 了 。", "Năm giờ, mưa nhỏ lại."),
        sentence("我们 没 去 公园 ， 但是 下午 也 很 好 。", "Chúng tôi không đi công viên nhưng buổi chiều vẫn rất vui.")
      ])
    ]
  ),
  article(
    "hsk1-birthday-noodles",
    "生日的面条",
    "Mì sinh nhật",
    "Cả nhà chuẩn bị một bữa tối đơn giản cho sinh nhật của ông.",
    "HSK 1",
    "Đời sống",
    [
      section("准备晚饭", "Chuẩn bị bữa tối", [
        sentence("今天 是 爷爷 的 生日 。", "Hôm nay là sinh nhật của ông."),
        sentence("下午 ， 我 和 爸爸 去 买 东西 。", "Buổi chiều, tôi và bố đi mua đồ."),
        sentence("我们 买了 鸡蛋 、 菜 和 一些 水果 。", "Chúng tôi mua trứng, rau và một ít hoa quả."),
        sentence("妈妈 在 家 做 面条 。", "Mẹ ở nhà nấu mì."),
        sentence("我 把 水果 放 在 桌子 上 。", "Tôi đặt hoa quả lên bàn.")
      ]),
      section("生日快乐", "Chúc mừng sinh nhật", [
        sentence("晚上 七点 ， 爷爷 来 了 。", "Bảy giờ tối, ông đến."),
        sentence("我们 一起 说 ： 生日 快乐 ！", "Chúng tôi cùng nói: Chúc mừng sinh nhật!"),
        sentence("爷爷 吃了 一大碗 面条 。", "Ông ăn một bát mì lớn."),
        sentence("他 说 妈妈 做 的 面条 很 好吃 。", "Ông nói mì mẹ nấu rất ngon."),
        sentence("吃完饭 ， 我们 一起 照了 一张 相 。", "Ăn xong, cả nhà cùng chụp một tấm ảnh.")
      ])
    ]
  ),
  article(
    "hsk1-library-afternoon",
    "图书馆的下午",
    "Buổi chiều ở thư viện",
    "Hai người bạn tìm một quyển sách tiếng Trung và cùng đọc đến giờ đóng cửa.",
    "HSK 1",
    "Học tập",
    [
      section("找一本书", "Tìm một quyển sách", [
        sentence("下午 没有 课 ， 我 和 小明 去 图书馆 。", "Buổi chiều không có tiết, tôi và Tiểu Minh đến thư viện."),
        sentence("图书馆 在 学校 的 后面 。", "Thư viện ở phía sau trường."),
        sentence("我 想 找 一本 简单 的 汉语书 。", "Tôi muốn tìm một quyển sách tiếng Trung đơn giản."),
        sentence("小明 看见 它 在 很 高 的 书架 上 。", "Tiểu Minh nhìn thấy nó trên giá sách cao."),
        sentence("他 帮 我 把 书 拿下来 。", "Cậu ấy giúp tôi lấy sách xuống.")
      ]),
      section("一起读", "Cùng nhau đọc", [
        sentence("我们 坐 在 窗户 旁边 。", "Chúng tôi ngồi cạnh cửa sổ."),
        sentence("书 里 有 很多 小 故事 。", "Trong sách có nhiều câu chuyện nhỏ."),
        sentence("我 读 第一页 ， 小明 读 第二页 。", "Tôi đọc trang đầu, Tiểu Minh đọc trang thứ hai."),
        sentence("有 一个 字 我 不 认识 ， 他 告诉 了 我 。", "Có một chữ tôi không biết, cậu ấy đã chỉ cho tôi."),
        sentence("五点 ， 我们 借了 书 回家 。", "Năm giờ, chúng tôi mượn sách rồi về nhà.")
      ])
    ]
  ),

  article(
    "hsk2-weekend-plan",
    "周末的计划",
    "Kế hoạch cuối tuần",
    "Hai người bạn đổi kế hoạch vì thời tiết rồi tìm được một nơi thích hợp để học.",
    "HSK 2",
    "Kế hoạch",
    [
      section("原来的计划", "Kế hoạch ban đầu", [
        sentence("这个 周末 天气 不错 ， 我 想 和 朋友 去 公园 。", "Cuối tuần này thời tiết khá đẹp, tôi muốn đi công viên cùng bạn."),
        sentence("我们 计划 早上 九点 在 地铁站 见面 。", "Chúng tôi định gặp nhau lúc chín giờ ở ga tàu điện."),
        sentence("朋友 会 带 水果 ， 我 会 带 面包 和 水 。", "Bạn sẽ mang hoa quả, tôi sẽ mang bánh mì và nước."),
        sentence("中午 ， 我们 可以 在 湖边 吃饭 。", "Buổi trưa, chúng tôi có thể ăn cạnh hồ."),
        sentence("下午 回家 以后 ， 我 还 要 复习 汉语 。", "Buổi chiều sau khi về nhà, tôi còn phải ôn tiếng Trung.")
      ]),
      section("计划变了", "Kế hoạch thay đổi", [
        sentence("星期六 早上 ， 天 突然 阴 了 。", "Sáng thứ Bảy, trời đột nhiên âm u."),
        sentence("朋友 打电话 说 可能 会 下雨 。", "Bạn gọi điện nói có thể trời sẽ mưa."),
        sentence("我们 决定 不 去 公园 ， 改 去 图书馆 。", "Chúng tôi quyết định không đi công viên mà chuyển sang thư viện."),
        sentence("图书馆 旁边 有 一家 小 饭店 。", "Bên cạnh thư viện có một quán ăn nhỏ."),
        sentence("我们 看了 书 ， 吃了 饭 ， 新的 计划 也 很 好 。", "Chúng tôi đọc sách, ăn cơm; kế hoạch mới cũng rất vui.")
      ])
    ]
  ),
  article(
    "hsk2-library-visit",
    "去图书馆",
    "Đi thư viện",
    "Một buổi chiều tìm tài liệu, hỏi người quản lý rồi mang sách về học tiếp.",
    "HSK 2",
    "Học tập",
    [
      section("找词典", "Tìm từ điển", [
        sentence("今天 下午 ， 我 去 图书馆 借 汉语书 。", "Chiều nay, tôi đến thư viện mượn sách tiếng Trung."),
        sentence("图书馆 离 学校 很 近 ， 走路 只要 十分钟 。", "Thư viện rất gần trường, đi bộ chỉ mất mười phút."),
        sentence("我 先 去 二楼 找 一本 汉语词典 。", "Trước tiên tôi lên tầng hai tìm một quyển từ điển tiếng Trung."),
        sentence("书架 上 的 词典 太 多 ， 我 不 知道 选 哪本 。", "Trên giá có quá nhiều từ điển, tôi không biết chọn cuốn nào."),
        sentence("一位 工作人员 走过来 帮助 了 我 。", "Một nhân viên bước đến giúp tôi.")
      ]),
      section("安静地读", "Yên lặng đọc sách", [
        sentence("她 告诉 我 ， 蓝色 的 那本 比较 简单 。", "Cô ấy bảo quyển màu xanh tương đối đơn giản."),
        sentence("我 拿着 词典 坐 到 窗边 。", "Tôi cầm từ điển ngồi cạnh cửa sổ."),
        sentence("遇到 不 懂 的 词 ， 我 就 查 一下 。", "Gặp từ không hiểu, tôi liền tra thử."),
        sentence("四点半 ， 我 已经 看完 两个 小 故事 。", "Bốn rưỡi, tôi đã đọc xong hai câu chuyện nhỏ."),
        sentence("离开 前 ， 我 借了 词典 和 一本 故事书 。", "Trước khi rời đi, tôi mượn từ điển và một cuốn truyện.")
      ])
    ]
  ),
  article(
    "hsk2-shopping-with-mom",
    "和妈妈选外套",
    "Chọn áo khoác cùng mẹ",
    "Hai mẹ con so sánh màu sắc, kích cỡ và giá của một chiếc áo khoác.",
    "HSK 2",
    "Thời trang",
    [
      section("两件外套", "Hai chiếc áo khoác", [
        sentence("天气 越来越 冷 ， 妈妈 想 买 一件 外套 。", "Thời tiết ngày càng lạnh, mẹ muốn mua một chiếc áo khoác."),
        sentence("星期六 上午 ， 我 陪 她 去 商场 。", "Sáng thứ Bảy, tôi cùng mẹ đến trung tâm mua sắm."),
        sentence("第一件 外套 是 黑色 的 ， 看起来 很 正式 。", "Chiếc áo đầu tiên màu đen, trông rất trang trọng."),
        sentence("第二件 是 米色 的 ， 穿起来 更 舒服 。", "Chiếc thứ hai màu be, mặc thoải mái hơn."),
        sentence("妈妈 觉得 两件 都 不错 ， 所以 问 我 的 意见 。", "Mẹ thấy cả hai đều ổn nên hỏi ý kiến tôi.")
      ]),
      section("适合工作的衣服", "Trang phục hợp để đi làm", [
        sentence("我 说 黑色 外套 更 适合 她 的 工作 。", "Tôi nói áo đen hợp với công việc của mẹ hơn."),
        sentence("妈妈 穿上 以后 ， 发现 袖子 有点 长 。", "Mẹ mặc vào rồi phát hiện tay áo hơi dài."),
        sentence("店员 帮 她 换了 小 一号 的 。", "Nhân viên đổi cho mẹ một chiếc nhỏ hơn một cỡ."),
        sentence("换了 以后 ， 大小 正好 ， 价格 也 可以 。", "Đổi xong, kích cỡ vừa vặn và giá cũng ổn."),
        sentence("妈妈 买下 外套 ， 说明天 就 穿 它 上班 。", "Mẹ mua chiếc áo và nói ngày mai sẽ mặc nó đi làm.")
      ])
    ]
  ),
  article(
    "hsk2-office-printer",
    "办公室里的打印机",
    "Chiếc máy in trong văn phòng",
    "Một nhân viên mới học cách xử lý công việc khi máy in không hoạt động.",
    "HSK 2",
    "Công sở",
    [
      section("机器不工作", "Máy không hoạt động", [
        sentence("上午 ， 经理 让我 打印 十张 表 。", "Buổi sáng, quản lý bảo tôi in mười tờ biểu mẫu."),
        sentence("我 把 文件 打开 ， 但是 打印机 没有 反应 。", "Tôi mở tài liệu nhưng máy in không phản hồi."),
        sentence("我 先 看看 电源 ， 又 看看 纸 ， 都 没有 问题 。", "Tôi kiểm tra nguồn điện rồi kiểm tra giấy, đều không có vấn đề."),
        sentence("同事 小李 说 ， 可能 是 电脑 没有 连好 。", "Đồng nghiệp Tiểu Lý nói có thể máy tính chưa kết nối đúng."),
        sentence("他 坐下来 ， 帮 我 重新 选择 打印机 。", "Anh ấy ngồi xuống giúp tôi chọn lại máy in.")
      ]),
      section("按时完成", "Hoàn thành đúng giờ", [
        sentence("这次 机器 开始 工作 了 。", "Lần này máy bắt đầu hoạt động."),
        sentence("可是 第一张 表 的 字 太 小 。", "Nhưng chữ trên tờ đầu tiên quá nhỏ."),
        sentence("我 把 字 改大 ， 再 打印 一张 。", "Tôi phóng chữ lớn hơn rồi in lại một tờ."),
        sentence("经理 看了 以后 说 很 清楚 。", "Quản lý xem xong nói rất rõ ràng."),
        sentence("我 按时 完成 工作 ， 也 学会了 一个 新 办法 。", "Tôi hoàn thành đúng giờ và học được một cách mới.")
      ])
    ]
  ),
  article(
    "hsk2-shirt-size",
    "一件不合适的衬衫",
    "Một chiếc sơ mi không vừa",
    "Một khách hàng đổi chiếc sơ mi đã mua và tìm được kích cỡ phù hợp.",
    "HSK 2",
    "May mặc",
    [
      section("回到商店", "Quay lại cửa hàng", [
        sentence("昨天 ， 我 买了 一件 白 衬衫 。", "Hôm qua, tôi mua một chiếc sơ mi trắng."),
        sentence("回家 穿了 一下 ， 我 发现 它 太 大 。", "Về nhà mặc thử, tôi phát hiện nó quá rộng."),
        sentence("今天 下班 后 ， 我 带着 衬衫 回到 商店 。", "Hôm nay sau giờ làm, tôi mang áo quay lại cửa hàng."),
        sentence("店员 问 我 是 颜色 不好 ， 还是 大小 不对 。", "Nhân viên hỏi màu không đẹp hay kích cỡ không đúng."),
        sentence("我 告诉 她 ， 颜色 很 好 ， 只是 太 大 。", "Tôi nói màu rất đẹp, chỉ là quá rộng.")
      ]),
      section("换小一号", "Đổi nhỏ hơn một cỡ", [
        sentence("她 给 我 找了 小 一号 的 衬衫 。", "Cô ấy tìm cho tôi chiếc sơ mi nhỏ hơn một cỡ."),
        sentence("我 在 试衣间 里 试穿 。", "Tôi mặc thử trong phòng thử đồ."),
        sentence("肩膀 和 袖子 都 很 合适 。", "Vai và tay áo đều rất vừa."),
        sentence("新的 衬衫 和 原来 的 价格 一样 。", "Chiếc áo mới có giá giống chiếc ban đầu."),
        sentence("我 不用 多 付 钱 ， 很快 就 换好 了 。", "Tôi không cần trả thêm tiền và đổi xong rất nhanh.")
      ])
    ]
  ),
  article(
    "hsk2-small-design-meeting",
    "一次小小的设计会",
    "Một cuộc họp thiết kế nhỏ",
    "Nhóm ba người chọn màu và chữ cho tấm áp phích của lớp.",
    "HSK 2",
    "Thiết kế",
    [
      section("三个想法", "Ba ý tưởng", [
        sentence("我们的 班 下个月 要 有 一个 活动 。", "Lớp chúng tôi tháng sau sẽ có một hoạt động."),
        sentence("老师 让 我们 三个人 设计 一张 海报 。", "Giáo viên giao ba người chúng tôi thiết kế một tấm áp phích."),
        sentence("小王 喜欢 红色 ， 因为 看起来 很 热闹 。", "Tiểu Vương thích màu đỏ vì trông rất náo nhiệt."),
        sentence("小林 喜欢 蓝色 ， 觉得 比较 安静 。", "Tiểu Lâm thích màu xanh vì thấy khá yên tĩnh."),
        sentence("我 想 用 黄色 ， 让 大家 容易 看见 。", "Tôi muốn dùng màu vàng để mọi người dễ nhìn thấy.")
      ]),
      section("一起完成", "Cùng nhau hoàn thành", [
        sentence("我们 把 三种 颜色 放 在 一起 看 。", "Chúng tôi đặt ba màu cạnh nhau để xem."),
        sentence("最后 ， 我们 选择 蓝色 做 背景 的 颜色 。", "Cuối cùng, chúng tôi chọn màu xanh làm màu nền."),
        sentence("重要 的 字 用 黄色 ， 时间 用 红色 。", "Chữ quan trọng dùng màu vàng, thời gian dùng màu đỏ."),
        sentence("小林 在 电脑 上 做 ， 我和 小王 检查 。", "Tiểu Lâm làm trên máy tính, tôi và Tiểu Vương kiểm tra."),
        sentence("一个 小时 后 ， 海报 终于 完成 了 。", "Một giờ sau, tấm áp phích cuối cùng cũng hoàn thành.")
      ])
    ]
  ),
  article(
    "hsk2-lost-umbrella",
    "找不到的雨伞",
    "Chiếc ô không tìm thấy",
    "Một chiếc ô tưởng đã mất được tìm lại nhờ nhớ đúng những nơi đã đi qua.",
    "HSK 2",
    "Đời sống",
    [
      section("雨伞在哪儿", "Chiếc ô ở đâu", [
        sentence("早上 出门 时 ， 外面 正在 下雨 。", "Khi ra ngoài buổi sáng, bên ngoài đang mưa."),
        sentence("我 带了 一把 蓝 雨伞 去 上课 。", "Tôi mang một chiếc ô xanh đi học."),
        sentence("下午 下课 后 ， 我 发现 雨伞 不见了 。", "Chiều tan học, tôi phát hiện ô đã biến mất."),
        sentence("我 先 回 教室 找 ， 但是 桌子 旁边 没有 。", "Tôi quay lại lớp tìm trước nhưng cạnh bàn không có."),
        sentence("同学 提醒 我 ， 中午 我们 去过 食堂 。", "Bạn học nhắc tôi rằng buổi trưa chúng tôi đã đến nhà ăn.")
      ]),
      section("原来在这里", "Hóa ra ở đây", [
        sentence("我们 一起 走到 食堂 门口 。", "Chúng tôi cùng đi đến cửa nhà ăn."),
        sentence("那里 有 很多 黑色 的 雨伞 。", "Ở đó có rất nhiều ô màu đen."),
        sentence("我的 蓝 雨伞 在 最 里面 。", "Chiếc ô xanh của tôi ở tận phía trong."),
        sentence("我 想起来 ， 吃饭 时 我 把 它 放 在 那儿 了 。", "Tôi nhớ ra rằng lúc ăn đã để nó ở đó."),
        sentence("我 谢谢 同学 ， 以后 要 更 小心 。", "Tôi cảm ơn bạn và sau này phải cẩn thận hơn.")
      ])
    ]
  ),
  article(
    "hsk2-train-trip",
    "坐火车去看朋友",
    "Đi tàu hỏa thăm bạn",
    "Một chuyến tàu ngắn bắt đầu bằng sự nhầm lẫn về chỗ ngồi.",
    "HSK 2",
    "Kế hoạch",
    [
      section("准备出发", "Chuẩn bị khởi hành", [
        sentence("这个 周末 ， 我 要 坐 火车 去 看 朋友 。", "Cuối tuần này, tôi sẽ đi tàu hỏa thăm bạn."),
        sentence("前一天 晚上 ， 我 把 衣服 和 礼物 放进 包里 。", "Tối hôm trước, tôi cho quần áo và quà vào túi."),
        sentence("早上 七点 ， 爸爸 开车 送 我 去 车站 。", "Bảy giờ sáng, bố lái xe đưa tôi ra ga."),
        sentence("我 到得 很 早 ， 还有 时间 买 水 。", "Tôi đến rất sớm, vẫn còn thời gian mua nước."),
        sentence("八点 ， 火车 准时 开 了 。", "Tám giờ, tàu khởi hành đúng giờ.")
      ]),
      section("坐错了位置", "Ngồi nhầm chỗ", [
        sentence("我 坐下 不久 ， 一位 阿姨 来 找 位置 。", "Tôi vừa ngồi không lâu thì một cô đến tìm chỗ."),
        sentence("她 看了 车票 ， 说 这里 是 她 的 位置 。", "Cô ấy xem vé rồi nói đây là chỗ của cô ấy."),
        sentence("我 看了 自己 的 票 ， 发现 看错了 数字 。", "Tôi xem vé mình và phát hiện đã đọc nhầm số."),
        sentence("我 马上 说 对不起 ， 坐 到 前面 去 。", "Tôi lập tức xin lỗi rồi chuyển lên phía trước."),
        sentence("两个 小时 后 ， 朋友 正在 车站 等 我 。", "Hai giờ sau, bạn đang đợi tôi ở ga.")
      ])
    ]
  ),
  article(
    "hsk2-cook-with-neighbor",
    "和邻居一起做饭",
    "Nấu ăn cùng hàng xóm",
    "Hai người hàng xóm chia sẻ nguyên liệu và cùng hoàn thành bữa tối.",
    "HSK 2",
    "Đời sống",
    [
      section("少了一样东西", "Thiếu một nguyên liệu", [
        sentence("晚上 ， 我 想 做 西红柿 鸡蛋 。", "Buổi tối, tôi muốn làm món trứng cà chua."),
        sentence("我 打开 冰箱 ， 发现 只有 鸡蛋 ， 没有 西红柿 。", "Tôi mở tủ lạnh, phát hiện chỉ có trứng, không có cà chua."),
        sentence("外面 下着 大雨 ， 商店 也 有点 远 。", "Bên ngoài mưa lớn, cửa hàng cũng hơi xa."),
        sentence("这时 ， 邻居 小陈 来 问 我 有没有 盐 。", "Lúc này, hàng xóm Tiểu Trần sang hỏi tôi có muối không."),
        sentence("我 给 她 盐 ， 她 给 我 两个 西红柿 。", "Tôi cho cô ấy muối, cô ấy cho tôi hai quả cà chua.")
      ]),
      section("两个人的晚饭", "Bữa tối của hai người", [
        sentence("我们 决定 一起 做 晚饭 。", "Chúng tôi quyết định cùng làm bữa tối."),
        sentence("我 洗菜 ， 小陈 切 西红柿 。", "Tôi rửa rau, Tiểu Trần cắt cà chua."),
        sentence("她 做 的 汤 很 好喝 ， 我的 菜 也 不错 。", "Canh cô ấy nấu rất ngon, món của tôi cũng ổn."),
        sentence("吃饭 时 ， 我们 说了 很多 工作 中 的 事 。", "Khi ăn, chúng tôi trò chuyện nhiều chuyện công việc."),
        sentence("雨 还 在 下 ， 屋里 却 很 暖和 。", "Mưa vẫn rơi nhưng trong nhà rất ấm áp.")
      ])
    ]
  ),

  article(
    "hsk3-understand-first",
    "先理解，再翻译",
    "Hiểu trước, rồi mới dịch",
    "Một người học thay đổi thói quen dịch từng chữ và dần đọc tự nhiên hơn.",
    "HSK 3",
    "Học tập",
    [
      section("以前的方法", "Cách học trước đây", [
        sentence("以前 读 汉语 文章 时 ， 我 常常 一个字 一个字 地 翻译 。", "Trước đây khi đọc bài tiếng Trung, tôi thường dịch từng chữ một."),
        sentence("虽然 每个 词 都 查过 ， 但是 整个 句子 还是 很 奇怪 。", "Dù đã tra từng từ, cả câu vẫn rất kỳ lạ."),
        sentence("遇到 长句子 ， 我 还 会 忘记 前面 说了 什么 。", "Gặp câu dài, tôi còn quên phần trước đã nói gì."),
        sentence("有一次 ， 老师 让我 先 不要 打开 词典 。", "Có lần, giáo viên bảo tôi trước tiên đừng mở từ điển."),
        sentence("她 叫 我 看 前后 的 内容 ， 猜 一猜 主要 意思 。", "Cô bảo tôi nhìn nội dung trước sau và đoán ý chính.")
      ]),
      section("新的阅读顺序", "Trình tự đọc mới", [
        sentence("现在 ， 我 会 先 找 谁 、 在 哪儿 、 做 什么 。", "Bây giờ, tôi tìm trước ai, ở đâu và làm gì."),
        sentence("不 认识 的 词 ， 我 先 用 句子 的 内容 来 猜 。", "Với từ không biết, tôi đoán trước dựa vào nội dung câu."),
        sentence("如果 这个 词 很 重要 ， 我 才 查看 拼音 和 解释 。", "Nếu từ đó quan trọng, tôi mới xem pinyin và giải thích."),
        sentence("读完 一段 后 ， 我 用 自己 的 话 说出 它 的 意思 。", "Đọc xong một đoạn, tôi dùng lời của mình nói lại ý nghĩa."),
        sentence("这样 虽然 慢 一点 ， 但是 我 理解 得 更 清楚 了 。", "Làm vậy tuy chậm hơn một chút nhưng tôi hiểu rõ hơn.")
      ])
    ]
  ),
  article(
    "hsk3-daily-progress",
    "每天进步一点",
    "Mỗi ngày tiến bộ một chút",
    "Một kế hoạch học nhỏ giúp người học duy trì tiếng Trung mà không quá mệt.",
    "HSK 3",
    "Học tập",
    [
      section("计划不要太大", "Kế hoạch đừng quá lớn", [
        sentence("为了 提高 汉语 水平 ， 我 以前 给 自己 安排 很多 任务 。", "Để nâng trình độ tiếng Trung, trước đây tôi tự xếp rất nhiều nhiệm vụ."),
        sentence("我 想 每天 学 五十个 新词 ， 还 要 读 很长 的 文章 。", "Tôi muốn mỗi ngày học năm mươi từ mới và đọc bài rất dài."),
        sentence("可是 三天 以后 ， 我 就 觉得 太累 了 。", "Nhưng sau ba ngày, tôi đã cảm thấy quá mệt."),
        sentence("老师 说 ， 好的 计划 应该 能 坚持 下去 。", "Giáo viên nói kế hoạch tốt phải có thể duy trì."),
        sentence("所以 我 把 每天 的 任务 改得 更 简单 。", "Vì vậy tôi điều chỉnh nhiệm vụ mỗi ngày đơn giản hơn.")
      ]),
      section("看得见的变化", "Thay đổi nhìn thấy được", [
        sentence("早上 我 复习 十个 词 ， 晚上 读 一篇 短文 。", "Buổi sáng tôi ôn mười từ, buổi tối đọc một bài ngắn."),
        sentence("周末 我 会 再看 这星期 遇到 的 难句子 。", "Cuối tuần tôi xem lại những câu khó gặp trong tuần."),
        sentence("有时候 很忙 ， 我 也 至少 学 十五分钟 。", "Có lúc rất bận, tôi vẫn học ít nhất mười lăm phút."),
        sentence("一个月 后 ， 我 发现 自己 查词典 的 次数 少了 。", "Một tháng sau, tôi phát hiện số lần tra từ điển đã giảm."),
        sentence("每天 进步 不 多 ， 时间 长了 却 有 很大 变化 。", "Mỗi ngày tiến bộ không nhiều, nhưng lâu dần lại có thay đổi lớn.")
      ])
    ]
  ),
  article(
    "hsk3-keep-a-promise",
    "答应了就要做到",
    "Đã hứa thì phải làm",
    "Một lời hứa giúp bạn bè hiểu rằng báo sớm cũng là một phần của trách nhiệm.",
    "HSK 3",
    "Đời sống",
    [
      section("突然有事", "Đột nhiên có việc", [
        sentence("星期一 ， 小林 答应 周六 帮 我 搬家 。", "Thứ Hai, Tiểu Lâm đồng ý thứ Bảy giúp tôi chuyển nhà."),
        sentence("我们 说好 早上 八点 在 我家 门口 见面 。", "Chúng tôi hẹn tám giờ sáng gặp trước cửa nhà tôi."),
        sentence("星期五 晚上 ， 他 的 公司 突然 有 重要 工作 。", "Tối thứ Sáu, công ty cậu ấy đột nhiên có việc quan trọng."),
        sentence("他 可能 不能 来 ， 心里 非常 着急 。", "Cậu ấy có thể không đến được nên rất sốt ruột."),
        sentence("他 马上 给 我 打电话 ， 说明 了 情况 。", "Cậu ấy lập tức gọi cho tôi và giải thích tình hình.")
      ]),
      section("换一个办法", "Đổi sang cách khác", [
        sentence("我 虽然 有点 失望 ， 但是 明白 他 不是 故意 的 。", "Tôi hơi thất vọng nhưng hiểu cậu ấy không cố ý."),
        sentence("小林 联系 了 另一个 朋友 来 帮忙 。", "Tiểu Lâm liên lạc một người bạn khác đến giúp."),
        sentence("周六 下午 ， 他 完成 工作 后 也 赶来 了 。", "Chiều thứ Bảy, sau khi xong việc cậu ấy cũng vội đến."),
        sentence("我们 三个人 很快 就 把 东西 搬完 了 。", "Ba người chúng tôi nhanh chóng chuyển xong đồ."),
        sentence("我 觉得 做不到 时 提前 说明 ， 也是 对 承诺 负责 。", "Tôi thấy khi không làm được mà báo trước cũng là có trách nhiệm với lời hứa.")
      ])
    ]
  ),
  article(
    "hsk3-uniform-design",
    "为咖啡店设计工作服",
    "Thiết kế đồng phục cho quán cà phê",
    "Một nhóm thiết kế cân bằng vẻ đẹp, sự thoải mái và nhu cầu làm việc thực tế.",
    "HSK 3",
    "Thiết kế",
    [
      section("先了解工作", "Tìm hiểu công việc trước", [
        sentence("我的 朋友 开了 一家 小 咖啡店 ， 请 我们 设计 工作服 。", "Bạn tôi mở một quán cà phê nhỏ và nhờ chúng tôi thiết kế đồng phục."),
        sentence("我们 没有 马上 画图 ， 而是 先 去 店里 看 大家 怎么 工作 。", "Chúng tôi không vẽ ngay mà đến quán xem mọi người làm việc thế nào."),
        sentence("服务员 每天 要 走 很多 路 ， 还 常常 拿 热 饮料 。", "Nhân viên phục vụ mỗi ngày đi lại nhiều và thường cầm đồ uống nóng."),
        sentence("他们 希望 衣服 穿起来 舒服 、 容易 洗 ， 口袋 也 要 大 。", "Họ muốn trang phục mặc thoải mái, dễ giặt và túi cũng phải lớn."),
        sentence("老板 喜欢 深绿色 ， 因为 它 和 店里 的 颜色 很 配 。", "Chủ quán thích xanh đậm vì nó rất hợp với màu sắc trong quán.")
      ]),
      section("试穿以后", "Sau khi mặc thử", [
        sentence("我们 画了 两种 样子 ， 让 每个人 都 看看 。", "Chúng tôi vẽ hai kiểu để mọi người cùng xem."),
        sentence("大家 选择 了 有 两个 口袋 的 那一件 。", "Mọi người chọn mẫu có hai túi."),
        sentence("第一次 试穿 时 ， 有人 觉得 袖子 太长 。", "Lần mặc thử đầu tiên, có người thấy tay áo quá dài."),
        sentence("我们 根据 意见 改短 袖子 ， 也 换了 更轻 的 布料 。", "Chúng tôi dựa theo góp ý để rút ngắn tay và đổi vải nhẹ hơn."),
        sentence("一个 星期 后 ， 新 工作服 既 好看 又 方便 。", "Một tuần sau, đồng phục mới vừa đẹp vừa tiện.")
      ])
    ]
  ),
  article(
    "hsk3-first-office-week",
    "办公室里的第一周",
    "Tuần đầu tiên ở văn phòng",
    "Một nhân viên mới học quy trình, hỏi đúng lúc và dần tự tin hơn.",
    "HSK 3",
    "Công sở",
    [
      section("事情比想象中多", "Nhiều việc hơn tưởng tượng", [
        sentence("大学 毕业 后 ， 我 在 一家 设计 公司 找到 了 工作 。", "Sau khi tốt nghiệp đại học, tôi tìm được việc ở một công ty thiết kế."),
        sentence("第一天 ， 同事 带 我 看了 办公室 和 会议室 。", "Ngày đầu, đồng nghiệp dẫn tôi xem văn phòng và phòng họp."),
        sentence("经理 给 我 一份 工作表 ， 上面 写着 每天 的 任务 。", "Quản lý đưa tôi một bảng công việc ghi nhiệm vụ hằng ngày."),
        sentence("有些 电脑 软件 我 用过 ， 有些 完全 不 熟悉 。", "Một số phần mềm tôi đã dùng, một số hoàn toàn xa lạ."),
        sentence("我 担心 问题 太多 会 影响 别人 工作 。", "Tôi lo hỏi quá nhiều sẽ ảnh hưởng công việc của người khác.")
      ]),
      section("学会怎么问", "Học cách đặt câu hỏi", [
        sentence("同事 告诉 我 ， 先 记下 问题 ， 再 一起 问 会 更 清楚 。", "Đồng nghiệp bảo tôi ghi câu hỏi lại rồi hỏi cùng lúc sẽ rõ hơn."),
        sentence("我 开始 把 不懂 的 地方 写 在 本子 上 。", "Tôi bắt đầu ghi những chỗ chưa hiểu vào sổ."),
        sentence("每天下午 ， 同事 花 十分钟 给 我 解释 。", "Mỗi chiều, đồng nghiệp dành mười phút giải thích cho tôi."),
        sentence("到 星期五 ， 我 已经 能 自己 完成 大部分 任务 。", "Đến thứ Sáu, tôi đã có thể tự hoàn thành phần lớn nhiệm vụ."),
        sentence("第一周 很忙 ， 但是 我 对 新 工作 更 有 信心 了 。", "Tuần đầu rất bận nhưng tôi tự tin hơn với công việc mới.")
      ])
    ]
  ),
  article(
    "hsk3-fashion-window",
    "会讲故事的橱窗",
    "Tủ kính biết kể chuyện",
    "Một nhân viên dùng câu chuyện đời thường để thiết kế tủ trưng bày mùa thu.",
    "HSK 3",
    "Thời trang",
    [
      section("不只是放衣服", "Không chỉ là đặt quần áo", [
        sentence("商场 要 换 秋天 的 橱窗 ， 经理 把 任务 交给 小周 。", "Trung tâm mua sắm cần đổi tủ kính mùa thu, quản lý giao nhiệm vụ cho Tiểu Chu."),
        sentence("以前 的 橱窗 只 把 新 衣服 放 在 一起 ， 看起来 有点 普通 。", "Tủ kính trước đây chỉ đặt quần áo mới cạnh nhau nên trông hơi bình thường."),
        sentence("小周 希望 客人 一看 就 能 想到 一个 生活 场景 。", "Tiểu Chu muốn khách nhìn vào là nghĩ đến một cảnh đời thường."),
        sentence("她 选择 了 下班 后 去 公园 散步 这个 主题 。", "Cô chọn chủ đề đi dạo công viên sau giờ làm."),
        sentence("橱窗 里 有 外套 、 长裙 、 雨伞 和 一把 木椅 。", "Trong tủ kính có áo khoác, váy dài, ô và một chiếc ghế gỗ.")
      ]),
      section("客人的反应", "Phản ứng của khách", [
        sentence("她 用 黄色 的 灯 ， 让 人 想到 下午 温暖 的 阳光 。", "Cô dùng đèn vàng để gợi cho người xem nhớ đến ánh nắng chiều ấm áp."),
        sentence("衣服 的 颜色 不 多 ， 所以 整体 看起来 很舒服 。", "Màu quần áo không nhiều nên tổng thể trông rất dễ chịu."),
        sentence("完成 后 ， 小周 站 在 外面 看了 很久 。", "Hoàn thành xong, Tiểu Chu đứng bên ngoài nhìn rất lâu."),
        sentence("几个 客人 停下来 拍照 ， 还 走进 店里 看 外套 。", "Vài vị khách dừng lại chụp ảnh rồi vào cửa hàng xem áo khoác."),
        sentence("经理 说 ， 好的 设计 能 让 衣服 讲出 故事 。", "Quản lý nói thiết kế tốt có thể khiến quần áo kể nên câu chuyện.")
      ])
    ]
  ),
  article(
    "hsk3-missed-bus",
    "错过末班车以后",
    "Sau khi lỡ chuyến xe cuối",
    "Một sự cố nhỏ trên đường về nhà cho thấy bình tĩnh quan trọng hơn vội vàng.",
    "HSK 3",
    "Đời sống",
    [
      section("车已经走了", "Xe đã đi rồi", [
        sentence("昨天 晚上 ， 我 在 图书馆 看书 看得 太 认真 。", "Tối qua, tôi đọc sách ở thư viện quá chăm chú."),
        sentence("听到 关门 的 声音 ， 我 才 发现 已经 十点 了 。", "Nghe tiếng đóng cửa, tôi mới phát hiện đã mười giờ."),
        sentence("我 跑到 车站 ， 最后一班 公共汽车 刚刚 开走 。", "Tôi chạy đến trạm thì chuyến xe buýt cuối vừa rời đi."),
        sentence("手机 只 剩 一点 电 ， 外面 又 开始 下雨 。", "Điện thoại chỉ còn ít pin, ngoài trời lại bắt đầu mưa."),
        sentence("我 有点 着急 ， 但 先 让 自己 安静 下来 。", "Tôi hơi lo nhưng trước tiên tự bình tĩnh lại.")
      ]),
      section("找到安全的办法", "Tìm cách an toàn", [
        sentence("车站 对面 有 一家 还 没 关门 的 饭店 。", "Đối diện trạm có một quán ăn chưa đóng cửa."),
        sentence("我 进去 借了 充电器 ， 给 家人 发了 消息 。", "Tôi vào mượn sạc và nhắn tin cho gia đình."),
        sentence("老板 告诉 我 ， 附近 有 地铁 可以 回家 。", "Chủ quán nói gần đó có tàu điện có thể về nhà."),
        sentence("他 还 在 纸上 画了 从 饭店 到 地铁站 的 路 。", "Ông còn vẽ đường từ quán đến ga lên giấy."),
        sentence("虽然 回家 晚了 半小时 ， 但是 我 安全 地 到家 了 。", "Tuy về muộn nửa giờ nhưng tôi đã về nhà an toàn.")
      ])
    ]
  ),
  article(
    "hsk3-grandma-smartphone",
    "奶奶学会了视频电话",
    "Bà học gọi video",
    "Bà học công nghệ bằng cách ghi lại từng bước và luyện tập nhiều lần.",
    "HSK 3",
    "Đời sống",
    [
      section("按钮太多了", "Quá nhiều nút", [
        sentence("哥哥 给 奶奶 买了 一部 新 手机 。", "Anh trai mua cho bà một chiếc điện thoại mới."),
        sentence("奶奶 会 接电话 ， 但是 不会 打 视频电话 。", "Bà biết nghe điện thoại nhưng chưa biết gọi video."),
        sentence("她 觉得 屏幕 上 的 按钮 太多 ， 很 容易 按错 。", "Bà thấy trên màn hình có quá nhiều nút, rất dễ bấm nhầm."),
        sentence("我 把 重要 的 软件 放 在 第一页 ， 其他 的 都 移开 。", "Tôi đặt ứng dụng quan trọng ở trang đầu và chuyển các ứng dụng khác đi."),
        sentence("然后 我 在 纸上 写下 打电话 的 三个 步骤 。", "Sau đó tôi viết ba bước gọi điện lên giấy.")
      ]),
      section("每天练一次", "Mỗi ngày luyện một lần", [
        sentence("第一天 ， 奶奶 看着 纸 才 能 打给 我 。", "Ngày đầu, bà phải nhìn giấy mới gọi được cho tôi."),
        sentence("第二天 ， 她 忘了 最后 应该 按 哪个 按钮 。", "Ngày thứ hai, bà quên cuối cùng phải bấm nút nào."),
        sentence("我们 没有 着急 ， 又 一起 做了 一次 。", "Chúng tôi không vội và cùng làm lại một lần."),
        sentence("一个 星期 后 ， 奶奶 能 自己 打 视频电话 了 。", "Một tuần sau, bà đã có thể tự gọi video."),
        sentence("现在 每天 晚上 ， 她 都 会 给 我们 看 家里 的 花 。", "Bây giờ mỗi tối bà đều gọi cho chúng tôi xem hoa trong nhà.")
      ])
    ]
  ),
  article(
    "hsk3-community-garden",
    "楼下的小花园",
    "Khu vườn nhỏ dưới nhà",
    "Hàng xóm biến một khoảng đất trống thành nơi mọi người cùng chăm sóc.",
    "HSK 3",
    "Kế hoạch",
    [
      section("从一块空地开始", "Bắt đầu từ một mảnh đất trống", [
        sentence("我们 楼下 有 一块 空地 ， 以前 只有 一些 旧 东西 。", "Dưới tòa nhà có một mảnh đất trống, trước đây chỉ có vài món đồ cũ."),
        sentence("邻居 张阿姨 建议 把 那里 变成 一个 小 花园 。", "Hàng xóm cô Trương đề nghị biến nơi đó thành một khu vườn nhỏ."),
        sentence("有的人 带 花 ， 有的人 带 工具 ， 大家 一起 打扫 。", "Người mang hoa, người mang dụng cụ, mọi người cùng dọn dẹp."),
        sentence("我 和 小陈 负责 搬走 旧 椅子 和 空 箱子 。", "Tôi và Tiểu Trần phụ trách chuyển ghế cũ và thùng rỗng đi."),
        sentence("忙了 一个 上午 ， 空地 终于 干净 了 。", "Bận cả buổi sáng, mảnh đất cuối cùng cũng sạch.")
      ]),
      section("大家轮流照顾", "Mọi người luân phiên chăm sóc", [
        sentence("我们 做了 一张 表 ， 每家 每星期 浇水 一次 。", "Chúng tôi làm một bảng, mỗi nhà tưới nước một lần mỗi tuần."),
        sentence("孩子们 画了 小牌子 ， 写上 每种 花 的 名字 。", "Bọn trẻ vẽ biển nhỏ và ghi tên từng loại hoa."),
        sentence("下雨 的 日子 不用 浇水 ， 但 要 看看 花盆 里的 水 是不是 太多 。", "Ngày mưa không cần tưới nhưng phải xem nước trong chậu có quá nhiều không."),
        sentence("两个月 后 ， 花园 里 有 红色 的 花 ， 也 有 绿色 的 菜 。", "Hai tháng sau, vườn có hoa đỏ và cả rau xanh."),
        sentence("晚上 大家 常 在 这里 聊天 ， 邻居们 也 越来越 熟悉 了 。", "Buổi tối mọi người thường trò chuyện ở đây và hàng xóm ngày càng thân nhau hơn.")
      ])
    ]
  )
];

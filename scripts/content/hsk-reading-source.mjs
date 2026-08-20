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
  ),
  article(
    "hsk4-first-project-report",
    "第一次独立汇报",
    "Lần đầu tự báo cáo công việc",
    "Một nhân viên trẻ chuẩn bị bản báo cáo đầu tiên và học cách trình bày vấn đề rõ ràng.",
    "HSK 4",
    "Công sở",
    [
      section("准备资料", "Chuẩn bị tài liệu", [
        sentence("工作 三个月 后 ， 经理 让我 独立 介绍 最近 的 项目 进度 。", "Sau ba tháng làm việc, quản lý yêu cầu tôi tự trình bày tiến độ dự án gần đây."),
        sentence("虽然 我 很 熟悉 工作 内容 ， 但是 一想到 要 在 大家 面前 讲话 就 紧张 。", "Dù rất quen nội dung công việc, tôi vẫn căng thẳng khi nghĩ đến việc nói trước mọi người."),
        sentence("同事 建议 我 先 把 最重要 的 结果 放在 前面 ， 再 解释 遇到 的 问题 。", "Đồng nghiệp khuyên tôi đưa kết quả quan trọng nhất lên trước rồi mới giải thích vấn đề đã gặp."),
        sentence("我 根据 数据 做了 几张 简单 的 图表 ， 并且 删除了 重复 的 内容 。", "Tôi làm vài biểu đồ đơn giản dựa trên dữ liệu và xóa nội dung trùng lặp."),
        sentence("汇报 前一天 ， 我 对着 空 椅子 练习了 三遍 ， 时间 终于 控制 在 十分钟 以内 。", "Một ngày trước buổi báo cáo, tôi luyện ba lần trước ghế trống và cuối cùng kiểm soát thời gian dưới mười phút.")
      ]),
      section("说清楚比说得多重要", "Nói rõ quan trọng hơn nói nhiều", [
        sentence("会议 开始 后 ， 我 先 说明 项目 已经 完成 百分之八十 。", "Sau khi cuộc họp bắt đầu, tôi nói trước rằng dự án đã hoàn thành tám mươi phần trăm."),
        sentence("当 经理 问到 延迟 的 原因 时 ， 我 没有 找 借口 ， 而是 提出了 两个 解决 办法 。", "Khi quản lý hỏi nguyên nhân chậm trễ, tôi không viện cớ mà đưa ra hai cách giải quyết."),
        sentence("大家 对 第二个 办法 很 感兴趣 ， 还 补充了 一些 具体 建议 。", "Mọi người rất quan tâm cách thứ hai và còn bổ sung vài đề xuất cụ thể."),
        sentence("汇报 结束 时 ， 我 才 发现 自己 已经 不那么 紧张 了 。", "Khi báo cáo kết thúc, tôi mới nhận ra mình không còn căng thẳng như trước."),
        sentence("这次 经历 让我 明白 ， 清楚 地 说明 事实 比 使用 复杂 的 词 更 重要 。", "Trải nghiệm này giúp tôi hiểu rằng trình bày sự thật rõ ràng quan trọng hơn dùng từ phức tạp.")
      ])
    ]
  ),
  article(
    "hsk4-sustainable-uniform",
    "一套可以穿更久的制服",
    "Bộ đồng phục có thể mặc lâu hơn",
    "Một nhóm thiết kế cải tiến đồng phục bằng cách quan sát người dùng và giảm lãng phí.",
    "HSK 4",
    "Thiết kế",
    [
      section("先了解真正的需要", "Trước tiên hiểu nhu cầu thật", [
        sentence("一家 咖啡店 请 我们 设计 新 制服 ， 希望 看起来 专业 又 容易 清洗 。", "Một quán cà phê nhờ chúng tôi thiết kế đồng phục mới, mong vừa chuyên nghiệp vừa dễ giặt."),
        sentence("设计师 没有 马上 画图 ， 而是 去 店里 观察 员工 一天 的 工作 。", "Nhà thiết kế không vẽ ngay mà đến cửa hàng quan sát một ngày làm việc của nhân viên."),
        sentence("他们 发现 员工 经常 弯腰 拿 东西 ， 普通 衬衫 的 后面 很容易 跑出来 。", "Họ phát hiện nhân viên thường cúi lấy đồ nên phần sau của áo sơ mi thông thường dễ tuột ra."),
        sentence("另外 ， 深色 围裙 虽然 不容易 显脏 ， 夏天 穿着 却 比较 热 。", "Ngoài ra, tạp dề tối màu tuy khó lộ vết bẩn nhưng mặc mùa hè khá nóng."),
        sentence("团队 记录了 这些 细节 ， 决定 先 做 两种 不同 的 样衣 。", "Nhóm ghi lại các chi tiết đó và quyết định làm trước hai mẫu thử khác nhau.")
      ]),
      section("减少浪费的修改", "Điều chỉnh để giảm lãng phí", [
        sentence("第一次 试穿 后 ， 大家 选择了 更 轻 的 布料 和 可以 调整 的 袖口 。", "Sau lần mặc thử đầu tiên, mọi người chọn loại vải nhẹ hơn và cổ tay áo có thể điều chỉnh."),
        sentence("围裙 的 口袋 被 分成 三个 部分 ， 工具 不会 再 混在 一起 。", "Túi tạp dề được chia thành ba phần để dụng cụ không còn lẫn vào nhau."),
        sentence("为了 让 制服 穿得 更久 ， 容易 坏 的 地方 还 增加了 一层 布 。", "Để đồng phục mặc được lâu hơn, những chỗ dễ hỏng còn được thêm một lớp vải."),
        sentence("咖啡店 先 让 五名 员工 试用 一个月 ， 然后 才 决定 生产 数量 。", "Quán cho năm nhân viên dùng thử một tháng rồi mới quyết định số lượng sản xuất."),
        sentence("好的 设计 不一定 使用 更多 材料 ， 关键 是 每个 细节 都 有 实际 作用 。", "Thiết kế tốt không nhất thiết dùng nhiều vật liệu hơn; điều quan trọng là mỗi chi tiết đều có tác dụng thực tế.")
      ])
    ]
  ),
  article(
    "hsk4-returned-dress",
    "被退回来的连衣裙",
    "Chiếc váy bị trả lại",
    "Một cửa hàng biến lời phàn nàn của khách thành cơ hội cải thiện sản phẩm và dịch vụ.",
    "HSK 4",
    "Thời trang",
    [
      section("不是尺寸的问题", "Không phải vấn đề kích cỡ", [
        sentence("周末 下午 ， 一位 客人 拿着 上周 买的 连衣裙 回到 店里 。", "Chiều cuối tuần, một khách hàng mang chiếc váy mua tuần trước quay lại cửa hàng."),
        sentence("店员 以为 尺寸 不合适 ， 客人 却 说 试穿 时 感觉 很舒服 。", "Nhân viên tưởng kích cỡ không phù hợp, nhưng khách nói lúc thử mặc rất thoải mái."),
        sentence("她 第一次 洗完 后 才 发现 ， 裙子 的 颜色 比 原来 浅了 很多 。", "Chỉ sau lần giặt đầu, cô mới phát hiện màu váy nhạt đi nhiều so với ban đầu."),
        sentence("店长 仔细 看了 洗衣 说明 ， 发现 标签 上 少写了 一个 重要 条件 。", "Quản lý xem kỹ hướng dẫn giặt và phát hiện nhãn thiếu một điều kiện quan trọng."),
        sentence("他 向 客人 道歉 ， 立刻 同意 退货 ， 还 记下了 商品 的 号码 。", "Anh xin lỗi khách, lập tức đồng ý trả hàng và ghi lại mã sản phẩm.")
      ]),
      section("把抱怨变成改进", "Biến phàn nàn thành cải tiến", [
        sentence("店长 检查了 同一批 裙子 ， 结果 又 找到 两件 有 相同 问题 的 商品 。", "Quản lý kiểm tra cùng lô váy và tìm thêm hai sản phẩm có vấn đề giống nhau."),
        sentence("他 联系 生产 工厂 ， 要求 重新 测试 布料 的 颜色 是否 稳定 。", "Anh liên hệ nhà máy, yêu cầu kiểm tra lại độ bền màu của vải."),
        sentence("新的 洗衣 标签 写得 更 清楚 ， 店员 也 会 主动 提醒 客人 。", "Nhãn giặt mới được viết rõ hơn và nhân viên cũng chủ động nhắc khách."),
        sentence("一个月 后 ， 那位 客人 再次 来到 店里 ， 选择了 另一条 裙子 。", "Một tháng sau, vị khách quay lại cửa hàng và chọn một chiếc váy khác."),
        sentence("她 说 ， 产品 出现 问题 并不可怕 ， 认真 处理 才 能 得到 信任 。", "Cô nói sản phẩm gặp vấn đề không đáng sợ; xử lý nghiêm túc mới giành được niềm tin.")
      ])
    ]
  ),
  article(
    "hsk4-lost-camera",
    "回到手里的相机",
    "Chiếc máy ảnh trở về tay chủ",
    "Một chiếc máy ảnh thất lạc được tìm lại nhờ những manh mối nhỏ và sự giúp đỡ của người lạ.",
    "HSK 4",
    "Đời sống",
    [
      section("旅行后的发现", "Phát hiện sau chuyến đi", [
        sentence("从 海边 回家 的 晚上 ， 我 整理 行李 时 发现 相机 不见了 。", "Tối trở về từ bờ biển, khi dọn hành lý tôi phát hiện máy ảnh biến mất."),
        sentence("相机 里 有 很多 家庭 照片 ， 所以 我 比 丢了 钱 更 难过 。", "Trong máy có nhiều ảnh gia đình nên tôi buồn hơn cả mất tiền."),
        sentence("我 先 给 酒店 打电话 ， 又 联系了 坐过 的 出租车 ， 都 没有 消息 。", "Tôi gọi khách sạn rồi liên hệ chiếc taxi đã đi nhưng đều không có tin tức."),
        sentence("姐姐 提醒 我 回忆 最后一次 使用 相机 的 地点 和 时间 。", "Chị nhắc tôi nhớ lại địa điểm và thời gian cuối cùng dùng máy ảnh."),
        sentence("我 想起 离开 海滩 前 ， 曾经 在 一家 小店 门口 拍过 照 。", "Tôi nhớ trước khi rời bãi biển từng chụp ảnh trước một cửa hàng nhỏ.")
      ]),
      section("照片里的线索", "Manh mối trong bức ảnh", [
        sentence("我 在 网上 找到 那家 店 的 电话 ， 老板 果然 捡到了一部 相机 。", "Tôi tìm được số điện thoại cửa hàng trên mạng và quả nhiên chủ quán đã nhặt được một máy ảnh."),
        sentence("为了 确认 我 是 主人 ， 他 请 我 说出 相机 的 颜色 和 第一张 照片 的 内容 。", "Để xác nhận tôi là chủ, ông yêu cầu nói màu máy và nội dung tấm ảnh đầu tiên."),
        sentence("第一张 是 父母 站在 蓝色 雨伞 旁边 的 合照 ， 老板 听完 就 放心了 。", "Tấm đầu là ảnh bố mẹ đứng cạnh chiếc ô xanh; nghe xong chủ quán yên tâm."),
        sentence("几天 后 ， 我 收到 他 寄来 的 相机 ， 里面 的 照片 一张 都 没 少 。", "Vài ngày sau tôi nhận lại máy ảnh ông gửi, không thiếu tấm nào."),
        sentence("这次 事情 让我 相信 ， 陌生人 之间 的 认真 和 善意 也 值得 珍惜 。", "Sự việc khiến tôi tin rằng sự tử tế và nghiêm túc giữa người xa lạ cũng đáng trân trọng.")
      ])
    ]
  ),
  article(
    "hsk4-community-bookcase",
    "小区门口的共享书柜",
    "Tủ sách dùng chung trước khu dân cư",
    "Cư dân cùng xây một tủ sách nhỏ và đặt ra quy tắc để nó hoạt động lâu dài.",
    "HSK 4",
    "Kế hoạch",
    [
      section("从旧书开始", "Bắt đầu từ sách cũ", [
        sentence("搬家 时 ， 陈老师 发现 家里 有 两箱 已经 看完 的 书 。", "Khi chuyển nhà, thầy Trần phát hiện hai thùng sách đã đọc xong."),
        sentence("直接 扔掉 太 可惜 ， 全部 送到 很远 的 图书馆 又 不方便 。", "Vứt đi thì quá tiếc, còn mang hết đến thư viện xa lại bất tiện."),
        sentence("他 建议 在 小区 门口 放 一个 书柜 ， 邻居 可以 自由 交换 。", "Ông đề nghị đặt một tủ sách trước khu dân cư để hàng xóm tự do trao đổi."),
        sentence("有人 担心 下雨 会 弄湿 书 ， 也有人 担心 书柜 很快 变乱 。", "Có người lo mưa làm ướt sách, người khác lo tủ nhanh chóng bừa bộn."),
        sentence("大家 讨论 后 ， 决定 使用 带门 的 旧柜子 ， 并且 安排 人 轮流 检查 。", "Sau khi thảo luận, mọi người quyết định dùng tủ cũ có cửa và phân công người kiểm tra luân phiên.")
      ]),
      section("规则让分享更长久", "Quy tắc giúp chia sẻ bền lâu", [
        sentence("书柜 上 写着 三条 规则 ： 保持 干净 、 看完 放回 、 不放 广告 。", "Trên tủ có ba quy tắc: giữ sạch, đọc xong đặt lại và không để quảng cáo."),
        sentence("孩子们 负责 给 图画书 分类 ， 老人们 则 常常 推荐 历史 故事 。", "Trẻ em phụ trách phân loại sách tranh, còn người lớn tuổi thường giới thiệu truyện lịch sử."),
        sentence("第一个月 ， 书柜 里的 书 不但 没有 减少 ， 反而 增加了 一倍 。", "Tháng đầu, sách trong tủ không giảm mà còn tăng gấp đôi."),
        sentence("邻居 以前 见面 只 点头 ， 现在 会 停下来 交流 阅读 感受 。", "Trước kia hàng xóm gặp nhau chỉ gật đầu, nay dừng lại trao đổi cảm nhận đọc sách."),
        sentence("一个 小小 的 书柜 不仅 节省了 资源 ， 还 让 小区 变得 更有 温度 。", "Một tủ sách nhỏ không chỉ tiết kiệm tài nguyên mà còn khiến khu dân cư ấm áp hơn.")
      ])
    ]
  ),
  article(
    "hsk4-learning-from-mistakes",
    "写错以后别急着擦",
    "Viết sai rồi đừng vội xóa",
    "Một lớp học biến lỗi sai thành tài liệu giúp học sinh hiểu cách suy nghĩ của mình.",
    "HSK 4",
    "Học tập",
    [
      section("同一个错误又出现了", "Cùng một lỗi lại xuất hiện", [
        sentence("每次 作业 发下来 ， 小林 都 会 立刻 把 错字 擦掉 ， 再 写上 正确 答案 。", "Mỗi lần nhận lại bài, Tiểu Lâm lập tức xóa chữ sai rồi viết đáp án đúng."),
        sentence("可是 下次 考试 遇到 相似 的 句子 ， 他 还是 会 犯 同样 的 错误 。", "Nhưng kỳ thi sau gặp câu tương tự, cậu vẫn mắc lỗi giống vậy."),
        sentence("老师 发现 后 ， 请 他 暂时 不要 擦 ， 先 在 旁边 写下 当时 的 想法 。", "Giáo viên phát hiện và bảo cậu tạm đừng xóa, trước hết viết suy nghĩ lúc đó bên cạnh."),
        sentence("小林 这才 注意到 ， 自己 常常 只 记住 一个 词 的 意思 ， 却 忽略了 使用 条件 。", "Lúc ấy Tiểu Lâm mới chú ý mình thường chỉ nhớ nghĩa từ mà bỏ qua điều kiện sử dụng."),
        sentence("老师 让 全班 准备 一本 错题本 ， 但是 不要求 抄写 所有 错误 。", "Giáo viên cho cả lớp chuẩn bị sổ lỗi sai nhưng không yêu cầu chép mọi lỗi.")
      ]),
      section("找到错误背后的原因", "Tìm nguyên nhân phía sau lỗi sai", [
        sentence("学生 只 记录 经常 出现 或者 自己 解释 不清楚 的 问题 。", "Học sinh chỉ ghi những vấn đề thường xuất hiện hoặc bản thân chưa giải thích rõ."),
        sentence("每条 记录 除了 正确 答案 ， 还要 写出 错误 原因 和 一个 新 例子 。", "Mỗi ghi chép ngoài đáp án đúng còn phải nêu nguyên nhân sai và một ví dụ mới."),
        sentence("两个 星期 后 ， 小林 发现 自己 的 大部分 问题 都 和 词语 顺序 有关 。", "Hai tuần sau, Tiểu Lâm phát hiện phần lớn vấn đề liên quan đến trật tự từ."),
        sentence("复习 时 ， 他 不再 从头 重看 课本 ， 而是 先 练习 这些 薄弱 的 地方 。", "Khi ôn, cậu không đọc lại sách từ đầu mà luyện trước những chỗ còn yếu."),
        sentence("错误 没有 让 他 更没 信心 ， 反而 成了 了解 自己 学习 方法 的 线索 。", "Lỗi sai không khiến cậu mất tự tin hơn mà trở thành manh mối hiểu cách học của chính mình.")
      ])
    ]
  ),
  article(
    "hsk4-meeting-with-distance",
    "隔着屏幕也能开好会",
    "Cách màn hình vẫn có thể họp tốt",
    "Một nhóm làm việc từ xa thay đổi cách họp để mọi thành viên đều theo kịp.",
    "HSK 4",
    "Công sở",
    [
      section("越来越长的会议", "Cuộc họp ngày càng dài", [
        sentence("我们 的 团队 在 三个 城市 工作 ， 每周 都要 通过 视频 讨论 项目 。", "Nhóm chúng tôi làm việc ở ba thành phố và mỗi tuần đều thảo luận dự án qua video."),
        sentence("开始 时 大家 没有 明确 计划 ， 想到 什么 就 说 什么 。", "Ban đầu mọi người không có kế hoạch rõ ràng, nghĩ gì nói nấy."),
        sentence("会议 常常 超过 一个 小时 ， 结束 后 却 没人 确定 下一步 做什么 。", "Cuộc họp thường quá một giờ nhưng kết thúc chẳng ai chắc bước tiếp theo là gì."),
        sentence("有一次 网络 不稳定 ， 一位 同事 错过了 重要 决定 ， 结果 做了 重复 工作 。", "Một lần mạng không ổn định, một đồng nghiệp bỏ lỡ quyết định quan trọng và làm việc trùng lặp."),
        sentence("负责人 意识到 ， 距离 不是 最大 问题 ， 没有 清楚 的 交流 方法 才是 。", "Người phụ trách nhận ra khoảng cách không phải vấn đề lớn nhất, mà là thiếu cách giao tiếp rõ ràng.")
      ]),
      section("让每个人都跟得上", "Để mọi người đều theo kịp", [
        sentence("从 那以后 ， 开会 前一天 每个人 都会 收到 讨论 内容 和 相关 文件 。", "Từ đó, một ngày trước họp mọi người đều nhận nội dung thảo luận và tài liệu liên quan."),
        sentence("会上 每个 问题 最多 讨论 十分钟 ， 没有 结果 就 安排 专人 继续 研究 。", "Trong họp mỗi vấn đề thảo luận tối đa mười phút; chưa có kết quả thì giao người nghiên cứu tiếp."),
        sentence("做出 决定 后 ， 记录 的 同事 会 马上 确认 谁 负责 以及 完成 时间 。", "Sau quyết định, người ghi biên bản lập tức xác nhận ai phụ trách và thời hạn hoàn thành."),
        sentence("不能 参加 的 人 可以 看 简短 记录 ， 不必 重听 整个 会议 。", "Người không thể tham gia có thể xem ghi chép ngắn, không cần nghe lại toàn bộ cuộc họp."),
        sentence("新的 方法 让 会议 缩短了 一半 ， 团队 的 合作 反而 更 顺利 。", "Cách mới rút ngắn cuộc họp một nửa và sự hợp tác của nhóm lại thuận lợi hơn.")
      ])
    ]
  ),
  article(
    "hsk4-family-trip-change",
    "没有看到日出的旅行",
    "Chuyến đi không ngắm được bình minh",
    "Thời tiết làm hỏng kế hoạch ngắm bình minh nhưng gia đình tìm được trải nghiệm đáng nhớ khác.",
    "HSK 4",
    "Đời sống",
    [
      section("天气改变了计划", "Thời tiết thay đổi kế hoạch", [
        sentence("为了 看 海上 日出 ， 我们 全家 提前 一个月 计划了 这次 旅行 。", "Để ngắm bình minh trên biển, cả nhà lên kế hoạch chuyến đi trước một tháng."),
        sentence("到达 小城 的 第一晚 ， 天气 预报 却 说明天 早上 会有 大雨 。", "Tối đầu tiên đến thị trấn, dự báo lại nói sáng hôm sau sẽ mưa lớn."),
        sentence("弟弟 很 失望 ， 因为 看 日出 是 他 最 期待 的 活动 。", "Em trai rất thất vọng vì ngắm bình minh là hoạt động em mong nhất."),
        sentence("父亲 说 天气 无法 控制 ， 但 我们 可以 决定 怎样 使用 时间 。", "Bố nói thời tiết không thể kiểm soát nhưng ta có thể quyết định sử dụng thời gian thế nào."),
        sentence("旅馆 老板 建议 我们 去 附近 的 渔村 ， 那里 雨天 也 很 有意思 。", "Chủ nhà nghỉ gợi ý chúng tôi đến làng chài gần đó, nơi ngày mưa cũng rất thú vị.")
      ]),
      section("意外的收获", "Thu hoạch bất ngờ", [
        sentence("第二天 ， 我们 穿着 雨衣 参观了 一个 制作 渔网 的 家庭 作坊 。", "Ngày hôm sau, chúng tôi mặc áo mưa thăm một xưởng gia đình làm lưới đánh cá."),
        sentence("一位 老人 教 弟弟 打了 一个 简单 的 结 ， 还 讲了 年轻 时 出海 的 故事 。", "Một cụ già dạy em trai thắt nút đơn giản và kể chuyện ra biển thời trẻ."),
        sentence("中午 雨 小了 ， 海面 上 出现 一层 白色 的 雾 ， 景色 非常 安静 。", "Buổi trưa mưa nhỏ, trên mặt biển xuất hiện lớp sương trắng, cảnh vật vô cùng yên tĩnh."),
        sentence("弟弟 拍了 很多 照片 ， 说 这 比 原来 的 计划 更 特别 。", "Em trai chụp nhiều ảnh và nói trải nghiệm này đặc biệt hơn kế hoạch ban đầu."),
        sentence("旅行 的 意义 也许 不是 完成 所有 安排 ， 而是 发现 没想到 的 风景 。", "Ý nghĩa chuyến đi có lẽ không phải hoàn thành mọi sắp xếp mà là phát hiện cảnh sắc không ngờ tới.")
      ])
    ]
  ),
  article(
    "hsk4-volunteer-market",
    "周末的旧物交换会",
    "Ngày hội đổi đồ cũ cuối tuần",
    "Một nhóm tình nguyện tổ chức phiên đổi đồ và điều chỉnh kế hoạch sau sự cố bất ngờ.",
    "HSK 4",
    "Kế hoạch",
    [
      section("让旧物找到新主人", "Để đồ cũ tìm được chủ mới", [
        sentence("大学 志愿者 计划 举办 一次 旧物 交换会 ， 鼓励 大家 减少 浪费 。", "Nhóm tình nguyện đại học dự định tổ chức ngày hội đổi đồ cũ để khuyến khích giảm lãng phí."),
        sentence("参加者 可以 带来 干净 的 书 、 衣服 或者 小型 生活用品 。", "Người tham gia có thể mang sách, quần áo hoặc đồ dùng nhỏ đã làm sạch."),
        sentence("每件 物品 会 得到 相应 的 点数 ， 人们 再 用 点数 选择 需要 的 东西 。", "Mỗi món nhận số điểm tương ứng rồi mọi người dùng điểm chọn thứ cần."),
        sentence("为了 避免 现场 混乱 ， 志愿者 提前 按照 种类 安排了 不同 区域 。", "Để tránh hỗn loạn tại chỗ, tình nguyện viên sắp xếp khu vực theo loại từ trước."),
        sentence("他们 还 提醒 大家 ， 交换 的 目的 不是 得到 最贵 的 商品 。", "Họ còn nhắc rằng mục đích trao đổi không phải lấy món đắt nhất.")
      ]),
      section("一场大雨的考验", "Thử thách từ một trận mưa lớn", [
        sentence("活动 开始 不久 突然 下起 大雨 ， 原来 的 室外 场地 不能 继续 使用 。", "Không lâu sau khi hoạt động bắt đầu, mưa lớn bất ngờ khiến địa điểm ngoài trời không thể dùng tiếp."),
        sentence("负责人 立刻 联系 学校 ， 把 活动 搬到 附近 的 体育馆 里面 。", "Người phụ trách lập tức liên hệ trường và chuyển hoạt động vào nhà thi đấu gần đó."),
        sentence("志愿者 一边 保护 物品 ， 一边 引导 参加者 安全 地 移动 。", "Tình nguyện viên vừa bảo vệ đồ vừa hướng dẫn người tham gia di chuyển an toàn."),
        sentence("虽然 浪费了 一些 时间 ， 但是 没有 一件 物品 被 雨 淋坏 。", "Dù mất chút thời gian nhưng không món đồ nào bị mưa làm hỏng."),
        sentence("活动 结束 后 ， 剩下 的 东西 全部 送给了 需要 帮助 的 家庭 。", "Sau hoạt động, toàn bộ đồ còn lại được tặng cho các gia đình cần giúp đỡ.")
      ])
    ]
  ),
  article(
    "hsk5-overtime-evaluation",
    "晚下班就更努力吗",
    "Ở lại muộn có nghĩa là chăm chỉ hơn?",
    "Một nhóm thay đổi cách đánh giá nhân viên sau khi nhận ra thời gian ở văn phòng không phản ánh đúng hiệu quả.",
    "HSK 5",
    "Công sở",
    [
      section("看得见的勤奋", "Sự chăm chỉ có thể nhìn thấy", [
        sentence("公司 过去 有一种 习惯 ， 谁 晚上 留在 办公室 ， 谁 就 容易 被 认为 更 努力 。", "Công ty trước đây có một thói quen: ai ở lại văn phòng buổi tối thì dễ được xem là chăm chỉ hơn."),
        sentence("新员工 小赵 为了 给 经理 留下 好 印象 ， 即使 工作 完成了 也 不敢 按时 下班 。", "Nhân viên mới Tiểu Triệu dù hoàn thành công việc vẫn không dám tan ca đúng giờ vì muốn tạo ấn tượng tốt với quản lý."),
        sentence("相反 ， 有位 同事 每天 准时 离开 ， 因此 常 被 怀疑 对 工作 不够 积极 。", "Ngược lại, một đồng nghiệp ngày nào cũng rời đi đúng giờ nên thường bị nghi là chưa đủ tích cực."),
        sentence("后来 经理 查看 项目 记录 才 发现 ， 那位 同事 不但 任务 完成得 快 ， 质量 也 最 稳定 。", "Sau đó quản lý xem hồ sơ dự án mới phát hiện người ấy không chỉ hoàn thành nhanh mà chất lượng còn ổn định nhất."),
        sentence("而 一些 经常 加班 的 人 ， 白天 却 花了 不少 时间 等待 指示 或者 重复 修改 。", "Trong khi đó, một số người thường tăng ca lại tốn khá nhiều thời gian ban ngày để chờ chỉ dẫn hoặc sửa đi sửa lại.")
      ]),
      section("从时间转向结果", "Chuyển từ thời gian sang kết quả", [
        sentence("经理 决定 取消 没有 必要 的 晚间 会议 ， 并且 明确 每项 任务 的 目标 和 期限 。", "Quản lý quyết định hủy các cuộc họp tối không cần thiết và xác định rõ mục tiêu, thời hạn từng nhiệm vụ."),
        sentence("员工 可以 自己 安排 工作 顺序 ， 遇到 阻碍 时 则 要 及时 说明 原因 。", "Nhân viên có thể tự sắp xếp thứ tự công việc, còn khi gặp trở ngại phải giải thích nguyên nhân kịp thời."),
        sentence("三个月 后 ， 团队 的 加班 时间 减少了 ， 项目 延迟 的 情况 也 变少了 。", "Ba tháng sau, thời gian tăng ca của nhóm giảm và tình trạng dự án chậm cũng ít đi."),
        sentence("小赵 终于 明白 ， 职业 态度 不是 表演 忙碌 ， 而是 对 承诺 的 结果 负责 。", "Tiểu Triệu cuối cùng hiểu rằng thái độ nghề nghiệp không phải biểu diễn sự bận rộn mà là chịu trách nhiệm với kết quả đã cam kết."),
        sentence("真正 公平 的 评价 应该 关注 贡献 ， 而不是 谁 最后一个 关掉 办公室 的 灯 。", "Đánh giá thật sự công bằng nên chú ý đóng góp, không phải ai là người cuối cùng tắt đèn văn phòng.")
      ])
    ]
  ),
  article(
    "hsk5-repair-clothes",
    "旧衣服的第二次机会",
    "Cơ hội thứ hai của quần áo cũ",
    "Một cửa hàng sửa chữa quần áo giúp khách nhìn lại thói quen mua mới rồi bỏ.",
    "HSK 5",
    "May mặc",
    [
      section("不是坏了就要扔", "Hỏng không có nghĩa là phải vứt", [
        sentence("小区 附近 新开了 一家 小店 ， 门口 没有 展示 新 衣服 ， 只 挂着 几件 修补过 的 外套 。", "Gần khu dân cư mở một cửa hàng nhỏ, trước cửa không trưng đồ mới mà chỉ treo vài chiếc áo khoác đã sửa."),
        sentence("店主 原来 在 服装 工厂 工作 ， 她 发现 很多 衣服 只是 拉链 坏了 或者 袖口 磨破 ， 就 被 扔掉 。", "Chủ tiệm từng làm ở nhà máy may và nhận ra nhiều quần áo chỉ hỏng khóa hoặc sờn cổ tay đã bị vứt đi."),
        sentence("她 希望 通过 修改 尺寸 、 更换 零件 和 重新 染色 ， 延长 衣服 的 使用 时间 。", "Cô muốn kéo dài thời gian sử dụng quần áo bằng cách sửa kích cỡ, thay phụ kiện và nhuộm lại."),
        sentence("起初 有些 顾客 觉得 修理 旧衣 不值得 ， 因为 便宜 的 新衣 随时 都 能 买到 。", "Ban đầu một số khách cho rằng sửa đồ cũ không đáng vì quần áo mới giá rẻ có thể mua bất cứ lúc nào."),
        sentence("但是 当 他们 看到 一件 普通 衬衫 经过 修改 变得 更 合身 时 ， 态度 慢慢 改变了 。", "Nhưng khi thấy một chiếc sơ mi bình thường trở nên vừa vặn hơn sau khi sửa, thái độ của họ dần thay đổi.")
      ]),
      section("修补的是物品也是记忆", "Sửa món đồ, giữ ký ức", [
        sentence("一位 老人 带来 丈夫 年轻 时 穿过 的 大衣 ， 希望 改成 适合 自己 的 长度 。", "Một cụ bà mang chiếc áo khoác chồng từng mặc thời trẻ và muốn sửa thành chiều dài phù hợp với mình."),
        sentence("大衣 的 布料 已经 有些 旧 ， 可是 保存得 很好 ， 里面 还 留着 丈夫 写的 名字 。", "Vải áo đã hơi cũ nhưng được giữ rất tốt, bên trong còn tên do chồng bà viết."),
        sentence("店主 花了 两周 调整 肩部 和 衣领 ， 同时 尽量 保留 原来 的 样子 。", "Chủ tiệm dành hai tuần chỉnh vai và cổ áo, đồng thời cố giữ dáng ban đầu."),
        sentence("老人 试穿 时 眼睛 红了 ， 她 说 这件 衣服 又 能 陪 自己 生活 许多年 。", "Khi thử áo, mắt bà đỏ lên; bà nói chiếc áo lại có thể đồng hành cùng mình nhiều năm."),
        sentence("修补 并不 只是 节省 钱 ， 它 也 提醒 人们 认真 对待 已经 拥有 的 东西 。", "Sửa chữa không chỉ tiết kiệm tiền mà còn nhắc mọi người trân trọng những gì đã có.")
      ])
    ]
  ),
  article(
    "hsk5-inclusive-coat",
    "为老人设计的一件外套",
    "Chiếc áo khoác được thiết kế cho người cao tuổi",
    "Một sinh viên thiết kế thay đổi sản phẩm sau khi thật sự quan sát những khó khăn của người mặc.",
    "HSK 5",
    "Thiết kế",
    [
      section("漂亮却不好穿", "Đẹp nhưng khó mặc", [
        sentence("服装 专业 的 学生 林然 参加 比赛 时 ， 决定 为 老年人 设计 一件 冬季 外套 。", "Sinh viên ngành thời trang Lâm Nhiên quyết định thiết kế áo khoác mùa đông cho người cao tuổi khi tham gia cuộc thi."),
        sentence("她 最初 的 作品 颜色 大方 、 线条 简单 ， 老师 却 没有 马上 表扬 。", "Tác phẩm ban đầu có màu trang nhã và đường nét đơn giản nhưng giáo viên không khen ngay."),
        sentence("老师 请 她 戴上 厚 手套 ， 再 尝试 扣好 那些 小小的 扣子 。", "Giáo viên yêu cầu cô đeo găng dày rồi thử cài những chiếc cúc nhỏ."),
        sentence("林然 这才 发现 ， 对 手指 不灵活 的 人 来说 ， 普通 扣子 会 带来 很大 麻烦 。", "Lúc ấy Lâm Nhiên mới nhận ra cúc thường gây nhiều khó khăn cho người có ngón tay kém linh hoạt."),
        sentence("她 又 去 社区 访问 几位 老人 ， 了解 他们 穿衣 时 真正 遇到 的 困难 。", "Cô còn đến cộng đồng hỏi thăm vài người cao tuổi để hiểu khó khăn thật sự khi mặc đồ.")
      ]),
      section("让细节照顾使用者", "Để chi tiết chăm sóc người dùng", [
        sentence("新的 外套 用 磁铁 代替 部分 扣子 ， 但 外面 仍然 保留 传统 的 外观 。", "Áo mới dùng nam châm thay một phần cúc nhưng bên ngoài vẫn giữ dáng vẻ truyền thống."),
        sentence("口袋 的 位置 被 提高 ， 老人 不用 弯腰 就 能 拿到 手机 和 钥匙 。", "Vị trí túi được nâng lên để người cao tuổi không cần cúi vẫn lấy được điện thoại và chìa khóa."),
        sentence("衣服 背后 增加了 一条 反光 材料 ， 晚上 出门 时 更 容易 被 车辆 看见 。", "Phía sau áo thêm một dải phản quang để khi ra ngoài ban đêm dễ được xe cộ nhìn thấy hơn."),
        sentence("比赛 评委 认为 ， 这件 外套 的 价值 不在于 技术 复杂 ， 而在于 理解 使用者 。", "Ban giám khảo cho rằng giá trị áo không nằm ở kỹ thuật phức tạp mà ở sự thấu hiểu người sử dụng."),
        sentence("林然 也 明白了 ， 设计 不是 替 别人 决定 什么 好 ， 而是 帮助 他们 更 自由 地 生活 。", "Lâm Nhiên cũng hiểu thiết kế không phải quyết định thay người khác điều gì tốt mà là giúp họ sống tự do hơn.")
      ])
    ]
  ),
  article(
    "hsk5-write-first-meeting",
    "先写再说的会议",
    "Cuộc họp viết trước rồi mới nói",
    "Một đội sản phẩm thử phương pháp họp mới để ý tưởng không bị quyết định bởi người nói nhiều nhất.",
    "HSK 5",
    "Công sở",
    [
      section("声音大不等于想法好", "Nói lớn không có nghĩa ý tưởng hay", [
        sentence("产品 团队 每次 讨论 新 功能 时 ， 总是 几位 性格 外向 的 同事 说得 最多 。", "Mỗi lần nhóm sản phẩm thảo luận tính năng mới, vài đồng nghiệp hướng ngoại luôn nói nhiều nhất."),
        sentence("其他 人 即使 有 不同 看法 ， 也 常常 因为 找不到 合适 时机 而 保持 沉默 。", "Những người khác dù có quan điểm khác vẫn thường im lặng vì không tìm được thời điểm thích hợp."),
        sentence("有一次 大家 很快 同意了 一个 方案 ， 开始 实施 后 才 发现 存在 明显 风险 。", "Một lần mọi người nhanh chóng đồng ý một phương án nhưng khi triển khai mới phát hiện rủi ro rõ ràng."),
        sentence("一名 平时 很少 发言 的 工程师 说 ， 他 其实 早就 想到 这个 问题 ， 只是 没有 机会 说明 。", "Một kỹ sư ít phát biểu nói rằng anh đã nghĩ đến vấn đề từ sớm nhưng không có cơ hội trình bày."),
        sentence("负责人 因此 决定 改变 会议 顺序 ， 让 每个人 先 安静 地 写下 判断 。", "Người phụ trách vì thế đổi thứ tự họp, để mọi người trước tiên yên lặng viết nhận định.")
      ]),
      section("不同意见终于出现", "Ý kiến khác biệt cuối cùng xuất hiện", [
        sentence("会议 开始 的 前 十分钟 不许 讲话 ， 所有人 都 阅读 资料 并 写下 支持 或 反对 的 理由 。", "Mười phút đầu cuộc họp không được nói; mọi người đọc tài liệu và viết lý do ủng hộ hoặc phản đối."),
        sentence("之后 每个人 轮流 分享 一个 重点 ， 不能 重复 已经 提到 的 内容 。", "Sau đó mỗi người lần lượt chia sẻ một trọng điểm và không lặp nội dung đã nêu."),
        sentence("这样 一来 ， 安静 的 同事 也 能 完整 表达 ， 讨论 中 出现了 更多 角度 。", "Nhờ vậy, đồng nghiệp ít nói cũng trình bày trọn vẹn và cuộc thảo luận có thêm nhiều góc nhìn."),
        sentence("团队 并没有 因为 意见 增加 而 更难 决定 ， 反而 更快 看清 每个 选择 的 代价 。", "Nhóm không khó quyết định hơn vì nhiều ý kiến mà ngược lại nhìn rõ cái giá của từng lựa chọn nhanh hơn."),
        sentence("好的 会议 不是 让 所有人 同意 ， 而是 让 重要 的 不同 意见 都 有 机会 被 听见 。", "Cuộc họp tốt không phải khiến tất cả đồng ý mà là cho mọi ý kiến khác biệt quan trọng cơ hội được lắng nghe.")
      ])
    ]
  ),
  article(
    "hsk5-old-tree-debate",
    "老树该不该被搬走",
    "Có nên di dời cây cổ thụ?",
    "Một khu phố tìm giải pháp cân bằng giữa an toàn giao thông, ký ức cộng đồng và môi trường.",
    "HSK 5",
    "Kế hoạch",
    [
      section("一棵树引起的争论", "Cuộc tranh luận từ một cái cây", [
        sentence("老街 路口 有 一棵 生长了 七十年 的 大树 ， 树下 是 邻居们 常 休息 的 地方 。", "Ở ngã tư phố cũ có cây lớn bảy mươi năm tuổi, dưới gốc là nơi hàng xóm thường nghỉ chân."),
        sentence("随着 车辆 增加 ， 有人 认为 树干 挡住 视线 ， 建议 把 树 搬到 公园 。", "Khi xe cộ tăng lên, có người cho rằng thân cây che tầm nhìn và đề nghị chuyển cây vào công viên."),
        sentence("另一些 居民 反对 ， 因为 这棵树 不仅 提供 阴凉 ， 还 保存着 几代人 的 回忆 。", "Những cư dân khác phản đối vì cây không chỉ tạo bóng mát mà còn lưu ký ức nhiều thế hệ."),
        sentence("双方 在 网上 争论了 很久 ， 却 都 没有 实际 测量 交通 风险 。", "Hai bên tranh luận lâu trên mạng nhưng không ai thực sự đo mức rủi ro giao thông."),
        sentence("社区 最后 邀请 交通 专家 和 植物 专家 一起 到 现场 调查 。", "Cuối cùng cộng đồng mời chuyên gia giao thông và thực vật cùng khảo sát tại chỗ.")
      ]),
      section("不是只有留下或搬走", "Không chỉ có giữ lại hoặc di dời", [
        sentence("调查 发现 ， 真正 影响 视线 的 主要 是 树旁边 随意 停放 的 车辆 。", "Khảo sát cho thấy thứ thực sự ảnh hưởng tầm nhìn chủ yếu là xe đỗ tùy tiện cạnh cây."),
        sentence("专家 建议 取消 两个 停车位 ， 修剪 部分 树枝 ， 并且 调整 红绿灯 的 位置 。", "Chuyên gia đề nghị bỏ hai chỗ đỗ xe, tỉa một phần cành và điều chỉnh vị trí đèn giao thông."),
        sentence("经过 一个月 试验 ， 路口 的 事故 风险 明显 降低 ， 大树 也 被 保留下来 。", "Sau một tháng thử nghiệm, rủi ro tai nạn ở giao lộ giảm rõ rệt và cây lớn cũng được giữ lại."),
        sentence("居民们 意识到 ， 如果 只 在 两个 极端 答案 中 选择 ， 很多 可能性 就 会 被 忽略 。", "Cư dân nhận ra nếu chỉ chọn giữa hai đáp án cực đoan thì nhiều khả năng sẽ bị bỏ qua."),
        sentence("面对 公共 问题 ， 先 收集 事实 再 讨论 价值 ， 往往 比 互相 指责 更有用 。", "Đối mặt vấn đề công cộng, thu thập sự thật trước rồi bàn giá trị thường hữu ích hơn chỉ trích nhau.")
      ])
    ]
  ),
  article(
    "hsk5-recording-grandfather",
    "录下爷爷的故事",
    "Ghi lại câu chuyện của ông",
    "Một người trẻ học cách lưu giữ ký ức gia đình bằng việc lắng nghe thay vì chỉ thu âm.",
    "HSK 5",
    "Đời sống",
    [
      section("从一张旧照片问起", "Bắt đầu bằng một bức ảnh cũ", [
        sentence("整理 房间 时 ， 我 找到 一张 爷爷 年轻 时 在 火车站 工作 的 黑白 照片 。", "Khi dọn phòng, tôi tìm thấy bức ảnh đen trắng ông làm việc ở ga tàu lúc trẻ."),
        sentence("照片 后面 只 写着 一个 年份 ， 家里 没人 知道 当天 发生过 什么 。", "Sau ảnh chỉ ghi một năm và không ai trong nhà biết hôm đó từng xảy ra chuyện gì."),
        sentence("我 担心 这些 记忆 将来 消失 ， 于是 决定 用 手机 录下 爷爷 的 回忆 。", "Tôi lo những ký ức ấy mai này biến mất nên quyết định dùng điện thoại ghi lại hồi ức của ông."),
        sentence("第一次 采访 时 ， 我 准备了 很多 问题 ， 结果 像 完成 任务 一样 问得 太快 。", "Lần phỏng vấn đầu, tôi chuẩn bị nhiều câu hỏi nhưng hỏi quá nhanh như đang hoàn thành nhiệm vụ."),
        sentence("爷爷 只 简单 回答 几句 ， 录音 里 虽然 没有 空白 ， 却 听不出 生活 的 味道 。", "Ông chỉ trả lời ngắn; bản ghi tuy không có khoảng trống nhưng chẳng nghe ra hương vị cuộc sống.")
      ]),
      section("让记忆慢慢打开", "Để ký ức từ từ mở ra", [
        sentence("第二次 我 没有 带 问题表 ， 只 把 那张 照片 放在 爷爷 面前 。", "Lần thứ hai tôi không mang bảng câu hỏi mà chỉ đặt bức ảnh trước mặt ông."),
        sentence("爷爷 看了 很久 ， 主动 讲起 第一天 上班 时 如何 因为 紧张 坐错了 火车 。", "Ông nhìn rất lâu rồi chủ động kể ngày đầu đi làm đã lên nhầm tàu vì căng thẳng thế nào."),
        sentence("他说到 老同事 的 玩笑 、 冬天 的 风 ， 以及 母亲 送给 他 的 午饭 。", "Ông kể chuyện đùa của đồng nghiệp cũ, gió mùa đông và bữa trưa mẹ chuẩn bị cho ông."),
        sentence("我 终于 明白 ， 记录 家庭 历史 不只是 保存 声音 ， 更重要 的 是 给 对方 时间 。", "Tôi cuối cùng hiểu ghi lại lịch sử gia đình không chỉ là lưu âm thanh mà quan trọng hơn là cho đối phương thời gian."),
        sentence("后来 我们 每周 聊 一次 ， 那张 沉默 多年 的 照片 逐渐 变成了 一段 完整 的 故事 。", "Sau đó chúng tôi trò chuyện mỗi tuần và bức ảnh im lặng nhiều năm dần trở thành một câu chuyện hoàn chỉnh.")
      ])
    ]
  ),
  article(
    "hsk5-listening-volunteer",
    "少说一点，多听一些",
    "Nói ít đi, nghe được nhiều hơn",
    "Một tình nguyện viên nhận ra giúp đỡ không bắt đầu từ lời khuyên mà từ việc hiểu nhu cầu thật.",
    "HSK 5",
    "Đời sống",
    [
      section("热心的建议没有用", "Lời khuyên nhiệt tình không có tác dụng", [
        sentence("大学生 阿文 每周 去 社区 陪伴 一位 独居 老人 ， 他 总想 帮 对方 解决 问题 。", "Sinh viên A Văn mỗi tuần đến cộng đồng thăm một cụ già sống một mình và luôn muốn giúp giải quyết vấn đề."),
        sentence("老人 说 最近 睡不好 ， 阿文 马上 推荐 运动 、 音乐 和 各种 放松 方法 。", "Khi cụ nói gần đây ngủ không ngon, A Văn lập tức khuyên tập thể dục, nghe nhạc và nhiều cách thư giãn."),
        sentence("老人 每次 都 礼貌 地 点头 ， 可是 下周 见面 时 情况 并没有 改变 。", "Mỗi lần cụ đều lịch sự gật đầu nhưng tuần sau gặp lại tình hình chẳng thay đổi."),
        sentence("负责 志愿者 培训 的 老师 提醒 阿文 ， 他 说了 很多 ， 却 没 问 老人 为什么 睡不着 。", "Giáo viên phụ trách đào tạo tình nguyện viên nhắc A Văn rằng cậu nói nhiều nhưng chưa hỏi vì sao cụ mất ngủ."),
        sentence("阿文 才 意识到 ， 自己 把 帮助 理解成 提供 答案 ， 而不是 了解 对方 。", "A Văn mới nhận ra mình hiểu giúp đỡ là đưa đáp án chứ không phải tìm hiểu đối phương.")
      ]),
      section("真正的问题终于被听见", "Vấn đề thật cuối cùng được lắng nghe", [
        sentence("下次 见面 ， 阿文 放下 手机 ， 没有 急着 建议 ， 只 请 老人 慢慢 讲 。", "Lần gặp sau, A Văn đặt điện thoại xuống, không vội khuyên mà chỉ mời cụ từ từ kể."),
        sentence("老人 终于 说 ， 楼上 半夜 常有 搬动 家具 的 声音 ， 让 他 感到 不安 。", "Cuối cùng cụ nói tầng trên thường có tiếng kéo đồ lúc nửa đêm khiến cụ bất an."),
        sentence("阿文 陪 他 联系 邻居 后 才 发现 ， 对方 夜里 工作 ， 回家 时 没 注意 声音 。", "Sau khi A Văn cùng cụ liên hệ hàng xóm, họ mới biết người ấy làm đêm và không để ý tiếng động khi về."),
        sentence("邻居 调整了 生活 习惯 ， 老人 的 睡眠 很快 恢复 ， 双方 关系 也 没有 受到 伤害 。", "Hàng xóm điều chỉnh sinh hoạt, giấc ngủ của cụ nhanh chóng hồi phục và quan hệ hai bên cũng không bị tổn hại."),
        sentence("阿文 从中 学会 ， 有时候 最有效 的 帮助 不是 多说 ， 而是 让 隐藏 的 问题 被 听见 。", "A Văn học được rằng đôi khi giúp đỡ hiệu quả nhất không phải nói nhiều mà là để vấn đề ẩn giấu được lắng nghe.")
      ])
    ]
  ),
  article(
    "hsk5-learning-to-question",
    "从不会提问到会学习",
    "Từ không biết hỏi đến biết học",
    "Một sinh viên cải thiện việc học khi thay câu hỏi chung chung bằng những câu hỏi có bằng chứng và mục tiêu.",
    "HSK 5",
    "Học tập",
    [
      section("一句我不懂", "Một câu ‘em không hiểu’", [
        sentence("刚 上大学 时 ， 陈晨 遇到 难题 总 对 老师 说 我 完全 不懂 ， 请 再 讲 一遍 。", "Khi mới vào đại học, gặp bài khó Trần Thần luôn nói với giáo viên rằng em hoàn toàn không hiểu, xin giảng lại."),
        sentence("老师 即使 重新 解释 ， 他 也 常常 只能 听懂 当时 ， 回去 以后 又 不会 做 。", "Dù giáo viên giải thích lại, cậu thường chỉ hiểu lúc đó rồi về nhà lại không làm được."),
        sentence("一位 教授 告诉 他 ， 提问 之前 应该 先 说明 自己 已经 尝试了 什么 。", "Một giáo sư bảo cậu trước khi hỏi nên nói rõ bản thân đã thử những gì."),
        sentence("教授 还 要求 他 指出 从 哪一步 开始 失去 理解 ， 而不是 把 整个 问题 推给 别人 。", "Giáo sư còn yêu cầu chỉ ra từ bước nào bắt đầu không hiểu thay vì đẩy toàn bộ vấn đề cho người khác."),
        sentence("陈晨 起初 觉得 这样 很 麻烦 ， 后来 却 发现 准备 问题 本身 就是 一次 思考 。", "Ban đầu Trần Thần thấy cách này phiền nhưng sau nhận ra chuẩn bị câu hỏi tự nó đã là một lần suy nghĩ.")
      ]),
      section("问题变得越来越具体", "Câu hỏi ngày càng cụ thể", [
        sentence("他 开始 在 笔记 中 区分 已知 条件 、 自己 的 推断 和 没有 证据 的 猜测 。", "Cậu bắt đầu phân biệt trong ghi chép giữa điều kiện đã biết, suy luận của mình và phỏng đoán chưa có bằng chứng."),
        sentence("有时 写到 一半 ， 他 就 能 发现 计算 错误 ， 根本 不需要 再 去 问 老师 。", "Đôi khi viết được nửa chừng cậu đã phát hiện lỗi tính toán và hoàn toàn không cần hỏi giáo viên nữa."),
        sentence("真正 需要 帮助 时 ， 他 的 问题 也 从 为什么 不对 变成了 这个 假设 是否 合理 。", "Khi thật sự cần giúp, câu hỏi của cậu cũng chuyển từ ‘vì sao không đúng’ thành ‘giả thiết này có hợp lý không’."),
        sentence("老师 能 更快 找到 他 思考 中 的 关键 缺口 ， 回答 也 变得 更有 针对性 。", "Giáo viên có thể nhanh chóng tìm khoảng trống then chốt trong suy nghĩ của cậu và câu trả lời cũng sát vấn đề hơn."),
        sentence("会 提问 并不 表示 知识 少 ， 它 反而 说明 学习者 知道 自己 正在 寻找 什么 。", "Biết đặt câu hỏi không có nghĩa ít kiến thức mà cho thấy người học biết mình đang tìm điều gì.")
      ])
    ]
  ),
  article(
    "hsk5-market-and-supermarket",
    "菜市场旁边的新超市",
    "Siêu thị mới bên cạnh chợ thực phẩm",
    "Người bán hàng trong chợ điều chỉnh cách phục vụ thay vì chỉ cạnh tranh về giá với siêu thị mới.",
    "HSK 5",
    "Kế hoạch",
    [
      section("大家都担心生意", "Mọi người đều lo việc kinh doanh", [
        sentence("老 菜市场 旁边 要 开 一家 大型 超市 的 消息 传来 后 ， 摊主们 都 很 担心 。", "Sau khi có tin một siêu thị lớn sẽ mở cạnh chợ cũ, các chủ sạp đều rất lo."),
        sentence("他们 认为 超市 环境 干净 、 营业 时间 长 ， 还 经常 用 优惠 吸引 顾客 。", "Họ cho rằng siêu thị sạch sẽ, mở cửa lâu và thường dùng khuyến mãi thu hút khách."),
        sentence("有人 建议 所有 摊位 一起 降价 ， 但 老摊主 刘阿姨 认为 这样 只能 暂时 留住 生意 。", "Có người đề nghị mọi sạp cùng giảm giá, nhưng cô Lưu bán lâu năm cho rằng cách đó chỉ giữ khách tạm thời."),
        sentence("她 观察 顾客 几天 后 发现 ， 很多人 来 市场 是 为了 买 新鲜 食材 和 询问 做法 。", "Sau vài ngày quan sát, cô phát hiện nhiều người đến chợ để mua thực phẩm tươi và hỏi cách chế biến."),
        sentence("这些 经验 和 人情 味 正是 大型 超市 不容易 提供 的 优点 。", "Kinh nghiệm và sự gần gũi ấy chính là ưu điểm siêu thị lớn khó cung cấp.")
      ]),
      section("找到不能被代替的价值", "Tìm giá trị không thể thay thế", [
        sentence("摊主们 决定 保持 价格 合理 ， 同时 把 商品 来源 和 到货 时间 写得 更 清楚 。", "Các chủ sạp quyết định giữ giá hợp lý, đồng thời ghi rõ hơn nguồn hàng và thời gian nhập."),
        sentence("卖菜 的 人 分享 简单 菜谱 ， 卖鱼 的 人 则 免费 帮 顾客 处理 食材 。", "Người bán rau chia sẻ công thức đơn giản, còn người bán cá giúp khách sơ chế miễn phí."),
        sentence("市场 还 增加了 统一 的 清洁 时间 ， 并且 接受 顾客 对 卫生 问题 的 意见 。", "Chợ còn bổ sung giờ vệ sinh thống nhất và tiếp nhận ý kiến khách về vấn đề vệ sinh."),
        sentence("超市 开业 后 ， 市场 的 客人 确实 少了 一些 ， 但 熟客 仍然 愿意 回来 。", "Sau khi siêu thị khai trương, khách ở chợ quả thật ít hơn nhưng khách quen vẫn muốn quay lại."),
        sentence("竞争 不一定 意味着 模仿 对方 ， 有时 更重要 的 是 看清 自己 为什么 值得 被 选择 。", "Cạnh tranh không nhất thiết là bắt chước đối phương; đôi khi quan trọng hơn là thấy rõ vì sao mình đáng được lựa chọn.")
      ])
    ]
  )
];

import { expect, test, type Page } from "@playwright/test";
import { strToU8, zipSync } from "fflate";
import legacyLibraryState from "./fixtures/anonymized-v1-state.json" with {
  type: "json"
};

const LEGACY_LIBRARY_STATE_STORAGE_KEY = "scottbook.libraryState.v1";
const LIBRARY_STATE_STORAGE_KEY = "scottbook.libraryState.v2";

function createEpubBuffer(): Buffer {
  const archive = zipSync({
    mimetype: strToU8("application/epub+zip"),
    "META-INF/container.xml": strToU8(
      '<container version="1.0"><rootfiles><rootfile full-path="EPUB/book.opf"/></rootfiles></container>'
    ),
    "EPUB/book.opf": strToU8(`<package version="3.0">
      <metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">办公室故事</dc:title><dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">林老师</dc:creator></metadata>
      <manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="one" href="one.xhtml" media-type="application/xhtml+xml"/><item id="two" href="two.xhtml" media-type="application/xhtml+xml"/></manifest>
      <spine><itemref idref="one"/><itemref idref="two"/></spine>
    </package>`),
    "EPUB/nav.xhtml": strToU8('<nav epub:type="toc"><a href="one.xhtml">第一天</a><a href="two.xhtml">第二天</a></nav>'),
    "EPUB/one.xhtml": strToU8("<html><body><p>我今天来到新办公室。</p></body></html>"),
    "EPUB/two.xhtml": strToU8("<html><body><p>我们一起看新的设计图。</p></body></html>")
  });
  return Buffer.from(archive);
}

async function dismissInstallNotice(page: Page): Promise<void> {
  const dismiss = page.getByRole("button", { name: "Để sau", exact: true });
  if ((await dismiss.count()) > 0 && (await dismiss.first().isVisible())) {
    await dismiss.first().click();
  }
}

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("reads, reveals assistance, and keeps local preferences", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);

  await expect(
    page.getByRole("heading", { name: /别急着翻译/ })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();
  await expect(page.getByRole("heading", { name: "我的早上" })).toBeVisible();

  const firstToken = page.locator("[data-reader-token]").first();
  await expect(firstToken).toHaveAttribute("aria-label", /mở pinyin/);
  await firstToken.click();
  await expect(page.getByText("zǎo shang", { exact: true })).toBeVisible();
  await expect(page.getByText("tảo thượng", { exact: true })).toBeVisible();
  await firstToken.click();
  await expect(page.getByText("buổi sáng sớm", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Sáu giờ sáng, tôi thức dậy.", { exact: true })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Đóng trợ giúp", exact: true })
    .click();

  await firstToken.click();
  await page.evaluate(() =>
    window.dispatchEvent(
      new Event("scottbook:native-back", { cancelable: true })
    )
  );
  await expect(
    page.getByRole("button", { name: "Đóng trợ giúp", exact: true })
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Bật giao diện tối" }).click();
  await page.getByRole("button", { name: "Thêm bài vào yêu thích" }).click();
  await page.reload();

  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "night"
  );
  await expect(
    page.getByRole("button", { name: "Bỏ bài khỏi yêu thích" })
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Về thư viện" }).click();
  await page.getByRole("button", { name: /Yêu thích 1/ }).click();
  await expect(
    page.getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("exports, restores, and undoes a local backup", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/#/review");
  await dismissInstallNotice(page);
  await expect(page.getByText("IndexedDB v4", { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tải bản sao JSON" }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  if (!backupPath) throw new Error("Backup download did not expose a local path");

  await page.getByRole("button", { name: "Bật giao diện tối" }).click();
  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "night"
  );

  await page.locator('input[type="file"]').setInputFiles(backupPath);
  await expect(
    page.getByRole("heading", { name: "Xem trước bản khôi phục" })
  ).toBeVisible();
  await expect(page.getByText("Checksum hợp lệ")).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận khôi phục" }).click();
  await expect(page.getByText(/Đã khôi phục bản sao/)).toBeVisible();
  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "paper"
  );

  await page.getByRole("button", { name: "Hoàn tác lần khôi phục" }).click();
  await expect(page.getByText(/Đã hoàn tác/)).toBeVisible();
  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "night"
  );
  expect(pageErrors).toEqual([]);
});

test("imports pasted Chinese and reopens the analyzed book offline", async ({
  page,
  context
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/#/import");
  await dismissInstallNotice(page);

  await page.getByPlaceholder("Ví dụ: Một ngày ở Bắc Kinh").fill("Bài đọc riêng");
  await page.getByPlaceholder("Dán nội dung vào đây…").fill(
    "我喜欢学习中文。\n\n朋友每天看书，也用 ScottBook 😊。"
  );
  await page.getByRole("button", { name: "Xem trước" }).click();
  await expect(
    page.getByRole("heading", { name: "Bài đọc riêng", level: 2 })
  ).toBeVisible();
  await page.getByRole("button", { name: "Phân tích và lưu offline" }).click();

  await expect(page.getByRole("heading", { name: "Bài đọc riêng", exact: true })).toBeVisible({
    timeout: 20_000
  });
  await expect(page.getByText(/Phân tích tự động offline/)).toBeVisible();
  const firstToken = page.locator("[data-reader-token]").first();
  await firstToken.click();
  await expect(page.getByText("wǒ", { exact: true })).toBeVisible();
  await firstToken.click();
  await expect(page.locator(".assist-meaning")).not.toBeEmpty();
  await page.getByRole("button", { name: "Đóng trợ giúp" }).click();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Bài đọc riêng", exact: true })).toBeVisible();
  await expect(page.getByText("朋友每天看书，也用 ScottBook 😊。", { exact: true })).toBeVisible();
  await context.setOffline(false);
  expect(pageErrors).toEqual([]);
});

test("imports EPUB spine and reopens its chapter navigation offline", async ({
  page,
  context
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/#/import");
  await dismissInstallNotice(page);
  await page.getByRole("button", { name: "Chọn EPUB" }).click();
  await page.locator('input[accept*=".epub"]').setInputFiles({
    name: "office-story.epub",
    mimeType: "application/epub+zip",
    buffer: createEpubBuffer()
  });

  await expect(
    page.getByPlaceholder("Ví dụ: Một ngày ở Bắc Kinh")
  ).toHaveValue("办公室故事");
  await expect(
    page.getByPlaceholder("Tên tác giả hoặc nguồn")
  ).toHaveValue("林老师");
  await expect(page.getByText("2 chương có chữ Hán")).toBeVisible();
  await page.getByRole("button", { name: "Xem trước" }).click();
  await expect(page.getByRole("heading", { name: "第一天" })).toBeVisible();
  await page.getByRole("button", { name: "Phân tích và lưu offline" }).click();

  await expect(
    page.getByRole("heading", { name: "办公室故事", exact: true })
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Mục lục · 2 chương")).toBeVisible();
  await page.getByText("Mục lục · 2 chương").click();
  await page.getByRole("button", { name: "第二天", exact: true }).click();
  await expect(page.getByRole("heading", { name: "第二天" })).toBeInViewport();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Mục lục · 2 chương")).toBeVisible();
  await expect(page.getByText("我们一起看新的设计图。")).toBeVisible();
  await context.setOffline(false);
  expect(pageErrors).toEqual([]);
});

test("turns assistance into an editable local review list", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  const tokens = page.locator("[data-reader-token]");
  await tokens.nth(0).click();
  await tokens.nth(0).click();
  await tokens.nth(1).click();

  await page.getByRole("button", { name: "Về thư viện" }).click();
  await page.locator('a[href="#/review"]:visible').click();
  await expect(
    page.getByRole("heading", { name: "Chữ và từ/cụm từng cần trợ giúp" })
  ).toBeVisible();
  await expect(page.getByText("liù diǎn", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Chưa hiểu nghĩa 1/ }).click();
  await expect(page.getByText("zǎo shang", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ghim 早上", exact: true }).click();
  await page
    .getByRole("button", { name: "Đã biết 早上", exact: true })
    .click();
  await expect(page.getByText("zǎo shang", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: /Đã biết 1/ }).click();
  await expect(page.getByText("zǎo shang", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Xóa 早上 khỏi lịch sử trợ giúp" })
    .click();
  await expect(page.getByText("zǎo shang", { exact: true })).toHaveCount(0);
  await expect(
    page
      .getByLabel("Lịch sử đọc gần đây")
      .getByText("Wǒ de zǎo shang · Buổi sáng của tôi", { exact: true })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("keeps sentence help in Reader but reviews only lexical items", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .evaluate((button) => {
      window.scrollTo(0, document.body.scrollHeight);
      (button as HTMLButtonElement).click();
    });

  await page.getByRole("button", { name: "Chữ (字)" }).click();
  const scopeBar = page.locator(".reader-scope-bar");
  await expect(scopeBar).toHaveAttribute("data-compact", "false");
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(scopeBar).toHaveAttribute("data-compact", "true");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(scopeBar).toHaveAttribute("data-compact", "false");
  const firstCharacter = page.locator(
    '[data-assistance-key="s1:character:s1-t1:0"]'
  );
  await expect(firstCharacter).toHaveAccessibleName(/Chữ 早; mở pinyin/);
  await firstCharacter.click();
  await expect(page.getByText("zǎo", { exact: true })).toBeVisible();
  await expect(page.getByText("tảo", { exact: true })).toBeVisible();
  await firstCharacter.click();
  await expect(page.getByText("sớm", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Đóng trợ giúp", exact: true })
    .click();

  await page.getByRole("button", { name: "Câu (句)" }).click();
  const firstSentence = page.locator(
    '[data-assistance-key="s1:sentence:s1"]'
  );
  await expect(firstSentence).toHaveAccessibleName(
    /Câu 早上六点，我起床。; mở pinyin/
  );
  await firstSentence.click();
  await expect(
    page.getByText("zǎo shang liù diǎn， wǒ qǐ chuáng。", { exact: true })
  ).toBeVisible();
  await firstSentence.click();
  await expect(
    page.getByText("Sáu giờ sáng, tôi thức dậy.", { exact: true })
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Câu (句)" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.getByRole("button", { name: "Về thư viện" }).click();
  await page.locator('a[href="#/review"]:visible').click();
  await page.getByRole("button", { name: /Chưa hiểu nghĩa 1/ }).click();
  await expect(
    page.locator(".review-scope-badge", { hasText: "Chữ" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Câu", exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Tiến độ học của bạn" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tiếp tục Buổi sáng của tôi" })
  ).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Tiến độ HSK 1" })
  ).toBeVisible();
  await page
    .getByLabel("Tìm trong danh sách ôn lại")
    .fill("zao");
  await expect(page.getByText("zǎo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Chữ", exact: true }).click();
  await expect(page.getByText("zǎo", { exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Sắp xếp danh sách ôn lại" })
    .selectOption("alphabetical");
  await expect(
    page.getByRole("combobox", { name: "Sắp xếp danh sách ôn lại" })
  ).toHaveValue("alphabetical");
  expect(pageErrors).toEqual([]);
});

test("practices local review evidence from Hanzi to meaning", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  const tokens = page.locator("[data-reader-token]");
  await tokens.nth(0).click();
  await tokens.nth(0).click();
  await tokens.nth(1).click();
  await page.getByRole("button", { name: "Về thư viện" }).click();
  await page.locator('a[href="#/review"]:visible').click();
  await page
    .getByRole("link", { name: "Luyện nhanh · 2 mục", exact: true })
    .click();

  await expect(
    page.getByRole("heading", { name: "Luyện nhanh những chỗ từng vấp." })
  ).toBeVisible();
  await expect(page.locator(".practice-card > strong")).toHaveText("早上");
  await expect(page.getByText("zǎo shang", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Hiện pinyin" }).click();
  await expect(page.getByText("zǎo shang", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hiện nghĩa" }).click();
  await expect(page.getByText("buổi sáng sớm", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Đã nhớ" }).click();

  await expect(page.locator(".practice-card > strong")).toHaveText("六点");
  await page.getByRole("button", { name: "Hiện pinyin" }).click();
  await page.getByRole("button", { name: "Hiện nghĩa" }).click();
  await page.getByRole("button", { name: "Cần ôn lại" }).click();

  await expect(
    page.getByRole("heading", { name: "Đã đi qua 2 mục." })
  ).toBeVisible();
  await expect(page.locator(".practice-result-stats div").nth(0)).toContainText(
    "1Đã nhớ"
  );
  await expect(page.locator(".practice-result-stats div").nth(1)).toContainText(
    "1Cần ôn lại"
  );
  await page
    .getByRole("button", { name: "Về Ôn lại", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Đã biết 1/ })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("compares local assistance evidence by article and reopens the reader", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  const tokens = page.locator("[data-reader-token]");
  await tokens.nth(0).click();
  await tokens.nth(0).click();
  await tokens.nth(1).click();
  await page.getByRole("button", { name: "Về thư viện" }).click();
  await page.locator('a[href="#/review"]:visible').click();

  await expect(
    page.getByRole("heading", { name: "Bài nào từng cần trợ giúp nhiều?" })
  ).toBeVisible();
  const insight = page.getByRole("article", {
    name: "Dấu vết trợ giúp bài Buổi sáng của tôi"
  });
  await expect(insight).toContainText("3 lượt mở");
  await expect(insight).toContainText("2 mục đang ôn");
  await expect(
    insight.getByRole("progressbar", {
      name: "Tỉ lệ từ/cụm từng cần trợ giúp trong Buổi sáng của tôi"
    })
  ).toHaveAttribute("aria-valuenow", /[1-9][0-9]?|100/);

  await insight
    .getByRole("button", { name: "Đọc lại Buổi sáng của tôi" })
    .click();
  await expect(page).toHaveURL(/#\/read\/hsk1-my-morning$/);
  await expect(
    page.getByRole("heading", { name: "我的早上", level: 1 })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("returns from Review to the exact saved sentence context", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  const contextToken = page.locator(
    '[data-assistance-key="s4:word:s4-t8"]'
  );
  await contextToken.click();
  await page.getByRole("button", { name: "Về thư viện" }).click();
  await page.locator('a[href="#/review"]:visible').click();

  await page
    .getByRole("button", { name: "Mở đúng câu có 喜欢" })
    .click();
  await expect(page).toHaveURL(
    /#\/read\/hsk1-my-morning\/context\/s4$/
  );
  const targetSentence = page.locator(
    '.sentence[data-sentence-id="s4"][data-context-target="true"]'
  );
  await expect(targetSentence).toBeVisible();
  await expect(targetSentence).toBeInViewport();
  await expect(
    page.getByText("Đã mở đúng câu từ Ôn lại", { exact: true })
  ).toBeVisible();

  await page.getByRole("button", { name: "Về Ôn lại" }).first().click();
  await expect(page).toHaveURL(/#\/review$/);
  await expect(page.getByText("xǐ huan", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("searches the offline article vocabulary and jumps to its sentence", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  await page.getByRole("button", { name: "Mở từ trong bài" }).click();
  await expect(
    page.getByRole("heading", { name: "Từ trong bài" })
  ).toBeVisible();
  await expect(page.getByText("50 từ/cụm duy nhất")).toBeVisible();

  await page.getByLabel("Tìm trong bài này").fill("xihuan");
  await expect(page.getByText("1/50 từ/cụm", { exact: true })).toBeVisible();
  const vocabularyList = page.getByRole("list", {
    name: "Danh sách từ trong bài"
  });
  await expect(vocabularyList.getByText("喜欢", { exact: true })).toBeVisible();
  await expect(
    vocabularyList.getByText("xǐ huan", { exact: true })
  ).toBeVisible();
  await expect(vocabularyList.getByText(/thích/)).toBeVisible();
  await vocabularyList
    .getByRole("button", { name: "Tìm thêm ngữ cảnh của 喜欢" })
    .click();

  await expect(
    page.getByRole("group", { name: "Phạm vi ngữ cảnh của 喜欢" })
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Tới ngữ cảnh 1 của 喜欢 trong bài Buổi sáng của tôi"
    })
    .click();

  await expect(page).toHaveURL(/#\/read\/hsk1-my-morning$/);
  const targetSentence = page.locator(
    '.sentence[data-sentence-id="s4"][data-vocabulary-target="true"]'
  );
  await expect(targetSentence).toBeVisible();
  await expect(targetSentence).toBeInViewport();
  await targetSentence
    .locator('[data-assistance-key="s4:word:s4-t8"]')
    .click();
  await expect(page.getByText("xǐ huan", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("compares every authored context of a repeated article word", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  await page.getByRole("button", { name: "Mở từ trong bài" }).click();
  await page.getByLabel("Tìm trong bài này").fill("wo");
  await page
    .getByRole("button", { name: "Xem 7 ngữ cảnh của 我" })
    .click();

  await expect(page.getByText("7 ngữ cảnh trong bài")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Về danh sách từ" })
  ).toBeFocused();
  const contextList = page.getByRole("list", {
    name: "Các ngữ cảnh của 我"
  });
  await expect(contextList.getByRole("listitem")).toHaveCount(7);
  await expect(
    contextList.getByText("Sáu giờ sáng, tôi thức dậy.", { exact: true })
  ).toBeVisible();
  await expect(
    contextList.getByText("Tôi nói: Có, con rất thích tiết tiếng Trung.", {
      exact: true
    })
  ).toBeVisible();

  await contextList
    .getByRole("button", { name: "Tới ngữ cảnh 4 của 我" })
    .click();
  await expect(page).toHaveURL(/#\/read\/hsk1-my-morning$/);
  const targetSentence = page.locator(
    '.sentence[data-sentence-id="s4"][data-vocabulary-target="true"]'
  );
  await expect(targetSentence).toBeVisible();
  await expect(targetSentence).toBeInViewport();
  await targetSentence
    .locator('[data-assistance-key="s4:word:s4-t1"]')
    .click();
  await expect(page.getByText("wǒ", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("compares a word across the offline library and opens another article", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  await page.getByRole("button", { name: "Mở từ trong bài" }).click();
  await page.getByLabel("Tìm trong bài này").fill("wo");
  await page
    .getByRole("button", { name: "Xem 7 ngữ cảnh của 我" })
    .click();
  await page
    .getByRole("button", { name: "Cả thư viện · 158" })
    .click();

  await expect(page.getByText("158 ngữ cảnh · 31 bài")).toBeVisible();
  const weekendContexts = page.getByRole("region", {
    name: "Ngữ cảnh trong bài Kế hoạch cuối tuần"
  });
  await expect(
    weekendContexts.getByRole("heading", { name: "周末的计划" })
  ).toBeVisible();
  await expect(
    weekendContexts.getByText(
      "Cuối tuần này thời tiết khá đẹp, tôi muốn đi công viên cùng bạn.",
      { exact: true }
    )
  ).toBeVisible();
  await weekendContexts
    .getByRole("button", {
      name: "Tới ngữ cảnh 1 của 我 trong bài Kế hoạch cuối tuần"
    })
    .click();

  await expect(page).toHaveURL(
    /#\/read\/hsk2-weekend-plan\/context\/s1\/from-vocabulary\/hsk1-my-morning$/
  );
  await expect(
    page.getByText("Đã mở ngữ cảnh từ Từ trong bài", { exact: true })
  ).toBeVisible();
  const targetSentence = page.locator(
    '.sentence[data-sentence-id="s1"][data-vocabulary-target="true"]'
  );
  await expect(targetSentence).toBeVisible();
  await expect(targetSentence).toBeInViewport();
  await targetSentence
    .locator('[data-assistance-key="s1:word:s1-t6"]')
    .click();
  await expect(page.getByText("wǒ", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Về bài trước" }).first().click();
  await expect(page).toHaveURL(/#\/read\/hsk1-my-morning$/);
  expect(pageErrors).toEqual([]);
});

test("personalizes the reader layout and restores safe defaults", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  const article = page.locator(".reader-article");
  await page.getByRole("button", { name: "Mở cài đặt đọc" }).click();
  await expect(
    page.getByRole("heading", { name: "Cài đặt đọc" })
  ).toBeVisible();
  await page.getByRole("button", { name: /OLED/ }).click();
  await page.getByRole("button", { name: /Không chân/ }).click();
  await page.getByRole("button", { name: /Thoáng/ }).click();
  await page.getByRole("button", { name: /Rộng/ }).click();
  await page.locator("#reader-font-size").press("End");

  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "oled"
  );
  await expect(article).toHaveAttribute("data-reader-font", "sans");
  await expect(article).toHaveAttribute("data-reader-line-height", "airy");
  await expect(article).toHaveAttribute("data-reader-content-width", "wide");
  await expect(page.locator("#reader-font-size")).toHaveValue("38");
  await page.getByRole("button", { name: "Xong", exact: true }).click();

  await page.reload();
  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "oled"
  );
  await expect(article).toHaveAttribute("data-reader-font", "sans");
  await expect(article).toHaveAttribute("data-reader-line-height", "airy");
  await expect(article).toHaveAttribute("data-reader-content-width", "wide");

  await page.getByRole("button", { name: "Mở cài đặt đọc" }).click();
  await page
    .getByRole("button", { name: "Đặt lại mặc định", exact: true })
    .click();
  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "paper"
  );
  await expect(article).toHaveAttribute("data-reader-font", "serif");
  await expect(article).toHaveAttribute(
    "data-reader-line-height",
    "comfortable"
  );
  await expect(article).toHaveAttribute(
    "data-reader-content-width",
    "balanced"
  );
  await expect(page.locator("#reader-font-size")).toHaveValue("25");
  expect(pageErrors).toEqual([]);
});

test("searches and filters the authored offline library", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);

  const search = page.getByRole("searchbox", {
    name: "Tìm trong thư viện offline"
  });
  await search.fill("xian lijie");
  await expect(
    page.getByRole("button", { name: "Mở bài Hiểu trước, rồi mới dịch" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Xóa nội dung tìm kiếm" }).click();
  const levelFilters = page.getByRole("group", {
    name: "Lọc theo cấp độ HSK"
  });
  await levelFilters.getByRole("button", { name: /HSK 2/ }).click();
  await expect(
    page.getByRole("button", { name: "Mở bài Kế hoạch cuối tuần" })
  ).toBeVisible();
  await expect(
    page.locator(".discovery-results [role='status']")
  ).toContainText("9 bài phù hợp");

  await page
    .getByRole("button", {
      name: "Thêm Kế hoạch cuối tuần vào mục yêu thích"
    })
    .click();
  const statusFilters = page.getByRole("group", {
    name: "Lọc theo trạng thái đọc"
  });
  await statusFilters.getByRole("button", { name: /Yêu thích/ }).click();
  await expect(
    page.getByRole("button", { name: "Mở bài Kế hoạch cuối tuần" })
  ).toBeVisible();

  await search.fill("không có bài này");
  await expect(
    page.getByText("Không tìm thấy bài phù hợp.", { exact: true })
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc", exact: true }).first().click();
  await expect(
    page.getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
  ).toBeVisible();
  await expect(
    page.locator(".discovery-results [role='status']")
  ).toContainText("75 bài phù hợp");
  expect(pageErrors).toEqual([]);
});

test("filters Discover and reviews an article before starting to read", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/#/discover");
  await dismissInstallNotice(page);

  await expect(
    page.getByRole("heading", { name: /Chọn nhịp đọc/ })
  ).toBeVisible();
  await page
    .getByRole("group", { name: "Lọc Khám phá theo cấp độ HSK" })
    .getByRole("button", { name: /HSK 2/ })
    .click();
  await page
    .getByRole("group", { name: "Lọc Khám phá theo chủ đề" })
    .getByRole("button", { name: /Học tập/ })
    .click();
  await page
    .getByRole("group", { name: "Lọc Khám phá theo độ dài bài đọc" })
    .getByRole("button", { name: /Vừa · khoảng 4–5 phút/ })
    .click();
  await expect(
    page.locator(".discover-filter-panel [role='status']")
  ).toContainText("1 bài phù hợp");

  await page
    .getByRole("button", { name: "Xem thông tin Đi thư viện" })
    .click();
  await expect(page.getByRole("heading", { name: "去图书馆" })).toBeVisible();
  await expect(page.getByText("Cụm đã chú giải", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/Mở trang này không thay đổi tiến độ/)
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chưa bắt đầu" })).toBeVisible();

  await page
    .getByRole("button", { name: "Thêm Đi thư viện vào mục yêu thích" })
    .click();
  await expect(
    page.getByRole("button", { name: "Bỏ Đi thư viện khỏi mục yêu thích" })
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Đọc ngay Đi thư viện" }).click();
  await expect(page.getByRole("heading", { name: "去图书馆" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("reads a newly authored article from the expanded content pack", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);

  const search = page.getByRole("searchbox", {
    name: "Tìm trong thư viện offline"
  });
  await search.fill("tien bo");
  await page
    .getByRole("button", { name: "Mở bài Mỗi ngày tiến bộ một chút" })
    .click();

  await expect(
    page.getByRole("heading", { name: "每天进步一点" })
  ).toBeVisible();
  const firstToken = page.locator("[data-reader-token]").first();
  await expect(firstToken).toHaveAccessibleName(/为了; mở pinyin/);
  await firstToken.click();
  await expect(page.getByText("wèi le", { exact: true })).toBeVisible();
  await firstToken.click();
  await expect(page.getByText("để; nhằm mục đích; để mà", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Để nâng trình độ tiếng Trung, trước đây tôi tự xếp rất nhiều nhiệm vụ.",
      { exact: true }
    )
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("continues into the next unfinished offline article", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/#/read/hsk1-my-morning");
  await dismissInstallNotice(page);

  const nextReading = page.getByRole("region", {
    name: "我的家"
  });
  await expect(nextReading).toContainText("Bài chưa đọc tiếp theo");
  await expect(nextReading).toContainText("Wǒ de jiā");
  await expect(nextReading).toContainText("Gia đình tôi");
  await nextReading
    .getByRole("button", { name: "Đọc bài tiếp theo: Gia đình tôi" })
    .click();

  await expect(page).toHaveURL(/#\/read\/hsk1-my-family$/);
  await expect(
    page.getByRole("heading", { name: "我的家", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Bài chưa đọc tiếp theo")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("migrates an anonymized v1 reading snapshot", async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: LEGACY_LIBRARY_STATE_STORAGE_KEY, value: legacyLibraryState }
  );
  await page.goto("/");
  await dismissInstallNotice(page);

  await expect(
    page.getByRole("button", { name: "Tiếp tục bài Buổi sáng của tôi" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Bỏ Buổi sáng của tôi khỏi mục yêu thích"
    })
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const value = localStorage.getItem(key);
        return value ? (JSON.parse(value) as { version?: number }).version : null;
      }, LIBRARY_STATE_STORAGE_KEY)
    )
    .toBe(2);

  await page
    .getByRole("button", { name: "Tiếp tục bài Buổi sáng của tôi" })
    .click();
  await expect(
    page.getByRole("progressbar", { name: "Tiến độ bài đọc" })
  ).toHaveAttribute("aria-valuenow", "75");
  expect(pageErrors).toEqual([]);
});

test("reopens a precached article while the browser is offline", async ({
  context,
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();
  await expect(page.getByRole("heading", { name: "我的早上" })).toBeVisible();

  try {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "onLine", {
        configurable: true,
        get: () => false
      });
    });
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "我的早上" })).toBeVisible();
    await expect(page.getByTestId("connection-status")).toHaveCount(0);
  } finally {
    await context.setOffline(false);
  }
  expect(pageErrors).toEqual([]);
});

test("keeps the precached reading shell available without a status chip", async ({
  context,
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await expect(page.getByTestId("connection-status")).toHaveCount(0);

  try {
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(page.locator("#main-content")).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByTestId("connection-status")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

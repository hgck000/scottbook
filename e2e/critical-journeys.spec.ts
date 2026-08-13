import { expect, test, type Page } from "@playwright/test";
import legacyLibraryState from "./fixtures/anonymized-v1-state.json" with {
  type: "json"
};

const LEGACY_LIBRARY_STATE_STORAGE_KEY = "scottbook.libraryState.v1";
const LIBRARY_STATE_STORAGE_KEY = "scottbook.libraryState.v2";

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
    page.getByRole("heading", { name: /Đừng dịch vội/ })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();
  await expect(page.getByRole("heading", { name: "我的早上" })).toBeVisible();

  const firstToken = page.locator("[data-reader-token]").first();
  await expect(firstToken).toHaveAttribute("aria-label", /mở pinyin/);
  await firstToken.click();
  await expect(page.getByText("zǎoshang", { exact: true })).toBeVisible();
  await firstToken.click();
  await expect(page.getByText("buổi sáng", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Sáu giờ sáng, tôi thức dậy.", { exact: true })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Đóng trợ giúp", exact: true })
    .click();

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
  await expect(page.getByText("IndexedDB v3", { exact: true })).toBeVisible();

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
    page.getByRole("heading", { name: "Chữ, từ và câu từng cần trợ giúp" })
  ).toBeVisible();
  await expect(page.getByText("liù diǎn", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Chưa hiểu nghĩa 1/ }).click();
  await expect(page.getByText("zǎoshang", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ghim 早上", exact: true }).click();
  await page
    .getByRole("button", { name: "Đã biết 早上", exact: true })
    .click();
  await expect(page.getByText("zǎoshang", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: /Đã biết 1/ }).click();
  await expect(page.getByText("zǎoshang", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Xóa 早上 khỏi lịch sử trợ giúp" })
    .click();
  await expect(page.getByText("zǎoshang", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("Wǒ de zǎoshang · Buổi sáng của tôi", { exact: true })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("switches authored assistance between character, word, and sentence", async ({
  page
}) => {
  const pageErrors = collectPageErrors(page);
  await page.goto("/");
  await dismissInstallNotice(page);
  await page
    .getByRole("button", { name: "Mở bài Buổi sáng của tôi" })
    .click();

  await page.getByRole("button", { name: "Chữ (字)" }).click();
  const firstCharacter = page.locator(
    '[data-assistance-key="s1:character:s1-t1:0"]'
  );
  await expect(firstCharacter).toHaveAccessibleName(/Chữ 早; mở pinyin/);
  await firstCharacter.click();
  await expect(page.getByText("zǎo", { exact: true })).toBeVisible();
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
    page.getByText("zǎoshang liù diǎn， wǒ qǐchuáng。", { exact: true })
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
  await page.getByRole("button", { name: /Chưa hiểu nghĩa 2/ }).click();
  await expect(
    page.locator(".review-scope-badge", { hasText: "Chữ" })
  ).toBeVisible();
  await expect(
    page.locator(".review-scope-badge", { hasText: "Câu" })
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Tìm trong danh sách ôn lại" })
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
  ).toContainText("3 bài phù hợp");

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
  ).toContainText("9 bài phù hợp");
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
    .getByRole("button", { name: /Vừa · 3 phút/ })
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
  await expect(page.getByText("wèile", { exact: true })).toBeVisible();
  await firstToken.click();
  await expect(page.getByText("để, nhằm", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Để nâng cao trình độ tiếng Trung, tôi lập cho mình một kế hoạch học tập đơn giản.",
      { exact: true }
    )
  ).toBeVisible();
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
    await expect(page.getByRole("status")).toContainText("Đang ngoại tuyến");
  } finally {
    await context.setOffline(false);
  }
  expect(pageErrors).toEqual([]);
});

import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { parseEpubFile } from "./epubParser";

function createEpub(options: {
  encrypted?: boolean;
  firstChapterHan?: boolean;
  secondChapterHan?: boolean;
} = {}): File {
  const chapterOne = options.firstChapterHan === false
    ? "<p>Hello from chapter one.</p>"
    : "<p>我喜欢学习中文。</p><p>每天读书很有意思。</p>";
  const chapterTwo = options.secondChapterHan === false
    ? "<p>Only an image description.</p>"
    : "<p>办公室里有新的设计图。</p>";
  const files: Record<string, Uint8Array> = {
    mimetype: strToU8("application/epub+zip"),
    "META-INF/container.xml": strToU8(`<?xml version="1.0"?>
      <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
        <rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles>
      </container>`),
    "EPUB/package.opf": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>我的 EPUB</dc:title><dc:creator>林老师</dc:creator>
        </metadata>
        <manifest>
          <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
          <item id="c1" href="chapters/one.xhtml" media-type="application/xhtml+xml"/>
          <item id="c2" href="chapters/two.xhtml" media-type="application/xhtml+xml"/>
        </manifest>
        <spine><itemref idref="c1"/><itemref idref="c2"/></spine>
      </package>`),
    "EPUB/nav.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
      <body><nav epub:type="toc"><ol>
        <li><a href="chapters/one.xhtml">第一课</a></li>
        <li><a href="chapters/two.xhtml">第二课</a></li>
      </ol></nav></body></html>`),
    "EPUB/chapters/one.xhtml": strToU8(`<html><head><title>Fallback one</title></head><body><script>坏代码</script><h1>旧标题</h1>${chapterOne}</body></html>`),
    "EPUB/chapters/two.xhtml": strToU8(`<html><body><h1>第二章</h1>${chapterTwo}</body></html>`)
  };
  if (options.encrypted) {
    files["META-INF/encryption.xml"] = strToU8("<encryption/>");
  }
  return new File([Uint8Array.from(zipSync(files)).buffer], "sample.epub", {
    type: "application/epub+zip"
  });
}

describe("EPUB import parsing", () => {
  it("follows container, manifest, spine, and navigation order", async () => {
    const parsed = await parseEpubFile(createEpub());

    expect(parsed.title).toBe("我的 EPUB");
    expect(parsed.author).toBe("林老师");
    expect(parsed.normalized.chapters).toEqual([
      { title: "第一课", paragraphIndex: 0 },
      { title: "第二课", paragraphIndex: 2 }
    ]);
    expect(parsed.normalized.paragraphs).toEqual([
      "我喜欢学习中文。",
      "每天读书很有意思。",
      "办公室里有新的设计图。"
    ]);
    expect(parsed.normalized.text).not.toContain("坏代码");
  });

  it("rejects encryption and skips chapters without Han text", async () => {
    await expect(parseEpubFile(createEpub({ encrypted: true }))).rejects.toThrow("DRM");
    await expect(parseEpubFile(createEpub({ firstChapterHan: false }))).resolves.toMatchObject({
      normalized: { chapters: [{ title: "第二课", paragraphIndex: 0 }] }
    });
    await expect(parseEpubFile(createEpub({
      firstChapterHan: false,
      secondChapterHan: false
    }))).rejects.toThrow("không có văn bản chữ Hán");
  });

  it("rejects another archive renamed to EPUB", async () => {
    const archive = Uint8Array.from(
      zipSync({ "hello.txt": strToU8("你好") })
    ).buffer;
    const file = new File([archive], "fake.epub");
    await expect(parseEpubFile(file)).rejects.toThrow("định danh EPUB");
  });
});

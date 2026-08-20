import { strFromU8, unzip } from "fflate";
import {
  MAX_IMPORT_CHARACTERS,
  type NormalizedImport,
  type NormalizedImportChapter
} from "./importedBook";

export const MAX_EPUB_FILE_BYTES = 20 * 1024 * 1024;
const MAX_EPUB_UNCOMPRESSED_BYTES = 40 * 1024 * 1024;
const MAX_EPUB_ENTRIES = 2_000;
const MAX_EPUB_CHAPTERS = 500;
const MAX_CONTENT_DOCUMENT_BYTES = 4 * 1024 * 1024;

export type ParsedEpub = {
  title: string;
  author: string | null;
  normalized: NormalizedImport;
};

type ManifestItem = {
  href: string;
  mediaType: string;
  properties: string;
};

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"'
  };
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/giu,
    (entity, key: string) => {
      if (key[0] === "#") {
        const hexadecimal = key[1]?.toLowerCase() === "x";
        const point = Number.parseInt(key.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
        return Number.isSafeInteger(point) && point > 0 && point <= 0x10ffff
          ? String.fromCodePoint(point)
          : entity;
      }
      return named[key.toLowerCase()] ?? entity;
    }
  );
}

function textContent(value: string): string {
  return decodeEntities(
    value
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gu, "$1")
      .replace(/<[^>]+>/gu, " ")
  )
    .replace(/[\t\n\r ]+/gu, " ")
    .trim();
}

function getAttribute(tag: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = tag.match(new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(["'])(.*?)\\1`, "iu"));
  return match?.[2] ? decodeEntities(match[2]).trim() : null;
}

function getElementText(xml: string, localName: string): string | null {
  const escaped = localName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = xml.match(
    new RegExp(`<(?:[\\w.-]+:)?${escaped}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${escaped}>`, "iu")
  );
  const value = match?.[1] ? textContent(match[1]) : "";
  return value || null;
}

function normalizeArchivePath(value: string): string {
  const decoded = decodeURIComponent(value.split("#")[0] ?? "").replace(/\\/gu, "/");
  const parts: string[] = [];
  for (const part of decoded.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (parts.length === 0) throw new Error("EPUB chứa đường dẫn vượt ra ngoài archive.");
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

function resolveArchivePath(baseFile: string, href: string): string {
  const baseDirectory = baseFile.includes("/")
    ? baseFile.slice(0, baseFile.lastIndexOf("/") + 1)
    : "";
  return normalizeArchivePath(`${baseDirectory}${href}`);
}

function readUtf8(files: Record<string, Uint8Array>, path: string): string {
  const bytes = files[path];
  if (!bytes) throw new Error(`EPUB thiếu tài nguyên bắt buộc: ${path}.`);
  if (bytes.length > MAX_CONTENT_DOCUMENT_BYTES) {
    throw new Error(`Tài nguyên ${path} vượt giới hạn an toàn 4 MB.`);
  }
  try {
    return strFromU8(bytes).replace(/^\uFEFF/u, "");
  } catch {
    throw new Error(`Không đọc được tài nguyên UTF-8: ${path}.`);
  }
}

function extractContentBlocks(xhtml: string): { title: string | null; paragraphs: string[] } {
  const cleaned = xhtml
    .replace(/<(script|style|svg|math)\b[^>]*>[\s\S]*?<\/\1>/giu, "")
    .replace(/<(rt|rp)\b[^>]*>[\s\S]*?<\/\1>/giu, "")
    .replace(/<br\s*\/?>/giu, "\n");
  const heading = cleaned.match(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/iu);
  const documentTitle = getElementText(cleaned, "title");
  const blocks = Array.from(
    cleaned.matchAll(/<(p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/giu)
  )
    .map((match) => textContent(match[2] ?? ""))
    .filter(Boolean);
  const paragraphs = blocks.length > 0
    ? blocks
    : textContent(cleaned)
        .split(/\n\s*\n+/gu)
        .map((value) => value.trim())
        .filter(Boolean);
  return {
    title: heading?.[1] ? textContent(heading[1]) : documentTitle,
    paragraphs
  };
}

function parseNavigationLabels(
  files: Record<string, Uint8Array>,
  packagePath: string,
  manifest: Map<string, ManifestItem>
): Map<string, string> {
  const labels = new Map<string, string>();
  const navItem = Array.from(manifest.values()).find((item) =>
    item.properties.split(/\s+/u).includes("nav")
  );
  if (navItem) {
    const navPath = resolveArchivePath(packagePath, navItem.href);
    const nav = readUtf8(files, navPath);
    const toc = nav.match(/<nav\b[^>]*(?:epub:type|type)\s*=\s*["']toc["'][^>]*>([\s\S]*?)<\/nav>/iu)?.[1] ?? nav;
    for (const link of toc.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)) {
      const href = getAttribute(link[1] ?? "", "href");
      const label = textContent(link[2] ?? "");
      if (href && label) labels.set(resolveArchivePath(navPath, href), label);
    }
    return labels;
  }

  const ncxItem = Array.from(manifest.values()).find(
    (item) => item.mediaType === "application/x-dtbncx+xml"
  );
  if (!ncxItem) return labels;
  const ncxPath = resolveArchivePath(packagePath, ncxItem.href);
  const ncx = readUtf8(files, ncxPath);
  for (const point of ncx.matchAll(/<navPoint\b[^>]*>([\s\S]*?)<\/navPoint>/giu)) {
    const body = point[1] ?? "";
    const sourceTag = body.match(/<content\b[^>]*>/iu)?.[0];
    const href = sourceTag ? getAttribute(sourceTag, "src") : null;
    const label = getElementText(body, "text");
    if (href && label) labels.set(resolveArchivePath(ncxPath, href), label);
  }
  return labels;
}

function unzipArchive(bytes: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    let entryCount = 0;
    let totalBytes = 0;
    let limitError: string | null = null;
    unzip(
      bytes,
      {
        filter: (entry) => {
          entryCount += 1;
          totalBytes += entry.originalSize;
          if (entryCount > MAX_EPUB_ENTRIES) {
            limitError = "EPUB có số lượng tài nguyên bất thường.";
            return false;
          }
          if (totalBytes > MAX_EPUB_UNCOMPRESSED_BYTES) {
            limitError = "EPUB giải nén vượt giới hạn an toàn 40 MB.";
            return false;
          }
          return true;
        }
      },
      (error, data) => {
        if (limitError) reject(new Error(limitError));
        else if (error) reject(new Error("File EPUB không phải archive ZIP hợp lệ."));
        else resolve(data);
      }
    );
  });
}

export async function parseEpubFile(file: File): Promise<ParsedEpub> {
  if (!file.name.toLocaleLowerCase("vi-VN").endsWith(".epub")) {
    throw new Error("Chỉ nhận file có đuôi .epub.");
  }
  if (file.size > MAX_EPUB_FILE_BYTES) {
    throw new Error("File EPUB vượt giới hạn 20 MB.");
  }
  const files = await unzipArchive(new Uint8Array(await file.arrayBuffer()));
  const entries = Object.entries(files);
  if (entries.length === 0) {
    throw new Error("EPUB có số lượng tài nguyên bất thường.");
  }
  if (files["META-INF/encryption.xml"]) {
    throw new Error("EPUB mã hóa hoặc DRM chưa được hỗ trợ.");
  }
  const mimetype = files.mimetype ? strFromU8(files.mimetype).trim() : "";
  if (mimetype !== "application/epub+zip") {
    throw new Error("File không có định danh EPUB hợp lệ.");
  }

  const container = readUtf8(files, "META-INF/container.xml");
  const rootfileTag = container.match(/<rootfile\b[^>]*>/iu)?.[0];
  const packageHref = rootfileTag ? getAttribute(rootfileTag, "full-path") : null;
  if (!packageHref) throw new Error("EPUB thiếu package document trong container.xml.");
  const packagePath = normalizeArchivePath(packageHref);
  const opf = readUtf8(files, packagePath);
  const title = getElementText(opf, "title") ?? file.name.replace(/\.epub$/iu, "");
  const author = getElementText(opf, "creator");

  const manifest = new Map<string, ManifestItem>();
  for (const tag of opf.matchAll(/<item\b[^>]*>/giu)) {
    const id = getAttribute(tag[0], "id");
    const href = getAttribute(tag[0], "href");
    if (!id || !href) continue;
    manifest.set(id, {
      href,
      mediaType: getAttribute(tag[0], "media-type") ?? "",
      properties: getAttribute(tag[0], "properties") ?? ""
    });
  }
  const spineIds = Array.from(opf.matchAll(/<itemref\b[^>]*>/giu))
    .map((match) => getAttribute(match[0], "idref"))
    .filter((value): value is string => Boolean(value));
  if (spineIds.length === 0 || spineIds.length > MAX_EPUB_CHAPTERS) {
    throw new Error("EPUB không có thứ tự chương hợp lệ.");
  }
  const navigationLabels = parseNavigationLabels(files, packagePath, manifest);
  const paragraphs: string[] = [];
  const chapters: NormalizedImportChapter[] = [];

  for (let spineIndex = 0; spineIndex < spineIds.length; spineIndex += 1) {
    if (spineIndex > 0 && spineIndex % 8 === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    const id = spineIds[spineIndex];
    if (!id) continue;
    const item = manifest.get(id);
    if (!item || !/^(application\/xhtml\+xml|text\/html)$/u.test(item.mediaType)) continue;
    const contentPath = resolveArchivePath(packagePath, item.href);
    const content = extractContentBlocks(readUtf8(files, contentPath));
    const usefulParagraphs = content.paragraphs.filter((paragraph) => /\p{Script=Han}/u.test(paragraph));
    if (usefulParagraphs.length === 0) continue;
    const chapterTitle = navigationLabels.get(contentPath) ?? content.title ?? `Chương ${chapters.length + 1}`;
    chapters.push({ title: chapterTitle.slice(0, 200), paragraphIndex: paragraphs.length });
    paragraphs.push(...usefulParagraphs);
  }

  const text = paragraphs.join("\n\n").normalize("NFC");
  const characterCount = Array.from(text).length;
  if (characterCount === 0) throw new Error("EPUB không có văn bản chữ Hán có thể đọc.");
  if (characterCount > MAX_IMPORT_CHARACTERS) {
    throw new Error(`Nội dung EPUB vượt giới hạn ${MAX_IMPORT_CHARACTERS.toLocaleString("vi-VN")} ký tự.`);
  }
  return { title: title.slice(0, 200), author: author?.slice(0, 200) ?? null, normalized: { text, paragraphs, characterCount, chapters } };
}

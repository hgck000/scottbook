# ScottBook v0.34.0 — offline EPUB import

## Release contract

This release extends the existing local import transaction to text-first EPUB
books without adding a network service.

- Read the required `META-INF/container.xml`, package document, manifest, and
  spine in default reading order.
- Use the EPUB 3 navigation document for chapter labels, with EPUB 2 NCX and
  content headings as fallbacks.
- Preserve publication title, author, chapter order, paragraph boundaries, and
  an in-reader table of contents that jumps to the selected chapter.
- Reduce detached XHTML to plain text. Scripts, CSS, SVG, MathML, ruby reading
  annotations, images, audio, and video are not rendered or stored.
- Reject encrypted/DRM EPUBs and archives outside the file, entry, expanded
  size, chapter, content-document, or normalized-text limits.
- Send extracted Chinese text through the same cancellable offline worker,
  pinyin-pro, CVDICT, and Hán-Việt path already used by Paste/TXT.
- Save only after analysis validates; cancellation or failure creates no book.
- Include EPUB books and their chapter metadata in IndexedDB, favorites,
  progress, delete cleanup, backup/restore, and offline reopen.
- Migrate imported-book schema v1 records to v2 without losing annotations.

The parser follows the container/package/spine/navigation model defined by the
[W3C EPUB 3.3 specification](https://www.w3.org/TR/epub-33/). It does not claim
full reading-system conformance or fixed-layout/media support.

## Automated evidence

| Gate | Observed evidence |
|---|---|
| EPUB parser | EPUB 3 container/OPF/spine/nav order, metadata, text filtering, encryption rejection, invalid archive rejection |
| Imported data | Schema v1 migration plus strict v2 chapter/TOC validation |
| Unit/integration | 32 files, 183/183 Vitest tests passed |
| Static quality | ESLint and TypeScript passed |
| PWA | Root and `/scottbook/` builds passed release verification |
| Android | Native web bundle synced at `0.34.0`, version code `34`, with no remote server |
| Security | Runtime security/license audit passed; `npm audit` found 0 vulnerabilities |
| Browser journeys | 40 desktop/mobile cases listed, including offline EPUB reopen and TOC jump |

The local execution environment does not provide the configured Chrome binary,
so GitHub Actions remains authoritative for executing the browser journeys.

## Manual checks

1. Open **Thư viện → Nhập Paste / TXT / EPUB → Chọn EPUB** and select an EPUB
   with several Chinese chapters.
2. Confirm title, author, number of chapters, normalized paragraph count, and
   chapter headings in Preview.
3. Analyze and save. In Reader, open **Mục lục** and jump to a later chapter.
4. Select a character and word/phrase to verify pinyin, meaning, and Hán-Việt.
5. Turn on airplane mode, reload, and confirm the book and TOC remain usable.
6. Export backup, delete the EPUB, restore the backup, and reopen the book.
7. Try a DRM EPUB, renamed ZIP, oversized EPUB, and image-only EPUB. Confirm
   each fails clearly and creates no stored book.

## Version

- Web/package: `0.34.0`
- Android: `versionCode 34`, `versionName 0.34.0`

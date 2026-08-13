# ScottBook v0.31.0 offline Paste/TXT import

Date: 2026-08-14
Status: Core personal-reader milestone; EPUB and owner signing remain deferred

## What this version adds

Version 0.31 replaces the old import placeholder with one complete local path:

- paste Chinese text or choose a `.txt` file;
- accept strict UTF-8 with or without UTF-8 BOM;
- reject UTF-16, invalid UTF-8, non-TXT files, files over 512 KB, text over
  120,000 normalized characters, empty text, and text without Han characters;
- normalize CRLF/newlines, Unicode composition, non-breaking spaces, repeated
  inline whitespace, and blank paragraph separators;
- edit title and optional author, then inspect the normalized preview before any
  language analysis or storage write begins;
- analyze in a cancellable Web Worker with visible dictionary/index/paragraph
  progress, leaving no book record when canceled or failed;
- create contextual pinyin with `pinyin-pro` 3.28.0;
- look up Vietnamese character and word/phrase meanings in the pinned CVDICT
  snapshot, and reuse ScottBook's existing Hán-Việt data in Reader;
- label imported annotations as automatic and explicitly report sentence
  translation as unavailable offline instead of synthesizing an unreliable
  translation from individual word meanings;
- preserve mixed Latin text, whitespace, punctuation, numbers, and emoji;
- assign a unique `imported:*` ID for every completed import, including two
  different files with the same filename;
- store completed books in IndexedDB and reopen them without a network;
- use the normal Reader preferences, progress, favorites, character/word/sentence
  scopes, and local assistance history;
- delete a book transactionally together with its own progress, favorite, and
  assistance contexts while preserving shared review items used by other books;
- export imported books in checksummed backup format v2, restore old v1 backups,
  restore v2 books transactionally, and keep one IndexedDB-backed book undo set;
- precache/copy the compressed offline dictionary in PWA root, PWA subpath, and
  Capacitor Android builds.

## Offline data and attribution

| Component | Pinned input | Purpose | License |
| --- | --- | --- | --- |
| CVDICT | commit `c379d909e308343a247e51619f7839a2060a271c` | Vietnamese meanings | CC BY-SA 4.0 |
| pinyin-pro | `3.28.0` | segmentation and contextual pinyin | MIT |
| fflate | `0.8.2` | unpack CVDICT inside the worker | MIT |

The source CVDICT file is 10,803,314 bytes with SHA-256
`4dde4b204193efa9c192d7f7daeab1bb579c8ccd7c41ed90d1b6caee22ba0948`.
The deterministic packaged gzip is 3,944,896 bytes with SHA-256
`9c87a201ca6be7985a500b715666e4553d614f4f08e8d3d29e73665d7eb3ed85`.
Rebuild and provenance details are in `docs/data/CVDICT-PROVENANCE.md`.

CVDICT's Vietnamese definitions were generated automatically upstream and can
contain errors. ScottBook therefore never presents imported annotations as
authored reference content.

## Storage and rollback contract

Imported books are authoritative in IndexedDB v4. Lightweight reader state
still has the existing localStorage compatibility path, but import is disabled
when IndexedDB is unavailable because a large book cannot be stored safely in
that fallback.

The worker never writes storage. Only a validated final result enters one
IndexedDB `put` transaction. Delete writes the book store and reader-state stores
in one transaction. Restore first captures the current local bytes, then changes
book/state stores together; failure restores the exact previous local bytes and
IndexedDB aborts atomically. One restore undo keeps its book set in the dedicated
`book-restore-undo` store rather than risking localStorage quota.

## Manual verification — Paste

1. Open **Thư viện → Nhập Paste / TXT → Dán văn bản**.
2. Enter title `Bài thử v0.31`, optional author, and paste:

   ```text
   我喜欢学习中文。

   朋友每天看书，也用 ScottBook 😊。
   ```

3. Confirm the counter reports two paragraphs; choose **Xem trước**.
4. Verify the preview keeps both paragraphs, Latin `ScottBook`, and emoji.
5. Choose **Phân tích và lưu offline**. Confirm progress moves through opening,
   decompressing, indexing, and paragraph analysis before Reader opens.
6. In Reader, verify the header says **Phân tích tự động offline**.
7. Select **Từ/cụm**. Tap a Hanzi word once: pinyin and Hán-Việt appear. Tap it
   again: a Vietnamese CVDICT meaning appears. Tap a third time: the panel closes.
8. Select **Câu**, tap once for sentence pinyin, and again. Verify the second
   result says sentence translation is unavailable offline, not a fabricated
   Vietnamese sentence.
9. Return to Library. Verify the book is in **Sách tự nhập trên thiết bị** and
   its reading progress is retained.

## Manual verification — TXT validation and cancel

1. Save the same sample as UTF-8 `.txt`, import it, and confirm its filename is
   suggested as the editable title.
2. Repeat with a UTF-8 BOM file; it must preview normally without a visible BOM.
3. Choose a UTF-16 TXT; ScottBook must explain that it needs UTF-8 and must not
   add a Library card.
4. Choose a renamed binary/non-UTF-8 file or a file over 512 KB; it must be
   rejected before preview/analysis.
5. Start a valid analysis and press **Hủy phân tích**, Android Back, or browser
   Back during analysis. Return to Library and verify no partial book was added.
6. Import two distinct TXT files with the same filename. Verify two separate
   cards exist and each opens its own text.

## Manual verification — offline, delete, backup

1. After one successful import, close ScottBook, enable airplane mode, and open
   it again. Open the imported book and reveal pinyin/meaning without a network.
2. Add an imported word to local assistance history, return to Library, then
   delete that book and accept the confirmation. Verify the book, its progress,
   and its private context disappear; built-in reading state remains.
3. Import a book again, go to **Ôn lại**, and download backup JSON. Verify the
   restore preview reports `1` under **Sách tự nhập**.
4. Delete the book, restore the downloaded backup, and verify it reappears and
   opens offline.
5. Choose **Hoàn tác lần khôi phục** and verify the pre-restore book set and
   reader state return together.

## Automated evidence before patch handoff

- `npm run typecheck`
- `npm run lint`
- `npm test` — 31 files, 174 tests
- `npm run audit:security` — policy/license audit passed; 0 runtime vulnerabilities
- `npm run build` — root-hosted PWA and dictionary precache contract passed
- `SCOTTBOOK_BASE_PATH=/scottbook/ npm run build` — subpath contract passed
- `npm run android:sync` — native bundle includes worker and CVDICT; versionCode 31
- Playwright adds desktop/mobile import-and-offline-reopen coverage. This local
  environment had no Chrome binary, so CI/owner device evidence remains required.
- A local Gradle debug APK build reached the verified Android web sync but could
  not download Gradle because the execution environment blocks `services.gradle.org`.
  GitHub CI remains the APK-producing gate after push.

## Intentionally not added

- No account, cloud sync, telemetry, score, streak, goal, or gamification.
- No online translation API or API key.
- No claim that automatic meanings are authored or always correct.
- No sentence machine translation for imported text.
- No EPUB yet; real Paste/TXT use should decide whether it is worth adding.
- No PDF or OCR import.
- No Android release key; owner key creation remains deferred.

# ScottBook v0.33.0 — lexical-only review

## Release contract

This release narrows **Ôn lại** to learning units that are practical to retain:
individual characters and words/phrases.

- Opening whole-sentence pinyin or translation in Reader does not create a
  review item.
- The Review list, counters, scope filters, quick practice, learning insights,
  diagnostics, backup previews, and restored data exclude sentence items.
- Valid sentence review records created by earlier versions are removed while
  local data or a backup is validated.
- Sentence examples remain attached to character and word/phrase cards as
  useful usage context.
- Sentence assistance remains available in Reader. This release does not add a
  whole-sentence Hán-Việt field because a sentence is not one lexical unit.

No content, account, cloud, scoring, streak, or SRS feature is added.

## Automated evidence

| Gate | Observed evidence |
|---|---|
| Unit/integration | 31 files, 177/177 Vitest tests passed |
| Static quality | ESLint and TypeScript passed |
| Content | 27 articles verified with no missing annotations |
| PWA | Production build and release artifact verification passed |
| Browser journeys | Playwright listed 38 desktop/mobile cases |

The local environment does not provide the configured Chrome binary. GitHub
Actions remains authoritative for executing the browser journeys after push.

## Manual checks

1. In Reader, choose **Câu**, open pinyin and translation, then go to **Ôn lại**.
   Confirm no sentence card or sentence scope filter appears.
2. Choose **Chữ** and open pinyin; choose **Từ/cụm** and open meaning. Confirm
   both become review cards and retain the containing sentence as context.
3. Open **Luyện nhanh** and confirm only characters and words/phrases appear.
4. Restore a backup made by v0.32 that contains a sentence card. Confirm restore
   succeeds, the sentence card is absent, and lexical cards remain.

## Version

- Web/package: `0.33.0`
- Android: `versionCode 33`, `versionName 0.33.0`

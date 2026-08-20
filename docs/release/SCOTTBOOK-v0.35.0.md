# ScottBook v0.35.0 — HSK 4 reading pack and resilient import analysis

## Release contract

This release adds one complete reading level and fixes the real deployed import
failure reported with the v0.34 EPUB sample.

- Add nine HSK 4 readings, each with ten sentences grouped under two connected
  section headings.
- Include four HSK 4 readings about office work, fashion, or design.
- Keep authored Vietnamese sentence translations plus offline pinyin,
  word/phrase meanings, character annotations, and Hán-Việt lookup.
- Use one violet HSK 4 accent consistently in Library, Discover, progress,
  article cards, detail, and Reader.
- Extend level counts and progress without changing existing article IDs or
  saved reading state.
- Detect the gzip magic bytes before opening CVDICT. Decode gzip bytes once,
  but accept the same dictionary when a host or browser has already decoded the
  HTTP response body.
- Continue rejecting a corrupt payload that declares a gzip header.

The new readings are original, standards-informed continuous-reading texts.
They do not reproduce official test passages. Their structure and difficulty
were checked against the official [Chinese Test Service HSK 4
overview](https://www.chinesetest.cn/HSK/4) and [vocabulary
resource](https://www.chinesetest.cn/HSK/4?type=2). Topic-specific terms remain
limited additions with complete offline assistance.

## Editorial matrix

| Level | Articles | Sentences | Sections per article | Required-topic articles | Accent |
|---|---:|---:|---:|---:|---|
| HSK 1 | 9 | 90 | 2 | 3 | Jade |
| HSK 2 | 9 | 90 | 2 | 4 | Amber |
| HSK 3 | 9 | 90 | 2 | 3 | Coral |
| HSK 4 | 9 | 90 | 2 | 4 | Violet |

## Automated evidence

| Gate | Observed evidence |
|---|---|
| Dictionary payload | Packaged gzip and already-decoded UTF-8 both open; corrupt gzip still fails |
| Authored library | 36 articles, 360 sentences, correct structure/topics/accents, no missing annotations |
| Unit/integration | 33 files, 186 tests pass |
| Static quality | ESLint and TypeScript pass |
| PWA | Root and `/scottbook/` builds pass release verification |
| Android | Native web bundle syncs at `0.35.0`, version code `35`, with no remote server |
| Security | Runtime security/license audit and dependency audit pass |
| Browser journeys | 40 desktop/mobile cases load; GitHub Actions remains authoritative for execution |

## Manual checks

1. Import `ScottBook-EPUB-test.epub` again from the deployed PWA. Analysis must
   pass the dictionary step instead of reporting `invalid gzip data`.
2. Turn on airplane mode, reopen the imported book, use its table of contents,
   and select a word/phrase to check pinyin, meaning, and Hán-Việt.
3. In Library, select HSK 4 and confirm nine violet cards are shown.
4. Open one HSK 4 article and confirm both connected section headings and all
   ten sentences appear.
5. In Reader, select `地`, `制服`, `被`, and `东西` where present; confirm the
   contextual reading/meaning is not the unrelated noun or homograph.
6. Complete or favorite an HSK 4 article and confirm the state survives reload.

## Version

- Web/package: `0.35.0`
- Android: `versionCode 35`, `versionName 0.35.0`

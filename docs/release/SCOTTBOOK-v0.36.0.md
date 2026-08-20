# ScottBook v0.36.0 — HSK 5 reading pack

## Release contract

This release adds one complete reading level without expanding into unrelated
learning features.

- Add nine HSK 5 readings, each with ten sentences grouped under two connected
  section headings.
- Include four HSK 5 readings about office work, clothing, or design.
- Keep authored Vietnamese sentence translations plus offline pinyin,
  word/phrase meanings, character annotations, and Hán-Việt lookup.
- Use one azure HSK 5 accent consistently in Library, Discover, progress,
  article cards, detail, and Reader.
- Extend level counts and progress without changing existing article IDs or
  saved reading state.
- Keep whole-sentence assistance in Reader while Review records only characters
  and words/phrases.
- Preserve the v0.35 import fix for both packaged gzip and already-decoded
  CVDICT responses.

The new readings are original, standards-informed continuous-reading texts.
They do not reproduce official test passages. Their structure and difficulty
were checked against the official [Chinese Test Service HSK 5
overview](https://www.chinesetest.cn/HSK/5) and [vocabulary
resource](https://www.chinesetest.cn/HSK/5?type=2). Topic-specific terms remain
limited additions with complete offline assistance.

## Editorial matrix

| Level | Articles | Sentences | Sections per article | Required-topic articles | Accent |
|---|---:|---:|---:|---:|---|
| HSK 1 | 9 | 90 | 2 | 3 | Jade |
| HSK 2 | 9 | 90 | 2 | 4 | Amber |
| HSK 3 | 9 | 90 | 2 | 3 | Coral |
| HSK 4 | 9 | 90 | 2 | 4 | Violet |
| HSK 5 | 9 | 90 | 2 | 4 | Azure |

## Automated evidence

| Gate | Observed evidence |
|---|---|
| Dictionary payload | Packaged gzip and already-decoded UTF-8 both open; corrupt gzip still fails |
| Authored library | 45 articles, 450 sentences, correct structure/topics/accents, no missing annotations |
| Unit/integration | 33 files, 186 tests pass |
| Static quality | ESLint and TypeScript pass |
| PWA | Root and `/scottbook/` builds pass release verification |
| Android | Native web bundle syncs at `0.36.0`, version code `36`, with no remote server |
| Security | Runtime security/license audit and dependency audit pass |
| Browser journeys | Desktop/mobile cases load; GitHub Actions remains authoritative for execution |

## Manual checks

1. Import the v0.34 EPUB sample from the deployed PWA. Analysis must pass the
   dictionary step instead of reporting `invalid gzip data`.
2. Turn on airplane mode, reopen the imported book, and select a word/phrase to
   check pinyin, meaning, and Hán-Việt.
3. In Library, select HSK 5 and confirm nine azure cards are shown.
4. Open one HSK 5 article and confirm both connected section headings and all
   ten sentences appear.
5. In Reader, select `只`, `完成得`, `钥匙`, `大树`, and `生意` where present;
   confirm their contextual pinyin, meaning, and Hán-Việt assistance.
6. Open sentence assistance, then visit Review. The whole sentence must not be
   added as a review card; character and word/phrase help must still be saved.
7. Complete or favorite an HSK 5 article and confirm the state survives reload.

## Version

- Web/package: `0.36.0`
- Android: `versionCode 36`, `versionName 0.36.0`

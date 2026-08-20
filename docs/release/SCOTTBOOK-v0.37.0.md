# ScottBook v0.37.0 — thirty long HSK 1 stories

## Release contract

This release expands continuous reading at one level without adding another
learning screen or changing Review.

- Add thirty original HSK 1 short stories, each with seventy sentences grouped
  under five connected sections.
- Include fifteen stories about clothing, office work, fashion, or design.
- Keep the nine existing HSK 1 readings and all existing article IDs, progress,
  favorites, and reading history.
- Keep authored Vietnamese sentence translations plus offline contextual
  pinyin, word/phrase meanings, character annotations, and Hán-Việt lookup.
- Keep whole-sentence assistance in Reader while Review records only characters
  and words/phrases.
- Compress the generated annotation pack inside the local application bundle so
  full-text search stays synchronous without shipping the raw JSON size.
- Preserve Paste/TXT/EPUB import, including the already-decoded CVDICT response
  path that prevents the previous `invalid gzip data` failure.

The stories are original, standards-informed continuous-reading texts; they do
not reproduce official test passages. Core vocabulary and grammar were checked
against the official [Chinese Test Service HSK 1
overview](https://www.chinesetest.cn/HSK/1) and [vocabulary
resource](https://www.chinesetest.cn/HSK/1?type=2). Repeated beginner sentence
patterns are deliberate scaffolding, while each story has its own plot,
section headings, outcome, and no repeated sentence inside the article.

## Editorial matrix

| Collection | Articles | Sentences per article | Sections per article | Required-topic articles | Accent |
|---|---:|---:|---:|---:|---|
| Existing HSK 1 | 9 | 10 | 2 | 3 | Jade |
| New HSK 1 stories | 30 | 70 | 5 | 15 | Jade |
| HSK 2 | 9 | 10 | 2 | 4 | Amber |
| HSK 3 | 9 | 10 | 2 | 3 | Coral |
| HSK 4 | 9 | 10 | 2 | 4 | Violet |
| HSK 5 | 9 | 10 | 2 | 4 | Azure |

The complete built-in library now contains 75 articles and 2,550 sentences.

## Automated evidence

| Gate | Observed evidence |
|---|---|
| Authored library | 75 articles, 2,550 sentences, correct long-story structure/topics/accents, no missing annotations |
| Annotation regression | Neutral-tone `得`, `着`, contextual `数`, recurring compounds, and proper names are locked by tests |
| Unit/integration | 33 files, 186 tests pass |
| Static quality | ESLint and TypeScript pass |
| PWA | Root and `/scottbook/` builds pass release verification |
| Android | Native web bundle syncs at `0.37.0`, version code `37`, with no remote server |
| Security | Runtime security/license audit and dependency audit pass |
| Browser journeys | Desktop/mobile cases load; GitHub Actions remains authoritative for execution |

## Manual checks

1. In Library, select HSK 1 and confirm 39 jade cards are shown.
2. Open any new HSK 1 story and confirm five connected section headings and all
   seventy sentences appear without a long card-entry animation delay.
3. Select words or phrases such as `做得`, `画着`, `一只`, `工作本`, and a
   character name; confirm contextual pinyin, Vietnamese meaning, and offline
   Hán-Việt assistance.
4. Open sentence assistance, then visit Review. The whole sentence must not be
   added as a review card; character and word/phrase help must still be saved.
5. Search for a word used late in a long story, open the result, reload offline,
   and confirm reading progress remains at the saved sentence.
6. Import the existing EPUB sample and confirm analysis does not report
   `invalid gzip data`.

## Version

- Web/package: `0.37.0`
- Android: `versionCode 37`, `versionName 0.37.0`

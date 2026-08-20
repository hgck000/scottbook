# HSK 1–4 reading pack provenance

ScottBook v0.35 contains 36 built-in readings: nine each for HSK 1, HSK 2,
HSK 3, and HSK 4. Every reading contains ten sentences grouped under two connected
section headings. Each level includes at least three readings about clothing,
office work, fashion, or design.

## Level standard

The pack uses the current HSK 1–4 structure established in ScottBook.
Grammar, sentence length, and core vocabulary were checked against the official
Chinese Test Service exam and vocabulary resources:

- [HSK 1 exam overview](https://www.chinesetest.cn/HSK/1)
- [HSK 1 vocabulary resource](https://www.chinesetest.cn/HSK/1?type=2)
- [HSK 2 exam overview](https://www.chinesetest.cn/HSK/2)
- [HSK 2 vocabulary resource](https://www.chinesetest.cn/HSK/2?type=2)
- [HSK 3 exam overview](https://www.chinesetest.cn/HSK/3)
- [HSK 3 vocabulary resource](https://www.chinesetest.cn/HSK/3?type=2)
- [HSK 4 exam overview](https://www.chinesetest.cn/HSK/4)
- [HSK 4 vocabulary resource](https://www.chinesetest.cn/HSK/4?type=2)

No official test passage is copied into ScottBook. The readings are original,
standards-informed adaptations designed for continuous reading rather than
mock-exam questions. Topic-specific words such as `办公室`, `设计`, `布料`, and
`试衣间` are intentionally limited additions. They may exceed a level's core
list, but every occurrence retains pinyin, Vietnamese meaning, sentence
translation, and offline Hán-Việt assistance.

## Editorial matrix

| Level | Articles | Sentences per article | Sections per article | Required-topic articles | Accent |
|---|---:|---:|---:|---:|---|
| HSK 1 | 9 | 10 | 2 | 3 | Jade |
| HSK 2 | 9 | 10 | 2 | 4 | Amber |
| HSK 3 | 9 | 10 | 2 | 3 | Coral |
| HSK 4 | 9 | 10 | 2 | 4 | Violet |

The source text is maintained in
[`scripts/content/hsk-reading-source.mjs`](../../scripts/content/hsk-reading-source.mjs).
The generated library is committed so a release never depends on a network call
at reading time. CI rejects stale generation, missing annotations, the wrong
article/section/sentence counts, an incorrect HSK accent, or fewer than three
required-topic articles at any level.

## Offline annotations

- [`pinyin-pro`](https://github.com/zh-lx/pinyin-pro) supplies contextual pinyin.
- [CVDICT](https://github.com/ph0ngp/CVDICT) supplies the pinned offline
  Chinese–Vietnamese dictionary used to choose word and character meanings.
- ScottBook's existing pinned Unicode Unihan and pinyin-specific data supply
  offline Hán-Việt readings in both character and word/phrase scopes.

Generated meanings are reviewed for the pack's recurring compounds and common
ambiguous particles. They remain concise reading assistance, not a substitute
for a full dictionary or a human translation service.

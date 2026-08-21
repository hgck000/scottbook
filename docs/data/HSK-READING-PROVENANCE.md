# HSK 1–5 reading pack provenance

ScottBook v0.45 contains 105 built-in readings and 4,650 sentences. HSK 1 has
the original nine readings plus thirty long short stories. HSK 2 and HSK 3 each
retain their original nine readings and add fifteen long stories. Every long
story in HSK 1–3 contains seventy sentences grouped under five connected
sections. Clothing, office work, fashion, and design remain recurring topics.

## Level standard

The pack uses the current HSK 1–5 structure established in ScottBook.
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
- [HSK 5 exam overview](https://www.chinesetest.cn/HSK/5)
- [HSK 5 vocabulary resource](https://www.chinesetest.cn/HSK/5?type=2)

No official test passage is copied into ScottBook. The readings are original,
standards-informed adaptations designed for continuous reading rather than
mock-exam questions. Topic-specific words such as `办公室`, `设计`, `布料`, and
`试衣间` are intentionally limited additions. They may exceed a level's core
list, but every occurrence retains pinyin, Vietnamese meaning, sentence
translation, and offline Hán-Việt assistance.

## Editorial matrix

| Level | Articles | Sentences per article | Sections per article | Required-topic articles | Accent |
|---|---:|---:|---:|---:|---|
| HSK 1 (original) | 9 | 10 | 2 | 3 | Jade |
| HSK 1 (long stories) | 30 | 70 | 5 | 15 | Jade |
| HSK 2 (original) | 9 | 10 | 2 | 4 | Amber |
| HSK 2 (long stories) | 15 | 70 | 5 | 5 | Amber |
| HSK 3 (original) | 9 | 10 | 2 | 3 | Coral |
| HSK 3 (long stories) | 15 | 70 | 5 | 5 | Coral |
| HSK 4 | 9 | 10 | 2 | 4 | Violet |
| HSK 5 | 9 | 10 | 2 | 4 | Azure |

The original source text is maintained in
[`scripts/content/hsk-reading-source.mjs`](../../scripts/content/hsk-reading-source.mjs),
with the long HSK 1 collection in
[`scripts/content/hsk1-long-stories.mjs`](../../scripts/content/hsk1-long-stories.mjs)
and the long HSK 2–3 collection in
[`scripts/content/hsk2-hsk3-long-stories.mjs`](../../scripts/content/hsk2-hsk3-long-stories.mjs).
The generated library is committed so a release never depends on a network call
at reading time. CI rejects stale generation, missing annotations, the wrong
article/section/sentence counts, repeated sentences inside one long story, an
incorrect HSK accent, or fewer than the required number of topic articles.

## Offline annotations

- [`pinyin-pro`](https://github.com/zh-lx/pinyin-pro) supplies contextual pinyin.
- [CVDICT](https://github.com/ph0ngp/CVDICT) supplies the pinned offline
  Chinese–Vietnamese dictionary used to choose word and character meanings.
- ScottBook's existing pinned Unicode Unihan and pinyin-specific data supply
  offline Hán-Việt readings in both character and word/phrase scopes.

Generated meanings are reviewed for the pack's recurring compounds and common
ambiguous particles. They remain concise reading assistance, not a substitute
for a full dictionary or a human translation service.

# ScottBook v0.45.0 — long HSK 2 and HSK 3 stories

## Release contract

This release adds original offline reading content only. It preserves the
simplified interface, imported-book flow, local reading state, and all existing
offline assistance behavior.

- Add 15 long HSK 2 stories and 15 long HSK 3 stories.
- Keep each new story at five connected sections and 70 authored sentences.
- Keep every character and word/phrase annotated with offline pinyin, concise
  Vietnamese meaning, and Hán-Việt assistance; retain a Vietnamese translation
  for every sentence.
- Keep Review limited to character and word/phrase items, never whole sentences.

## Content result

| Level | Original readings | Long stories | Total readings | Total sentences |
|---|---:|---:|---:|---:|
| HSK 1 | 9 | 30 | 39 | 2,190 |
| HSK 2 | 9 | 15 | 24 | 1,140 |
| HSK 3 | 9 | 15 | 24 | 1,140 |
| HSK 4 | 9 | 0 | 9 | 90 |
| HSK 5 | 9 | 0 | 9 | 90 |
| **Library** | **45** | **60** | **105** | **4,650** |

The new stories cover everyday plans, study, local activities, clothing,
design, office work, travel, and community tasks. They are original
standards-informed adaptations; no official exam passage is copied.

## Verification

- The generated library validates at 105 articles with no missing annotations.
- All 34 test files and 191 unit/integration tests pass.
- ESLint, TypeScript, and root PWA release verification pass.
- The source and generated pack enforce 15 new long stories at HSK 2 and 15 at
  HSK 3, each with five sections, 70 unique sentences, and the appropriate
  amber/coral accent.

## Version

- Web/package: `0.45.0`
- Android: `versionCode 45`, `versionName 0.45.0`

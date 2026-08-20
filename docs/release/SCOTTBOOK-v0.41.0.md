# ScottBook v0.41.0 — reading-library quality audit

## Release contract

This release improves the existing 75 readings without adding stories or a new
learning feature.

- Review all generated word/phrase annotations for irrelevant dictionary noise.
- Correct neutral-tone and contextual pinyin that previously selected the wrong
  dictionary entry.
- Give recurring names, quantities, colors, paper compounds, and location
  phrases concise Vietnamese meanings instead of mechanically joined senses.
- Rewrite unnatural sentences found in the long HSK 1 collection.
- Keep all article IDs, ordering, progress, favorites, history, and backups.
- Keep whole-sentence assistance in Reader but never add sentence cards to
  Review.
- Preserve the Paste/TXT/EPUB `invalid gzip data` import fix.

No official test passage is copied. The library remains the same original,
standards-informed collection documented in
[`HSK-READING-PROVENANCE.md`](../data/HSK-READING-PROVENANCE.md).

## Corrected examples

| Hanzi | Before | v0.41 |
|---|---|---|
| `故事` | `gù shì` / “tục lệ cũ” | `gù shi` / “câu chuyện; truyện” |
| `告诉` | `gào sù` / nghĩa pháp lý | `gào su` / “nói cho biết; thông báo” |
| `知道` | `zhī dào` plus pronunciation noise | `zhī dao` / “biết; hiểu rõ” |
| `林阿姨` | meanings of the separate characters | “cô Lâm” |
| `陈老师` | meanings of `陈` plus “giáo viên” | “giáo viên Trần” |
| `黄色` | included an irrelevant adult sense | “màu vàng” |
| `水里` | selected a Taiwanese place name | “trong nước” |

The HSK 1 story text also removes repeated `一起一起`, replaces unnatural
`站边`, corrects a service-desk location, chair armrest wording, river/boat
phrasing, and several project descriptions.

## Automated evidence

| Gate | Observed evidence |
|---|---|
| Authored library | 75 articles and 2,550 sentences; no missing annotations |
| Meaning hygiene | Generated word meanings reject geographic, dialect, slang, adult, surname, variant, and pronunciation-note noise |
| Pinyin regression | Reviewed neutral tones, tone sandhi, polyphonic tokens, and names are locked by tests |
| Hán-Việt | Every built-in word and character still resolves entirely offline |
| Unit/integration | 33 files, 187 tests pass |
| Static quality | ESLint and TypeScript pass |
| PWA | Root and `/scottbook/` builds pass release verification |
| Android | Native web bundle syncs at `0.41.0`, version code `41`, with no remote server |
| Security | Runtime security/license audit and dependency audit pass |
| Browser journeys | Desktop/mobile cases load; GitHub Actions remains authoritative for execution |

## Manual checks

1. Open one article from each HSK level and select a person name, common word,
   compound, and individual character.
2. In the HSK 1 long stories, check `故事`, `告诉`, `知道`, `黄色`, `林阿姨`,
   and `陈老师` for the reviewed pinyin and meaning.
3. Confirm every selected word/phrase still shows an offline Hán-Việt reading.
4. Use sentence assistance, then open Review and confirm no whole-sentence card
   was added.
5. Import the existing EPUB sample and confirm analysis does not report
   `invalid gzip data`.

## Version

- Web/package: `0.41.0`
- Android: `versionCode 41`, `versionName 0.41.0`

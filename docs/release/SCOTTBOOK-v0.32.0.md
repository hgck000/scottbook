# ScottBook v0.32.0 — graded reading library

## Release contract

This release expands the built-in offline library from nine pilot articles to
27 medium-to-long readings while preserving the existing IDs of the original
nine articles.

- HSK 1, HSK 2, and HSK 3 each contain exactly nine readings.
- Every reading contains ten sentences under exactly two connected headings.
- Each level includes at least three readings about clothing, office work,
  fashion, or design.
- HSK 1 uses jade, HSK 2 amber, and HSK 3 coral across filters, cards, progress,
  and Reader.
- Every built-in character and word/phrase retains contextual pinyin,
  Vietnamese meaning, and offline Hán-Việt; every sentence retains pinyin and a
  Vietnamese translation.
- All reading and assistance data remains bundled offline. No content or
  translation API is added.

The texts are original adaptations aligned to the official HSK 1–3 exam and
vocabulary resources. They do not reproduce official test passages. See
[`../data/HSK-READING-PROVENANCE.md`](../data/HSK-READING-PROVENANCE.md).

## Browser CI correction

The v0.31 Browser journeys job failed in both desktop and mobile because the
non-exact heading locator `Bài đọc riêng` matched both the import page heading
`Đưa bài đọc riêng vào ScottBook` and the saved-books heading `Bài đọc riêng`.
The journey now selects the latter with `exact: true`. The workflow and product
behavior are unchanged; the assertion is no longer ambiguous.

## Automated evidence

| Gate | Observed evidence |
|---|---|
| Generated content | 27 articles; 9 per HSK; 2 sections and 10 sentences each; no missing annotations |
| Required topics | HSK 1: 3; HSK 2: 4; HSK 3: 3 |
| HSK accents | HSK 1 jade; HSK 2 amber; HSK 3 coral |
| Unit/integration | 31 files, 175/175 Vitest tests passed |
| Static quality | ESLint and TypeScript passed |
| PWA | Root and `/scottbook/` production builds passed release verification |
| Android | Native web bundle synced with version `0.32.0`, version code `32`, and no remote server |
| Security | Runtime security/license audit passed; `npm audit` found 0 vulnerabilities |
| Browser journeys | Playwright listed 38 desktop/mobile cases; GitHub Actions remains authoritative for execution |

The local execution environment does not provide the configured Chrome binary,
so it can list the 38 Playwright cases but cannot launch them. GitHub Actions is
the authoritative browser result after the patch is pushed.

## Manual reading checks

1. Open the Library and confirm HSK 1, HSK 2, and HSK 3 each report nine
   articles.
2. Filter each HSK level and confirm the entire level uses only its assigned
   jade, amber, or coral accent.
3. Open one article per level and confirm it contains two named sections and ten
   logically ordered sentences.
4. Open at least three clothing/office/fashion/design articles per level.
5. In `字` and `词` scopes, select characters and compounds and verify pinyin,
   Vietnamese meaning, and **Âm Hán-Việt**.
6. In `句` scope, select a sentence and verify pinyin plus Vietnamese
   translation.
7. Turn on airplane mode, reopen the installed PWA or APK, and repeat steps 3–6.
8. Import a TXT book and confirm the existing `Bài đọc riêng` flow still works.

## Version

- Web/package: `0.32.0`
- Android: `versionCode 32`, `versionName 0.32.0`

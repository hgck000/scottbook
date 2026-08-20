# ScottBook v0.42.0 — offline-library performance

## Release contract

This release makes the existing app start and search with less repeated work.
It adds no reading, screen, account, score, or learning feature.

- Keep all 75 built-in articles, 2,550 sentences, annotations, article IDs,
  ordering, progress, favorites, history, imports, and backups unchanged.
- Store repeated library strings once before the existing deterministic gzip
  step, then restore the same typed article structure locally at runtime.
- Normalize each article for Library search once per loaded catalog instead of
  once per article on every keystroke.
- Reuse article metadata and vocabulary search indexes.
- Build one cross-library vocabulary-context index only after a word is
  selected, then reuse it for later selections.
- Paint a small accessible startup shell while the larger App/library chunk is
  loaded from the local PWA or APK bundle.
- Preserve the Paste/TXT/EPUB `invalid gzip data` import fix and keep sentences
  out of Review.

## Before/after evidence

Measurements use production builds of the same v0.41 content on this release
worktree. Vite filenames contain hashes and may differ on another machine.

| Artifact/work | v0.41 baseline | v0.42 |
|---|---:|---:|
| Generated library module | 922,231 bytes | 599,010 bytes |
| Largest application JS | 1,787.85 kB / 961.82 kB gzip | 1,256.64 kB / 652.72 kB gzip |
| Initial JS entry | Included in the single application chunk | 208.04 kB / 66.20 kB gzip |
| PWA precache | 2,136.61 KiB | 1,821.77 KiB |
| Library query normalization | 75 articles per query change | Once per article object |
| Global vocabulary scan | Once for every word when the panel opens | One index after the first selected word |

The split startup entry still requests the App chunk immediately; its purpose is
to show a truthful local loading state before the full library is decoded. The
string table is the main transfer/cache reduction. No network lookup is added.

## Automated evidence

| Gate | Expected evidence |
|---|---|
| Authored library | 75 articles and 2,550 sentences; generated output current |
| Data identity | Restored v0.42 JSON matches the v0.41 payload byte-for-byte after serialization |
| Cache behavior | Repeated metadata and vocabulary-context lookups reuse the cached result |
| Unit/integration | 33 files, 187 tests pass |
| Static quality | ESLint and TypeScript pass |
| PWA | Root and `/scottbook/` builds pass; all split chunks and CVDICT are precached |
| Android | Native bundle syncs at `0.42.0`, version code `42`, with no remote server |
| Security | Runtime security/license audit and dependency audit pass |
| Browser journeys | Desktop/mobile cases load; GitHub Actions remains authoritative for execution |

## Manual checks

1. Launch a cold PWA/APK and confirm the ScottBook startup shell appears rather
   than a blank page before Library is ready.
2. Search several Hanzi, tone-free pinyin, and Vietnamese terms rapidly; confirm
   results still match v0.41.
3. Open **Từ trong bài**, search a word, and compare its current-article and
   whole-library contexts.
4. Reopen the app offline and confirm every built-in article still opens with
   pinyin, meaning, sentence assistance, and Hán-Việt.
5. Import the existing EPUB sample and confirm analysis does not report
   `invalid gzip data`.

## Version

- Web/package: `0.42.0`
- Android: `versionCode 42`, `versionName 0.42.0`

# ScottBook v0.15.0 offline Discover and article detail

Date: 2026-08-13
Status: Reader MVP navigation milestone; not a 1.0 Release Candidate

## Outcome

Version 0.15 makes the existing nine-article offline pack easier to choose
from without changing its authored learning data. It adds two hash routes:

- `#/discover` presents an offline Discover view with combined HSK, topic, and
  length filters.
- `#/article/:articleId` presents a detail view before a reader starts the
  article.

The detail route shows title Hanzi, tone-marked pinyin, Vietnamese title,
summary, level, topic, estimated duration, sentence count, annotated
word/phrase count, Hanzi count, favorite state, and locally held reading
progress. Its metadata is derived from the version-controlled article data;
the app does not request, generate, or download annotation while rendering it.

Viewing a detail page does not create a reading-history entry. Only **Đọc
ngay** enters the existing reader route and records the article as opened.
This keeps discovery behavior distinct from actual study activity.

## Discover contract

The filters are intentionally small and transparent:

| Filter | Values | Source |
| --- | --- | --- |
| HSK level | All, HSK 1, HSK 2, HSK 3 | Authored `level` metadata |
| Topic | All, Đời sống, Kế hoạch, Học tập | Authored `topic` metadata |
| Length | Short ≤2 min, medium 3 min, long ≥4 min | Authored duration |

Counts are calculated from the nine bundled articles. Filter choices are
temporary view state: they do not change progress, favorites, history,
backups, IndexedDB, or localStorage schema. The Discover cards reuse the
existing favorite and progress indicators, but their primary action is now
**Xem thông tin**, not an implicit read start.

## Compatibility and accessibility

No content id, article annotation, data store, backup, or IndexedDB schema
changes in this release. Existing progress, completion, favorites, review
history, preferences, backups, update checkpoints, and recovery behavior stay
compatible.

Both routes use the app's existing page title, hash-navigation focus transfer,
skip link, desktop sidebar, mobile tab bar, live result count, pressed filter
states, accessible button names, and a named progress bar. The mobile tab bar
now holds Library, Discover, and Review while retaining its safe-area spacing.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Catalog metadata, combined filters, routes, storage regression | 94/94 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Ten critical journeys on desktop and mobile Chrome profiles | 20/20 passed |
| New journey | HSK + topic + length → detail → favorite → read | Passed on both profiles |
| Offline regression | Precached article reopens with the browser offline | Passed on both profiles |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root artifact | Manifest, service worker, icons, navigation fallback, version | Passed |
| `/scottbook/` artifact | Configured subpath contract | Passed |
| Responsive inspection | Discover/detail at 1440×1000 and 390×844 | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. The physical-device matrix in `SCOTTBOOK-v0.9.0-RC.md` remains
pending.

## Still outside this version

- Personalized recommendations, saved reading queues, and a user-authored
  Discover taxonomy.
- The proposed 30-article 1.0 target and an approved HSK versioning policy.
- A configurable translation language; authored translation remains Vietnamese.
- An in-app content-authoring editor or approved import pipeline.
- Spaced repetition, quizzes, CSV/Anki export, and cloud sync.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.
- Paste/TXT/EPUB/PDF/OCR import and automatic annotation.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be
described as complete.

# ScottBook v0.13.0 offline library discovery

Date: 2026-08-11
Status: mandatory library-core work; not a 1.0 Release Candidate

## Outcome

Version 0.13 makes the built-in library usable beyond its current three pilot
articles and prepares the UI for a larger authored collection:

- Search covers titles, summaries, Hanzi, pinyin, Vietnamese sentence
  translations, and contextual word meanings.
- Vietnamese accents and pinyin tone marks are ignored during matching, so
  `hieu`, `Xiān lǐjiě`, and `xian lijie` remain useful queries.
- Hanzi remains searchable without transliteration.
- HSK 1, HSK 2, and HSK 3 filters expose stable authored counts.
- In-progress, completed, and favorite filters derive from existing local
  reading data.
- A live result count, clear-search action, complete reset, and explanatory
  empty state keep combined filters understandable.

The controls remain compact on desktop and become horizontally scrollable chip
rows on small screens. Article order remains the authored library order; search
does not silently rank or promote content.

## Search contract

The search index is assembled entirely from the version-controlled built-in
content already present in the PWA. No query, reading text, or search result is
sent to a server. Latin terms match from word boundaries by prefix so `hieu`
does not incorrectly match Vietnamese `nhiều`; Hanzi terms continue to match as
character sequences. Multiple terms must all occur in the same article.

Search and filter selection are temporary view state. They do not change the
IndexedDB schema, localStorage records, JSON backup, reading progress, review
history, or PWA update checkpoint.

## Automated and visual evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Normalization, authored-content search, combined filters, reading status, level counts, rendered accessibility | 88/88 passed |
| Browser matrix | Eight critical journeys on desktop and mobile Chrome profiles | 16/16 passed |
| New journey | Tone-free pinyin search → HSK 2 → favorite filter → empty state → reset | Passed on both profiles |
| Offline regression | Precached article reopens with the browser offline | Passed on both profiles |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root artifact | Manifest, service worker, icons, navigation fallback, version | Passed |
| `/scottbook/` artifact | Configured subpath contract | Passed |
| Responsive inspection | Library discovery at 1440×1000 and 390×844 | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. The physical-device matrix in `SCOTTBOOK-v0.9.0-RC.md` remains pending.

## Still outside this version

- More authored articles and an approved final content-count/HSK-version plan.
- A separate Discover feed and article-detail route.
- A configurable translation language; the authored translation remains
  Vietnamese.
- An in-app content-authoring editor or approved import pipeline.
- Spaced repetition, quizzes, CSV/Anki export, and cloud sync.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.
- Paste/TXT/EPUB/PDF/OCR import and automatic annotation.

These items remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.

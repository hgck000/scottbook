# ScottBook v0.14.0 authored pilot library

Date: 2026-08-11
Status: Reader MVP content milestone; not a 1.0 Release Candidate

## Outcome

Version 0.14 completes the nine-article pilot content pack defined in the
ScottBook product plan. The library is now balanced at three articles for each
of HSK 1, HSK 2, and HSK 3, with four sentences per article.

Six new articles ship in this version:

| Level | Article | Learning context |
| --- | --- | --- |
| HSK 1 | `我的家` · Gia đình tôi | Family and shared evening activities |
| HSK 1 | `学校里的朋友` · Người bạn ở trường | Class, lunch, and speaking practice |
| HSK 2 | `去图书馆` · Đi thư viện | Walking, finding a dictionary, and borrowing books |
| HSK 2 | `和妈妈去商店` · Đi cửa hàng cùng mẹ | Shopping for food and simple supplies |
| HSK 3 | `每天进步一点` · Mỗi ngày tiến bộ một chút | A steady study plan and context-first reading |
| HSK 3 | `答应朋友的事` · Việc đã hứa với bạn | Helping a friend move and keeping a promise |

Together with the original three articles, ScottBook now contains 36 authored
sentences. Every word/phrase carries tone-marked pinyin and a contextual
Vietnamese meaning; every character has an ordered authored annotation; every
sentence has a Vietnamese translation. No pinyin, meaning, or translation is
generated or downloaded when reading.

## Content-quality contract

The expansion introduces a shared article-token helper while retaining the
existing explicit annotation model. Build-time validation now rejects:

- missing or duplicate article, paragraph, sentence, and token ids;
- empty titles, title pinyin, title translation, summaries, or sentence
  translations;
- non-positive or non-integer reading-time estimates;
- words without pinyin, contextual meaning, or one annotation per Hanzi;
- character annotations whose order does not match the token surface.

The content pack contains no remote URL, provider, endpoint, or API key. It is
compiled into the PWA and precached with the app shell.

## Compatibility

This is a content-only expansion. Article ids from v0.13 remain unchanged, and
there is no localStorage, backup, or IndexedDB schema migration. Existing
progress, completion, favorites, reading history, assistance history, reader
preferences, backups, update checkpoints, and corrupt-record recovery remain
compatible.

## Automated and visual evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Balanced content pack, complete annotations, metadata/id rejection, search counts, routes, storage regression | 89/89 passed |
| Browser matrix | Nine critical journeys on desktop and mobile Chrome profiles | 18/18 passed |
| New journey | Vietnamese search → expanded HSK 3 article → pinyin → meaning → sentence translation | Passed on both profiles |
| Offline regression | Precached article reopens with the browser offline | Passed on both profiles |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root artifact | Manifest, service worker, icons, navigation fallback, version | Passed |
| `/scottbook/` artifact | Configured subpath contract | Passed |
| Responsive inspection | Nine-card library at 1440×1000 and 390×844 | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. The physical-device matrix in `SCOTTBOOK-v0.9.0-RC.md` remains pending.

## Still outside this version

- The proposed 30-article 1.0 target and an approved HSK versioning policy.
- A separate Discover feed and article-detail route.
- A configurable translation language; authored translation remains Vietnamese.
- An in-app content-authoring editor or approved import pipeline.
- Spaced repetition, quizzes, CSV/Anki export, and cloud sync.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.
- Paste/TXT/EPUB/PDF/OCR import and automatic annotation.

These items remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.

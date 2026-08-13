# ScottBook v0.21.0 offline vocabulary inside Reader

Date: 2026-08-13
Status: Focused personal-reader milestone; not a 1.0 Release Candidate

## Outcome

Version 0.21 adds **Từ trong bài** to every built-in Reader. The panel is
derived entirely from the word/phrase annotations already compiled into each
article and presents:

- one entry for each unique Hanzi + pinyin + contextual-meaning combination;
- authored pinyin and Vietnamese meaning without an online lookup;
- the number of occurrences in the current article; and
- a **Tới câu** action that closes the panel, centers, focuses, and highlights
  the first containing sentence.

Search accepts Hanzi, pinyin with or without tone marks, pinyin written without
spaces, and Vietnamese with or without accents. Results keep first-reading
order rather than imposing a score or algorithmic recommendation. On desktop
the index opens as a side panel; at phone widths it becomes a bottom sheet.

## Local-data and compatibility contract

The index is pure derived view state. Opening it or reading its pinyin and
meaning does not create assistance history, progress, or a new local record.
Assistance history changes only after the reader taps an assistance unit in the
article as before.

Version 0.21 adds no persistent field, IndexedDB migration, backup field,
account, analytics event, translation provider, generated pinyin, score,
streak, goal, gamification, or network request. Existing v0.20 data, backups,
normal Reader routes, Review context routes, and saved reading positions remain
compatible.

## Manual verification

1. Open **Buổi sáng của tôi** and press the `词` toolbar action labeled **Mở
   từ trong bài**.
2. Confirm the panel reports **16 từ/cụm duy nhất** and lists `早上 · zǎoshang
   · buổi sáng` first.
3. Find `我` and confirm its action says **4 lần · Tới câu đầu**. Repeated uses
   must not create four duplicate vocabulary rows.
4. Search `gaoxing` or `gao`. Confirm only `高兴 · gāoxìng · vui` remains and
   the live result count says **1/16 từ/cụm**.
5. Clear the search, try `liudian`, `buoi sang`, and `高兴`, and confirm compact
   pinyin, accent-free Vietnamese, and Hanzi all match.
6. Search `gaoxing` again and press **Tới câu**. Confirm the panel closes and
   the fourth sentence is centered and highlighted without adding `/context/`
   to the URL.
7. Tap `高兴` in that sentence. Confirm normal progressive assistance still
   reveals `gāoxìng` first and `vui` second.
8. In a clean browser profile, open and browse **Từ trong bài** without tapping
   a word in Reader, then visit **Ôn lại**. Confirm merely viewing the index did
   not create an assistance record.
9. Reopen the index and press Escape, its close button, and the outside scrim in
   separate attempts. Confirm it closes and keyboard focus returns to `词`.
10. Repeat the search-and-jump flow offline and at approximately 390 px width.
    Confirm the bottom sheet, search field, result card, and action remain
    readable and tappable without horizontal scrolling.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Unique vocabulary, repeated occurrences, search normalization, target-source markup, Reader trigger | 117/117 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Reader vocabulary → normalized search → exact sentence → normal assistance + prior journeys | 28/28 passed |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |
| Responsive inspection | Vocabulary panel at 1440×1000 and Pixel 7 width | Passed |
| Base-branch CI | v0.20 pushed baseline | GitHub Actions #20 passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services, by deliberate product choice.
- Cycling between every occurrence of a repeated word or a custom vocabulary
  editor.
- An approved external-content import pipeline or configurable translation
  language.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.

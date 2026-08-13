# ScottBook v0.18.0 device-only quick review

Date: 2026-08-13
Status: Reader MVP learning-flow milestone; not a 1.0 Release Candidate

## Outcome

Version 0.18 adds `#/review/practice`, a focused session built from the
assistance history the reader already created while reading. Each card follows
the same authored-help order as Reader:

1. Show only Hanzi.
2. Reveal authored pinyin on request.
3. Reveal the contextual Vietnamese meaning and most recent sentence context.
4. Choose **Cần ôn lại** or **Đã nhớ** before moving to the next card.

The queue contains at most twenty active records. Pinned records come first,
followed by records whose meaning was opened more often, total assistance
frequency, recency, and a stable Hanzi tie-breaker. Known records are excluded.

**Đã nhớ** reuses the existing known-state action and therefore participates in
backup, restore, undo, IndexedDB, and localStorage exactly as before. **Cần ôn
lại** intentionally makes no write, leaving the item active for a later
session. Session counts are temporary UI state and disappear when the route is
closed.

## Privacy and compatibility contract

Quick review uses only authored data and assistance evidence already held on
the device. It has no network provider, account, telemetry, generated pinyin,
automatic translation, score, timer, streak, or SRS schedule. Version 0.18 does
not change any persistent schema, content id, backup format, IndexedDB version,
or diagnostic field.

## Manual verification

1. Open **Buổi sáng của tôi**. Open `早上` through its meaning and open `六点`
   only through pinyin, then return to **Ôn lại**.
2. Confirm the header of **Chữ, từ và câu từng cần trợ giúp** shows **Luyện
   nhanh · 2 mục**, then open it.
3. On the first card, confirm only `早上` appears. Press **Hiện pinyin** and
   confirm `zǎoshang`; press **Hiện nghĩa** and confirm `buổi sáng` plus its
   saved sentence context.
4. Press **Đã nhớ**. Confirm the next card is `六点`, reveal both help levels,
   then press **Cần ôn lại**.
5. Confirm the result screen reports **1 Đã nhớ** and **1 Cần ôn lại**.
6. Press **Về Ôn lại**. Confirm `早上` is under **Đã biết**, while `六点`
   remains in the active review list.
7. Start another quick session. Confirm the known item is absent and the item
   kept for review is still present.
8. Reload the page and confirm the known/active decisions remain. Repeat once
   with the browser offline.
9. At approximately 390 px width, confirm the card, reveal buttons, result
   counts, top back button, and bottom navigation are readable and tappable.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Queue priority, known exclusion, session limit, reveal order, route rendering | 104/104 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Assistance evidence → quick review → known/active result + prior journeys | 22/22 passed |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |
| Responsive inspection | Practice route at 1440×1000 and 390×844 | Passed |
| Base-branch CI | v0.17 workflow after the Chrome locator fix | GitHub Actions #17 passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Spaced-repetition scheduling, graded quizzes, audio, reminders, and goals.
- Persistent per-session scores, study time, streaks, and analytics.
- CSV/Anki export, cloud sync, or a configurable translation language.
- An approved external-content import pipeline.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.

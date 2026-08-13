# ScottBook v0.17.0 offline learning progress

Date: 2026-08-13
Status: Reader MVP learning-flow milestone; not a 1.0 Release Candidate

## Outcome

Version 0.17 adds **Tiến độ học của bạn** to the device-only Review route. The
overview shows:

- one whole-library percentage calculated from saved article percentages;
- completed, in-progress, and unread article counts;
- separate HSK 1, HSK 2, and HSK 3 progress bars and status counts;
- a continue action for the most recently opened unfinished article.

A completed article contributes 100 percent. An unfinished article contributes
its last saved reading percentage, and an unread article contributes zero. The
continue action ignores completed articles, so finishing a newer article does
not hide an older unfinished one.

## Data and compatibility contract

The overview is derived during render from the existing built-in content and
`LibraryState`. It does not write a new event, timestamp, preference, or cache.
The localStorage schema, IndexedDB v3, JSON backup/restore, update checkpoint,
diagnostic format, and all authored content ids remain unchanged.

The v0.16 GitHub browser job exposed a Chrome-version compatibility issue in
the test locator: `input[type="search"]` was queried by an accessibility role
that changed in the hosted Chrome runner. Version 0.17 selects the same control
by its visible label. This changes test targeting only; the accessible label
and application behavior are unchanged.

## Manual verification

1. Open ScottBook, choose **Buổi sáng của tôi**, then scroll until the saved
   percentage is above zero and return to **Ôn lại**.
2. Find **Tiến độ học của bạn**. Confirm the summary shows one article **đang
   đọc**, HSK 1 is above zero, and HSK 2/3 stay unchanged.
3. Press **Tiếp tục · Buổi sáng của tôi**. Confirm the reader opens that article
   near its saved sentence rather than starting another article.
4. At the bottom of the reader press **Đánh dấu đã đọc xong**, return to **Ôn
   lại**, and confirm the completed count increases while the unfinished count
   decreases.
5. Confirm the whole-library bar and HSK 1 bar report values between 0 and 100,
   and that the three status counts add up to all nine bundled articles.
6. Reload the page and repeat step 2. Confirm the same progress remains.
7. Set the browser offline, reload **Ôn lại**, and confirm the overview and HSK
   bars still render without an error or network request.
8. At 390 px width, confirm the summary stacks vertically, all three HSK rows
   remain readable, and the continue action is fully tappable.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Overall math, per-level math, unfinished selection, empty collection, storage regression | 100/100 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Reader evidence → Review overview → continue + prior journeys | 20/20 passed |
| CI regression | Search field selected by accessible label across Chrome roles | Passed locally on both profiles |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |
| Responsive inspection | Review overview at 1440×1000 and 390×844 | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Daily sessions, study time, streaks, weekly targets, and reminders.
- Spaced repetition, quizzes, CSV/Anki export, and cloud sync.
- A configurable translation language or approved external-content import.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.

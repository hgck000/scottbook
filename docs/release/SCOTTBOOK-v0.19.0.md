# ScottBook v0.19.0 per-article learning insights

Date: 2026-08-13
Status: Reader MVP learning-flow milestone; not a 1.0 Release Candidate

## Outcome

Version 0.19 adds **Bài nào từng cần trợ giúp nhiều?** to Review. It turns the
assistance contexts already created while reading into a compact article-level
view:

- percentage and count of distinct authored words/phrases that received help;
- total pinyin/meaning opens retained for that article;
- active review records and records already marked known; and
- a direct **Đọc lại** action for returning to the article.

Articles with evidence appear first. Their order uses word/phrase coverage,
active review records, help opens, recency, and a stable article-id tie-breaker.
Articles without assistance evidence stay out of the card list; the header
still states how many of the nine authored articles currently have data.

## Calculation contract

The denominator is the number of distinct authored word/phrase annotations in
an article, identified by Hanzi, contextual pinyin, and contextual meaning. The
numerator is the subset whose local word-scope review record still carries a
context from that article. Character and sentence assistance contributes to
help-open and active/known counts but not to word/phrase coverage.

Repeated help in the same sentence increases **lượt mở** without inflating the
distinct-word numerator. Marking a record known moves it from active to known;
deleting it removes its contribution. Each review record retains up to eight
recent contexts, so the view is an honest summary of retained local evidence,
not a permanent lifetime analytics ledger or an assessment of article
difficulty.

## Privacy and compatibility contract

The calculation is pure derived view state over the built-in content pack and
the existing assistance-history snapshot. It adds no event, persistent field,
IndexedDB migration, backup field, account, telemetry, score, streak, SRS
schedule, automatic translation, or network request. Existing v0.18 data and
backups remain compatible.

## Manual verification

1. Open **Buổi sáng của tôi**. Open `早上` through meaning, then open `六点`
   only through pinyin.
2. Return to **Ôn lại** and find **Bài nào từng cần trợ giúp nhiều?** between
   whole-library progress and the detailed assistance list.
3. Confirm the header shows **1/9 bài · 3 lượt mở**.
4. Confirm the article card shows **13%**, **2/16 từ/cụm**, **3 lượt mở**, and
   **2 mục đang ôn**. The ratio must be labeled as a reading trace, not a score.
5. Press **Đọc lại** and confirm Reader opens **我的早上**. Return to Review.
6. Mark `早上` as **Đã biết**. Confirm the article card changes to **1 mục đang
   ôn · 1 đã biết** without changing the 2/16 historic word coverage.
7. Delete the `早上` assistance record after accepting the confirmation.
   Confirm the card falls to **1/16**, **1 lượt mở**, and **1 mục đang ôn**.
8. Reload and repeat once with the browser offline. Confirm the same derived
   values appear without a request or blank state.
9. In a clean browser profile with no assistance history, confirm the section
   shows **Chưa có dấu vết để so sánh** and a link to Discover.
10. At approximately 390 px width, confirm the heading, percentage, progress
    bar, counts, read-again button, and explanatory note remain readable and
    tappable without horizontal scrolling.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Distinct word coverage, repeated contexts, known state, empty articles, stable ordering, route rendering | 107/107 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Read assistance → per-article insight → reopen Reader + prior journeys | 24/24 passed |
| Security | Browser API policy, runtime licenses, dependency advisories | 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |
| Responsive inspection | Review insight at 1440×1000 and 390×844 | Passed |
| Base-branch CI | v0.18 pushed baseline | GitHub Actions #18 passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Daily sessions, time spent, streaks, goals, graded quizzes, and SRS.
- Permanent analytics, cross-device progress, accounts, telemetry, or cloud sync.
- CSV/Anki export or a configurable translation language.
- An approved external-content import pipeline.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.

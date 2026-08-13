# ScottBook v0.23.0 offline library concordance

Date: 2026-08-13
Status: Focused personal-reader milestone; not a 1.0 Release Candidate

## Outcome

Version 0.23 extends **Từ trong bài** from one-article comparison to an offline
library concordance. An exact authored vocabulary identity—Hanzi, pinyin, and
Vietnamese meaning—can now switch between:

- **Bài này**, retaining the v0.22 contexts from the open article; and
- **Cả thư viện**, grouping every matching context by authored article.

Each library group shows the article's HSK level, Chinese title, Vietnamese
title, occurrence count, full Hanzi sentence with the selected word
highlighted, and authored Vietnamese translation. The current article is shown
first; the remaining groups keep built-in library order.

If a word appears once in the current article but repeats elsewhere, its list
action opens the library contexts directly. A word that is unique across the
whole library still keeps the fast **Tới câu** action.

Choosing a context from another article opens that exact sentence in Reader.
The target sentence is centered and highlighted, normal progressive assistance
continues to work, and a vocabulary-specific notice plus **Về bài trước** action
returns to the originating article. Review context links remain visually and
semantically separate.

## Local-data and compatibility contract

The concordance is derived at runtime from the nine version-controlled articles
already bundled into the offline app shell. It does not call a dictionary,
translation provider, pinyin generator, search service, or other network API.
Only exact authored identities are merged, so identical Hanzi with a different
reading or meaning remain separate.

Opening the concordance creates no assistance record. Moving to another article
uses the existing local reading-history behavior, just like opening that article
from the library. Version 0.23 adds no persistent field, IndexedDB migration,
backup field, account, analytics event, score, streak, goal, gamification, or
remote dependency. Existing v0.22 data and backups remain compatible.

## Manual verification

1. Open **Buổi sáng của tôi**, open **Từ trong bài**, and search `wo`.
2. Open `我 · wǒ · tôi` with **4 trong bài**. Confirm **Bài này · 4** is
   selected and the four v0.22 context cards remain in reading order.
3. Select **Cả thư viện · 25**. Confirm the panel reports **25 ngữ cảnh · 9
   bài**.
4. Confirm **Buổi sáng của tôi** is the first group. Scroll through the other
   groups and verify each shows its HSK level, Chinese/Vietnamese title, count,
   highlighted `我`, and authored Vietnamese translation.
5. In **Kế hoạch cuối tuần**, press **Tới câu** on its first context. Confirm the
   URL is
   `#/read/hsk2-weekend-plan/context/s1/from-vocabulary/hsk1-my-morning`.
6. Confirm sentence 1 is centered and highlighted and the notice says **Đã mở
   ngữ cảnh từ Từ trong bài** rather than referring to Review.
7. Tap `我` in the target sentence. Confirm assistance still reveals `wǒ` first
   and `tôi` second.
8. Press **Về bài trước**. Confirm Reader returns to
   `#/read/hsk1-my-morning`.
9. Reopen **Từ trong bài** and search `xuexiao`. Because `学校` occurs once in
   this article but three times across three articles, confirm its action says
   **3 trong thư viện** and opens the library scope directly.
10. Search `gaoxing`. Confirm globally unique `高兴` still uses **Tới câu**
    without an unnecessary context view.
11. Open a saved context from **Ôn lại** and confirm its notice and back action
    still say **Ôn lại**, not **Từ trong bài** or **Về bài trước**.
12. Repeat steps 1–8 offline and at about 390 px width. Confirm every article
    group and context card remains readable and scrollable without horizontal
    overflow.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Exact identity grouping, 25 `我` contexts across nine articles, single-current/multi-library detection, safe vocabulary routes, Reader compatibility | 123/123 passed |
| Lint and type check | React, TypeScript, and hooks rules | Passed |
| Browser matrix | Library scope → grouped contexts → cross-article exact sentence → assistance → return, plus prior journeys | 32 cases defined; local run blocked before launch because this workspace has no Chrome executable |
| Security | Browser API policy, runtime licenses, dependency advisories | Passed; 0 vulnerabilities |
| Root + `/scottbook/` artifacts | PWA deployment contracts | Passed |
| Base-branch CI | v0.22 pushed baseline | GitHub Actions #22 passed |

GitHub Actions becomes the authoritative browser evidence after this patch is
applied. Physical-device checks remain pending.

## Still outside this version

- Accounts, cloud sync, scores, streaks, goals, gamification, telemetry, and
  commercial services, by deliberate product choice.
- A custom vocabulary editor, saved personal word list, or fuzzy merging of
  authored vocabulary identities.
- An approved external-content import pipeline or configurable translation
  language.
- Capacitor, a signed APK, and physical Android/iPhone/Mac/Windows evidence.

These limits remain visible in `KNOWN-LIMITATIONS.md` and must not be described
as complete.
